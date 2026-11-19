'use client';

import React, { useState } from 'react';
import { useLocale } from '@pranora/i18n';
import { Card, Button } from '@pranora/ui';
import type { AdoptionApplicationWithListing } from '@pranora/api';
import type { AdoptionApplicationStatus } from '@pranora/types';
import {
  MOCK_MY_APPLICATIONS,
  DISTRICT_MAP,
} from './mockData';

interface AdoptionApplicationStatusTrackerProps {
  initialApplications?: AdoptionApplicationWithListing[];
  onWithdrawApplication?: (applicationId: string) => Promise<{ success: boolean; error?: string }>;
  onViewListing?: (listingId: string) => void;
}

const STATUS_STEPS: {
  key: 'submitted' | 'under_review' | 'decision';
  bn: string;
  en: string;
}[] = [
  { key: 'submitted', bn: 'জমা হয়েছে', en: 'Submitted' },
  { key: 'under_review', bn: 'দেখা হচ্ছে', en: 'Under Review' },
  { key: 'decision', bn: 'চূড়ান্ত সিদ্ধান্ত', en: 'Decision' },
];

export function AdoptionApplicationStatusTracker({
  initialApplications = MOCK_MY_APPLICATIONS,
  onWithdrawApplication,
  onViewListing,
}: AdoptionApplicationStatusTrackerProps) {
  const { isBangla } = useLocale();
  const [applications, setApplications] = useState<AdoptionApplicationWithListing[]>(initialApplications);
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);
  const [expandedAppId, setExpandedAppId] = useState<string | null>(null);

  const handleWithdraw = async (applicationId: string) => {
    setWithdrawingId(applicationId);
    try {
      if (onWithdrawApplication) {
        await onWithdrawApplication(applicationId);
      }
      setApplications((prev) =>
        prev.map((item) =>
          item.application.id === applicationId
            ? {
                ...item,
                application: {
                  ...item.application,
                  status: 'withdrawn' as AdoptionApplicationStatus,
                },
              }
            : item
        )
      );
    } finally {
      setWithdrawingId(null);
    }
  };

  const getStepState = (
    currentStatus: AdoptionApplicationStatus,
    stepKey: 'submitted' | 'under_review' | 'decision'
  ): 'completed' | 'current' | 'upcoming' | 'rejected' => {
    if (currentStatus === 'rejected') {
      if (stepKey === 'decision') return 'rejected';
      return 'completed';
    }

    if (currentStatus === 'withdrawn') {
      return 'upcoming';
    }

    if (stepKey === 'submitted') {
      return currentStatus === 'submitted' ? 'current' : 'completed';
    }

    if (stepKey === 'under_review') {
      if (currentStatus === 'submitted') return 'upcoming';
      if (currentStatus === 'under_review') return 'current';
      return 'completed';
    }

    if (stepKey === 'decision') {
      return currentStatus === 'approved' ? 'completed' : 'upcoming';
    }

    return 'upcoming';
  };

  if (applications.length === 0) {
    return (
      <Card className="p-8 text-center max-w-lg mx-auto bg-white dark:bg-neutral-900 border-stroke-subtle shadow-sm space-y-3">
        <span className="text-3xl">🐾</span>
        <h3 className="text-base font-bold text-foreground">
          {isBangla ? 'এখনো কোনো দত্তক আবেদন জমা দেননি' : 'No adoption applications yet'}
        </h3>
        <p className="text-xs text-foreground-secondary">
          {isBangla
            ? 'পাবলিক দত্তক পোর্টাল ব্রাউজ করে আপনার পছন্দের প্রাণীর জন্য আবেদন করতে পারেন।'
            : 'Browse the public adoption portal to find and apply for rescued pets.'}
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {applications.map(({ application, listing }) => {
        const isApproved = application.status === 'approved';
        const isRejected = application.status === 'rejected';
        const isWithdrawn = application.status === 'withdrawn';
        const isUnderReview = application.status === 'under_review';
        const isPendingDecision = !isApproved && !isRejected && !isWithdrawn;
        const isExpanded = expandedAppId === application.id;

        const title = isBangla
          ? listing.title_bn || listing.title_en || 'প্রাণী'
          : listing.title_en || listing.title_bn || 'Pet';

        const district = DISTRICT_MAP[listing.district_id]
          ? isBangla
            ? DISTRICT_MAP[listing.district_id]?.bn
            : DISTRICT_MAP[listing.district_id]?.en
          : isBangla
          ? 'বাংলাদেশ'
          : 'Bangladesh';

        const photo = listing.photos?.[0] || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800';

        return (
          <Card
            key={application.id}
            className="p-5 bg-white dark:bg-neutral-900 border-stroke-subtle shadow-sm space-y-4"
          >
            {/* Header: Pet Summary & Status Chip */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stroke-subtle">
              <div className="flex items-center gap-3">
                <img
                  src={photo}
                  alt={title}
                  className="w-14 h-14 rounded-xl object-cover border border-stroke-subtle flex-shrink-0"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                      {listing.species}
                    </span>
                    <span className="text-xs text-foreground-secondary">
                      📍 {district}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-foreground mt-0.5">
                    {title}
                  </h3>
                  <p className="text-[11px] text-foreground-secondary">
                    {isBangla ? 'আবেদনের তারিখ: ' : 'Applied on: '}
                    {new Date(application.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <div className="self-start sm:self-center">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide ${
                    isApproved
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300'
                      : isRejected
                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300'
                      : isWithdrawn
                      ? 'bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
                      : isUnderReview
                      ? 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300'
                  }`}
                >
                  {isApproved
                    ? isBangla ? '✅ অনুমোদিত' : 'Approved'
                    : isRejected
                    ? isBangla ? '❌ বাতিল' : 'Rejected'
                    : isWithdrawn
                    ? isBangla ? '⚪ প্রত্যাহারকৃত' : 'Withdrawn'
                    : isUnderReview
                    ? isBangla ? '🔍 দেখা হচ্ছে' : 'Under Review'
                    : isBangla ? '📩 জমা হয়েছে' : 'Submitted'}
                </span>
              </div>
            </div>

            {/* 3-Step Lifecycle Timeline */}
            <div className="py-2">
              <div className="flex items-center justify-between relative">
                {STATUS_STEPS.map((step, idx) => {
                  const state = getStepState(application.status, step.key);
                  const isLast = idx === STATUS_STEPS.length - 1;

                  return (
                    <React.Fragment key={step.key}>
                      <div className="flex flex-col items-center flex-1 z-10">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                            state === 'completed'
                              ? 'bg-emerald-600 text-white'
                              : state === 'current'
                              ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 ring-4 ring-emerald-500/20'
                              : state === 'rejected'
                              ? 'bg-rose-600 text-white'
                              : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-500'
                          }`}
                        >
                          {state === 'completed' ? '✓' : state === 'rejected' ? '✕' : idx + 1}
                        </div>
                        <span className="text-[11px] font-semibold text-foreground mt-1.5 text-center">
                          {isLast && isApproved
                            ? isBangla ? 'অনুমোদিত' : 'Approved'
                            : isLast && isRejected
                            ? isBangla ? 'বাতিল' : 'Rejected'
                            : isBangla ? step.bn : step.en}
                        </span>
                      </div>

                      {!isLast && (
                        <div
                          className={`flex-1 h-0.5 -mx-2 -mt-4 transition-all ${
                            state === 'completed'
                              ? 'bg-emerald-500'
                              : 'bg-neutral-200 dark:bg-neutral-800'
                          }`}
                        />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            {/* Celebration Card when Approved */}
            {isApproved && (
              <div className="p-3.5 bg-emerald-50/90 dark:bg-emerald-950/40 rounded-xl border border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🎉</span>
                  <h4 className="font-bold text-sm">
                    {isBangla ? 'অভিনন্দন! আপনার আবেদন অনুমোদিত হয়েছে' : 'Congratulations! Application Approved'}
                  </h4>
                </div>
                <p className="text-xs opacity-90 leading-relaxed">
                  {isBangla
                    ? 'আশ্রয়কেন্দ্র বা লিস্টার আপনার আবেদনটি মঞ্জুর করেছেন। পরবর্তী ধাপ হিসেবে দুই-পক্ষীয় সুরক্ষিত হস্তান্তরের (Handover) মাধ্যমে প্রাণীর চূড়ান্ত মালিকানা ও স্বাস্থ্য রেকর্ড আপনার নামে স্থানান্তর করা হবে।'
                    : 'The caretaker has approved your application! Next, proceed to the two-sided handover to finalize ownership transfer.'}
                </p>
                {application.decision_note && (
                  <p className="text-xs bg-white/70 dark:bg-black/30 p-2 rounded border border-emerald-200 text-emerald-900 dark:text-emerald-200">
                    <span className="font-semibold">{isBangla ? 'লিস্টারের বার্তা: ' : 'Guardian Note: '}</span>
                    {application.decision_note}
                  </p>
                )}
              </div>
            )}

            {/* Rejection Note */}
            {isRejected && application.decision_note && (
              <div className="p-3 bg-rose-50/90 dark:bg-rose-950/40 rounded-xl border border-rose-300 dark:border-rose-800 text-rose-950 dark:text-rose-100 space-y-1">
                <h4 className="font-bold text-xs">
                  {isBangla ? 'পর্যালোচকের সিদ্ধান্ত ও কারণ:' : 'Reviewer Decision & Note:'}
                </h4>
                <p className="text-xs whitespace-pre-line">
                  {application.decision_note}
                </p>
              </div>
            )}

            {/* Application Details Toggle */}
            <div>
              <button
                type="button"
                onClick={() => setExpandedAppId(isExpanded ? null : application.id)}
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                <span>{isExpanded ? '▲' : '▼'}</span>
                <span>
                  {isExpanded
                    ? isBangla ? 'জমা দেওয়া তথ্য সংক্ষেপ করুন' : 'Hide submitted details'
                    : isBangla ? 'জমা দেওয়া তথ্য দেখুন' : 'View submitted details'}
                </span>
              </button>

              {isExpanded && (
                <div className="mt-2.5 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/60 border border-stroke-subtle text-xs space-y-2">
                  <p>
                    <span className="font-semibold">{isBangla ? 'বাসার ধরন: ' : 'Home Type: '}</span>
                    {application.home_type}
                  </p>
                  <p>
                    <span className="font-semibold">{isBangla ? 'অন্যান্য পোষা প্রাণী: ' : 'Other Pets: '}</span>
                    {application.has_other_pets ? (isBangla ? 'হ্যাঁ' : 'Yes') : (isBangla ? 'না' : 'No')}
                  </p>
                  {application.experience && (
                    <p>
                      <span className="font-semibold">{isBangla ? 'পূর্ব অভিজ্ঞতা: ' : 'Experience: '}</span>
                      {application.experience}
                    </p>
                  )}
                  <p>
                    <span className="font-semibold">{isBangla ? 'দত্তক নেওয়ার কারণ: ' : 'Reason: '}</span>
                    {application.reason}
                  </p>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between pt-1 border-t border-stroke-subtle">
              <span className="text-[11px] text-foreground-secondary">
                🛡️ {isBangla ? '১০০% মানবিক সিদ্ধান্ত' : '100% Human Decision'}
              </span>

              <div className="flex items-center gap-2">
                {onViewListing && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onViewListing(listing.id)}
                  >
                    {isBangla ? 'তালিকা দেখুন' : 'View Listing'}
                  </Button>
                )}

                {isPendingDecision && onWithdrawApplication && (
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleWithdraw(application.id)}
                    disabled={withdrawingId === application.id}
                  >
                    {withdrawingId === application.id
                      ? isBangla ? 'প্রত্যাহার হচ্ছে...' : 'Withdrawing...'
                      : isBangla ? 'আবেদন প্রত্যাহার' : 'Withdraw'}
                  </Button>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
