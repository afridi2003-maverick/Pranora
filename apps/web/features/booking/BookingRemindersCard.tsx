'use client';

import React, { useEffect, useState } from 'react';
import { useLocale } from '@pranora/i18n';
import { Button, Card, Chip } from '@pranora/ui';
import {
  getBookingReminders,
  scheduleBookingReminders,
  cancelBookingReminders,
  createSupabaseClient,
  type BookingReminderItem,
  type ReminderChannel,
} from '@pranora/api';

interface BookingRemindersCardProps {
  bookingId?: string;
  scheduledAt?: string;
}

export function BookingRemindersCard({
  bookingId = '550e8400-e29b-41d4-a716-446655440001',
  scheduledAt = new Date(Date.now() + 26 * 3600 * 1000).toISOString(),
}: BookingRemindersCardProps) {
  const { locale } = useLocale();
  const isBangla = locale === 'bn';

  const [reminders, setReminders] = useState<BookingReminderItem[]>([]);
  const [enable24h, setEnable24h] = useState(true);
  const [enable1h, setEnable1h] = useState(true);
  const [channel, setChannel] = useState<ReminderChannel>('both');
  const [isSaving, setIsSaving] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder'
    );
    getBookingReminders(supabase, bookingId).then(setReminders);
  }, [bookingId]);

  const handleSave = async () => {
    setIsSaving(true);
    setSavedNotice(false);
    try {
      const supabase = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder'
      );
      const updated = await scheduleBookingReminders(supabase, {
        bookingId,
        scheduledAt,
        enable24h,
        enable1h,
        channel,
      });
      setReminders(updated);
      setSavedNotice(true);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelAll = async () => {
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder'
    );
    await cancelBookingReminders(supabase, bookingId);
    setReminders((prev) => prev.map((r) => ({ ...r, status: 'cancelled' })));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {isBangla ? 'অ্যাপয়েন্টমেন্ট রিমাইন্ডার' : 'Appointment Reminders'}
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          {isBangla
            ? 'ভিজিটের ২৪ ঘণ্টা ও ১ ঘণ্টা আগে নোটিফিকেশন পান'
            : 'Get notified 24 hours and 1 hour before your vet visit'}
        </p>
      </div>

      {savedNotice && (
        <Card className="p-3 border-emerald-300 bg-emerald-50 dark:bg-emerald-950/30">
          <p className="text-sm text-emerald-800 dark:text-emerald-200">
            {isBangla
              ? 'বুকিং রিমাইন্ডার আপডেট হয়েছে!'
              : 'Booking reminders updated!'}
          </p>
        </Card>
      )}

      <Card className="p-5 space-y-4">
        <h2 className="text-base font-semibold text-foreground">
          {isBangla ? 'রিমাইন্ডার সেটিংস' : 'Reminder Windows'}
        </h2>

        <label className="flex items-center justify-between gap-3 cursor-pointer">
          <span className="text-sm text-foreground">
            {isBangla ? '২৪ ঘণ্টা আগে (24h)' : '24 hours before appointment'}
          </span>
          <input
            type="checkbox"
            checked={enable24h}
            onChange={(e) => setEnable24h(e.target.checked)}
            className="h-4 w-4 accent-emerald-600"
          />
        </label>

        <label className="flex items-center justify-between gap-3 cursor-pointer">
          <span className="text-sm text-foreground">
            {isBangla ? '১ ঘণ্টা আগে (1h)' : '1 hour before appointment'}
          </span>
          <input
            type="checkbox"
            checked={enable1h}
            onChange={(e) => setEnable1h(e.target.checked)}
            className="h-4 w-4 accent-emerald-600"
          />
        </label>

        <div className="pt-2 space-y-2">
          <p className="text-xs font-medium text-neutral-500">
            {isBangla ? 'নোটিফিকেশন মাধ্যম' : 'Notification Channel'}
          </p>
          <div className="flex flex-wrap gap-2">
            {(['both', 'push', 'in_app'] as const).map((c) => (
              <Button
                key={c}
                variant={channel === c ? 'primary' : 'ghost'}
                onClick={() => setChannel(c)}
              >
                {c === 'both'
                  ? isBangla
                    ? 'পুশ + ইন-অ্যাপ'
                    : 'Push + In-App'
                  : c === 'push'
                    ? isBangla
                      ? 'শুধু পুশ'
                      : 'Push Only'
                    : isBangla
                      ? 'শুধু ইন-অ্যাপ'
                      : 'In-App Only'}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Button variant="primary" onClick={handleSave} disabled={isSaving}>
            {isSaving
              ? isBangla
                ? 'সেভ হচ্ছে...'
                : 'Saving...'
              : isBangla
                ? 'রিমাইন্ডার সেভ করুন'
                : 'Save Reminder Preferences'}
          </Button>
          <Button variant="ghost" onClick={handleCancelAll}>
            {isBangla ? 'রিমাইন্ডার বন্ধ করুন' : 'Mute Reminders'}
          </Button>
        </div>
      </Card>

      <div className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">
          {isBangla ? 'নির্ধারিত রিমাইন্ডার' : 'Scheduled Reminders'}
        </h2>
        {reminders.map((rem) => (
          <Card
            key={rem.id}
            className="p-4 flex flex-wrap items-center justify-between gap-3"
          >
            <div>
              <p className="font-medium text-foreground">
                {rem.reminderWindow === '24h'
                  ? isBangla
                    ? '২৪ ঘণ্টা আগে রিমাইন্ডার'
                    : '24-Hour Reminder'
                  : isBangla
                    ? '১ ঘণ্টা আগে রিমাইন্ডার'
                    : '1-Hour Reminder'}
              </p>
              <p className="text-xs text-neutral-500">
                {new Date(rem.remindAt).toLocaleString()} • {rem.channel}
              </p>
            </div>
            <Chip
              variant="status"
              statusType={
                rem.status === 'sent'
                  ? 'completed'
                  : rem.status === 'cancelled'
                    ? 'neutral'
                    : 'confirmed'
              }
              label={
                rem.status === 'sent'
                  ? isBangla
                    ? 'পাঠানো হয়েছে'
                    : 'Sent'
                  : rem.status === 'cancelled'
                    ? isBangla
                      ? 'বন্ধ'
                      : 'Muted'
                    : isBangla
                      ? 'নির্ধারিত'
                      : 'Scheduled'
              }
            />
          </Card>
        ))}
      </div>
    </div>
  );
}
