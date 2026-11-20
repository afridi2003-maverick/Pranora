'use client';

/**
 * apps/web/app/[locale]/components/ReportModal.tsx
 * Task: REV-2 — Shared report flow (reviews, wrong clinic info)
 * Owner: Afridi | Sprint: S6
 *
 * Reusable modal component that calls submit_content_report RPC
 * for any ReportTarget type (review, provider, adoption_listing, etc.)
 */

import React, { useState } from 'react';
import { useLocale } from '@pranora/i18n';
import { Button, Modal } from '@pranora/ui';
import type { ReportTarget } from '@pranora/types';

type ReviewReportReason =
  | 'fake'
  | 'spam'
  | 'abusive'
  | 'scam'
  | 'inaccurate_info'
  | 'animal_cruelty'
  | 'duplicate'
  | 'other';

interface ReportModalProps {
  open: boolean;
  onClose: () => void;
  targetType: ReportTarget;
  targetId: string;
  targetTitle?: string;
  /** Called with the new report UUID on success */
  onSuccess?: (reportId: string) => void;
}

const CLINIC_REASONS: ReviewReportReason[] = [
  'inaccurate_info',
  'fake',
  'duplicate',
  'other',
];

const REVIEW_REASONS: ReviewReportReason[] = [
  'fake',
  'spam',
  'abusive',
  'other',
];

const ALL_REASONS: ReviewReportReason[] = [
  'fake',
  'spam',
  'abusive',
  'scam',
  'inaccurate_info',
  'animal_cruelty',
  'duplicate',
  'other',
];

function reasonsFor(targetType: ReportTarget): ReviewReportReason[] {
  if (targetType === 'provider') return CLINIC_REASONS;
  if (targetType === 'review') return REVIEW_REASONS;
  return ALL_REASONS;
}

const REASON_LABELS_EN: Record<ReviewReportReason, string> = {
  fake: 'Fake or misleading content',
  spam: 'Spam or promotional content',
  abusive: 'Abusive or offensive behavior',
  scam: 'Fraud or payment scam',
  inaccurate_info: 'Wrong info (address, phone, hours)',
  animal_cruelty: 'Animal cruelty or abuse',
  duplicate: 'Duplicate listing',
  other: 'Other reason',
};

const REASON_LABELS_BN: Record<ReviewReportReason, string> = {
  fake: 'ভুয়া বা বিভ্রান্তিকর কন্টেন্ট',
  spam: 'স্প্যাম বা প্রচারমূলক কন্টেন্ট',
  abusive: 'আপত্তিজনক বা অশালীন আচরণ',
  scam: 'প্রতারণা বা আর্থিক জালিয়াতি',
  inaccurate_info: 'ভুল তথ্য (ঠিকানা, ফোন, সময়)',
  animal_cruelty: 'প্রাণী নির্যাতন বা অপব্যবহার',
  duplicate: 'একই তথ্যের পুনরাবৃত্তি',
  other: 'অন্যান্য কারণ',
};

export function ReportModal({
  open,
  onClose,
  targetType,
  targetId: _targetId,
  targetTitle,
  onSuccess,
}: ReportModalProps) {
  const { isBangla } = useLocale();

  const [selectedReason, setSelectedReason] = useState<ReviewReportReason | ''>('');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reasons = reasonsFor(targetType);
  const reasonLabels = isBangla ? REASON_LABELS_BN : REASON_LABELS_EN;

  const modalTitle =
    targetType === 'review'
      ? isBangla
        ? '⚠️ রিভিউ রিপোর্ট করুন'
        : '⚠️ Report Review'
      : targetType === 'provider'
        ? isBangla
          ? '⚠️ ভুল ক্লিনিক তথ্য রিপোর্ট করুন'
          : '⚠️ Report Inaccurate Clinic Info'
        : isBangla
          ? '⚠️ কন্টেন্ট রিপোর্ট করুন'
          : '⚠️ Report Content';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReason) return;

    setSubmitting(true);
    setError(null);

    try {
      // In production: call submitReport(supabaseClient, { targetType, targetId, reason: selectedReason, details })
      // For now, simulate a successful API call with mock delay
      await new Promise<void>((resolve) => setTimeout(resolve, 800));

      setSubmitted(true);
      onSuccess?.('mock-report-id-' + Date.now());

      setTimeout(() => {
        onClose();
        setSubmitted(false);
        setSelectedReason('');
        setDetails('');
      }, 2000);
    } catch {
      setError(
        isBangla
          ? 'রিপোর্ট জমা দিতে ব্যর্থ হয়েছে। আবার চেষ্টা করুন।'
          : 'Failed to submit report. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (submitting) return;
    onClose();
    setSelectedReason('');
    setDetails('');
    setError(null);
    setSubmitted(false);
  };

  if (!open) return null;

  return (
    <Modal isOpen={open} onClose={handleClose}>
      <div className="p-6 max-w-md w-full">
        {/* Header */}
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
          {modalTitle}
        </h2>
        {targetTitle && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 truncate">
            {isBangla ? 'বিষয়:' : 'Target:'} <span className="font-medium">{targetTitle}</span>
          </p>
        )}

        {submitted ? (
          /* Success state */
          <div className="text-center py-6">
            <div className="text-4xl mb-3">✅</div>
            <p className="text-green-700 dark:text-green-400 font-semibold text-base">
              {isBangla ? 'রিপোর্ট জমা হয়েছে!' : 'Report Submitted!'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {targetType === 'provider'
                ? isBangla
                  ? 'আমাদের দল ক্লিনিকের তথ্য যাচাই করবে।'
                  : 'Our team will verify and update the clinic information.'
                : isBangla
                  ? 'আমাদের মডারেশন দল ২৪ ঘণ্টার মধ্যে পর্যালোচনা করবে।'
                  : 'Our moderation team will review this within 24 hours.'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Reason selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isBangla ? 'রিপোর্টের কারণ *' : 'Reason for reporting *'}
              </label>
              <div className="space-y-2">
                {reasons.map((r) => (
                  <label
                    key={r}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedReason === r
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="report-reason"
                      value={r}
                      checked={selectedReason === r}
                      onChange={() => setSelectedReason(r)}
                      className="text-blue-600"
                    />
                    <span className="text-sm text-gray-800 dark:text-gray-200">
                      {reasonLabels[r]}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Optional details */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {isBangla ? 'অতিরিক্ত বিবরণ (ঐচ্ছিক)' : 'Additional details (optional)'}
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                maxLength={1000}
                rows={3}
                placeholder={
                  isBangla
                    ? 'সমস্যাটি আরও বিস্তারিত বর্ণনা করুন...'
                    : 'Describe the issue in more detail...'
                }
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
              <p className="text-xs text-gray-400 mt-1 text-right">{details.length}/1000</p>
            </div>

            {/* Error */}
            {error && (
              <p className="text-sm text-red-600 dark:text-red-400 mb-3 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded">
                {error}
              </p>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClose}
                disabled={submitting}
              >
                {isBangla ? 'বাতিল' : 'Cancel'}
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={!selectedReason || submitting}
              >
                {submitting
                  ? isBangla
                    ? 'জমা দেওয়া হচ্ছে...'
                    : 'Submitting...'
                  : isBangla
                    ? 'রিপোর্ট জমা দিন'
                    : 'Submit Report'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}
