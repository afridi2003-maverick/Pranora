'use client';

/**
 * apps/web/app/[locale]/admin/moderation/page.tsx
 * Task: ADM-2 — Admin Content Moderation & Abuse Prevention
 * Owner: Afridi | Sprint: S5
 */

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import { useLocale } from '@pranora/i18n';
import { Button, Card, Chip, EmptyState, Modal } from '@pranora/ui';
import { LanguageHeader } from '../../../../components/LanguageHeader';
import type { ContentReportItem, ModerationAction } from '@pranora/api';
import type { ModerationStatus, ReportTarget } from '@pranora/types';

const MOCK_REPORTS: ContentReportItem[] = [
  {
    id: 'rep-001',
    reporter_id: 'usr-201',
    target_type: 'adoption_listing',
    target_id: 'adp-771',
    reason: 'fake',
    details: 'এই লিস্টিংটি একটি বিদেশী সাইট থেকে পার্সিয়ান বিড়ালের ছবি চুরি করে দেওয়া হয়েছে। যোগাযোগের পর অগ্রিম ৩০০০ টাকা বিকাশ করতে বলা হচ্ছে।',
    evidence_urls: ['https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=400&q=80'],
    status: 'open',
    moderator_id: null,
    moderator_notes: null,
    action_taken: 'none',
    resolved_at: null,
    created_at: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    reporter_name: 'তানভীর হাসান',
    reporter_phone: '+8801712345678',
    target_title: 'Pure Persian Kitten for Free Adoption (Dhaka)',
  },
  {
    id: 'rep-002',
    reporter_id: 'usr-202',
    target_type: 'provider',
    target_id: 'prv-330',
    reason: 'inaccurate_info',
    details: 'উক্ত ভেট ক্লিনিকটি গত মাসে গুলশান ২ থেকে ধানমন্ডি শিফট হয়েছে। কিন্তু প্রোফাইলে এখনো পুরনো ঠিকানা ও বন্ধ ফোন নম্বর দেওয়া আছে।',
    evidence_urls: [],
    status: 'open',
    moderator_id: null,
    moderator_notes: null,
    action_taken: 'none',
    resolved_at: null,
    created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    reporter_name: 'ডাঃ ফারহানা কবির',
    reporter_phone: '+8801819283746',
    target_title: 'Central Pet Care & Vet Hospital',
  },
  {
    id: 'rep-003',
    reporter_id: 'usr-203',
    target_type: 'animal_report',
    target_id: 'rsc-882',
    reason: 'spam',
    details: 'উদ্ধার রিপোর্ট নয়, বরং এটি একটি পেট ফুড এবং আনুষাঙ্গিক পণ্য বিক্রির বিজ্ঞাপনী পোস্ট।',
    evidence_urls: [],
    status: 'open',
    moderator_id: null,
    moderator_notes: null,
    action_taken: 'none',
    resolved_at: null,
    created_at: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    reporter_name: 'মাহমুদুল হক',
    reporter_phone: '+8801911223344',
    target_title: 'Imported Royal Canin Cat Food 10kg Discount',
  },
  {
    id: 'rep-004',
    reporter_id: 'usr-204',
    target_type: 'user',
    target_id: 'usr-999',
    reason: 'abusive',
    details: 'বিভিন্ন অ্যাডপশন লিস্টিং পোস্টকারীদের ইনবক্সে অশালীন বার্তা এবং অবমাননাকর মন্তব্য পাঠাচ্ছে।',
    evidence_urls: [],
    status: 'open',
    moderator_id: null,
    moderator_notes: null,
    action_taken: 'none',
    resolved_at: null,
    created_at: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    reporter_name: 'সাদিয়া তাসনিম',
    reporter_phone: '+8801611002233',
    target_title: 'User Profile: fake_rescuer_bd',
  },
];

const TARGET_ICONS: Record<ReportTarget, string> = {
  adoption_listing: '🐾',
  animal_report: '🚑',
  provider: '🏥',
  user: '👤',
  review: '⭐',
};

const TARGET_NAMES: Record<ReportTarget, { bn: string; en: string }> = {
  adoption_listing: { bn: 'অ্যাডপশন লিস্টিং', en: 'Adoption Listing' },
  animal_report: { bn: 'উদ্ধার রিপোর্ট', en: 'Rescue Report' },
  provider: { bn: 'ক্লিনিক / সেবা কেন্দ্র', en: 'Clinic / Provider' },
  user: { bn: 'ব্যবহারকারী প্রোফাইল', en: 'User Account' },
  review: { bn: 'রিভিউ / মন্তব্য', en: 'Review' },
};

const REASON_LABELS: Record<string, { bn: string; en: string; type: 'emergency' | 'pending' | 'confirmed' | 'neutral' }> = {
  fake: { bn: '🚨 ভুয়া লিস্টিং', en: '🚨 Fake Listing', type: 'emergency' },
  scam: { bn: '⚠️ আর্থিক জালিয়াতি', en: '⚠️ Fraud / Scam', type: 'emergency' },
  animal_cruelty: { bn: '⛔ প্রাণী নির্যাতন', en: '⛔ Animal Cruelty', type: 'emergency' },
  abusive: { bn: '🚫 হয়রানিমূলক আচরণ', en: '🚫 Abusive Behavior', type: 'pending' },
  inaccurate_info: { bn: 'ℹ️ ভুল ক্লিনিক তথ্য', en: 'ℹ️ Inaccurate Info', type: 'confirmed' },
  spam: { bn: '📢 স্প্যাম / বিজ্ঞাপন', en: '📢 Spam Content', type: 'neutral' },
  duplicate: { bn: '🔄 প্রতিলিপি', en: '🔄 Duplicate', type: 'neutral' },
  other: { bn: 'অন্যান্য', en: 'Other', type: 'neutral' },
};

export default function AdminModerationPage() {
  const { locale } = useLocale();
  const isBn = locale === 'bn';

  const [reports, setReports] = useState<ContentReportItem[]>(MOCK_REPORTS);
  const [statusTab, setStatusTab] = useState<ModerationStatus | 'all'>('open');
  const [targetFilter, setTargetFilter] = useState<ReportTarget | 'all'>('all');
  const [selectedReport, setSelectedReport] = useState<ContentReportItem | null>(null);
  const [actionType, setActionType] = useState<ModerationAction>('removed');
  const [moderatorNotes, setModeratorNotes] = useState('');
  const [blockUserChecked, setBlockUserChecked] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; kind: 'success' | 'error' } | null>(null);

  const showToast = useCallback((message: string, kind: 'success' | 'error') => {
    setToast({ message, kind });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const openCount = reports.filter((r) => r.status === 'open').length;
  const actionedCount = reports.filter((r) => r.status === 'actioned').length;
  const dismissedCount = reports.filter((r) => r.status === 'dismissed').length;

  const filteredReports = reports.filter((r) => {
    if (statusTab !== 'all' && r.status !== statusTab) return false;
    if (targetFilter !== 'all' && r.target_type !== targetFilter) return false;
    return true;
  });

  function openActionModal(report: ContentReportItem, action: ModerationAction) {
    setSelectedReport(report);
    setActionType(action);
    setModeratorNotes('');
    setBlockUserChecked(action === 'user_blocked');
  }

  async function handleExecuteModeration() {
    if (!selectedReport) return;
    setActionLoading(true);

    try {
      // Simulate API call to moderateContent()
      await new Promise((r) => setTimeout(r, 600));

      const newStatus: ModerationStatus = actionType === 'dismissed' ? 'dismissed' : 'actioned';

      setReports((prev) =>
        prev.map((r) =>
          r.id === selectedReport.id
            ? {
                ...r,
                status: newStatus,
                action_taken: actionType,
                moderator_notes: moderatorNotes || null,
                resolved_at: new Date().toISOString(),
              }
            : r
        )
      );

      showToast(
        actionType === 'dismissed'
          ? isBn
            ? 'রিপোর্টটি সফলভাবে বাতিল করা হয়েছে।'
            : 'Report dismissed.'
          : isBn
          ? 'কন্টেন্ট মডারেট করা হয়েছে এবং অ্যাকশন রেকর্ড করা হয়েছে।'
          : 'Content moderated and action successfully recorded.',
        'success'
      );
      setSelectedReport(null);
    } catch {
      showToast(isBn ? 'কার্যক্রম সম্পন্ন হয়নি।' : 'Action failed.', 'error');
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <LanguageHeader />

      {/* Admin Subnav */}
      <div className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 sm:px-6">
          <nav className="flex space-x-1 sm:space-x-4 text-xs sm:text-sm font-medium">
            <Link
              href={`/${locale}/admin/verifications`}
              className="rounded-md px-3 py-1.5 text-neutral-600 hover:bg-neutral-100"
            >
              {isBn ? 'ভেরিফিকেশন' : 'Verifications'}
            </Link>
            <Link
              href={`/${locale}/admin/rescue-queue`}
              className="rounded-md px-3 py-1.5 text-neutral-600 hover:bg-neutral-100"
            >
              {isBn ? 'জরুরি উদ্ধার কিউ' : 'Rescue Queue'}
            </Link>
            <Link
              href={`/${locale}/admin/moderation`}
              className="rounded-md bg-green-50 px-3 py-1.5 text-green-700 font-semibold"
            >
              {isBn ? 'মডারেশন ও সুরক্ষা' : 'Content Moderation'}
            </Link>
            <Link
              href={`/${locale}/admin/audit`}
              className="rounded-md px-3 py-1.5 text-neutral-600 hover:bg-neutral-100"
            >
              {isBn ? 'অডিট লগ' : 'Audit Logs'}
            </Link>
          </nav>
          <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-800">
            {openCount} {isBn ? 'অপেক্ষামান রিপোর্ট' : 'Pending Reports'}
          </span>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Title */}
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900">
              {isBn ? '🛡️ কন্টেন্ট মডারেশন ও সুরক্ষা' : '🛡️ Content Moderation & Abuse Control'}
            </h1>
            <p className="mt-1 text-sm text-neutral-600">
              {isBn
                ? 'ভুয়া লিস্টিং, স্প্যাম রিপোর্ট, ভুল ক্লিনিক তথ্য এবং ক্ষতিকর ব্যবহারকারী নিয়ন্ত্রণ'
                : 'Review fake listings, spam reports, inaccurate clinic data, and block abusive users'}
            </p>
          </div>
        </div>

        {/* Status Counter Tabs */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <button
            onClick={() => setStatusTab('open')}
            className={`rounded-lg border p-4 text-left transition-all ${
              statusTab === 'open'
                ? 'border-red-600 bg-red-50 ring-2 ring-red-500'
                : 'border-neutral-200 bg-white hover:border-neutral-300'
            }`}
          >
            <div className="text-xs font-medium text-neutral-500">
              {isBn ? 'অপেক্ষামান রিপোর্ট' : 'Pending Review'}
            </div>
            <div className="mt-1 text-2xl font-bold text-red-600">{openCount}</div>
          </button>
          <button
            onClick={() => setStatusTab('actioned')}
            className={`rounded-lg border p-4 text-left transition-all ${
              statusTab === 'actioned'
                ? 'border-green-600 bg-green-50 ring-2 ring-green-500'
                : 'border-neutral-200 bg-white hover:border-neutral-300'
            }`}
          >
            <div className="text-xs font-medium text-neutral-500">
              {isBn ? 'পদক্ষেপ গৃহীত' : 'Action Taken'}
            </div>
            <div className="mt-1 text-2xl font-bold text-green-700">{actionedCount}</div>
          </button>
          <button
            onClick={() => setStatusTab('dismissed')}
            className={`rounded-lg border p-4 text-left transition-all ${
              statusTab === 'dismissed'
                ? 'border-neutral-500 bg-neutral-100 ring-2 ring-neutral-400'
                : 'border-neutral-200 bg-white hover:border-neutral-300'
            }`}
          >
            <div className="text-xs font-medium text-neutral-500">
              {isBn ? 'বাতিলকৃত' : 'Dismissed'}
            </div>
            <div className="mt-1 text-2xl font-bold text-neutral-600">{dismissedCount}</div>
          </button>
          <button
            onClick={() => setStatusTab('all')}
            className={`rounded-lg border p-4 text-left transition-all ${
              statusTab === 'all'
                ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-500'
                : 'border-neutral-200 bg-white hover:border-neutral-300'
            }`}
          >
            <div className="text-xs font-medium text-neutral-500">
              {isBn ? 'মোট রিপোর্ট' : 'Total Reports'}
            </div>
            <div className="mt-1 text-2xl font-bold text-blue-700">{reports.length}</div>
          </button>
        </div>

        {/* Target Type Filter Chips */}
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mr-2">
            {isBn ? 'ফিল্টার:' : 'Filter Target:'}
          </span>
          {(['all', 'adoption_listing', 'animal_report', 'provider', 'user'] as const).map((t) => (
            <Chip
              key={t}
              label={
                t === 'all'
                  ? isBn
                    ? 'সকল বিষয়বস্তু'
                    : 'All Targets'
                  : `${TARGET_ICONS[t]} ${isBn ? TARGET_NAMES[t].bn : TARGET_NAMES[t].en}`
              }
              isSelected={targetFilter === t}
              onSelect={() => setTargetFilter(t)}
            />
          ))}
        </div>

        {/* Content Reports List */}
        {filteredReports.length === 0 ? (
          <EmptyState
            icon={<span className="text-3xl">🛡️</span>}
            title={isBn ? 'কোনো রিপোর্ট পাওয়া যায়নি' : 'No reports found'}
            description={
              isBn
                ? 'নির্বাচিত ফিল্টারের আওতায় বর্তমানে কোনো কন্টেন্ট রিপোর্ট অবশিষ্ট নেই।'
                : 'There are no content reports matching the selected filters.'
            }
          />
        ) : (
          <div className="space-y-4">
            {filteredReports.map((report) => {
              const reasonMeta = REASON_LABELS[report.reason] || REASON_LABELS.other;

              return (
                <Card key={report.id} className="p-5 shadow-sm border border-neutral-200">
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                    <div className="space-y-2 flex-1">
                      {/* Top Badges */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center rounded-md bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-700">
                          {TARGET_ICONS[report.target_type]}{' '}
                          <span className="ml-1">
                            {isBn ? TARGET_NAMES[report.target_type].bn : TARGET_NAMES[report.target_type].en}
                          </span>
                        </span>
                        <Chip
                          label={isBn ? reasonMeta?.bn || '' : reasonMeta?.en || ''}
                          variant="status"
                          statusType={reasonMeta?.type || 'neutral'}
                        />
                        <span className="text-xs text-neutral-400 font-mono">
                          ID: {report.target_id.slice(0, 8)}...
                        </span>
                      </div>

                      {/* Target Title & Summary */}
                      <h3 className="text-base sm:text-lg font-bold text-neutral-900">
                        {report.target_title || report.target_id}
                      </h3>

                      {/* Report Details */}
                      <div className="rounded-md bg-neutral-50 p-3 text-sm text-neutral-700 border border-neutral-100">
                        <span className="font-semibold text-neutral-900">
                          {isBn ? 'অভিযোগকারীর বিবরণ:' : 'Report Details:'}{' '}
                        </span>
                        {report.details || (isBn ? 'কোনো অতিরিক্ত বিবরণ দেওয়া হয়নি।' : 'No details provided.')}
                      </div>

                      {/* Reporter Information & Timestamp */}
                      <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-500 pt-1">
                        <div>
                          👤 <span className="font-medium text-neutral-700">{report.reporter_name}</span> (
                          {report.reporter_phone})
                        </div>
                        <div>
                          🕒 {new Date(report.created_at).toLocaleDateString(isBn ? 'bn-BD' : 'en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                        {report.action_taken !== 'none' && (
                          <div className="text-green-700 font-medium">
                            ✓ {isBn ? 'গৃহীত ব্যবস্থা:' : 'Action taken:'} {report.action_taken}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons for Open Reports */}
                    {report.status === 'open' ? (
                      <div className="flex flex-row sm:flex-col gap-2 shrink-0 pt-2 sm:pt-0">
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => openActionModal(report, 'removed')}
                        >
                          {isBn ? '🚫 কন্টেন্ট সরান' : '🚫 Remove'}
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => openActionModal(report, 'user_blocked')}
                        >
                          {isBn ? '⛔ ইউজার ব্লক' : '⛔ Block User'}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openActionModal(report, 'dismissed')}
                        >
                          {isBn ? 'বাতিল' : 'Dismiss'}
                        </Button>
                      </div>
                    ) : (
                      <div className="shrink-0 self-center">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                            report.status === 'actioned'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-neutral-200 text-neutral-700'
                          }`}
                        >
                          {report.status === 'actioned'
                            ? isBn
                              ? 'পদক্ষেপ সম্পন্ন'
                              : 'Resolved'
                            : isBn
                            ? 'বাতিলকৃত'
                            : 'Dismissed'}
                        </span>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Moderation Confirmation Modal */}
        <Modal
          isOpen={Boolean(selectedReport)}
          onClose={() => !actionLoading && setSelectedReport(null)}
          title={
            actionType === 'dismissed'
              ? isBn
                ? 'রিপোর্ট বাতিল নিশ্চিতকরণ'
                : 'Confirm Report Dismissal'
              : actionType === 'user_blocked'
              ? isBn
                ? 'ব্যবহারকারী অ্যাকাউন্ট ব্লক'
                : 'Block Abusive User'
              : isBn
              ? 'কন্টেন্ট অপসারণ ও মডারেশন'
              : 'Remove Fake/Spam Content'
          }
        >
          {selectedReport && (
            <div className="space-y-4">
              <p className="text-sm text-neutral-600">
                {actionType === 'dismissed'
                  ? isBn
                    ? 'এই রিপোর্টটি ভিত্তিহীন বিবেচনা করে বাতিল করা হবে। কন্টেন্ট অপরিবর্তিত থাকবে।'
                    : 'This report will be marked dismissed without affecting the target content.'
                  : isBn
                  ? 'এই পদক্ষেপের ফলে সংশ্লিষ্ট কন্টেন্টটি প্ল্যাটফর্ম থেকে তাৎক্ষণিকভাবে প্রত্যাহার করা হবে।'
                  : 'This action will immediately remove/hide the reported content from Pranora.'}
              </p>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  {isBn ? 'প্রশাসক নোট / সিদ্ধান্তের কারণ (অডিট লগে সংরক্ষিত হবে):' : 'Moderator Notes (Audit Log):'}
                </label>
                <textarea
                  className="w-full rounded-md border border-neutral-300 p-2 text-sm focus:border-green-500 focus:outline-none"
                  rows={3}
                  value={moderatorNotes}
                  onChange={(e) => setModeratorNotes(e.target.value)}
                  placeholder={
                    isBn
                      ? 'সিদ্ধান্তের বিস্তারিত কারণ লিখুন...'
                      : 'Provide details for why this action is taken...'
                  }
                />
              </div>

              {actionType !== 'dismissed' && (
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="blockUserCheck"
                    checked={blockUserChecked}
                    onChange={(e) => setBlockUserChecked(e.target.checked)}
                    className="h-4 w-4 rounded border-neutral-300 text-green-600 focus:ring-green-500"
                  />
                  <label htmlFor="blockUserCheck" className="text-xs text-neutral-700 select-none">
                    {isBn
                      ? 'সংশ্লিষ্ট অ্যাকাউন্ট ব্লক করুন (নতুন কোনো লিস্টিং বা রিপোর্ট পোস্ট বন্ধ হবে)'
                      : 'Block associated user account from creating further content'}
                  </label>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t border-neutral-100">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={actionLoading}
                  onClick={() => setSelectedReport(null)}
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </Button>
                <Button
                  variant={actionType === 'dismissed' ? 'secondary' : 'danger'}
                  size="sm"
                  isLoading={actionLoading}
                  onClick={handleExecuteModeration}
                >
                  {actionType === 'dismissed'
                    ? isBn
                      ? 'রিপোর্ট বাতিল করুন'
                      : 'Dismiss Report'
                    : isBn
                    ? 'পদক্ষেপ প্রয়োগ করুন'
                    : 'Confirm Moderation'}
                </Button>
              </div>
            </div>
          )}
        </Modal>

        {/* Notification Toast */}
        {toast && (
          <div
            className={`fixed bottom-6 right-6 z-50 rounded-lg px-4 py-3 text-sm font-semibold text-white shadow-xl ${
              toast.kind === 'success' ? 'bg-green-700' : 'bg-red-700'
            }`}
          >
            {toast.message}
          </div>
        )}
      </main>
    </div>
  );
}
