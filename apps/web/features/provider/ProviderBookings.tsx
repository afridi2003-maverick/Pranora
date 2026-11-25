'use client';

import React, { useState, useEffect } from 'react';
import { useLocale } from '@pranora/i18n';
import { Button, Card, Chip, Textarea } from '@pranora/ui';
import {
  listProviderBookings,
  confirmBooking,
  rejectBooking,
  startConsultation,
  completeBooking,
  markNoShow,
  recordCashPayment,
  type BookingDetails,
  type BookingStatus,
} from '@pranora/api';
import { useSession } from '../../hooks/useSession';

const STATUS_TYPE_MAP: Record<string, 'pending' | 'confirmed' | 'completed' | 'emergency' | 'neutral'> = {
  pending: 'pending',
  confirmed: 'confirmed',
  in_progress: 'confirmed',
  completed: 'completed',
  cancelled_by_owner: 'neutral',
  cancelled_by_provider: 'neutral',
  no_show: 'emergency',
  expired: 'neutral',
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

export interface ProviderBookingsProps {
  locationId?: string;
}

export function ProviderBookings({
  locationId = 'loc-dhaka-mirpur',
}: ProviderBookingsProps) {
  const { t, isBangla } = useLocale();
  const { supabase, isConfigured, isAuthenticated } = useSession();
  const [tab, setTab] = useState<ProviderTab>('pending');
  const [bookings, setBookings] = useState<BookingDetails[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Decline Modal State
  const [declineTargetId, setDeclineTargetId] = useState<string | null>(null);
  const [declineReason, setDeclineReason] = useState<string>('');

  // Cash Receipt Modal State (PAY-1)
  const [receiptBooking, setReceiptBooking] = useState<BookingDetails | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchBookings() {
      setLoading(true);
      try {
        if (!isConfigured || !isAuthenticated) {
          if (isMounted) setBookings(MOCK_PROVIDER_BOOKINGS);
          return;
        }
        const data = await listProviderBookings(supabase, locationId);
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

  // Tab Filtering
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

  // Actions
  const handleConfirm = async (bookingId: string) => {
    setActionLoadingId(bookingId);
    setActionError(null);
    try {
      await confirmBooking(isConfigured && isAuthenticated ? supabase : (null as any), bookingId);
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: 'confirmed' } : b))
      );
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Confirmation failed');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeclineSubmit = async () => {
    if (!declineTargetId) return;
    setActionLoadingId(declineTargetId);
    setActionError(null);
    try {
      await rejectBooking(isConfigured && isAuthenticated ? supabase : (null as any), declineTargetId, declineReason || 'Declined by clinic');
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
      setActionError(err instanceof Error ? err.message : 'Decline failed');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleStartConsultation = async (bookingId: string) => {
    setActionLoadingId(bookingId);
    setActionError(null);
    try {
      await startConsultation(isConfigured && isAuthenticated ? supabase : (null as any), bookingId);
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: 'in_progress' } : b))
      );
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Check-in failed');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleComplete = async (bookingId: string) => {
    setActionLoadingId(bookingId);
    setActionError(null);
    try {
      await completeBooking(isConfigured && isAuthenticated ? supabase : (null as any), bookingId);
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: 'completed' } : b))
      );
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Completion failed');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleNoShow = async (bookingId: string) => {
    if (!confirm(isBangla ? 'রোগী কি অনুপস্থিত ছিলেন?' : 'Mark this patient as No-Show?')) return;
    setActionLoadingId(bookingId);
    setActionError(null);
    try {
      await markNoShow(isConfigured && isAuthenticated ? supabase : (null as any), bookingId);
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: 'no_show' } : b))
      );
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCollectCash = async (booking: BookingDetails) => {
    setActionLoadingId(booking.id);
    setActionError(null);
    try {
      await recordCashPayment(isConfigured && isAuthenticated ? supabase : (null as any), {
        bookingId: booking.id,
        amount: booking.price ?? 500,
      });
      setBookings((prev) =>
        prev.map((b) =>
          b.id === booking.id ? { ...b, paymentStatus: 'paid', paymentMethod: 'cash' } : b
        )
      );
      setReceiptBooking({ ...booking, paymentStatus: 'paid', paymentMethod: 'cash' });
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Cash collection failed');
    } finally {
      setActionLoadingId(null);
    }
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {t('booking.provider.title')}
        </h1>
        <p className="text-sm text-content-secondary mt-1">
          {t('booking.provider.subtitle')}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border pb-2 overflow-x-auto">
        <button
          className={`px-4 py-2 text-sm font-semibold rounded-t transition-colors whitespace-nowrap ${
            tab === 'pending'
              ? 'text-primary border-b-2 border-primary'
              : 'text-content-secondary hover:text-foreground'
          }`}
          onClick={() => setTab('pending')}
        >
          {t('booking.provider.tabs.pending')} ({pendingList.length})
        </button>
        <button
          className={`px-4 py-2 text-sm font-semibold rounded-t transition-colors whitespace-nowrap ${
            tab === 'confirmed'
              ? 'text-primary border-b-2 border-primary'
              : 'text-content-secondary hover:text-foreground'
          }`}
          onClick={() => setTab('confirmed')}
        >
          {t('booking.provider.tabs.confirmed')} ({confirmedList.length})
        </button>
        <button
          className={`px-4 py-2 text-sm font-semibold rounded-t transition-colors whitespace-nowrap ${
            tab === 'in_progress'
              ? 'text-primary border-b-2 border-primary'
              : 'text-content-secondary hover:text-foreground'
          }`}
          onClick={() => setTab('in_progress')}
        >
          {t('booking.provider.tabs.inProgress')} ({inProgressList.length})
        </button>
        <button
          className={`px-4 py-2 text-sm font-semibold rounded-t transition-colors whitespace-nowrap ${
            tab === 'completed'
              ? 'text-primary border-b-2 border-primary'
              : 'text-content-secondary hover:text-foreground'
          }`}
          onClick={() => setTab('completed')}
        >
          {t('booking.provider.tabs.completed')} ({historyList.length})
        </button>
      </div>

      {/* Action Error Alert */}
      {actionError && (
        <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl text-red-700 dark:text-red-400 text-sm">
          {actionError}
        </div>
      )}

      {/* Loading Spinner */}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      )}

      {/* Empty State */}
      {!loading && currentList.length === 0 && (
        <div className="py-16 text-center text-content-secondary text-sm">
          {tab === 'pending'
            ? t('booking.provider.empty.pending')
            : tab === 'confirmed'
            ? t('booking.provider.empty.confirmed')
            : tab === 'in_progress'
            ? t('booking.provider.empty.inProgress')
            : t('booking.provider.empty.completed')}
        </div>
      )}

      {/* Bookings Grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentList.map((booking) => {
            const isLoading = actionLoadingId === booking.id;
            return (
              <Card key={booking.id} className="p-5 space-y-4 border border-stroke-subtle">
                {/* Header: Code + Status */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-mono text-content-secondary block">
                      Ref: {booking.code}
                    </span>
                    <span className="font-semibold text-base text-foreground mt-0.5 block">
                      {booking.type === 'serial' && booking.serialNo != null
                        ? `${isBangla ? 'সিরিয়াল' : 'Serial'} #${booking.serialNo}`
                        : formatDateTime(booking.startsAt)}
                    </span>
                  </div>
                  <Chip
                    variant="status"
                    statusType={STATUS_TYPE_MAP[booking.status] ?? 'neutral'}
                    label={statusLabel(booking.status)}
                  />
                </div>

                {/* Patient & Service details */}
                <div className="grid grid-cols-2 gap-2 text-xs text-content-secondary bg-surface-secondary/40 p-3 rounded-xl">
                  <div>
                    <span className="font-medium text-foreground">{t('booking.summary.pet')}: </span>
                    {booking.petId ? 'Pet #' + booking.petId.substring(0, 5) : (isBangla ? 'সাধারণ' : 'General')}
                  </div>
                  <div>
                    <span className="font-medium text-foreground">{t('booking.summary.price')}: </span>
                    ৳{booking.price ?? 500}
                  </div>
                  <div className="col-span-2 flex items-center justify-between pt-1 border-t border-stroke-subtle">
                    <div>
                      <span className="font-medium text-foreground">{t('booking.payment.method')}: </span>
                      {booking.paymentMethod === 'cash' ? t('booking.payment.cash') : booking.paymentMethod}
                      <span className={`ml-2 font-mono text-[11px] font-bold uppercase ${
                        booking.paymentStatus === 'paid' ? 'text-green-600 dark:text-lime-400' : 'text-amber-600'
                      }`}>
                        ({booking.paymentStatus === 'paid' ? t('booking.payment.paid') : t('booking.payment.pending')})
                      </span>
                    </div>
                    {booking.paymentStatus !== 'paid' && !['cancelled_by_owner', 'cancelled_by_provider'].includes(booking.status) && (
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={isLoading}
                        onClick={() => handleCollectCash(booking)}
                        className="text-xs"
                      >
                        💵 {t('booking.payment.collectCash')}
                      </Button>
                    )}
                  </div>
                </div>

                {booking.problemNote && (
                  <p className="text-xs text-content-secondary italic line-clamp-2 bg-neutral-100 dark:bg-neutral-900 p-2.5 rounded-lg">
                    "{booking.problemNote}"
                  </p>
                )}

                {/* Actions Bar */}
                <div className="pt-2 border-t border-stroke-subtle flex flex-wrap gap-2 justify-end">
                  {/* PENDING: Confirm or Decline */}
                  {booking.status === 'pending' && (
                    <>
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={isLoading}
                        onClick={() => {
                          setDeclineTargetId(booking.id);
                          setDeclineReason('');
                        }}
                      >
                        {t('booking.provider.actions.decline')}
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        disabled={isLoading}
                        onClick={() => handleConfirm(booking.id)}
                      >
                        {isLoading ? '...' : t('booking.provider.actions.confirm')}
                      </Button>
                    </>
                  )}

                  {/* CONFIRMED: Start Visit or No-Show */}
                  {booking.status === 'confirmed' && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-600"
                        disabled={isLoading}
                        onClick={() => handleNoShow(booking.id)}
                      >
                        {t('booking.provider.actions.noShow')}
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        disabled={isLoading}
                        onClick={() => handleStartConsultation(booking.id)}
                      >
                        {isLoading ? '...' : t('booking.provider.actions.startVisit')}
                      </Button>
                    </>
                  )}

                  {/* IN_PROGRESS: Complete */}
                  {booking.status === 'in_progress' && (
                    <Button
                      variant="primary"
                      size="sm"
                      disabled={isLoading}
                      onClick={() => handleComplete(booking.id)}
                    >
                      {isLoading ? '...' : t('booking.provider.actions.complete')}
                    </Button>
                  )}

                  {/* HISTORY: Just display cancel reason if exists */}
                  {booking.cancelReason && (
                    <span className="text-xs text-red-500">
                      Reason: {booking.cancelReason}
                    </span>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Decline Reason Modal */}
      {declineTargetId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-app-card border border-stroke-medium rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-foreground">
              {t('booking.provider.declineModal.title')}
            </h3>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-content-secondary">
                {t('booking.provider.declineModal.reasonLabel')}
              </label>
              <Textarea
                rows={3}
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                placeholder={t('booking.provider.declineModal.reasonPlaceholder')}
                className="w-full text-sm"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setDeclineTargetId(null);
                  setDeclineReason('');
                }}
              >
                {t('booking.provider.declineModal.cancel')}
              </Button>
              <Button
                variant="danger"
                size="sm"
                disabled={actionLoadingId === declineTargetId}
                onClick={handleDeclineSubmit}
              >
                {actionLoadingId === declineTargetId
                  ? '...'
                  : t('booking.provider.declineModal.confirm')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* PAY-1: Cash Receipt Modal */}
      {receiptBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-app-card border border-stroke-medium rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🧾</span>
              <div>
                <h3 className="text-lg font-bold text-foreground">
                  {t('booking.payment.receipt')}
                </h3>
                <p className="text-xs text-content-secondary">
                  {t('booking.payment.receiptNotice')}
                </p>
              </div>
            </div>

            <div className="bg-surface-secondary/60 p-4 rounded-xl space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-stroke-subtle">
                <span className="text-content-secondary">Booking Ref:</span>
                <span className="font-mono font-bold text-foreground">{receiptBooking.code}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stroke-subtle">
                <span className="text-content-secondary">{t('booking.summary.price')}:</span>
                <span className="font-bold text-green-600 dark:text-lime-400 text-sm">
                  ৳{receiptBooking.price ?? 500}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-stroke-subtle">
                <span className="text-content-secondary">{t('booking.payment.method')}:</span>
                <span className="font-semibold text-foreground">{t('booking.payment.cash')}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-content-secondary">Status:</span>
                <Chip variant="status" statusType="confirmed" label={t('booking.payment.paid')} />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setReceiptBooking(null)}
              >
                OK
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
