'use client';

import React, { useState } from 'react';
import { useLocale } from '@pranora/i18n';
import { Modal, Button } from '@pranora/ui';
import type { AdoptionListingRow } from '@pranora/api';
import type { ListingReportReason } from '@pranora/validation';

interface ReportListingModalProps {
  listing: AdoptionListingRow | null;
  isOpen: boolean;
  onClose: () => void;
  onReport?: (payload: {
    listingId: string;
    reason: ListingReportReason;
    details?: string;
  }) => Promise<{ success: boolean; error?: string }>;
}

const REPORT_REASONS: {
  id: ListingReportReason;
  bn: string;
  en: string;
  descBn: string;
  descEn: string;
}[] = [
  {
    id: 'fake',
    bn: 'ভুয়া বিজ্ঞাপন / ভুয়া ছবি',
    en: 'Fake Listing / Stolen Photos',
    descBn: 'প্রাণীর অস্তিত্ব নেই বা ইন্টারনেট থেকে সংগৃহীত অসত্য ছবি।',
    descEn: 'The pet does not exist or stolen photos from the internet were used.',
  },
  {
    id: 'scam',
    bn: 'প্রতারণা বা অর্থ দাবি',
    en: 'Financial Scam / Asking for Money',
    descBn: 'দত্তকের নামে টাকা বা ডেলিভারি ফি দাবি করছে।',
    descEn: 'Poster is demanding money, advance payment, or delivery fees.',
  },
  {
    id: 'commercial_sale',
    bn: 'বাণিজ্যিক পোষা প্রাণী বিক্রয়',
    en: 'Commercial Pet Sale',
    descBn: 'বিনামূল্যে দত্তকের আড়ালে বাণিজ্যিক প্রজননকারী বা বিক্রেতা।',
    descEn: 'Unauthorized commercial breeder disguised as free adoption.',
  },
  {
    id: 'animal_cruelty',
    bn: 'প্রাণী নির্যাতন বা ঝুঁকিপূর্ণ অবস্থা',
    en: 'Animal Cruelty / Neglect',
    descBn: 'প্রাণীটির প্রতি অবহেলা বা শারীরিক ক্ষতি প্রতীয়মান।',
    descEn: 'Evidence of cruelty, abuse, or hazardous sheltering conditions.',
  },
  {
    id: 'inaccurate_info',
    bn: 'ভুল জেলা বা অসত্য তথ্য',
    en: 'Inaccurate Information',
    descBn: 'বয়স, স্বাস্থ্য বা টিকাদান সম্পর্কে ইচ্ছাকৃত ভুল তথ্য।',
    descEn: 'Misleading age, breed, vaccine, or health details.',
  },
  {
    id: 'other',
    bn: 'অন্যান্য কারণ',
    en: 'Other Reason',
    descBn: 'প্ল্যাটফর্মের নীতিমালা পরিপন্থী কোনো সমস্যা।',
    descEn: 'Any other violation of Pranora community guidelines.',
  },
];

export function ReportListingModal({
  listing,
  isOpen,
  onClose,
  onReport,
}: ReportListingModalProps) {
  const { isBangla } = useLocale();

  const [reason, setReason] = useState<ListingReportReason>('fake');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!listing) return null;

  const title = isBangla
    ? listing.title_bn || listing.title_en || 'প্রাণী'
    : listing.title_en || listing.title_bn || 'Animal';

  const handleResetAndClose = () => {
    setIsSuccess(false);
    setDetails('');
    setReason('fake');
    setErrorMessage(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      if (onReport) {
        const res = await onReport({
          listingId: listing.id,
          reason,
          details: details.trim() || undefined,
        });

        if (!res.success) {
          setErrorMessage(
            res.error || (isBangla ? 'রিপোর্ট জমা দেওয়া সম্ভব হয়নি।' : 'Failed to submit report.')
          );
          setIsSubmitting(false);
          return;
        }
      }

      setIsSuccess(true);
    } catch {
      setErrorMessage(isBangla ? 'সার্ভারে ত্রুটি হয়েছে।' : 'Server error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleResetAndClose}
      title={isBangla ? 'বিজ্ঞাপনটি রিপোর্ট করুন' : 'Report Adoption Listing'}
    >
      {isSuccess ? (
        <div className="py-6 text-center space-y-4">
          <span className="text-4xl block">🛡️</span>
          <h3 className="text-base font-bold text-foreground">
            {isBangla ? 'রিপোর্ট সফলভাবে জমা হয়েছে' : 'Report Submitted Successfully'}
          </h3>
          <p className="text-xs text-foreground-secondary max-w-sm mx-auto leading-relaxed">
            {isBangla
              ? 'আমাদের মডারেশন টিম অভিযোগটি গুরুত্বের সাথে পর্যালোচনা করবে। সুরক্ষা নিশ্চিত করতে প্রয়োজনবোধে বিজ্ঞাপনটি সরিয়ে দেওয়া হবে।'
              : 'Our moderation team will review this report carefully. The listing will be taken down if guidelines are violated.'}
          </p>
          <div className="pt-2">
            <Button variant="primary" onClick={handleResetAndClose}>
              {isBangla ? 'ঠিক আছে' : 'Done'}
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
          <div>
            <p className="text-xs text-foreground-secondary font-medium">
              {isBangla ? 'বিজ্ঞাপন: ' : 'Target Listing: '}
              <span className="font-bold text-foreground">{title}</span>
            </p>
            <p className="text-[11px] text-foreground-secondary mt-0.5">
              {isBangla
                ? 'প্রাণোরায় পোষা প্রাণী সম্পূর্ণ বিনামূল্যে দত্তক দেওয়া বাধ্যতামূলক। কোনো প্রকার অর্থ লেনদেন বা ভুয়া তথ্য নিষিদ্ধ।'
                : 'Adoption on Pranora must be 100% free. Any monetary demand or fraudulent posting is strictly prohibited.'}
            </p>
          </div>

          {/* Reason Radio Group */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-foreground">
              {isBangla ? 'রিপোর্টের কারণ নির্বাচন করুন:*' : 'Select Reason:*'}
            </label>
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {REPORT_REASONS.map((r) => {
                const isSelected = reason === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setReason(r.id)}
                    className={`w-full p-2.5 rounded-lg border text-left transition-all flex flex-col gap-0.5 ${
                      isSelected
                        ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/20 ring-1 ring-rose-500'
                        : 'border-stroke-subtle hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground">
                        {isBangla ? r.bn : r.en}
                      </span>
                      <span className={`text-xs ${isSelected ? 'text-rose-600' : 'text-neutral-400'}`}>
                        {isSelected ? '●' : '○'}
                      </span>
                    </div>
                    <span className="text-[11px] text-foreground-secondary">
                      {isBangla ? r.descBn : r.descEn}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Additional Details */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-foreground">
              {isBangla ? 'অতিরিক্ত তথ্য (ঐচ্ছিক):' : 'Additional Details (Optional):'}
            </label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={3}
              placeholder={
                isBangla
                  ? 'কোনো স্ক্রিনশট লিংক, ফোন আলাপ বা সুনির্দিষ্ট তথ্যের উল্লেখ থাকলে লিখুন...'
                  : 'Mention any specific evidence, phone conversation, or details...'
              }
              className="w-full text-xs p-2.5 rounded-lg border border-stroke-subtle bg-white dark:bg-neutral-900 text-foreground focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
            />
          </div>

          {errorMessage && (
            <div className="p-2.5 bg-rose-100 text-rose-900 rounded-lg text-xs font-semibold">
              {errorMessage}
            </div>
          )}

          {/* Actions */}
          <div className="pt-2 border-t border-stroke-subtle flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleResetAndClose}
              disabled={isSubmitting}
            >
              {isBangla ? 'বাতিল' : 'Cancel'}
            </Button>
            <Button
              type="submit"
              variant="danger"
              size="sm"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? isBangla ? 'জমা হচ্ছে...' : 'Submitting...'
                : isBangla ? '🚨 রিপোর্ট জমা দিন' : '🚨 Submit Report'}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
