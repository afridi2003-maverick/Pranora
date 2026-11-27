'use client';

import React, { useState } from 'react';
import { useLocale } from '@pranora/i18n';
import { Modal, Button, Input } from '@pranora/ui';
import type { LostFoundBoardItem } from '@pranora/api';

interface ReportSightingModalProps {
  item: LostFoundBoardItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmitSighting: (params: {
    reportId: string;
    message: string;
    locationText?: string;
    contactPhone?: string;
  }) => Promise<{ success: boolean; error?: string }>;
}

export function ReportSightingModal({
  item,
  isOpen,
  onClose,
  onSubmitSighting,
}: ReportSightingModalProps) {
  const { isBangla } = useLocale();

  const [message, setMessage] = useState('');
  const [locationText, setLocationText] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!item) return null;

  const handleResetAndClose = () => {
    setMessage('');
    setLocationText('');
    setContactPhone('');
    setError(null);
    setIsSuccess(false);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      setError(isBangla ? 'অনুগ্রহ করে বিস্তারিত বার্তা লিখুন।' : 'Please describe what you saw.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await onSubmitSighting({
        reportId: item.id,
        message: message.trim(),
        locationText: locationText.trim() || undefined,
        contactPhone: contactPhone.trim() || undefined,
      });

      if (res.success) {
        setIsSuccess(true);
      } else {
        setError(res.error || (isBangla ? 'বার্তা পাঠাতে ব্যর্থ হয়েছে।' : 'Failed to send sighting report.'));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Server error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleResetAndClose}
      title={isBangla ? 'আমি দেখেছি — সন্ধান বার্তা পাঠান (RSC-10)' : "I've Seen It — Sighting Report (RSC-10)"}
    >
      {isSuccess ? (
        <div className="py-6 text-center space-y-4 max-w-md mx-auto">
          <span className="text-4xl block">📬</span>
          <h3 className="text-base font-bold text-foreground">
            {isBangla ? 'সন্ধান বার্তা সফলভাবে পাঠানো হয়েছে!' : 'Sighting Sent to Pet Reporter!'}
          </h3>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
            {isBangla
              ? 'প্রাণীর মূল রিপোর্টকারীকে একটি ইন-অ্যাপ নোটিফিকেশন পাঠানো হয়েছে। আপনার পাঠানো তথ্যের প্রেক্ষিতে মালিক সিদ্ধান্ত নেবেন যে তিনি তার যোগাযোগ নম্বর শেয়ার করবেন কিনা।'
              : "The pet's original reporter has received an in-app notification. They will decide whether to share their phone number based on your report."}
          </p>
          <div className="pt-3">
            <Button variant="primary" onClick={handleResetAndClose}>
              {isBangla ? 'সম্পন্ন' : 'Done'}
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
          {/* Target animal context */}
          <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-stroke-subtle text-xs space-y-1">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                item.kind === 'lost' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {item.kind === 'lost'
                  ? isBangla ? 'হারানো প্রাণী' : 'Lost'
                  : isBangla ? 'পাওয়া গেছে' : 'Found'}
              </span>
              <span className="font-semibold text-foreground capitalize">
                🐾 {item.species}
              </span>
            </div>
            {item.area_text && (
              <p className="text-neutral-600 dark:text-neutral-400">
                📍 {item.area_text} (~১ কিমি এলাকা)
              </p>
            )}
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
              {error}
            </div>
          )}

          {/* Sighting message */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              {isBangla ? 'আপনি কোথায় ও কখন প্রাণীটিকে দেখেছেন?' : 'Where & when did you see this animal?'} *
            </label>
            <textarea
              required
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                isBangla
                  ? 'যেমন: আজ সকালে ডিওএইচএস ৪ নম্বর রোডের মোড়ে একটি লাল কলার পরা কুকুরটি দেখেছি...'
                  : 'e.g. Saw this dog near Mirpur DOHS road 4 this morning around 9 AM...'
              }
              className="w-full text-xs p-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          {/* Specific Location Landmark */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              {isBangla ? 'নির্দিষ্ট ল্যান্ডমার্ক / অবস্থান' : 'Specific Landmark / Location'}
            </label>
            <Input
              value={locationText}
              onChange={(e) => setLocationText(e.target.value)}
              placeholder={
                isBangla
                  ? 'যেমন: মসজিদ সংলগ্ন চায়ের দোকানের পাশে'
                  : 'e.g. Next to the grocery store on road 4'
              }
            />
          </div>

          {/* Contact Phone (Optional) */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              {isBangla ? 'আপনার যোগাযোগের ফোন নম্বর (ঐচ্ছিক)' : 'Your Contact Phone (Optional)'}
            </label>
            <Input
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="+88017XXXXXXXX"
            />
          </div>

          {/* Privacy Note */}
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-[11px] text-blue-900 dark:text-blue-300 leading-normal">
            🔒 {isBangla
              ? 'নিরাপত্তা নিশ্চিত করতে জনসমক্ষে কোনো ফোন নম্বর প্রদর্শিত হয় না। আপনার পাঠানো বার্তা সরাসরি মূল উদ্ধারকারী/মালিকের নিকট পৌঁছাবে।'
              : 'For safety, phone numbers are never shown publicly. Your message goes through the in-app notification system.'}
          </div>

          {/* Action buttons */}
          <div className="pt-2 border-t border-stroke-subtle flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={handleResetAndClose}>
              {isBangla ? 'বাতিল' : 'Cancel'}
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting
                ? isBangla ? 'পাঠানো হচ্ছে...' : 'Sending...'
                : isBangla ? '👁️ সন্ধান বার্তা পাঠান' : "Send Sighting"}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
