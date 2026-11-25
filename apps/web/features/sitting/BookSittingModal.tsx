'use client';

import React, { useState } from 'react';
import { useLocale } from '@pranora/i18n';
import { Button } from '@pranora/ui';
import {
  SitterProfile,
  SittingServiceType,
  SittingPaymentMethod,
  createSittingBooking,
} from '@pranora/api';
import { useSession } from '../../hooks/useSession';

interface BookSittingModalProps {
  sitter: SitterProfile;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function BookSittingModal({ sitter, isOpen, onClose, onSuccess }: BookSittingModalProps) {
  const { t, isBangla } = useLocale();
  const { supabase, isConfigured, isAuthenticated } = useSession();

  const [serviceType, setServiceType] = useState<SittingServiceType>(
    sitter.service_types[0] ?? 'sitting_hourly'
  );
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]!;
  const [startDate, setStartDate] = useState<string>(tomorrow);
  const [startTime, setStartTime] = useState<string>('10:00 AM');
  const [durationHours, setDurationHours] = useState<number>(2);
  const [paymentMethod, setPaymentMethod] = useState<SittingPaymentMethod>('cash');
  const [address, setAddress] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const totalPrice = durationHours * sitter.hourly_rate;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) {
      setErrorMessage(
        isBangla ? 'অনুগ্রহ করে আপনার সঠিক ঠিকানা দিন।' : 'Please provide your full address.'
      );
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await createSittingBooking(isConfigured && isAuthenticated ? supabase : null, {
        sitter_id: sitter.id,
        service_type: serviceType,
        start_date: startDate,
        start_time: startTime,
        duration_hours: durationHours,
        payment_method: paymentMethod,
        address: address.trim(),
        notes: notes.trim() || undefined,
      });

      if (res.data) {
        onSuccess();
        onClose();
      } else {
        setErrorMessage(res.error || 'Failed to submit booking');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div>
            <h3 className="text-xl font-bold text-content-primary">
              {t('sitting:modal.title')}
            </h3>
            <p className="text-sm text-content-secondary mt-0.5">
              {t('sitting:modal.sitterLabel')}{' '}
              <span className="font-semibold text-green-700">
                {isBangla ? sitter.full_name_bn : sitter.full_name_en}
              </span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            ✕
          </button>
        </div>

        {errorMessage && (
          <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Service Type Selection */}
          <div>
            <label className="block text-sm font-medium text-content-primary mb-1.5">
              {t('sitting:modal.serviceType')}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {sitter.service_types.map((st) => (
                <button
                  type="button"
                  key={st}
                  onClick={() => setServiceType(st)}
                  className={`p-2.5 text-xs font-medium rounded-lg border text-left transition-all ${
                    serviceType === st
                      ? 'border-green-600 bg-green-50 text-green-800'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  {t(`sitting:serviceTypes.${st}` as any)}
                </button>
              ))}
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-content-primary mb-1">
                {t('sitting:modal.date')}
              </label>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-content-primary mb-1">
                {t('sitting:modal.time')}
              </label>
              <select
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none bg-white"
              >
                <option value="08:00 AM">08:00 AM</option>
                <option value="10:00 AM">10:00 AM</option>
                <option value="12:00 PM">12:00 PM</option>
                <option value="02:00 PM">02:00 PM</option>
                <option value="04:00 PM">04:00 PM</option>
                <option value="06:00 PM">06:00 PM</option>
                <option value="08:00 PM">08:00 PM</option>
              </select>
            </div>
          </div>

          {/* Duration Counter */}
          <div>
            <label className="block text-sm font-medium text-content-primary mb-1">
              {t('sitting:modal.duration')}
            </label>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setDurationHours(Math.max(1, durationHours - 1))}
                className="w-10 h-10 rounded-lg border border-gray-300 text-gray-700 font-bold hover:bg-gray-100 flex items-center justify-center transition-colors"
              >
                -
              </button>
              <span className="font-semibold text-lg text-content-primary min-w-[3rem] text-center">
                {isBangla ? `${durationHours} ঘণ্টা` : `${durationHours} hrs`}
              </span>
              <button
                type="button"
                onClick={() => setDurationHours(Math.min(24, durationHours + 1))}
                className="w-10 h-10 rounded-lg border border-gray-300 text-gray-700 font-bold hover:bg-gray-100 flex items-center justify-center transition-colors"
              >
                +
              </button>
              <span className="text-xs text-content-secondary ml-2">
                (@ ৳{sitter.hourly_rate}/{isBangla ? 'ঘণ্টা' : 'hr'})
              </span>
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-content-primary mb-1">
              {t('sitting:modal.address')} *
            </label>
            <input
              type="text"
              placeholder={t('sitting:modal.addressPlaceholder')}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none"
              required
            />
          </div>

          {/* Special Notes */}
          <div>
            <label className="block text-sm font-medium text-content-primary mb-1">
              {t('sitting:modal.notes')}
            </label>
            <textarea
              rows={2}
              placeholder={t('sitting:modal.notesPlaceholder')}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none resize-none"
            />
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-content-primary mb-1.5">
              {t('sitting:modal.paymentMethod')}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['cash', 'bkash', 'nagad'] as SittingPaymentMethod[]).map((pm) => (
                <button
                  type="button"
                  key={pm}
                  onClick={() => setPaymentMethod(pm)}
                  className={`p-2 text-xs font-medium rounded-lg border text-center transition-all ${
                    paymentMethod === pm
                      ? 'border-green-600 bg-green-50 text-green-800'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  {t(`sitting:modal.${pm}` as any)}
                </button>
              ))}
            </div>
          </div>

          {/* Price Calculation Banner */}
          <div className="bg-green-50/70 border border-green-200 rounded-xl p-3 flex items-center justify-between">
            <span className="text-sm font-medium text-green-900">
              {t('sitting:modal.estimatedPrice')}:
            </span>
            <span className="text-xl font-bold text-green-700">
              ৳ {totalPrice.toLocaleString()}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-gray-100">
            <Button variant="secondary" type="button" onClick={onClose} disabled={isSubmitting}>
              {t('sitting:modal.cancelBtn')}
            </Button>
            <Button variant="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? t('sitting:modal.submitting') : t('sitting:modal.submitBtn')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
