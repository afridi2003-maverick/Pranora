'use client';

import React, { useState, useEffect } from 'react';
import { useLocale } from '@pranora/i18n';
import { Button, Card, Chip, Modal } from '@pranora/ui';
import {
  listUserBookings,
  cancelBooking,
  rescheduleBooking,
  checkCancellationCutoff,
  CANCELLATION_REASONS,
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
    problemNote: 'Routine vaccination & check-up',
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
    // Imminent appointment within 1 hour to test cut-off display
    startsAt: new Date(Date.now() + 45 * 60 * 1000).toISOString(),
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

export function MyBookings() {
  const { t, isBangla } = useLocale();
  const [tab, setTab] = useState<BookingTab>('upcoming');
  const [bookings, setBookings] = useState<BookingDetails[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionError, setActionError] = useState<string | null>(null);

  // Cancellation Modal State (APT-3)
  const [cancelTargetBooking, setCancelTargetBooking] = useState<BookingDetails | null>(null);
  const [cancelReason, setCancelReason] = useState<string>(CANCELLATION_REASONS[0]);
  const [cancelCustomNote, setCancelCustomNote] = useState<string>('');
  const [cancelling, setCancelling] = useState(false);

  // Reschedule Modal State (APT-3)
  const [rescheduleTargetBooking, setRescheduleTargetBooking] = useState<BookingDetails | null>(null);
  const [newDateOffsetDays, setNewDateOffsetDays] = useState<number>(1);
  const [newTimeHour, setNewTimeHour] = useState<number>(11);
  const [rescheduleReason, setRescheduleReason] = useState<string>('');
  const [rescheduling, setRescheduling] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function fetchBookings() {
      setLoading(true);
      try {
        const data = await listUserBookings(null as any);
        if (isMounted) {
          setBookings(data.length > 0 ? data : MOCK_BOOKINGS);
        }
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
    setActionError(null);

    const fullReason = cancelReason === 'Other' && cancelCustomNote.trim()
      ? cancelCustomNote.trim()
      : cancelCustomNote.trim()
      ? `${cancelReason}: ${cancelCustomNote.trim()}`
      : cancelReason;

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
      setCancelCustomNote('');
    } catch (err: any) {
      setActionError(err.message || 'Failed to cancel booking');
    } finally {
      setCancelling(false);
    }
  };

  const handleConfirmReschedule = async () => {
    if (!rescheduleTargetBooking) return;
    setRescheduling(true);
    setActionError(null);

    // Compute new target slot timestamp
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + newDateOffsetDays);
    targetDate.setHours(newTimeHour, 0, 0, 0);
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
            ? {
                ...b,
                startsAt: newStartsAt,
                status: 'pending',
                cancelReason: rescheduleReason.trim() ? `Rescheduled: ${rescheduleReason}` : b.cancelReason,
              }
            : b
        )
      );
      setRescheduleTargetBooking(null);
      setRescheduleReason('');
    } catch (err: any) {
      setActionError(err.message || 'Failed to reschedule booking');
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
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h1 className="text-2xl font-bold text-foreground">
          {t('booking.myBookings')}
        </h1>
        <div className="text-xs text-content-secondary">
          {isBangla
            ? 'অ্যাপয়েন্টমেন্টের ২ ঘণ্টা আগে পর্যন্ত বাতিল বা পরিবর্তন সম্ভব'
            : 'Cancel or reschedule until 2 hours before appointment (APT-3)'}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border pb-2">
        <button
          className={`px-4 py-2 text-sm font-medium rounded-t transition-colors ${
            tab === 'upcoming'
              ? 'text-primary border-b-2 border-primary font-bold'
              : 'text-content-secondary hover:text-foreground'
          }`}
          onClick={() => setTab('upcoming')}
        >
          {t('booking.upcoming')} ({upcoming.length})
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium rounded-t transition-colors ${
            tab === 'past'
              ? 'text-primary border-b-2 border-primary font-bold'
              : 'text-content-secondary hover:text-foreground'
          }`}
          onClick={() => setTab('past')}
        >
          {t('booking.past')} ({past.length})
        </button>
      </div>

      {/* Error Banner */}
      {actionError && (
        <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 text-red-600 dark:text-red-400 text-sm rounded-lg flex justify-between items-center">
          <span>{actionError}</span>
          <button onClick={() => setActionError(null)} className="text-xs font-bold underline ml-2">
            Dismiss
          </button>
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
        displayed.map((booking) => {
          const cutoff = checkCancellationCutoff(booking.startsAt, 2);
          const isUpcomingActive = tab === 'upcoming' && ['pending', 'confirmed'].includes(booking.status);

          return (
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
                <div className="flex items-center gap-2">
                  <Chip
                    variant="status"
                    statusType={STATUS_TYPE_MAP[booking.status] ?? 'neutral'}
                    label={statusLabel(booking.status)}
                  />
                </div>
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

              {/* Cut-off info / actions for upcoming appointments */}
              {isUpcomingActive && (
                <div className="pt-2 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {cutoff.canModify ? (
                    <div className="text-xs text-content-secondary">
                      ⏱ {isBangla ? 'বাতিল বা পরিবর্তনের সময় বাকি:' : 'Modification window remaining:'}{' '}
                      <span className="font-semibold text-brand-primary">{cutoff.formattedRemaining}</span>
                    </div>
                  ) : (
                    <div className="text-xs text-amber-600 dark:text-amber-400 font-medium bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded">
                      ⚠️ {isBangla
                        ? 'বাতিলের সময়সীমা পার হয়েছে (অ্যাপয়েন্টমেন্টের ২ ঘণ্টার মধ্যে)'
                        : 'Cancellation cutoff passed (< 2h before visit)'}
                    </div>
                  )}

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {cutoff.canModify ? (
                      <>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="text-xs"
                          onClick={() => setRescheduleTargetBooking(booking)}
                        >
                          {t('booking.reschedule.label')}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-600 text-xs"
                          onClick={() => setCancelTargetBooking(booking)}
                        >
                          {t('booking.cancel.label')}
                        </Button>
                      </>
                    ) : (
                      <span className="text-xs text-content-secondary italic">
                        {isBangla ? 'ক্লিনিকে যোগাযোগ করুন' : 'Contact clinic to change'}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </Card>
          );
        })}

      {/* Cancel Modal (APT-3) */}
      {cancelTargetBooking && (
        <Modal
          isOpen={true}
          onClose={() => setCancelTargetBooking(null)}
          title={t('booking.cancel.label')}
        >
          <div className="space-y-4 p-4 text-left">
            <p className="text-sm text-content-secondary">
              {isBangla
                ? `আপনি কি নিশ্চিত যে অ্যাপয়েন্টমেন্ট #${cancelTargetBooking.code} বাতিল করতে চান?`
                : `Are you sure you want to cancel appointment #${cancelTargetBooking.code}?`}
            </p>

            <div>
              <label className="text-xs font-semibold text-content-primary mb-1 block">
                {isBangla ? 'বাতিলের কারণ নির্বাচন করুন:' : 'Select Cancellation Reason:'}
              </label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full text-sm px-3 py-2 border rounded-md bg-surface-primary text-content-primary"
              >
                {CANCELLATION_REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-content-primary mb-1 block">
                {isBangla ? 'অতিরিক্ত বিবরণ (ঐচ্ছিক):' : 'Additional Note (Optional):'}
              </label>
              <textarea
                value={cancelCustomNote}
                onChange={(e) => setCancelCustomNote(e.target.value)}
                placeholder={isBangla ? 'বিস্তারিত কারণ লিখুন...' : 'Add details if needed...'}
                rows={3}
                className="w-full text-sm px-3 py-2 border rounded-md"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="secondary"
                onClick={() => setCancelTargetBooking(null)}
                disabled={cancelling}
              >
                {isBangla ? 'ফিরে যান' : 'Keep Booking'}
              </Button>
              <Button
                variant="danger"
                onClick={handleConfirmCancel}
                disabled={cancelling}
              >
                {cancelling ? (isBangla ? 'বাতিল হচ্ছে...' : 'Cancelling...') : (isBangla ? 'বাতিল নিশ্চিত করুন' : 'Confirm Cancel')}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Reschedule Modal (APT-3) */}
      {rescheduleTargetBooking && (
        <Modal
          isOpen={true}
          onClose={() => setRescheduleTargetBooking(null)}
          title={t('booking.reschedule.title')}
        >
          <div className="space-y-4 p-4 text-left">
            <p className="text-sm text-content-secondary">
              {isBangla
                ? `অ্যাপয়েন্টমেন্ট #${rescheduleTargetBooking.code}-এর জন্য নতুন তারিখ ও সময় স্লট নির্বাচন করুন:`
                : `Select a new date and time slot for appointment #${rescheduleTargetBooking.code}:`}
            </p>

            <div>
              <label className="text-xs font-semibold text-content-primary mb-1 block">
                {isBangla ? 'নতুন তারিখ:' : 'New Date:'}
              </label>
              <select
                value={newDateOffsetDays}
                onChange={(e) => setNewDateOffsetDays(Number(e.target.value))}
                className="w-full text-sm px-3 py-2 border rounded-md"
              >
                <option value={1}>{isBangla ? 'আগামীকাল (Tomorrow)' : 'Tomorrow'}</option>
                <option value={2}>{isBangla ? 'পরশু (In 2 days)' : 'In 2 days'}</option>
                <option value={3}>{isBangla ? '৩ দিন পর (In 3 days)' : 'In 3 days'}</option>
                <option value={5}>{isBangla ? '৫ দিন পর (In 5 days)' : 'In 5 days'}</option>
                <option value={7}>{isBangla ? '১ সপ্তাহ পর (In 1 week)' : 'In 1 week'}</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-content-primary mb-1 block">
                {isBangla ? 'নতুন সময় স্লট:' : 'New Time Slot:'}
              </label>
              <select
                value={newTimeHour}
                onChange={(e) => setNewTimeHour(Number(e.target.value))}
                className="w-full text-sm px-3 py-2 border rounded-md"
              >
                <option value={9}>09:00 AM</option>
                <option value={10}>10:00 AM</option>
                <option value={11}>11:00 AM</option>
                <option value={14}>02:00 PM</option>
                <option value={15}>03:00 PM</option>
                <option value={16}>04:00 PM</option>
                <option value={17}>05:00 PM</option>
                <option value={18}>06:00 PM</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-content-primary mb-1 block">
                {isBangla ? 'সময় পরিবর্তনের কারণ (ঐচ্ছিক):' : 'Reason for Rescheduling (Optional):'}
              </label>
              <input
                type="text"
                value={rescheduleReason}
                onChange={(e) => setRescheduleReason(e.target.value)}
                placeholder={isBangla ? 'যেমন: অফিসে জরুরি কাজ...' : 'e.g. Schedule conflict...'}
                className="w-full text-sm px-3 py-2 border rounded-md"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="secondary"
                onClick={() => setRescheduleTargetBooking(null)}
                disabled={rescheduling}
              >
                {isBangla ? 'বাতিল' : 'Cancel'}
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirmReschedule}
                disabled={rescheduling}
              >
                {rescheduling
                  ? (isBangla ? 'পরিবর্তন হচ্ছে...' : 'Rescheduling...')
                  : (isBangla ? 'পরিবর্তন নিশ্চিত করুন' : 'Confirm Reschedule')}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
