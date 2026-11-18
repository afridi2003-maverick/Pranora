'use client';

import React, { useState } from 'react';
import { useLocale } from '@pranora/i18n';
import { Button, Input, Card } from '@pranora/ui';
import type { MyReportStatusResponse } from '@pranora/api';
import type { RescueStatus } from '@pranora/types';

interface ReportStatusTrackerProps {
  initialReport?: MyReportStatusResponse | null;
  onSearch?: (reportId: string) => Promise<MyReportStatusResponse | null>;
  onNewReport?: () => void;
}

interface StepDefinition {
  key: string;
  bnTitle: string;
  enTitle: string;
  bnDesc: string;
  enDesc: string;
}

const STEPS: StepDefinition[] = [
  {
    key: 'submitted',
    bnTitle: 'জমা',
    enTitle: 'Submitted',
    bnDesc: 'রিপোর্টটি সফলভাবে ডাটাবেজে সংরক্ষিত হয়েছে।',
    enDesc: 'Report safely registered in the system.',
  },
  {
    key: 'under_review',
    bnTitle: 'দেখা হচ্ছে',
    enTitle: 'Under Review',
    bnDesc: 'সমন্বয়কারী ও শেল্টার দল জরুরি অবস্থা ও বিবরণ যাচাই করছেন।',
    enDesc: 'Reviewers are evaluating priority and dispatching help.',
  },
  {
    key: 'rescue_in_progress',
    bnTitle: 'উদ্ধার চলছে',
    enTitle: 'Rescue in Progress',
    bnDesc: 'উদ্ধারকারী দল মাঠে নিয়োজিত এবং উদ্ধার কাজ পরিচালিত হচ্ছে।',
    enDesc: 'Rescuer is actively en route and carrying out rescue.',
  },
  {
    key: 'closed',
    bnTitle: 'শেষ',
    enTitle: 'Closed',
    bnDesc: 'প্রাণীটির প্রাথমিক চিকিৎসা, আশ্রয় বা মালিকের কাছে হস্তান্তর সম্পন্ন।',
    enDesc: 'Medical care, shelter transfer, or reunification complete.',
  },
];

function getActiveStepIndex(status: RescueStatus): number {
  switch (status) {
    case 'submitted':
      return 0;
    case 'under_review':
      return 1;
    case 'assigned':
    case 'rescue_in_progress':
      return 2;
    case 'closed':
      return 3;
    case 'rejected':
    case 'duplicate':
      return -1; // Special terminal state
    default:
      return 0;
  }
}

const URGENCY_LABELS: Record<string, { bn: string; en: string; style: string }> = {
  critical: { bn: 'খুব জরুরি', en: 'Critical', style: 'bg-red-600 text-white' },
  high: { bn: 'উচ্চ', en: 'High', style: 'bg-amber-600 text-white' },
  medium: { bn: 'মাঝারি', en: 'Medium', style: 'bg-green-700 text-white' },
  low: { bn: 'কম', en: 'Low', style: 'bg-neutral-200 text-neutral-800' },
};

export function ReportStatusTracker({
  initialReport = null,
  onSearch,
  onNewReport,
}: ReportStatusTrackerProps) {
  const { isBangla } = useLocale();
  const [reportIdInput, setReportIdInput] = useState('');
  const [report, setReport] = useState<MyReportStatusResponse | null>(initialReport);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = reportIdInput.trim();
    if (!query) return;

    setIsSearching(true);
    setSearchError(null);

    try {
      if (onSearch) {
        const found = await onSearch(query);
        if (found) {
          setReport(found);
        } else {
          setReport(null);
          setSearchError(
            isBangla
              ? 'এই আইডির কোনো রিপোর্ট পাওয়া যায়নি। অনুগ্রহ করে আইডি যাচাই করুন।'
              : 'No report found with this tracking ID. Please verify and try again.'
          );
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Search failed';
      setSearchError(msg);
    } finally {
      setIsSearching(false);
    }
  };

  const activeIndex = report ? getActiveStepIndex(report.status) : 0;
  const isTerminalOther = report && (report.status === 'rejected' || report.status === 'duplicate');

  return (
    <div className="space-y-6 max-w-2xl mx-auto p-4">
      {/* Search Bar */}
      <Card className="p-4 sm:p-5 bg-white dark:bg-neutral-900 border-stroke-subtle">
        <label className="block text-sm font-semibold mb-2 text-foreground">
          {isBangla ? 'রিপোর্ট ট্র্যাকিং আইডি লিখুন' : 'Enter Report Tracking ID'}
        </label>
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            placeholder={isBangla ? 'যেমন: rep-123xyz বা UUID' : 'e.g. rep-123xyz or UUID'}
            value={reportIdInput}
            onChange={(e) => setReportIdInput(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" variant="primary" disabled={isSearching || !reportIdInput.trim()}>
            {isSearching ? (isBangla ? 'খোঁজা হচ্ছে...' : 'Searching...') : isBangla ? 'খুঁজুন' : 'Track'}
          </Button>
        </form>

        {searchError && (
          <p className="text-xs text-red-600 mt-2">{searchError}</p>
        )}
      </Card>

      {/* Report Status Content */}
      {report ? (
        <Card className="p-6 bg-white dark:bg-neutral-900 border-stroke-subtle space-y-6">
          {/* Header Summary */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-stroke-subtle">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">
                  {report.kind === 'injured'
                    ? '🚑'
                    : report.kind === 'lost'
                    ? '🔍'
                    : report.kind === 'found'
                    ? '🐾'
                    : '📦'}
                </span>
                <div>
                  <h2 className="text-lg font-bold text-foreground">
                    {isBangla ? report.statusBn : report.statusEn}
                  </h2>
                  <p className="text-xs font-mono text-neutral-500">
                    ID: {report.reportId}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                  URGENCY_LABELS[report.urgency]?.style ?? 'bg-neutral-200'
                }`}
              >
                {isBangla
                  ? URGENCY_LABELS[report.urgency]?.bn
                  : URGENCY_LABELS[report.urgency]?.en}
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-green-50 dark:bg-green-950/40 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800 font-medium capitalize">
                {report.species}
              </span>
            </div>
          </div>

          {/* Details Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-neutral-600 dark:text-neutral-400">
            {report.areaText && (
              <div>
                <span className="font-semibold text-foreground">
                  📍 {isBangla ? 'এলাকা: ' : 'Area: '}
                </span>
                {report.areaText}
              </div>
            )}
            <div>
              <span className="font-semibold text-foreground">
                🕒 {isBangla ? 'দাখিলের সময়: ' : 'Reported At: '}
              </span>
              {new Date(report.createdAt).toLocaleString(isBangla ? 'bn-BD' : 'en-US')}
            </div>
          </div>

          {/* 4-Step Vertical / Horizontal Stepper */}
          {isTerminalOther ? (
            <div className="p-4 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-center">
              <p className="text-sm font-bold text-foreground">
                {report.status === 'rejected'
                  ? isBangla
                    ? 'রিপোর্টটি বাতিল করা হয়েছে।'
                    : 'Report was rejected or cancelled.'
                  : isBangla
                  ? 'এই রিপোর্টটি কাছাকাছি বিদ্যমান অপর একটি রিপোর্টের সাথে মার্জ করা হয়েছে।'
                  : 'Report was merged with an existing duplicate report.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4 pt-2">
              <h3 className="text-sm font-semibold text-foreground">
                {isBangla ? 'উদ্ধার অগ্রগতি' : 'Rescue Progress'}
              </h3>
              <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-stroke-subtle">
                {STEPS.map((step, idx) => {
                  const isCompleted = activeIndex > idx || activeIndex === 3;
                  const isCurrent = activeIndex === idx && activeIndex !== 3;

                  return (
                    <div key={step.key} className="relative flex items-start gap-3">
                      {/* Step Circle */}
                      <div
                        className={`absolute -left-6 sm:-left-8 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                          isCompleted
                            ? 'bg-green-600 text-white ring-4 ring-green-100 dark:ring-green-950'
                            : isCurrent
                            ? 'bg-primary text-white ring-4 ring-primary/20 animate-pulse'
                            : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-500'
                        }`}
                      >
                        {isCompleted ? '✓' : idx + 1}
                      </div>

                      {/* Step Details */}
                      <div>
                        <h4
                          className={`text-sm font-semibold ${
                            isCompleted || isCurrent
                              ? 'text-foreground'
                              : 'text-neutral-400 dark:text-neutral-600'
                          }`}
                        >
                          {isBangla ? step.bnTitle : step.enTitle}
                        </h4>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                          {isBangla ? step.bnDesc : step.enDesc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Privacy Budget Disclaimer */}
          <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-stroke-subtle flex items-start gap-2.5">
            <span className="text-base flex-shrink-0">🔒</span>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              {isBangla
                ? 'নিরাপত্তা ও গোপনীয়তা বিধিমালার কারণে উদ্ধারকারীর ব্যক্তিগত যোগাযোগ বা অভ্যন্তরীণ নোট রিপোর্টারের কাছে প্রদর্শন করা হয় না।'
                : 'To protect responder safety and privacy, direct rescuer contact details and internal operational logs are kept confidential.'}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            {onNewReport && (
              <Button variant="secondary" onClick={onNewReport}>
                {isBangla ? 'নতুন রিপোর্ট করুন' : 'Submit Another Report'}
              </Button>
            )}
            <Button variant="primary" onClick={() => handleSearch()}>
              {isBangla ? 'রিফ্রেশ করুন' : 'Refresh Status'}
            </Button>
          </div>
        </Card>
      ) : (
        /* Empty Prompt */
        <div className="text-center py-12 px-4 border border-dashed border-stroke-subtle rounded-2xl bg-white/50 dark:bg-neutral-900/50">
          <span className="text-4xl block mb-3">📋</span>
          <h3 className="text-base font-semibold text-foreground mb-1">
            {isBangla ? 'রিপোর্টের বর্তমান অগ্রগতি ট্র্যাক করুন' : 'Track Your Rescue Report Live'}
          </h3>
          <p className="text-xs text-neutral-500 max-w-md mx-auto mb-4">
            {isBangla
              ? 'প্রাণী রিপোর্ট করার পর প্রাপ্ত ট্র্যাকিং আইডি উপরের ঘরে লিখে Search চাপুন।'
              : 'Enter the tracking ID received upon submitting an animal report to view real-time stage updates.'}
          </p>
          {onNewReport && (
            <Button variant="secondary" size="sm" onClick={onNewReport}>
              {isBangla ? 'নতুন প্রাণী রিপোর্ট করতে চান?' : 'Need to report an animal?'}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
