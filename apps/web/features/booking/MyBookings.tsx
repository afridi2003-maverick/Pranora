'use client';

import React, { useState, useEffect } from 'react';
import { useLocale } from '@pranora/i18n';
import { Button, Card, Chip } from '@pranora/ui';
import {
  listUserBookings,
  cancelBooking,
  type BookingDetails,
} from '@pranora/api';

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

/** Mock bookings for offline / no-auth UI development */
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
  if (['cancelled_by_owner', 'cancelled_by_provider', 'no_show', 'expired', 'completed'].includes(b.status)) {
    return false;
  }
  if (b.startsAt) {
    return new Date(b.startsAt) >= new Date();
  }
  return true;
}

export function MyBookings() {
  const { t } = useLocale();
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const [bookings, setBookings] = useState<BookingDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelError, setCancelError] = useState<string | null>(null);

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
    return () => { isMounted = false; };
  }, []);

  const upcoming = bookings.filter(isUpcoming);
  const past = bookings.filter((b) => !isUpcoming(b));
  const displayed = tab === 'upcoming' ? upcoming : past;

  const handleCancel = async (bookingId: string) => {
    if (!confirm(t('booking.cancel.confirm'))) return;
    setCancellingId(bookingId);
    setCancelError(null);
    try {
      await cancelBooking(null as any, { bookingId, reason: 'User cancelled' });
      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId ? { ...b, status: 'cancelled_by_owner' } : b
        )
      );
    } catch (err) {
      setCancelError(err instanceof Error ? err.message : 'Cancel failed');
    } finally {
      setCancellingId(null);
    }
  };

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

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-foreground">
        {t('booking.myBookings')}
      </h1>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border pb-2">
        <button
          className={`px-4 py-2 text-sm font-medium rounded-t transition-colors ${
            tab === 'upcoming'
              ? 'text-primary border-b-2 border-primary'
              : 'text-content-secondary hover:text-foreground'
          }`}
          onClick={() => setTab('upcoming')}
        >
          {t('booking.upcoming')} ({upcoming.length})
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium rounded-t transition-colors ${
            tab === 'past'
              ? 'text-primary border-b-2 border-primary'
              : 'text-content-secondary hover:text-foreground'
          }`}
          onClick={() => setTab('past')}
        >
          {t('booking.past')} ({past.length})
        </button>
      </div>

      {/* Error */}
      {cancelError && (
        <div className="p-3 bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 text-sm rounded-lg">
          {cancelError}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      )}

      {/* Empty */}
      {!loading && displayed.length === 0 && (
        <div className="py-12 text-center text-content-secondary">
          {t('booking.noBookings')}
        </div>
      )}

      {/* Booking Cards */}
      {!loading &&
        displayed.map((booking) => (
          <Card key={booking.id} className="p-4 space-y-3">
            {/* Header row */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div>
                <p className="text-xs text-content-secondary">
                  {t('booking.summary.clinic')} · {booking.locationId}
                </p>
                <p className="font-semibold text-foreground font-mono text-sm mt-0.5">
                  {booking.code}
                </p>
              </div>
              <Chip
                variant="status"
                statusType={STATUS_TYPE_MAP[booking.status] ?? 'neutral'}
                label={statusLabel(booking.status)}
              />
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-content-secondary">
              <span>
                <strong>{t('booking.summary.date')}:</strong>{' '}
                {formatDateTime(booking.startsAt)}
              </span>
              {booking.type === 'serial' && booking.serialNo != null && (
                <span>
                  <strong>{t('booking.summary.serial')}:</strong> #{booking.serialNo}
                </span>
              )}
              {booking.paymentMethod && (
                <span>
                  <strong>{t('booking.payment.method')}:</strong>{' '}
                  {booking.paymentMethod === 'cash'
                    ? t('booking.payment.cash')
                    : booking.paymentMethod}
                </span>
              )}
              {booking.price != null && (
                <span>
                  <strong>{t('booking.payment.fee')}:</strong> ৳{booking.price}
                </span>
              )}
            </div>

            {booking.problemNote && (
              <p className="text-xs text-content-secondary italic line-clamp-2">
                {booking.problemNote}
              </p>
            )}

            {/* Actions — only for upcoming/cancellable */}
            {tab === 'upcoming' &&
              ['pending', 'confirmed'].includes(booking.status) && (
                <div className="flex gap-2 pt-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-600 text-xs"
                    onClick={() => handleCancel(booking.id)}
                    disabled={cancellingId === booking.id}
                  >
                    {cancellingId === booking.id ? '...' : t('booking.cancel.label')}
                  </Button>
                </div>
              )}
          </Card>
        ))}
    </div>
  );
}
