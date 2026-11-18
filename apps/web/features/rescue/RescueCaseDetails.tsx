'use client';

import React, { useState } from 'react';
import { useLocale } from '@pranora/i18n';
import { Card, Button } from '@pranora/ui';
import type { RescueStatus, RescueOutcome } from '@pranora/types';
import type { RescueCaseFullDetails } from './caseDetailMockData';
import { CaseUpdateTimeline } from './CaseUpdateTimeline';
import { AddCaseUpdateForm } from './AddCaseUpdateForm';
import { CloseCaseOutcomeModal } from './CloseCaseOutcomeModal';
import { UrgentReportAlertBanner } from './UrgentReportAlertBanner';

interface RescueCaseDetailsProps {
  initialDetails: RescueCaseFullDetails;
  onAddUpdate?: (payload: {
    case_id: string;
    note?: string | null;
    status?: RescueStatus | null;
    photos?: string[];
  }) => Promise<{ error?: string }>;
  onCloseCase?: (payload: {
    case_id: string;
    outcome: RescueOutcome;
    note?: string | null;
    pet_id?: string | null;
  }) => Promise<{ error?: string }>;
  onCloseCaseClick?: () => void;
}

export function RescueCaseDetails({
  initialDetails,
  onAddUpdate,
  onCloseCase,
  onCloseCaseClick,
}: RescueCaseDetailsProps) {
  const { isBangla } = useLocale();
  const [details, setDetails] = useState<RescueCaseFullDetails>(initialDetails);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);

  const { rescueCase, report, updates } = details;

  const handlePostUpdate = async (payload: {
    case_id: string;
    note?: string | null;
    status?: RescueStatus | null;
    photos?: string[];
  }): Promise<{ error?: string }> => {
    setIsSubmitting(true);
    try {
      if (onAddUpdate) {
        const res = await onAddUpdate(payload);
        if (res.error) return res;
      }

      const newUpdate = {
        id: `upd-${Date.now().toString(36)}`,
        case_id: payload.case_id,
        author_id: 'rescuer-current',
        author_name: isBangla ? 'বর্তমান উদ্ধারকারী' : 'Current Rescuer',
        author_role: 'rescuer',
        status: payload.status ?? null,
        note: payload.note ?? null,
        photos: payload.photos ?? [],
        created_at: new Date().toISOString(),
      };

      setDetails((prev) => ({
        ...prev,
        rescueCase: {
          ...prev.rescueCase,
          status: payload.status || prev.rescueCase.status,
        },
        updates: [...prev.updates, newUpdate],
      }));

      return {};
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExecuteClose = async (payload: {
    case_id: string;
    outcome: RescueOutcome;
    note?: string | null;
    pet_id?: string | null;
  }): Promise<{ error?: string; success?: boolean }> => {
    setIsSubmitting(true);
    try {
      if (onCloseCase) {
        const res = await onCloseCase(payload);
        if (res.error) return res;
      }

      const closedTimestamp = new Date().toISOString();
      const closeAuditUpdate = {
        id: `upd-close-${Date.now().toString(36)}`,
        case_id: payload.case_id,
        author_id: 'rescuer-current',
        author_name: isBangla ? 'উদ্ধারকারী দল' : 'Rescue Team',
        author_role: 'rescuer',
        status: 'closed' as RescueStatus,
        note: `[Case Closed] Outcome: ${payload.outcome}. ${payload.note || ''}`,
        photos: [],
        created_at: closedTimestamp,
      };

      setDetails((prev) => ({
        ...prev,
        rescueCase: {
          ...prev.rescueCase,
          status: 'closed',
          outcome: payload.outcome,
          outcome_note: payload.note || null,
          closed_at: closedTimestamp,
          pet_id: payload.pet_id || prev.rescueCase.pet_id,
        },
        updates: [...prev.updates, closeAuditUpdate],
      }));

      return { success: true };
    } finally {
      setIsSubmitting(false);
    }
  };

  const isClosed = rescueCase.status === 'closed';

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Urgent Report Alert & 15-min Escalation Window (RSC-6) */}
      <UrgentReportAlertBanner report={report} />

      {/* 1. Header Card */}
      <Card className="p-6 bg-white dark:bg-neutral-900 border-stroke-subtle shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-stroke-subtle">
          <div className="flex items-center gap-3">
            <span className="text-3xl">
              {report.kind === 'injured'
                ? '🚑'
                : report.kind === 'lost'
                ? '🔍'
                : report.kind === 'found'
                ? '🐾'
                : '📦'}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-foreground capitalize">
                  {report.species} · {report.kind}
                </h1>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                    isClosed
                      ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200'
                      : 'bg-green-50 dark:bg-green-950/40 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800'
                  }`}
                >
                  {rescueCase.status.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs font-mono text-neutral-500 mt-0.5">
                Case ID: {rescueCase.id} · Report ID: {report.id}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-xs px-3 py-1 rounded-full font-bold uppercase ${
                report.urgency === 'critical'
                  ? 'bg-red-600 text-white animate-pulse'
                  : report.urgency === 'high'
                  ? 'bg-amber-600 text-white'
                  : 'bg-green-700 text-white'
              }`}
            >
              {report.urgency}
            </span>

            {!isClosed && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  if (onCloseCaseClick) onCloseCaseClick();
                  else setIsCloseModalOpen(true);
                }}
              >
                🔒 {isBangla ? 'কেস সম্পন্ন করুন' : 'Close Case'}
              </Button>
            )}
          </div>
        </div>

        {/* Closed Outcome Showcase Banner */}
        {isClosed && rescueCase.outcome && (
          <div className="p-4 rounded-xl bg-green-50 dark:bg-green-950/40 border border-green-300 dark:border-green-800 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🏆</span>
                <div>
                  <h4 className="text-sm font-bold text-green-900 dark:text-green-200">
                    {isBangla ? 'কেস সম্পন্ন ও ফলাফল রেকর্ডকৃত' : 'Case Closed with Recorded Outcome'}
                  </h4>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-green-200 dark:bg-green-800 text-green-900 dark:text-green-100 uppercase">
                    {rescueCase.outcome}
                  </span>
                </div>
              </div>
              {rescueCase.closed_at && (
                <span className="text-xs text-green-700 dark:text-green-400">
                  🕒 {new Date(rescueCase.closed_at).toLocaleString(isBangla ? 'bn-BD' : 'en-US')}
                </span>
              )}
            </div>

            {rescueCase.outcome_note && (
              <p className="text-xs text-green-800 dark:text-green-300 italic pt-1">
                "{rescueCase.outcome_note}"
              </p>
            )}
          </div>
        )}

        {/* 2. Overview Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Photos */}
          <div className="md:col-span-1 space-y-2">
            <h4 className="text-xs font-semibold text-neutral-500 uppercase">
              {isBangla ? 'রিপোর্টকৃত ছবি' : 'Report Photos'}
            </h4>
            {report.photos && report.photos.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {report.photos.map((src, i) => (
                  <div key={i} className="aspect-square rounded-xl overflow-hidden border border-stroke-subtle">
                    <img src={src} alt="Animal" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="aspect-video rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-xs text-neutral-400">
                {isBangla ? 'ছবি নেই' : 'No photos'}
              </div>
            )}
          </div>

          {/* Details & Location */}
          <div className="md:col-span-2 space-y-3">
            <div>
              <h4 className="text-xs font-semibold text-neutral-500 uppercase mb-1">
                {isBangla ? 'ঘটনাস্থল ও এলাকা' : 'Incident Location'}
              </h4>
              <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <span>📍</span> {report.area_text || (isBangla ? 'এলাকা নির্ধারিত নয়' : 'Location unspecified')}
              </p>
              {Boolean(report.location) && (
                <p className="text-xs font-mono text-neutral-400 mt-0.5">
                  Coordinates: {String(report.location)}
                </p>
              )}
            </div>

            {report.description && (
              <div>
                <h4 className="text-xs font-semibold text-neutral-500 uppercase mb-1">
                  {isBangla ? 'প্রাথমিক বিবরণ' : 'Initial Description'}
                </h4>
                <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed bg-neutral-50 dark:bg-neutral-800/40 p-3 rounded-xl border border-stroke-subtle">
                  {report.description}
                </p>
              </div>
            )}

            {/* Confidential Hotline for Rescuer / Admin */}
            {report.contact_phone && (
              <div className="p-3 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800/60 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-green-900 dark:text-green-300 block">
                    📞 {isBangla ? 'রিপোর্টার হটলাইন (গোপনীয়)' : 'Reporter Direct Contact (Confidential)'}
                  </span>
                  <span className="font-mono text-sm font-bold text-green-800 dark:text-green-400">
                    {report.contact_phone}
                  </span>
                </div>
                <a
                  href={`tel:${report.contact_phone}`}
                  className="px-3 py-1.5 rounded-lg bg-green-700 text-white font-semibold text-xs hover:bg-green-800"
                >
                  {isBangla ? 'কল করুন' : 'Call Reporter'}
                </a>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* 3. Add Update Form (If case is open) */}
      {!isClosed && (
        <AddCaseUpdateForm
          caseId={rescueCase.id}
          currentStatus={rescueCase.status}
          onSubmit={handlePostUpdate}
          isSubmitting={isSubmitting}
        />
      )}

      {/* 4. Timeline */}
      <CaseUpdateTimeline updates={updates} />

      {/* 5. Close Case Outcome Modal */}
      <CloseCaseOutcomeModal
        isOpen={isCloseModalOpen}
        onClose={() => setIsCloseModalOpen(false)}
        caseId={rescueCase.id}
        animalSpecies={report.species}
        isLostReport={report.kind === 'lost' || report.kind === 'found'}
        onSubmit={handleExecuteClose}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
