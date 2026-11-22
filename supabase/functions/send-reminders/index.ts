/**
 * send-reminders — Supabase Edge Function
 * HLT-2 & HLT-6: In-app, push & SMS reminders with pg_cron
 * Owner: afridi | Sprint: S5/S6
 *
 * Called by pg_cron every 15 minutes via trigger_send_reminders().
 * 1. Queries due reminders (vaccine, medicine, checkup, etc.).
 * 2. Queries upcoming confirmed clinic bookings (~24h / ~1h).
 * 3. Dispatches notifications: in-app, push, and SMS (when user has phone & opt-in).
 * 4. Advances repeating reminders or marks one-shot done.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const LOOK_AHEAD_MINUTES = 1;

interface ReminderRow {
  id: string;
  pet_id: string;
  owner_id: string;
  type: string;
  title: string;
  remind_at: string;
  repeat_days: number | null;
  vaccination_id: string | null;
  is_done: boolean;
  last_sent_at: string | null;
}

interface ProfileRow {
  id: string;
  phone: string | null;
  locale: string | null;
  sms_opt_in: boolean | null;
}

interface PetRow {
  id: string;
  name: string;
}

interface BookingRow {
  id: string;
  code: string;
  owner_id: string;
  starts_at: string;
  status: string;
}

/** Map reminder_type → notification template key */
function templateKeyForType(type: string): string {
  const map: Record<string, string> = {
    vaccine:   'vaccine_due',
    deworming: 'vaccine_due',
    flea_tick: 'vaccine_due',
    medicine:  'vaccine_due',
    grooming:  'booking_reminder',
    checkup:   'booking_reminder',
    custom:    'booking_reminder',
  };
  return map[type] ?? 'booking_reminder';
}

function buildSmsText(type: string, title: string, petName: string, locale: string): string {
  if (type === 'vaccine' || type === 'deworming' || type === 'flea_tick') {
    if (locale === 'en') {
      return `[Pranora] Reminder: ${petName}'s vaccine (${title}) is due soon. Check details in Pranora app.`;
    }
    return `[প্রণোরা] সতর্কতা: আপনার পোষা প্রাণী ${petName}-এর টিকা (${title}) আসন্ন। Pranora অ্যাপে বিস্তারিত দেখুন।`;
  }

  if (locale === 'en') {
    return `[Pranora] Health Alert: ${title} for ${petName}.`;
  }
  return `[প্রণোরা] স্বাস্থ্য স্মরণিকা: ${petName}-এর জন্য ${title}।`;
}

function buildAppointmentSmsText(bookingCode: string, startsAt: string, locale: string): string {
  const timeFormatted = new Date(startsAt).toLocaleTimeString(locale === 'bn' ? 'bn-BD' : 'en-GB', {
    hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short',
  });

  if (locale === 'en') {
    return `[Pranora] Reminder: Your clinic appointment (Booking #${bookingCode}) is at ${timeFormatted}. Please arrive 10m early.`;
  }
  return `[প্রণোরা] অ্যাপয়েন্টমেন্ট স্মরণিকা: আপনার বুকিং #${bookingCode} ${timeFormatted}-এ নির্ধারিত। ১০ মিনিট আগে উপস্থিত থাকুন।`;
}

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  const now = new Date();
  const cutoff = new Date(now.getTime() + LOOK_AHEAD_MINUTES * 60_000).toISOString();

  // 1. Fetch pending, due reminders
  const { data: reminders, error: fetchError } = await supabase
    .from('reminders')
    .select('id, pet_id, owner_id, type, title, remind_at, repeat_days, vaccination_id, is_done, last_sent_at')
    .eq('is_done', false)
    .lte('remind_at', cutoff)
    .returns<ReminderRow[]>();

  if (fetchError) {
    console.error('[send-reminders] fetch error:', fetchError.message);
    return new Response(JSON.stringify({ error: fetchError.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let sent = 0;
  let smsSent = 0;
  let skipped = 0;

  if (reminders && reminders.length > 0) {
    for (const reminder of reminders) {
      try {
        // Fetch owner profile for phone & sms preference
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, phone, locale, sms_opt_in')
          .eq('id', reminder.owner_id)
          .single<ProfileRow>();

        // Fetch pet name
        const { data: pet } = await supabase
          .from('pets')
          .select('id, name')
          .eq('id', reminder.pet_id)
          .single<PetRow>();

        const petName = pet?.name ?? 'Pet';
        const userLocale = profile?.locale ?? 'bn';

        // Base channels: in-app + push
        const channels = ['in_app', 'push'];

        // HLT-6: If user opted in to SMS and has a phone number, dispatch SMS
        const shouldSendSms = Boolean(profile?.phone && (profile.sms_opt_in ?? true));
        if (shouldSendSms) {
          channels.push('sms');
        }

        // Fire notify() RPC
        const rpcArgs = {
          p_user_id:     reminder.owner_id,
          p_template_key: templateKeyForType(reminder.type),
          p_data: {
            reminder_id:    reminder.id,
            pet_id:         reminder.pet_id,
            pet_name:       petName,
            reminder_type:  reminder.type,
            title:          reminder.title,
            vaccination_id: reminder.vaccination_id,
          },
          p_channels: channels,
        };

        const { error: notifyError } = await supabase.rpc('notify', rpcArgs);
        if (notifyError) {
          console.warn(`[send-reminders] notify failed for ${reminder.id}:`, notifyError.message);
        }

        // Direct SMS invocation if enabled (HLT-6)
        if (shouldSendSms && profile?.phone) {
          try {
            const smsMessage = buildSmsText(reminder.type, reminder.title, petName, userLocale);
            await supabase.functions.invoke('send-sms', {
              body: {
                recipient: profile.phone,
                message: smsMessage,
              },
            });
            smsSent++;
          } catch (smsErr) {
            console.warn(`[send-reminders] SMS dispatch error for ${reminder.id}:`, smsErr);
          }
        }

        // Advance or mark done
        if (reminder.repeat_days && reminder.repeat_days > 0) {
          const nextRemindAt = new Date(reminder.remind_at);
          nextRemindAt.setDate(nextRemindAt.getDate() + reminder.repeat_days);

          await supabase
            .from('reminders')
            .update({
              last_sent_at: now.toISOString(),
              remind_at:    nextRemindAt.toISOString(),
            })
            .eq('id', reminder.id);
        } else {
          await supabase
            .from('reminders')
            .update({
              is_done:      true,
              last_sent_at: now.toISOString(),
            })
            .eq('id', reminder.id);
        }

        sent++;
      } catch (err) {
        console.error(`[send-reminders] unexpected error for ${reminder.id}:`, err);
        skipped++;
      }
    }
  }

  // 2. HLT-6: Scan confirmed bookings starting within ~24h (between 23h50m and 24h10m)
  try {
    const windowStart = new Date(now.getTime() + 23 * 60 * 60 * 1000 + 50 * 60 * 1000).toISOString();
    const windowEnd   = new Date(now.getTime() + 24 * 60 * 60 * 1000 + 10 * 60 * 1000).toISOString();

    const { data: upcomingBookings } = await supabase
      .from('bookings')
      .select('id, code, owner_id, starts_at, status')
      .eq('status', 'confirmed')
      .gte('starts_at', windowStart)
      .lte('starts_at', windowEnd)
      .returns<BookingRow[]>();

    if (upcomingBookings && upcomingBookings.length > 0) {
      for (const booking of upcomingBookings) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, phone, locale, sms_opt_in')
          .eq('id', booking.owner_id)
          .single<ProfileRow>();

        if (profile?.phone && (profile.sms_opt_in ?? true)) {
          const smsText = buildAppointmentSmsText(booking.code, booking.starts_at, profile.locale ?? 'bn');
          await supabase.functions.invoke('send-sms', {
            body: {
              recipient: profile.phone,
              message: smsText,
            },
          });
          smsSent++;
        }
      }
    }
  } catch (bookingScanErr) {
    console.warn('[send-reminders] appointment scan notice:', bookingScanErr);
  }

  console.log(`[send-reminders] done — sent: ${sent}, smsSent: ${smsSent}, skipped: ${skipped}`);
  return new Response(JSON.stringify({ sent, smsSent, skipped }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
});
