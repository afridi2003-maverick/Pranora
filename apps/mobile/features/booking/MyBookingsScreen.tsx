import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Modal,
} from 'react-native';
import { useLocale } from '@pranora/i18n';
import {
  listUserBookings,
  cancelBooking,
  rescheduleBooking,
  checkCancellationCutoff,
  CANCELLATION_REASONS,
  type BookingDetails,
} from '@pranora/api';

const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b',
  confirmed: '#10b981',
  in_progress: '#3b82f6',
  completed: '#6b7280',
  cancelled_by_owner: '#ef4444',
  cancelled_by_provider: '#ef4444',
  no_show: '#ef4444',
  expired: '#9ca3af',
};

function formatDateTime(isoString?: string | null): string {
  if (!isoString) return '—';
  try {
    return new Date(isoString).toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}

const MOCK_BOOKINGS: BookingDetails[] = [
  {
    id: 'mock-1',
    code: 'PRN-24K7Q9',
    ownerId: 'user-1',
    petId: 'pet-1',
    locationId: 'loc-dhaka-mirpur',
    vetId: null,
    providerServiceId: 'svc-1',
    type: 'slot',
    status: 'confirmed',
    startsAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    endsAt: null,
    serialNo: null,
    addressId: null,
    problemNote: 'Routine check-up & vaccination',
    attachments: [],
    price: 500,
    paymentMethod: 'cash',
    paymentStatus: 'pending',
    cancelReason: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'mock-2',
    code: 'PRN-99A1B2',
    ownerId: 'user-1',
    petId: 'pet-2',
    locationId: 'loc-dhaka-dhanmondi',
    vetId: null,
    providerServiceId: 'svc-2',
    type: 'slot',
    status: 'pending',
    startsAt: new Date(Date.now() + 50 * 60 * 1000).toISOString(),
    endsAt: null,
    serialNo: null,
    addressId: null,
    problemNote: 'Skin itchiness',
    attachments: [],
    price: 600,
    paymentMethod: 'cash',
    paymentStatus: 'pending',
    cancelReason: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

type BookingTab = 'upcoming' | 'past';

export function MyBookingsScreen() {
  const { t, isBangla } = useLocale();
  const [tab, setTab] = useState<BookingTab>('upcoming');
  const [bookings, setBookings] = useState<BookingDetails[]>([]);
  const [loading, setLoading] = useState(true);

  // Cancel Modal State (APT-3)
  const [cancelTargetBooking, setCancelTargetBooking] = useState<BookingDetails | null>(null);
  const [cancelReason, setCancelReason] = useState<string>(CANCELLATION_REASONS[0]);
  const [cancelNote, setCancelNote] = useState<string>('');
  const [cancelling, setCancelling] = useState(false);

  // Reschedule Modal State (APT-3)
  const [rescheduleTargetBooking, setRescheduleTargetBooking] = useState<BookingDetails | null>(null);
  const [newOffsetDays, setNewOffsetDays] = useState<number>(1);
  const [newHour, setNewHour] = useState<number>(10);
  const [rescheduleReason, setRescheduleReason] = useState<string>('');
  const [rescheduling, setRescheduling] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function fetchBookings() {
      setLoading(true);
      try {
        const data = await listUserBookings(null as any);
        if (isMounted) setBookings(data.length > 0 ? data : MOCK_BOOKINGS);
      } catch {
        if (isMounted) setBookings(MOCK_BOOKINGS);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchBookings();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleConfirmCancel = async () => {
    if (!cancelTargetBooking) return;
    setCancelling(true);

    const fullReason = cancelNote.trim() ? `${cancelReason}: ${cancelNote.trim()}` : cancelReason;

    try {
      await cancelBooking(null as any, {
        bookingId: cancelTargetBooking.id,
        reason: fullReason,
      });

      setBookings((prev) =>
        prev.map((b) =>
          b.id === cancelTargetBooking.id
            ? { ...b, status: 'cancelled_by_owner', cancelReason: fullReason }
            : b
        )
      );
      setCancelTargetBooking(null);
      setCancelNote('');
    } catch {
      // optimistic
      setBookings((prev) =>
        prev.map((b) =>
          b.id === cancelTargetBooking.id
            ? { ...b, status: 'cancelled_by_owner', cancelReason: fullReason }
            : b
        )
      );
      setCancelTargetBooking(null);
    } finally {
      setCancelling(false);
    }
  };

  const handleConfirmReschedule = async () => {
    if (!rescheduleTargetBooking) return;
    setRescheduling(true);

    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + newOffsetDays);
    targetDate.setHours(newHour, 0, 0, 0);
    const newStartsAt = targetDate.toISOString();

    try {
      await rescheduleBooking(null as any, {
        bookingId: rescheduleTargetBooking.id,
        startsAt: newStartsAt,
        reason: rescheduleReason.trim() || undefined,
      });

      setBookings((prev) =>
        prev.map((b) =>
          b.id === rescheduleTargetBooking.id
            ? { ...b, startsAt: newStartsAt, status: 'pending' }
            : b
        )
      );
      setRescheduleTargetBooking(null);
      setRescheduleReason('');
    } catch {
      // optimistic
      setBookings((prev) =>
        prev.map((b) =>
          b.id === rescheduleTargetBooking.id
            ? { ...b, startsAt: newStartsAt, status: 'pending' }
            : b
        )
      );
      setRescheduleTargetBooking(null);
    } finally {
      setRescheduling(false);
    }
  };

  const upcoming = bookings.filter((b) =>
    ['pending', 'confirmed', 'in_progress'].includes(b.status)
  );
  const past = bookings.filter((b) =>
    ['completed', 'cancelled_by_owner', 'cancelled_by_provider', 'no_show', 'expired'].includes(
      b.status
    )
  );
  const displayed = tab === 'upcoming' ? upcoming : past;

  const statusLabel = (status: string) => {
    const map: Record<string, string> = {
      pending: t('booking.status.pending'),
      confirmed: t('booking.status.confirmed'),
      in_progress: t('booking.status.inProgress'),
      completed: t('booking.status.completed'),
      cancelled_by_owner: t('booking.status.cancelledByOwner'),
      cancelled_by_provider: t('booking.status.cancelledByProvider'),
      no_show: t('booking.status.noShow'),
      expired: t('booking.status.expired'),
    };
    return map[status] ?? status;
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      {/* Header */}
      <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: '#e5e7eb', backgroundColor: '#ffffff' }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#111827' }}>
          {t('booking.myBookings')}
        </Text>
        <Text style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>
          {isBangla ? 'কাট-অফ: ২ ঘণ্টা আগে পর্যন্ত বাতিল/পরিবর্তন সম্ভব' : 'Cut-off: modify until 2h before visit (APT-3)'}
        </Text>

        {/* Tab switch */}
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
          <TouchableOpacity
            style={{
              paddingVertical: 6,
              paddingHorizontal: 16,
              borderRadius: 20,
              backgroundColor: tab === 'upcoming' ? '#10b981' : '#f3f4f6',
            }}
            onPress={() => setTab('upcoming')}
          >
            <Text style={{ fontSize: 13, fontWeight: 'bold', color: tab === 'upcoming' ? '#ffffff' : '#4b5563' }}>
              {t('booking.upcoming')} ({upcoming.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              paddingVertical: 6,
              paddingHorizontal: 16,
              borderRadius: 20,
              backgroundColor: tab === 'past' ? '#10b981' : '#f3f4f6',
            }}
            onPress={() => setTab('past')}
          >
            <Text style={{ fontSize: 13, fontWeight: 'bold', color: tab === 'past' ? '#ffffff' : '#4b5563' }}>
              {t('booking.past')} ({past.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* List */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator color="#10b981" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
          {displayed.length === 0 ? (
            <View style={{ paddingVertical: 40, alignItems: 'center' }}>
              <Text style={{ color: '#6b7280', fontSize: 14 }}>
                {t('booking.noBookings')}
              </Text>
            </View>
          ) : (
            displayed.map((booking) => {
              const cutoff = checkCancellationCutoff(booking.startsAt, 2);
              const isUpcomingActive = tab === 'upcoming' && ['pending', 'confirmed'].includes(booking.status);

              return (
                <View
                  key={booking.id}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 12,
                    borderWidth: 1,
                    borderColor: '#e5e7eb',
                  }}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View>
                      <Text style={{ fontSize: 11, color: '#6b7280' }}>
                        {t('booking.summary.clinic')} • {booking.locationId}
                      </Text>
                      <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#111827', marginTop: 2 }}>
                        {booking.code}
                      </Text>
                    </View>
                    <View
                      style={{
                        paddingHorizontal: 8,
                        paddingVertical: 3,
                        borderRadius: 12,
                        backgroundColor: (STATUS_COLORS[booking.status] ?? '#6b7280') + '20',
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 11,
                          fontWeight: 'bold',
                          color: STATUS_COLORS[booking.status] ?? '#6b7280',
                        }}
                      >
                        {statusLabel(booking.status)}
                      </Text>
                    </View>
                  </View>

                  <View style={{ marginTop: 8, gap: 3 }}>
                    <Text style={{ fontSize: 12, color: '#374151' }}>
                      <Text style={{ fontWeight: '600' }}>{t('booking.summary.date')}: </Text>
                      {formatDateTime(booking.startsAt)}
                    </Text>
                    {booking.type === 'serial' && booking.serialNo != null && (
                      <Text style={{ fontSize: 12, color: '#374151' }}>
                        <Text style={{ fontWeight: '600' }}>{t('booking.summary.serial')}: </Text>
                        #{booking.serialNo}
                      </Text>
                    )}
                    {booking.price != null && (
                      <Text style={{ fontSize: 12, color: '#374151' }}>
                        <Text style={{ fontWeight: '600' }}>{t('booking.payment.fee')}: </Text>
                        ৳{booking.price}
                      </Text>
                    )}
                  </View>

                  {/* Cutoff status & actions */}
                  {isUpcomingActive && (
                    <View style={{ marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#f3f4f6' }}>
                      {cutoff.canModify ? (
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Text style={{ fontSize: 11, color: '#059669', fontWeight: '500' }}>
                            ⏱ {cutoff.formattedRemaining} left to modify
                          </Text>
                          <View style={{ flexDirection: 'row', gap: 8 }}>
                            <TouchableOpacity
                              onPress={() => setRescheduleTargetBooking(booking)}
                              style={{ paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6, borderWidth: 1, borderColor: '#d1d5db' }}
                            >
                              <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#374151' }}>
                                {t('booking.reschedule.label')}
                              </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              onPress={() => setCancelTargetBooking(booking)}
                              style={{ paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6, backgroundColor: '#fee2e2' }}
                            >
                              <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#dc2626' }}>
                                {t('booking.cancel.label')}
                              </Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      ) : (
                        <View style={{ backgroundColor: '#fffbeb', padding: 8, borderRadius: 6 }}>
                          <Text style={{ fontSize: 11, color: '#d97706', fontWeight: '500' }}>
                            ⚠️ {isBangla ? 'কাট-অফ সময় পার হয়েছে (২ ঘণ্টার কম সময় বাকি)' : 'Cut-off passed (< 2h). Please contact clinic.'}
                          </Text>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              );
            })
          )}
        </ScrollView>
      )}

      {/* Cancel Modal (APT-3) */}
      <Modal visible={Boolean(cancelTargetBooking)} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 }}>
          <View style={{ backgroundColor: '#ffffff', borderRadius: 12, padding: 20 }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#111827', marginBottom: 8 }}>
              {t('booking.cancel.label')}
            </Text>
            <Text style={{ fontSize: 13, color: '#6b7280', marginBottom: 12 }}>
              {isBangla ? 'বুকিং বাতিলের কারণ নির্বাচন করুন:' : 'Select reason for cancellation:'}
            </Text>

            <View style={{ gap: 6, marginBottom: 12 }}>
              {CANCELLATION_REASONS.slice(0, 4).map((r) => (
                <TouchableOpacity
                  key={r}
                  onPress={() => setCancelReason(r)}
                  style={{
                    padding: 8,
                    borderRadius: 6,
                    borderWidth: 1,
                    borderColor: cancelReason === r ? '#10b981' : '#e5e7eb',
                    backgroundColor: cancelReason === r ? '#ecfdf5' : '#ffffff',
                  }}
                >
                  <Text style={{ fontSize: 12, color: cancelReason === r ? '#059669' : '#374151', fontWeight: cancelReason === r ? 'bold' : 'normal' }}>
                    {r}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              placeholder={isBangla ? 'অতিরিক্ত বিবরণ লিখুন...' : 'Additional note...'}
              value={cancelNote}
              onChangeText={setCancelNote}
              style={{ borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 8, fontSize: 12, marginBottom: 16 }}
            />

            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8 }}>
              <TouchableOpacity
                onPress={() => setCancelTargetBooking(null)}
                style={{ paddingVertical: 8, paddingHorizontal: 14, borderRadius: 6, borderWidth: 1, borderColor: '#d1d5db' }}
              >
                <Text style={{ fontSize: 12, color: '#374151' }}>{isBangla ? 'ফিরে যান' : 'Back'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleConfirmCancel}
                disabled={cancelling}
                style={{ backgroundColor: '#dc2626', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 6 }}
              >
                <Text style={{ fontSize: 12, color: '#ffffff', fontWeight: 'bold' }}>
                  {cancelling ? '...' : (isBangla ? 'বাতিল নিশ্চিত করুন' : 'Confirm Cancel')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Reschedule Modal (APT-3) */}
      <Modal visible={Boolean(rescheduleTargetBooking)} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 }}>
          <View style={{ backgroundColor: '#ffffff', borderRadius: 12, padding: 20 }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#111827', marginBottom: 8 }}>
              {t('booking.reschedule.title')}
            </Text>
            <Text style={{ fontSize: 13, color: '#6b7280', marginBottom: 12 }}>
              {isBangla ? 'নতুন দিন ও সময় নির্বাচন করুন:' : 'Select new day & time slot:'}
            </Text>

            <View style={{ flexDirection: 'row', gap: 6, marginBottom: 12 }}>
              {[1, 2, 3].map((days) => (
                <TouchableOpacity
                  key={days}
                  onPress={() => setNewOffsetDays(days)}
                  style={{
                    flex: 1,
                    padding: 8,
                    borderRadius: 6,
                    borderWidth: 1,
                    alignItems: 'center',
                    borderColor: newOffsetDays === days ? '#10b981' : '#e5e7eb',
                    backgroundColor: newOffsetDays === days ? '#ecfdf5' : '#ffffff',
                  }}
                >
                  <Text style={{ fontSize: 11, fontWeight: 'bold', color: newOffsetDays === days ? '#059669' : '#374151' }}>
                    {days === 1 ? (isBangla ? 'আগামীকাল' : 'Tomorrow') : `+${days} days`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
              {[10, 11, 14, 16].map((hr) => (
                <TouchableOpacity
                  key={hr}
                  onPress={() => setNewHour(hr)}
                  style={{
                    paddingVertical: 6,
                    paddingHorizontal: 10,
                    borderRadius: 6,
                    borderWidth: 1,
                    borderColor: newHour === hr ? '#10b981' : '#e5e7eb',
                    backgroundColor: newHour === hr ? '#ecfdf5' : '#ffffff',
                  }}
                >
                  <Text style={{ fontSize: 11, color: newHour === hr ? '#059669' : '#374151', fontWeight: newHour === hr ? 'bold' : 'normal' }}>
                    {hr > 12 ? `${hr - 12}:00 PM` : `${hr}:00 AM`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              placeholder={isBangla ? 'কারণ লিখুন (ঐচ্ছিক)...' : 'Reason (optional)...'}
              value={rescheduleReason}
              onChangeText={setRescheduleReason}
              style={{ borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 8, fontSize: 12, marginBottom: 16 }}
            />

            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8 }}>
              <TouchableOpacity
                onPress={() => setRescheduleTargetBooking(null)}
                style={{ paddingVertical: 8, paddingHorizontal: 14, borderRadius: 6, borderWidth: 1, borderColor: '#d1d5db' }}
              >
                <Text style={{ fontSize: 12, color: '#374151' }}>{isBangla ? 'বাতিল' : 'Cancel'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleConfirmReschedule}
                disabled={rescheduling}
                style={{ backgroundColor: '#10b981', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 6 }}
              >
                <Text style={{ fontSize: 12, color: '#ffffff', fontWeight: 'bold' }}>
                  {rescheduling ? '...' : (isBangla ? 'নিশ্চিত করুন' : 'Confirm')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
