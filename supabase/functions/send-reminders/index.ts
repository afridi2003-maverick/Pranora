/**
 * send-reminders — Supabase Edge Function
 * HLT-2: In-app & push reminders with pg_cron
 * Owner: afridi | Sprint: S5
 *
 * Called by pg_cron every 15 minutes via trigger_send_reminders().
 * Queries reminders due in the next window, fires notify() RPC for each,
 * then advances the remind_at for repeating reminders or marks one-shot done.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Look-ahead window: pick up reminders up to 1 minute past due
// (accommodates clock skew and 15-min cron cadence)
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

interface NotifyRpcArgs {
  p_user_id: string;
  p_template_key: string;
  p_data: Record<string, unknown>;
  p_channels: string[];
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

Deno.serve(async (req: Request) => {
  // Allow GET for manual testing; pg_cron fires POST
  if (req.method !== 'POST' && req.method !== 'GET') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  const now = new Date();
  const cutoff = new Date(now.getTime() + LOOK_AHEAD_MINUTES * 60_000).toISOString();

  // Fetch all pending, due reminders
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

  if (!reminders || reminders.length === 0) {
    return new Response(JSON.stringify({ sent: 0, skipped: 0 }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let sent = 0;
  let skipped = 0;

  for (const reminder of reminders) {
    try {
      // Fire in-app + push notification via notify() RPC
      const rpcArgs: NotifyRpcArgs = {
        p_user_id:     reminder.owner_id,
        p_template_key: templateKeyForType(reminder.type),
        p_data: {
          reminder_id:    reminder.id,
          pet_id:         reminder.pet_id,
          reminder_type:  reminder.type,
          title:          reminder.title,
          vaccination_id: reminder.vaccination_id,
        },
        p_channels: ['in_app', 'push'],
      };

      const { error: notifyError } = await supabase.rpc('notify', rpcArgs);
      if (notifyError) {
        console.warn(`[send-reminders] notify failed for ${reminder.id}:`, notifyError.message);
        skipped++;
        continue;
      }

      // Advance or mark done
      if (reminder.repeat_days && reminder.repeat_days > 0) {
        // Repeating: push remind_at forward by repeat_days days
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
        // One-shot: mark done
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

  console.log(`[send-reminders] done — sent: ${sent}, skipped: ${skipped}`);
  return new Response(JSON.stringify({ sent, skipped }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
});
