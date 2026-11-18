'use client';

/**
 * apps/web/app/[locale]/admin/rescue-queue/page.tsx
 * Task: ADM-3 — Admin Urgent Rescue Report Queue
 * Owner: Afridi | Sprint: S4
 */

import React, { useState, useCallback } from 'react';
import { useLocale } from '@pranora/i18n';
import { Button, Card, Chip, EmptyState, Modal } from '@pranora/ui';
import { LanguageHeader } from '../../../../components/LanguageHeader';
import type { UrgentRescueReportItem } from '@pranora/api';
import type { UrgencyLevel, AnimalReportKind, SpeciesType } from '@pranora/types';

const MOCK_RESCUE_REPORTS: UrgentRescueReportItem[] = [
  {
    id: 'rsc-001',
    reporter_id: 'u-101',
    kind: 'injured',
    species: 'dog',
    urgency: 'critical',
    last_seen_at: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    contact_phone: '+8801711998877',
    description: 'রাস্তার পাশে গুরুতর আঘাতপ্রাপ্ত কুকুর, রক্তক্ষরণ হচ্ছে। দ্রুত চিকিৎসার প্রয়োজন।',
    photos: ['https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=400&q=80'],
    area_text: 'ধানমন্ডি লেক সংলগ্ন রবীন্দ্র সরোবর, ঢাকা',
    district_id: 1,
    upazila_id: 10,
    status: 'submitted',
    created_at: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    reporter_name: 'আরিফ রহমান',
    reporter_phone: '+8801711998877',
  },
  {
    id: 'rsc-002',
    reporter_id: 'u-102',
    kind: 'abandoned',
    species: 'cat',
    urgency: 'high',
    last_seen_at: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    contact_phone: '+8801822334455',
    description: '৩টি ছোট বিড়ালছানা বক্সে করে ফেলে রেখে যাওয়া হয়েছে। মা বিড়াল নেই।',
    photos: ['https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=400&q=80'],
    area_text: 'উত্তরা সেক্টর ৭, পার্কের কাছে, ঢাকা',
    district_id: 1,
    upazila_id: 12,
    status: 'submitted',
    created_at: new Date(Date.now() - 1000 * 60 * 95).toISOString(),
    reporter_name: 'তানজিলা ইসলাম',
    reporter_phone: '+8801822334455',
  },
  {
    id: 'rsc-003',
    reporter_id: 'u-103',
    kind: 'injured',
    species: 'bird',
    urgency: 'medium',
    last_seen_at: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    contact_phone: '+8801933557799',
    description: 'ডানা ভাঙা একটি চিল গাছে আটকে ছিল, নিচে নামানো হয়েছে।',
    photos: [],
    area_text: 'মিরপুর ২, কমার্স কলেজ রোড',
    district_id: 1,
    upazila_id: 15,
    status: 'under_review',
    created_at: new Date(Date.now() - 1000 * 60 * 190).toISOString(),
    reporter_name: 'সোহেল আহমেদ',
    reporter_phone: '+8801933557799',
  },
];

const SPECIES_EMOJI: Record<SpeciesType, string> = {
  dog: '🐕',
  cat: '🐈',
  bird: '🦅',
  fish: '🐟',
  rabbit: '🐇',
  cow: '🐄',
  goat: '🐐',
  poultry: '🐔',
  other: '🐾',
};

const KIND_LABEL: Record<AnimalReportKind, { bn: string; en: string }> = {
  injured: { bn: 'আহত প্রাণী', en: 'Injured Animal' },
  lost: { bn: 'হারিয়ে যাওয়া', en: 'Lost Pet' },
  found: { bn: 'খুঁজে পাওয়া', en: 'Found Pet' },
  abandoned: { bn: 'পরিত্যক্ত প্রাণী', en: 'Abandoned' },
};

const URGENCY_CONFIG: Record<UrgencyLevel, { bn: string; en: string; type: 'emergency' | 'pending' | 'confirmed' | 'neutral' }> = {
  critical: { bn: '🚨 জীবনঝুঁকি (Critical)', en: '🚨 Critical Urgency', type: 'emergency' },
  high: { bn: '⚠️ উচ্চ জরুরি (High)', en: '⚠️ High Urgency', type: 'pending' },
  medium: { bn: 'সাধারণ জরুরি (Medium)', en: 'Medium Urgency', type: 'confirmed' },
  low: { bn: 'স্বাভাবিক (Low)', en: 'Low Urgency', type: 'neutral' },
};

export default function AdminRescueQueuePage() {
  const { locale } = useLocale();
  const isBn = locale === 'bn';

  const [reports, setReports] = useState<UrgentRescueReportItem[]>(MOCK_RESCUE_REPORTS);
  const [urgencyFilter, setUrgencyFilter] = useState<UrgencyLevel | 'all'>('all');
  const [modalItem, setModalItem] = useState<{ report: UrgentRescueReportItem; accept: boolean } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; kind: 'success' | 'error' } | null>(null);

  const showToast = useCallback((message: string, kind: 'success' | 'error') => {
    setToast({ message, kind });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const criticalCount = reports.filter((r) => r.urgency === 'critical' && r.status === 'submitted').length;

  const filteredReports = reports.filter((r) => {
    if (urgencyFilter !== 'all' && r.urgency !== urgencyFilter) return false;
    return true;
  });

  async function handleConfirmReview() {
    if (!modalItem) return;
    setActionLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 600));
      setReports((prev) => prev.filter((r) => r.id !== modalItem.report.id));

      showToast(
        modalItem.accept
          ? isBn
            ? 'রিপোর্টটি অনুমোদিত হয়েছে এবং কেস ওপেন হয়েছে! 🚑'
            : 'Report approved and rescue case opened! 🚑'
          : isBn
          ? 'রিপোর্টটি বাতিল করা হয়েছে।'
          : 'Report has been dismissed.',
        'success'
      );
      setModalItem(null);
    } catch {
      showToast(isBn ? 'কার্যক্রম সম্পন্ন হয়নি।' : 'Action failed.', 'error');
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <LanguageHeader />

      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-5">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-2xl">🚑</span>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              {isBn ? 'জরুরি উদ্ধার কিউ' : 'Urgent Rescue Queue'}
            </h1>
            {criticalCount > 0 && (
              <span className="ml-auto bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-full animate-pulse">
                {criticalCount} {isBn ? 'জীবনঝুঁকি' : 'Critical'}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {isBn
              ? 'বিপন্ন ও আহত প্রাণীদের জরুরি রিপোর্ট দ্রুত পর্যালোচনা ও উদ্ধার সমন্বয়'
              : 'Review urgent animal rescue reports and dispatch rescue coordination'}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-4xl mx-auto px-4 pt-4 flex gap-2 flex-wrap items-center">
        <span className="text-xs font-semibold text-gray-500 uppercase mr-1">
          {isBn ? 'জরুরিতা:' : 'Urgency:'}
        </span>
        {(['all', 'critical', 'high', 'medium', 'low'] as const).map((lvl) => (
          <Chip
            key={lvl}
            label={
              lvl === 'all'
                ? isBn ? 'সকল রিপোর্ট' : 'All'
                : isBn ? URGENCY_CONFIG[lvl].bn : URGENCY_CONFIG[lvl].en
            }
            variant="filter"
            isSelected={urgencyFilter === lvl}
            onSelect={() => setUrgencyFilter(lvl)}
            className="cursor-pointer"
          />
        ))}
      </div>

      {/* Report Queue List */}
      <main className="max-w-4xl mx-auto px-4 py-4 pb-24 space-y-4">
        {filteredReports.length === 0 ? (
          <EmptyState
            icon="🚑"
            title={isBn ? 'কোনো অপেক্ষামান জরুরি রিপোর্ট নেই' : 'No pending urgent reports'}
            description={
              isBn
                ? 'সকল জরুরি উদ্ধার রিপোর্ট পর্যালোচনা সম্পন্ন হয়েছে।'
                : 'All urgent rescue reports have been processed.'
            }
          />
        ) : (
          filteredReports.map((report) => {
            const urgency = URGENCY_CONFIG[report.urgency];
            const kind = KIND_LABEL[report.kind] ?? { bn: report.kind, en: report.kind };
            const emoji = SPECIES_EMOJI[report.species] ?? '🐾';

            return (
              <Card
                key={report.id}
                className={`p-5 border-l-4 ${
                  report.urgency === 'critical'
                    ? 'border-l-red-600 dark:border-l-red-500 bg-red-50/20'
                    : report.urgency === 'high'
                    ? 'border-l-amber-500 bg-amber-50/20'
                    : 'border-l-green-600'
                }`}
              >
                <div className="flex flex-col md:flex-row gap-4 items-start">
                  {/* Photo or Icon */}
                  {report.photos.length > 0 ? (
                    <img
                      src={report.photos[0]}
                      alt={report.species}
                      className="w-full md:w-36 h-36 object-cover rounded-xl flex-shrink-0"
                    />
                  ) : (
                    <div className="w-full md:w-36 h-36 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center text-4xl flex-shrink-0">
                      {emoji}
                    </div>
                  )}

                  {/* Details */}
                  <div className="flex-1 space-y-2 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Chip label={isBn ? urgency.bn : urgency.en} variant="status" statusType={urgency.type} />
                      <span className="font-semibold text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                        {emoji} {isBn ? kind.bn : kind.en}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(report.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {report.description ?? (isBn ? 'কোনো বিবরণ দেওয়া হয়নি' : 'No description provided')}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs text-gray-600 dark:text-gray-400 pt-1">
                      <div>
                        📍 <span className="font-semibold">{isBn ? 'স্থান:' : 'Area:'}</span> {report.area_text ?? '—'}
                      </div>
                      <div>
                        👤 <span className="font-semibold">{isBn ? 'রিপোর্টার:' : 'Reporter:'}</span> {report.reporter_name ?? 'Anonymous'}
                      </div>
                      {report.contact_phone && (
                        <div>
                          📞 <span className="font-semibold">{isBn ? 'ফোন:' : 'Phone:'}</span> {report.contact_phone}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2 flex-wrap">
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => setModalItem({ report, accept: true })}
                      >
                        {isBn ? '✅ অনুমোদন ও কেস শুরু' : '✅ Approve & Open Case'}
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => setModalItem({ report, accept: false })}
                      >
                        {isBn ? '❌ বাতিল করুন' : '❌ Dismiss Report'}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </main>

      {/* Confirmation Modal */}
      {modalItem && (
        <Modal
          isOpen={true}
          onClose={() => setModalItem(null)}
          title={
            modalItem.accept
              ? isBn ? 'উদ্ধার কেস অনুমোদন করবেন?' : 'Approve Rescue Case?'
              : isBn ? 'রিপোর্টটি বাতিল করবেন?' : 'Dismiss Report?'
          }
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {modalItem.accept
                ? isBn
                  ? 'এই রিপোর্টটি অনুমোদন করলে স্বয়ংক্রিয়ভাবে একটি রেসকিউ কেস তৈরি হবে এবং উদ্ধারকারীদের নিকট নোটিফিকেশন পাঠানো যাবে।'
                  : 'Approving this report will create an active rescue case and alert nearby responders.'
                : isBn
                ? 'আপনি কি নিশ্চিত যে এই রিপোর্টটি বাতিল করতে চান?'
                : 'Are you sure you want to dismiss this report?'}
            </p>
            <div className="flex gap-2 justify-end pt-2">
              <Button variant="ghost" onClick={() => setModalItem(null)} disabled={actionLoading}>
                {isBn ? 'বাতিল' : 'Cancel'}
              </Button>
              <Button
                variant={modalItem.accept ? 'primary' : 'danger'}
                onClick={handleConfirmReview}
                isLoading={actionLoading}
              >
                {isBn ? 'নিশ্চিত করুন' : 'Confirm'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Toast Feedback */}
      {toast && (
        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium ${
            toast.kind === 'success' ? 'bg-green-600' : 'bg-red-600'
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}
