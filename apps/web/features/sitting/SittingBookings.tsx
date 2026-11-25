'use client';

import React, { useState, useEffect } from 'react';
import { useLocale } from '@pranora/i18n';
import { Button, Card } from '@pranora/ui';
import {
  SittingBooking,
  listMySittingBookings,
  cancelSittingBooking,
} from '@pranora/api';
import { useSession } from '../../hooks/useSession';

interface SittingBookingsProps {
  onRefreshTrigger?: number;
}

export function SittingBookings({ onRefreshTrigger = 0 }: SittingBookingsProps) {
  const { t, isBangla } = useLocale();
  const { supabase, isConfigured, isAuthenticated } = useSession();
  const [bookings, setBookings] = useState<SittingBooking[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const data = await listMySittingBookings(isConfigured && isAuthenticated ? supabase : null);
      setBookings(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [onRefreshTrigger]);

  const handleCancel = async (id: string) => {
    const confirmed = window.confirm(
      isBangla
        ? 'আপনি কি নিশ্চিত যে এই সিটিং বুকিংটি বাতিল করতে চান?'
        : 'Are you sure you want to cancel this sitting booking?'
    );
    if (!confirmed) return;

    const res = await cancelSittingBooking(isConfigured && isAuthenticated ? supabase : null, id);
    if (res.success) {
      setActionSuccess(t('sitting:bookings.cancelledSuccess'));
      fetchBookings();
      setTimeout(() => setActionSuccess(null), 3500);
    }
  };

  const getStatusBadge = (status: SittingBooking['status']) => {
    switch (status) {
      case 'confirmed':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">
          {t(`sitting:bookings.status.${status}` as any)}
        </span>;
      case 'in_progress':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
          {t(`sitting:bookings.status.${status}` as any)}
        </span>;
      case 'completed':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 border border-gray-200">
          {t(`sitting:bookings.status.${status}` as any)}
        </span>;
      case 'cancelled':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200">
          {t(`sitting:bookings.status.${status}` as any)}
        </span>;
      case 'pending':
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
          {t(`sitting:bookings.status.pending` as any)}
        </span>;
    }
  };

  if (isLoading) {
    return (
      <div className="py-16 text-center text-content-secondary">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mb-3" />
        <p className="text-sm">বুকিং লোড হচ্ছে...</p>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="py-16 text-center bg-gray-50/60 rounded-2xl border border-dashed border-gray-200">
        <span className="text-5xl block mb-3">📅</span>
        <h4 className="text-lg font-bold text-content-primary mb-1">
          {t('sitting:bookings.empty')}
        </h4>
        <p className="text-sm text-content-secondary max-w-sm mx-auto">
          {isBangla
            ? 'পছন্দের সিটার নির্বাচন করে অ্যাপয়েন্টমেন্ট বুক করুন। আপনার সমস্ত চলমান ও পূর্ববর্তী বুকিং এখানে দেখতে পাবেন।'
            : 'Find and book a verified pet sitter. All your active and completed sitting bookings will appear here.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {actionSuccess && (
        <div className="p-3 bg-green-50 text-green-800 rounded-xl text-sm border border-green-200 animate-in fade-in">
          {actionSuccess}
        </div>
      )}

      {bookings.map((b) => (
        <Card
          key={b.id}
          className="p-5 border border-gray-200/80 hover:border-gray-300 transition-all bg-white"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold text-content-primary">
                  {t(`sitting:serviceTypes.${b.service_type}` as any)}
                </span>
                {getStatusBadge(b.status)}
              </div>
              <p className="text-sm text-content-secondary mt-0.5">
                {t('sitting:bookings.sitter')}:{' '}
                <span className="font-semibold text-gray-800">
                  {b.sitter
                    ? isBangla
                      ? b.sitter.full_name_bn
                      : b.sitter.full_name_en
                    : 'Verified Sitter'}
                </span>
              </p>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-xl font-bold text-green-700">৳ {b.total_price}</span>
              <p className="text-xs text-content-secondary">
                ({t(`sitting:modal.${b.payment_method}` as any)})
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 py-3 text-xs text-content-secondary">
            <div>
              <span className="font-semibold block text-gray-700">
                {t('sitting:bookings.dateTime')}:
              </span>
              <span>
                {b.start_date} | {b.start_time}
              </span>
            </div>
            <div>
              <span className="font-semibold block text-gray-700">
                {t('sitting:bookings.duration')}:
              </span>
              <span>
                {isBangla ? `${b.duration_hours} ঘণ্টা` : `${b.duration_hours} hours`}
              </span>
            </div>
            <div>
              <span className="font-semibold block text-gray-700">
                {t('sitting:bookings.address')}:
              </span>
              <span className="truncate block" title={b.address}>
                {b.address}
              </span>
            </div>
          </div>

          {b.notes && (
            <div className="bg-gray-50 p-2.5 rounded-lg text-xs text-gray-600 mt-1 mb-2">
              <span className="font-medium text-gray-800">নোট: </span>
              {b.notes}
            </div>
          )}

          {b.status === 'pending' && (
            <div className="pt-2 flex justify-end">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleCancel(b.id)}
                className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
              >
                {t('sitting:bookings.cancelBtn')}
              </Button>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}
