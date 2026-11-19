import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocale } from '@pranora/i18n';
import {
  listUserBookings,
  cancelBooking,
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
    problemNote: 'Routine check-up',
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
    code: 'PRN-18B3X2',
    ownerId: 'user-1',
    petId: 'pet-2',
    locationId: 'loc-dhaka-gulshan',
    vetId: null,
    providerServiceId: 'svc-2',
    type: 'serial',
    status: 'completed',
    startsAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    endsAt: null,
    serialNo: 4,
    addressId: null,
    problemNote: null,
    attachments: [],
    price: 300,
    paymentMethod: 'cash',
    paymentStatus: 'paid',
    cancelReason: null,
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

function isUpcoming(b: BookingDetails): boolean {
  if (
    ['cancelled_by_owner', 'cancelled_by_provider', 'no_show', 'expired', 'completed'].includes(
      b.status
    )
  ) {
    return false;
  }
  if (b.startsAt) return new Date(b.startsAt) >= new Date();
  return true;
}

export function MyBookingsScreen() {
  const { t, isBangla } = useLocale();
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const [bookings, setBookings] = useState<BookingDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function load() {
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
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const upcoming = bookings.filter(isUpcoming);
  const past = bookings.filter((b) => !isUpcoming(b));
  const displayed = tab === 'upcoming' ? upcoming : past;

  const statusLabel = (status: string): string => {
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

  const handleCancel = (bookingId: string) => {
    Alert.alert(
      isBangla ? 'বুকিং বাতিল' : 'Cancel Booking',
      t('booking.cancel.confirm'),
      [
        { text: isBangla ? 'না' : 'No', style: 'cancel' },
        {
          text: isBangla ? 'হ্যাঁ, বাতিল করুন' : 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            setCancellingId(bookingId);
            try {
              await cancelBooking(null as any, {
                bookingId,
                reason: 'User cancelled',
              });
              setBookings((prev) =>
                prev.map((b) =>
                  b.id === bookingId ? { ...b, status: 'cancelled_by_owner' } : b
                )
              );
            } catch (err) {
              Alert.alert(
                'Error',
                err instanceof Error ? err.message : 'Cancel failed'
              );
            } finally {
              setCancellingId(null);
            }
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-neutral-50 dark:bg-neutral-950">
      {/* Header */}
      <View className="px-4 pt-12 pb-4 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
        <Text className="text-xl font-bold text-foreground">
          {t('booking.myBookings')}
        </Text>
      </View>

      {/* Tab Row */}
      <View className="flex-row bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
        {(['upcoming', 'past'] as const).map((tabKey) => (
          <TouchableOpacity
            key={tabKey}
            className={`flex-1 py-3 items-center border-b-2 ${
              tab === tabKey
                ? 'border-primary'
                : 'border-transparent'
            }`}
            onPress={() => setTab(tabKey)}
          >
            <Text
              className={`text-sm font-medium ${
                tab === tabKey ? 'text-primary' : 'text-content-secondary'
              }`}
            >
              {tabKey === 'upcoming'
                ? `${t('booking.upcoming')} (${upcoming.length})`
                : `${t('booking.past')} (${past.length})`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#6366f1" />
        </View>
      ) : (
        <ScrollView className="flex-1 p-4" contentContainerStyle={{ paddingBottom: 32 }}>
          {displayed.length === 0 && (
            <Text className="text-center text-content-secondary py-12">
              {t('booking.noBookings')}
            </Text>
          )}

          {displayed.map((booking) => (
            <View
              key={booking.id}
              className="bg-white dark:bg-neutral-900 rounded-xl p-4 mb-3 border border-neutral-200 dark:border-neutral-800"
            >
              {/* Code + Status */}
              <View className="flex-row justify-between items-start mb-2">
                <View>
                  <Text className="text-xs text-content-secondary">
                    {booking.locationId}
                  </Text>
                  <Text className="font-mono font-bold text-foreground text-sm mt-0.5">
                    {booking.code}
                  </Text>
                </View>
                <View
                  className="rounded-full px-2 py-0.5"
                  style={{
                    backgroundColor:
                      (STATUS_COLORS[booking.status] ?? '#6b7280') + '22',
                  }}
                >
                  <Text
                    className="text-xs font-medium"
                    style={{ color: STATUS_COLORS[booking.status] ?? '#6b7280' }}
                  >
                    {statusLabel(booking.status)}
                  </Text>
                </View>
              </View>

              {/* Details */}
              <View className="space-y-1">
                <Text className="text-xs text-content-secondary">
                  <Text className="font-medium">{t('booking.summary.date')}: </Text>
                  {formatDateTime(booking.startsAt)}
                </Text>
                {booking.type === 'serial' && booking.serialNo != null && (
                  <Text className="text-xs text-content-secondary">
                    <Text className="font-medium">{t('booking.summary.serial')}: </Text>
                    #{booking.serialNo}
                  </Text>
                )}
                {booking.price != null && (
                  <Text className="text-xs text-content-secondary">
                    <Text className="font-medium">{t('booking.payment.fee')}: </Text>
                    ৳{booking.price}
                  </Text>
                )}
                {booking.problemNote ? (
                  <Text
                    className="text-xs text-content-secondary italic"
                    numberOfLines={2}
                  >
                    {booking.problemNote}
                  </Text>
                ) : null}
              </View>

              {/* Cancel action */}
              {tab === 'upcoming' &&
                ['pending', 'confirmed'].includes(booking.status) && (
                  <TouchableOpacity
                    className="mt-3 self-start"
                    onPress={() => handleCancel(booking.id)}
                    disabled={cancellingId === booking.id}
                  >
                    <Text className="text-xs text-red-500 font-medium">
                      {cancellingId === booking.id
                        ? '...'
                        : t('booking.cancel.label')}
                    </Text>
                  </TouchableOpacity>
                )}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
