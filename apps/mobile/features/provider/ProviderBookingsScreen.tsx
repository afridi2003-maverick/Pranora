import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { useLocale } from '@pranora/i18n';
import {
  listProviderBookings,
  confirmBooking,
  rejectBooking,
  startConsultation,
  completeBooking,
  markNoShow,
  type BookingDetails,
  type BookingStatus,
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

const MOCK_PROVIDER_BOOKINGS: BookingDetails[] = [
  {
    id: 'mock-p1',
    code: 'PRN-REQ001',
    ownerId: 'user-2',
    petId: 'pet-1',
    locationId: 'loc-dhaka-mirpur',
    vetId: null,
    providerServiceId: 'svc-1',
    type: 'slot',
    status: 'pending',
    startsAt: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    endsAt: null,
    serialNo: null,
    addressId: null,
    problemNote: 'Cat has ear infection and scratch marks',
    attachments: [],
    price: 600,
    paymentMethod: 'cash',
    paymentStatus: 'pending',
    cancelReason: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'mock-p2',
    code: 'PRN-24K7Q9',
    ownerId: 'user-1',
    petId: 'pet-2',
    locationId: 'loc-dhaka-mirpur',
    vetId: null,
    providerServiceId: 'svc-2',
    type: 'slot',
    status: 'confirmed',
    startsAt: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(),
    endsAt: null,
    serialNo: null,
    addressId: null,
    problemNote: 'Routine vaccination booster',
    attachments: [],
    price: 450,
    paymentMethod: 'cash',
    paymentStatus: 'pending',
    cancelReason: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'mock-p3',
    code: 'PRN-VIP999',
    ownerId: 'user-3',
    petId: 'pet-3',
    locationId: 'loc-dhaka-mirpur',
    vetId: null,
    providerServiceId: 'svc-1',
    type: 'serial',
    status: 'in_progress',
    startsAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    endsAt: null,
    serialNo: 2,
    addressId: null,
    problemNote: 'Follow-up dental check',
    attachments: [],
    price: 500,
    paymentMethod: 'cash',
    paymentStatus: 'pending',
    cancelReason: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'mock-p4',
    code: 'PRN-OLD123',
    ownerId: 'user-4',
    petId: 'pet-4',
    locationId: 'loc-dhaka-mirpur',
    vetId: null,
    providerServiceId: 'svc-2',
    type: 'slot',
    status: 'completed',
    startsAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    endsAt: null,
    serialNo: null,
    addressId: null,
    problemNote: 'General health checkup',
    attachments: [],
    price: 450,
    paymentMethod: 'cash',
    paymentStatus: 'paid',
    cancelReason: null,
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

type ProviderTab = 'pending' | 'confirmed' | 'in_progress' | 'completed';

export interface ProviderBookingsScreenProps {
  locationId?: string;
}

export function ProviderBookingsScreen({
  locationId = 'loc-dhaka-mirpur',
}: ProviderBookingsScreenProps) {
  const { t, isBangla } = useLocale();
  const [tab, setTab] = useState<ProviderTab>('pending');
  const [bookings, setBookings] = useState<BookingDetails[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Decline Dialog
  const [declineTargetId, setDeclineTargetId] = useState<string | null>(null);
  const [declineReason, setDeclineReason] = useState<string>('');

  useEffect(() => {
    let isMounted = true;
    async function fetchBookings() {
      setLoading(true);
      try {
        const data = await listProviderBookings(null as any, locationId);
        if (isMounted) setBookings(data.length > 0 ? data : MOCK_PROVIDER_BOOKINGS);
      } catch {
        if (isMounted) setBookings(MOCK_PROVIDER_BOOKINGS);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchBookings();
    return () => {
      isMounted = false;
    };
  }, [locationId]);

  const pendingList = bookings.filter((b) => b.status === 'pending');
  const confirmedList = bookings.filter((b) => b.status === 'confirmed');
  const inProgressList = bookings.filter((b) => b.status === 'in_progress');
  const historyList = bookings.filter((b) =>
    ['completed', 'cancelled_by_provider', 'cancelled_by_owner', 'no_show', 'expired'].includes(b.status)
  );

  const currentList =
    tab === 'pending'
      ? pendingList
      : tab === 'confirmed'
      ? confirmedList
      : tab === 'in_progress'
      ? inProgressList
      : historyList;

  const handleConfirm = async (bookingId: string) => {
    setActionLoadingId(bookingId);
    try {
      await confirmBooking(null as any, bookingId);
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: 'confirmed' } : b))
      );
    } catch (err: unknown) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Confirmation failed');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeclineSubmit = async () => {
    if (!declineTargetId) return;
    setActionLoadingId(declineTargetId);
    try {
      await rejectBooking(null as any, declineTargetId, declineReason || 'Declined by clinic');
      setBookings((prev) =>
        prev.map((b) =>
          b.id === declineTargetId
            ? { ...b, status: 'cancelled_by_provider', cancelReason: declineReason }
            : b
        )
      );
      setDeclineTargetId(null);
      setDeclineReason('');
    } catch (err: unknown) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Decline failed');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleStartConsultation = async (bookingId: string) => {
    setActionLoadingId(bookingId);
    try {
      await startConsultation(null as any, bookingId);
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: 'in_progress' } : b))
      );
    } catch (err: unknown) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Check-in failed');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleComplete = async (bookingId: string) => {
    setActionLoadingId(bookingId);
    try {
      await completeBooking(null as any, bookingId);
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: 'completed' } : b))
      );
    } catch (err: unknown) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Completion failed');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleNoShow = (bookingId: string) => {
    Alert.alert(
      isBangla ? 'অনুপস্থিত' : 'Mark No-Show',
      isBangla ? 'রোগী কি অনুপস্থিত ছিলেন?' : 'Did the patient fail to show up?',
      [
        { text: isBangla ? 'না' : 'Cancel', style: 'cancel' },
        {
          text: isBangla ? 'হ্যাঁ, অনুপস্থিত' : 'Yes, No-Show',
          style: 'destructive',
          onPress: async () => {
            setActionLoadingId(bookingId);
            try {
              await markNoShow(null as any, bookingId);
              setBookings((prev) =>
                prev.map((b) => (b.id === bookingId ? { ...b, status: 'no_show' } : b))
              );
            } catch (err: unknown) {
              Alert.alert('Error', err instanceof Error ? err.message : 'Action failed');
            } finally {
              setActionLoadingId(null);
            }
          },
        },
      ]
    );
  };

  const statusLabel = (status: BookingStatus): string => {
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
    <View className="flex-1 bg-neutral-50 dark:bg-neutral-950">
      {/* Header */}
      <View className="px-4 pt-12 pb-3 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
        <Text className="text-xl font-bold text-foreground">
          {t('booking.provider.title')}
        </Text>
        <Text className="text-xs text-content-secondary mt-0.5">
          {t('booking.provider.subtitle')}
        </Text>
      </View>

      {/* Tabs */}
      <View className="flex-row bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
        <TouchableOpacity
          className={`flex-1 py-3 items-center border-b-2 ${
            tab === 'pending' ? 'border-primary' : 'border-transparent'
          }`}
          onPress={() => setTab('pending')}
        >
          <Text
            className={`text-xs font-semibold ${
              tab === 'pending' ? 'text-primary' : 'text-content-secondary'
            }`}
          >
            {isBangla ? 'অনুরোধ' : 'Requests'} ({pendingList.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={`flex-1 py-3 items-center border-b-2 ${
            tab === 'confirmed' ? 'border-primary' : 'border-transparent'
          }`}
          onPress={() => setTab('confirmed')}
        >
          <Text
            className={`text-xs font-semibold ${
              tab === 'confirmed' ? 'text-primary' : 'text-content-secondary'
            }`}
          >
            {isBangla ? 'নিশ্চিত' : 'Confirmed'} ({confirmedList.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={`flex-1 py-3 items-center border-b-2 ${
            tab === 'in_progress' ? 'border-primary' : 'border-transparent'
          }`}
          onPress={() => setTab('in_progress')}
        >
          <Text
            className={`text-xs font-semibold ${
              tab === 'in_progress' ? 'text-primary' : 'text-content-secondary'
            }`}
          >
            {isBangla ? 'চলমান' : 'Active'} ({inProgressList.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={`flex-1 py-3 items-center border-b-2 ${
            tab === 'completed' ? 'border-primary' : 'border-transparent'
          }`}
          onPress={() => setTab('completed')}
        >
          <Text
            className={`text-xs font-semibold ${
              tab === 'completed' ? 'text-primary' : 'text-content-secondary'
            }`}
          >
            {isBangla ? 'ইতিহাস' : 'History'} ({historyList.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#6366f1" />
        </View>
      ) : (
        <ScrollView className="flex-1 p-4" contentContainerStyle={{ paddingBottom: 40 }}>
          {currentList.length === 0 && (
            <Text className="text-center text-content-secondary py-16 text-sm">
              {tab === 'pending'
                ? t('booking.provider.empty.pending')
                : tab === 'confirmed'
                ? t('booking.provider.empty.confirmed')
                : tab === 'in_progress'
                ? t('booking.provider.empty.inProgress')
                : t('booking.provider.empty.completed')}
            </Text>
          )}

          {currentList.map((booking) => {
            const isLoading = actionLoadingId === booking.id;
            return (
              <View
                key={booking.id}
                className="bg-white dark:bg-neutral-900 rounded-xl p-4 mb-3 border border-neutral-200 dark:border-neutral-800"
              >
                {/* Header: Code + Status */}
                <View className="flex-row justify-between items-start mb-2">
                  <View>
                    <Text className="text-xs font-mono text-content-secondary">
                      Ref: {booking.code}
                    </Text>
                    <Text className="font-bold text-foreground text-sm mt-0.5">
                      {booking.type === 'serial' && booking.serialNo != null
                        ? `${isBangla ? 'সিরিয়াল' : 'Serial'} #${booking.serialNo}`
                        : formatDateTime(booking.startsAt)}
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
                      className="text-xs font-semibold"
                      style={{ color: STATUS_COLORS[booking.status] ?? '#6b7280' }}
                    >
                      {statusLabel(booking.status)}
                    </Text>
                  </View>
                </View>

                {/* Details */}
                <View className="bg-neutral-50 dark:bg-neutral-800/50 p-2.5 rounded-lg mb-2">
                  <Text className="text-xs text-content-secondary mb-0.5">
                    <Text className="font-medium text-foreground">{t('booking.summary.pet')}: </Text>
                    {booking.petId ? 'Pet #' + booking.petId.substring(0, 5) : (isBangla ? 'সাধারণ' : 'General')}
                  </Text>
                  <Text className="text-xs text-content-secondary mb-0.5">
                    <Text className="font-medium text-foreground">{t('booking.summary.price')}: </Text>
                    ৳{booking.price ?? 500} ({booking.paymentMethod})
                  </Text>
                  {booking.problemNote ? (
                    <Text className="text-xs text-content-secondary italic mt-1" numberOfLines={2}>
                      "{booking.problemNote}"
                    </Text>
                  ) : null}
                </View>

                {/* Actions */}
                <View className="flex-row justify-end gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                  {booking.status === 'pending' && (
                    <>
                      <TouchableOpacity
                        className="px-3 py-1.5 rounded-lg border border-red-500"
                        disabled={isLoading}
                        onPress={() => {
                          setDeclineTargetId(booking.id);
                          setDeclineReason('');
                        }}
                      >
                        <Text className="text-xs font-semibold text-red-500">
                          {t('booking.provider.actions.decline')}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        className="px-3 py-1.5 rounded-lg bg-green-600"
                        disabled={isLoading}
                        onPress={() => handleConfirm(booking.id)}
                      >
                        <Text className="text-xs font-semibold text-white">
                          {isLoading ? '...' : t('booking.provider.actions.confirm')}
                        </Text>
                      </TouchableOpacity>
                    </>
                  )}

                  {booking.status === 'confirmed' && (
                    <>
                      <TouchableOpacity
                        className="px-3 py-1.5 rounded-lg border border-red-400"
                        disabled={isLoading}
                        onPress={() => handleNoShow(booking.id)}
                      >
                        <Text className="text-xs font-semibold text-red-500">
                          {t('booking.provider.actions.noShow')}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        className="px-3 py-1.5 rounded-lg bg-primary"
                        disabled={isLoading}
                        onPress={() => handleStartConsultation(booking.id)}
                      >
                        <Text className="text-xs font-semibold text-white">
                          {isLoading ? '...' : t('booking.provider.actions.startVisit')}
                        </Text>
                      </TouchableOpacity>
                    </>
                  )}

                  {booking.status === 'in_progress' && (
                    <TouchableOpacity
                      className="px-4 py-2 rounded-lg bg-green-600"
                      disabled={isLoading}
                      onPress={() => handleComplete(booking.id)}
                    >
                      <Text className="text-xs font-semibold text-white">
                        {isLoading ? '...' : t('booking.provider.actions.complete')}
                      </Text>
                    </TouchableOpacity>
                  )}

                  {booking.cancelReason && (
                    <Text className="text-xs text-red-500">
                      Reason: {booking.cancelReason}
                    </Text>
                  )}
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}

      {/* Decline Note Modal */}
      {declineTargetId && (
        <View className="absolute inset-0 bg-black/50 justify-center items-center p-4">
          <View className="bg-white dark:bg-neutral-900 rounded-2xl p-5 w-full max-w-sm border border-neutral-200 dark:border-neutral-800">
            <Text className="text-base font-bold text-foreground mb-2">
              {t('booking.provider.declineModal.title')}
            </Text>
            <TextInput
              className="border border-neutral-300 dark:border-neutral-700 rounded-xl p-3 text-xs text-foreground bg-neutral-50 dark:bg-neutral-800 mb-3"
              placeholder={t('booking.provider.declineModal.reasonPlaceholder')}
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={3}
              value={declineReason}
              onChangeText={setDeclineReason}
            />
            <View className="flex-row justify-end gap-2">
              <TouchableOpacity
                className="px-3 py-2 rounded-lg bg-neutral-200 dark:bg-neutral-700"
                onPress={() => setDeclineTargetId(null)}
              >
                <Text className="text-xs font-semibold text-foreground">
                  {t('booking.provider.declineModal.cancel')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="px-3 py-2 rounded-lg bg-red-600"
                disabled={actionLoadingId === declineTargetId}
                onPress={handleDeclineSubmit}
              >
                <Text className="text-xs font-semibold text-white">
                  {actionLoadingId === declineTargetId
                    ? '...'
                    : t('booking.provider.declineModal.confirm')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
