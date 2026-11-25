import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useLocale } from '@pranora/i18n';
import {
  getBookingReminders,
  scheduleBookingReminders,
  cancelBookingReminders,
  createSupabaseClient,
  type BookingReminderItem,
} from '@pranora/api';

interface BookingRemindersScreenProps {
  bookingId?: string;
  scheduledAt?: string;
}

export function BookingRemindersScreen({
  bookingId = '550e8400-e29b-41d4-a716-446655440001',
  scheduledAt = new Date(Date.now() + 26 * 3600 * 1000).toISOString(),
}: BookingRemindersScreenProps) {
  const { locale } = useLocale();
  const isBangla = locale === 'bn';

  const [reminders, setReminders] = useState<BookingReminderItem[]>([]);
  const [enable24h, setEnable24h] = useState(true);
  const [enable1h, setEnable1h] = useState(true);
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    const supabase = createSupabaseClient(
      'https://placeholder.supabase.co',
      'placeholder'
    );
    getBookingReminders(supabase, bookingId).then(setReminders);
  }, [bookingId]);

  const handleSave = async () => {
    setSavedNotice(false);
    const supabase = createSupabaseClient(
      'https://placeholder.supabase.co',
      'placeholder'
    );
    const updated = await scheduleBookingReminders(supabase, {
      bookingId,
      scheduledAt,
      enable24h,
      enable1h,
      channel: 'both',
    });
    setReminders(updated);
    setSavedNotice(true);
  };

  const handleMute = async () => {
    const supabase = createSupabaseClient(
      'https://placeholder.supabase.co',
      'placeholder'
    );
    await cancelBookingReminders(supabase, bookingId);
    setReminders((prev) => prev.map((r) => ({ ...r, status: 'cancelled' })));
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>
        {isBangla ? 'অ্যাপয়েন্টমেন্ট রিমাইন্ডার' : 'Appointment Reminders'}
      </Text>
      <Text style={styles.subtitle}>
        {isBangla
          ? 'ভিজিটের ২৪ ঘণ্টা ও ১ ঘণ্টা আগে নোটিফিকেশন পান'
          : 'Get notified 24 hours and 1 hour before your vet visit'}
      </Text>

      {savedNotice && (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>
            {isBangla
              ? 'বুকিং রিমাইন্ডার আপডেট হয়েছে!'
              : 'Booking reminders updated!'}
          </Text>
        </View>
      )}

      <View style={styles.card}>
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>
            {isBangla ? '২৪ ঘণ্টা আগে (24h)' : '24 hours before'}
          </Text>
          <Switch value={enable24h} onValueChange={setEnable24h} />
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>
            {isBangla ? '১ ঘণ্টা আগে (1h)' : '1 hour before'}
          </Text>
          <Switch value={enable1h} onValueChange={setEnable1h} />
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>
            {isBangla ? 'রিমাইন্ডার সেভ করুন' : 'Save Preferences'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.muteBtn} onPress={handleMute}>
          <Text style={styles.muteBtnText}>
            {isBangla ? 'রিমাইন্ডার বন্ধ করুন' : 'Mute Reminders'}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>
        {isBangla ? 'নির্ধারিত রিমাইন্ডার' : 'Scheduled Reminders'}
      </Text>

      {reminders.map((rem) => (
        <View key={rem.id} style={styles.itemCard}>
          <View>
            <Text style={styles.itemTitle}>
              {rem.reminderWindow === '24h'
                ? isBangla
                  ? '২৪ ঘণ্টা আগে'
                  : '24-Hour Reminder'
                : isBangla
                  ? '১ ঘণ্টা আগে'
                  : '1-Hour Reminder'}
            </Text>
            <Text style={styles.itemMeta}>
              {new Date(rem.remindAt).toLocaleString()}
            </Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {rem.status === 'cancelled'
                ? isBangla
                  ? 'বন্ধ'
                  : 'Muted'
                : isBangla
                  ? 'নির্ধারিত'
                  : 'Scheduled'}
            </Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 16, gap: 12 },
  title: { fontSize: 22, fontWeight: '700', color: '#0f172a' },
  subtitle: { fontSize: 13, color: '#64748b', marginBottom: 4 },
  banner: {
    backgroundColor: '#d1fae5',
    padding: 12,
    borderRadius: 10,
  },
  bannerText: { color: '#065f46', fontSize: 13, fontWeight: '600' },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 12,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchLabel: { fontSize: 15, color: '#0f172a', fontWeight: '500' },
  saveBtn: {
    backgroundColor: '#2F7B53',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveBtnText: { color: '#ffffff', fontWeight: '600', fontSize: 15 },
  muteBtn: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  muteBtnText: { color: '#64748b', fontWeight: '600', fontSize: 13 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginTop: 6,
  },
  itemCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemTitle: { fontSize: 14, fontWeight: '600', color: '#0f172a' },
  itemMeta: { fontSize: 12, color: '#64748b', marginTop: 2 },
  badge: {
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeText: { color: '#047857', fontSize: 11, fontWeight: '600' },
});
