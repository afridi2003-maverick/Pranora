'use client';

/**
 * apps/web/app/[locale]/reviews/report/page.tsx
 * Task: REV-2 — Shared report flow (reviews, wrong clinic info)
 * Owner: Afridi | Sprint: S6
 *
 * Standalone page for reporting a review or provider. Accepts ?targetType= and ?targetId=
 * query params. Used as a deep-link target from notification emails and admin workflows.
 */

import React, { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useLocale } from '@pranora/i18n';
import { Button, Card } from '@pranora/ui';
import { LanguageHeader } from '../../../../components/LanguageHeader';
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

const CLINIC_REASONS: ReviewReportReason[] = ['inaccurate_info', 'fake', 'duplicate', 'other'];
const REVIEW_REASONS: ReviewReportReason[] = ['fake', 'spam', 'abusive', 'other'];
const ALL_REASONS: ReviewReportReason[] = [
  'fake', 'spam', 'abusive', 'scam', 'inaccurate_info', 'animal_cruelty', 'duplicate', 'other',
];

function reasonsFor(tt: ReportTarget): ReviewReportReason[] {
  if (tt === 'provider') return CLINIC_REASONS;
  if (tt === 'review') return REVIEW_REASONS;
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

function ReportPageContent() {
  const { isBangla } = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();

  const targetType = (searchParams.get('targetType') ?? 'provider') as ReportTarget;
  const targetId = searchParams.get('targetId') ?? '';
  const targetTitle = searchParams.get('title') ?? '';

  const [selectedReason, setSelectedReason] = useState<ReviewReportReason | ''>('');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reasons = reasonsFor(targetType);
  const reasonLabels = isBangla ? REASON_LABELS_BN : REASON_LABELS_EN;

  const pageTitle =
    targetType === 'review'
      ? isBangla ? 'রিভিউ রিপোর্ট করুন' : 'Report a Review'
      : targetType === 'provider'
        ? isBangla ? 'ভুল ক্লিনিক তথ্য রিপোর্ট করুন' : 'Report Inaccurate Clinic Info'
        : isBangla ? 'কন্টেন্ট রিপোর্ট করুন' : 'Report Content';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReason || !targetId) return;

    setSubmitting(true);
    setError(null);

    try {
      // Production: await submitReport(supabaseClient, { targetType, targetId, reason: selectedReason, details });
      await new Promise<void>((r) => setTimeout(r, 900));
      setSubmitted(true);
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

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <LanguageHeader />
      <div className="max-w-lg mx-auto px-4 py-8">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-6"
        >
          ← {isBangla ? 'ফিরে যান' : 'Go back'}
        </button>

        <Card className="p-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">⚠️</span>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">{pageTitle}</h1>
              {targetTitle && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 truncate max-w-sm">
                  {targetTitle}
                </p>
              )}
            </div>
          </div>

          {!targetId ? (
            <div className="text-center py-8 text-gray-400">
              <p className="text-4xl mb-3">🔍</p>
              <p>{isBangla ? 'অবৈধ রিপোর্ট লিঙ্ক।' : 'Invalid report link.'}</p>
            </div>
          ) : submitted ? (
            /* Success */
            <div className="text-center py-8">
              <div className="text-5xl mb-4">✅</div>
              <h2 className="text-lg font-semibold text-green-700 dark:text-green-400 mb-2">
                {isBangla ? 'রিপোর্ট জমা হয়েছে!' : 'Report Submitted!'}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                {targetType === 'provider'
                  ? isBangla
                    ? 'আমাদের দল ক্লিনিকের তথ্য যাচাই করে আপডেট করবে।'
                    : 'Our team will verify and update the clinic information.'
                  : isBangla
                    ? 'আমাদের মডারেশন দল ২৪ ঘণ্টার মধ্যে পর্যালোচনা করবে।'
                    : 'Our moderation team will review this within 24 hours.'}
              </p>
              <Button variant="primary" size="sm" onClick={() => router.back()}>
                {isBangla ? 'ফিরে যান' : 'Go back'}
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* Reason list */}
              <div className="mb-5">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  {isBangla ? 'রিপোর্টের কারণ বেছে নিন *' : 'Select a reason *'}
                </p>
                <div className="space-y-2">
                  {reasons.map((r) => (
                    <label
                      key={r}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        selectedReason === r
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-sm'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <input
                        type="radio"
                        name="reason"
                        value={r}
                        checked={selectedReason === r}
                        onChange={() => setSelectedReason(r)}
                        className="accent-blue-600 w-4 h-4 shrink-0"
                      />
                      <span className="text-sm text-gray-800 dark:text-gray-200">
                        {reasonLabels[r]}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Details */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {isBangla ? 'অতিরিক্ত বিবরণ (ঐচ্ছিক)' : 'Additional details (optional)'}
                </label>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  maxLength={1000}
                  rows={4}
                  placeholder={
                    isBangla
                      ? 'সমস্যাটি আরও বিস্তারিত বর্ণনা করুন...'
                      : 'Describe the issue in more detail (address change, wrong phone, etc.)...'
                  }
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
                <p className="text-xs text-gray-400 mt-1 text-right">{details.length}/1000</p>
              </div>

              {/* Disclaimer */}
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-5 bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                {isBangla
                  ? '📋 মিথ্যা রিপোর্ট করা প্রণোরার নীতি লঙ্ঘন এবং আপনার অ্যাকাউন্ট স্থগিত হতে পারে।'
                  : '📋 False reports violate Pranora\'s community guidelines and may result in account suspension.'}
              </p>

              {error && (
                <div className="mb-4 px-3 py-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="flex-1"
                  onClick={() => router.back()}
                  disabled={submitting}
                >
                  {isBangla ? 'বাতিল' : 'Cancel'}
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="flex-1"
                  disabled={!selectedReason || submitting}
                >
                  {submitting
                    ? isBangla ? 'জমা দেওয়া হচ্ছে...' : 'Submitting...'
                    : isBangla ? 'রিপোর্ট জমা দিন' : 'Submit Report'}
                </Button>
              </div>
            </form>
          )}
        </Card>
      </div>
    </main>
  );
}

export default function ReportPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 dark:bg-gray-950" />}>
      <ReportPageContent />
    </Suspense>
  );
}
