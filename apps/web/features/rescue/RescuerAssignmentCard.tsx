'use client';

import React, { useState } from 'react';
import { useLocale } from '@pranora/i18n';
import { Card, Button, Modal } from '@pranora/ui';
import type { AssignmentWithReport } from './assignmentMockData';

interface RescuerAssignmentCardProps {
  item: AssignmentWithReport;
  onRespond: (assignmentId: string, accept: boolean, declineReason?: string) => Promise<void>;
  onViewCase?: (caseId: string) => void;
  isSubmitting?: boolean;
}

const DECLINE_REASONS = [
  { id: 'area_far', bn: 'আমার কভারেজ এলাকার বাইরে', en: 'Outside my coverage area' },
  { id: 'busy_other', bn: 'অন্য রেসকিউ কাজে ব্যস্ত আছি', en: 'Busy with another active rescue' },
  { id: 'no_transport', bn: 'পরিবহন বা প্রয়োজনীয় সরঞ্জাম নেই', en: 'No transport or critical equipment' },
  { id: 'unavailable', bn: 'ব্যক্তিগত কারণে এই মুহূর্তে পারছি না', en: 'Temporarily unavailable' },
  { id: 'other', bn: 'অন্যান্য কারণ', en: 'Other' },
];

export function RescuerAssignmentCard({
  item,
  onRespond,
  onViewCase,
  isSubmitting = false,
}: RescuerAssignmentCardProps) {
  const { isBangla } = useLocale();
  const { assignment, rescueCase, report } = item;

  const [isDeclineModalOpen, setIsDeclineModalOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState(DECLINE_REASONS[0]?.id || 'area_far');
  const [customReason, setCustomReason] = useState('');

  const handleConfirmDecline = async () => {
    const chosen = DECLINE_REASONS.find((r) => r.id === selectedReason);
    const reasonText =
      selectedReason === 'other'
        ? customReason.trim() || 'Other'
        : chosen
        ? isBangla ? chosen.bn : chosen.en
        : 'Declined by rescuer';

    await onRespond(assignment.id, false, reasonText);
    setIsDeclineModalOpen(false);
  };

  const isCritical = report.urgency === 'critical';
  const isOffered = assignment.status === 'offered';
  const isAccepted = assignment.status === 'accepted';

  return (
    <Card className="p-5 bg-white dark:bg-neutral-900 border-stroke-subtle space-y-4 shadow-sm hover:shadow-md transition-shadow">
      {/* Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-stroke-subtle">
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
            <h3 className="font-bold text-base text-foreground capitalize">
              {report.species} · {report.kind}
            </h3>
            <p className="text-xs text-neutral-500 font-mono">
              Case #{rescueCase.id.slice(0, 8)} · Assignment #{assignment.id.slice(0, 8)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`text-xs px-2.5 py-1 rounded-full font-bold ${
              isCritical
                ? 'bg-red-600 text-white animate-pulse'
                : report.urgency === 'high'
                ? 'bg-amber-600 text-white'
                : 'bg-green-700 text-white'
            }`}
          >
            {report.urgency.toUpperCase()}
          </span>

          {isOffered && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 font-semibold">
              🔔 {isBangla ? 'নতুন প্রস্তাবনা' : 'New Offer'}
            </span>
          )}

          {isAccepted && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-green-50 dark:bg-green-950/40 text-green-800 dark:text-green-300 border border-green-300 dark:border-green-800 font-semibold">
              ✓ {isBangla ? 'গৃহীত কেস' : 'Accepted'}
            </span>
          )}
        </div>
      </div>

      {/* Body Content */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Photo Thumbnail */}
        {report.photos && report.photos.length > 0 && (
          <div className="md:col-span-1 rounded-xl overflow-hidden aspect-video md:aspect-square bg-neutral-100 dark:bg-neutral-800 border border-stroke-subtle">
            <img
              src={report.photos[0]}
              alt="Rescue Animal"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Details & Location */}
        <div className={`${report.photos?.length ? 'md:col-span-3' : 'md:col-span-4'} space-y-2`}>
          {report.area_text && (
            <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <span>📍</span> {report.area_text}
            </p>
          )}

          {report.description && (
            <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed line-clamp-3">
              {report.description}
            </p>
          )}

          {/* Assigned Rescuer-Only Confidential Phone Access */}
          {report.contact_phone && (
            <div className="p-2.5 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900/60 text-xs flex items-center justify-between">
              <div>
                <span className="font-semibold text-green-900 dark:text-green-300">
                  📞 {isBangla ? 'রিপোর্টার হটলাইন (গোপনীয়): ' : 'Reporter Contact (Confidential): '}
                </span>
                <span className="font-mono font-bold text-green-800 dark:text-green-400">
                  {report.contact_phone}
                </span>
              </div>
              <a
                href={`tel:${report.contact_phone}`}
                className="px-2.5 py-1 rounded bg-green-700 text-white font-semibold text-xs hover:bg-green-800"
              >
                {isBangla ? 'কল দিন' : 'Call'}
              </a>
            </div>
          )}

          <p className="text-[11px] text-neutral-400">
            {isBangla ? 'প্রস্তাবনার সময়: ' : 'Offered At: '}
            {new Date(assignment.created_at).toLocaleString(isBangla ? 'bn-BD' : 'en-US')}
          </p>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-3 border-t border-stroke-subtle flex items-center justify-end gap-3">
        {isOffered && (
          <>
            <Button
              variant="secondary"
              size="sm"
              disabled={isSubmitting}
              onClick={() => setIsDeclineModalOpen(true)}
            >
              ✕ {isBangla ? 'প্রত্যাখ্যান করুন' : 'Decline'}
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={isSubmitting}
              onClick={() => onRespond(assignment.id, true)}
            >
              ✓ {isBangla ? 'দায়িত্ব গ্রহণ করুন' : 'Accept Case'}
            </Button>
          </>
        )}

        {isAccepted && onViewCase && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => onViewCase(rescueCase.id)}
          >
            📋 {isBangla ? 'কেস পেজ দেখুন' : 'Go to Case Page'}
          </Button>
        )}

        {assignment.status === 'declined' && (
          <span className="text-xs text-neutral-500 italic">
            {isBangla ? 'প্রত্যাখ্যানের কারণ: ' : 'Decline Reason: '}
            {assignment.decline_reason || 'N/A'}
          </span>
        )}
      </div>

      {/* Decline Reason Modal */}
      <Modal
        isOpen={isDeclineModalOpen}
        onClose={() => setIsDeclineModalOpen(false)}
        title={isBangla ? 'কেস প্রত্যাখ্যানের কারণ' : 'Decline Assignment Reason'}
      >
        <div className="space-y-4 max-w-md">
          <p className="text-xs text-neutral-600 dark:text-neutral-300">
            {isBangla
              ? 'আপনার প্রত্যাখ্যানের পর কেসটি পুনরায় পর্যালোচনার জন্য সমন্বয়কারীর কাছে চলে যাবে যাতে অন্য উদ্ধারকারী নিয়োগ করা যায়।'
              : 'Declining will revert this case to the coordinator queue so another verified rescuer can be dispatched immediately.'}
          </p>

          <div className="space-y-2">
            {DECLINE_REASONS.map((r) => (
              <label
                key={r.id}
                className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer text-xs transition-colors ${
                  selectedReason === r.id
                    ? 'border-primary bg-primary/5 font-semibold text-primary'
                    : 'border-stroke-subtle hover:bg-neutral-50 dark:hover:bg-neutral-800 text-foreground'
                }`}
              >
                <input
                  type="radio"
                  name="decline_reason"
                  value={r.id}
                  checked={selectedReason === r.id}
                  onChange={(e) => setSelectedReason(e.target.value)}
                  className="text-primary"
                />
                <span>{isBangla ? r.bn : r.en}</span>
              </label>
            ))}
          </div>

          {selectedReason === 'other' && (
            <textarea
              rows={3}
              placeholder={isBangla ? 'সংক্ষেপে কারণ লিখুন...' : 'Briefly describe your reason...'}
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              className="w-full p-2.5 text-xs rounded-lg border border-stroke-subtle bg-white dark:bg-neutral-900 text-foreground"
            />
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-stroke-subtle">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsDeclineModalOpen(false)}
            >
              {isBangla ? 'ফিরে যান' : 'Back'}
            </Button>
            <Button
              variant="danger"
              size="sm"
              disabled={isSubmitting}
              onClick={handleConfirmDecline}
            >
              {isSubmitting
                ? isBangla ? 'পাঠানো হচ্ছে...' : 'Submitting...'
                : isBangla ? 'প্রত্যাখ্যান নিশ্চিত করুন' : 'Confirm Decline'}
            </Button>
          </div>
        </div>
      </Modal>
    </Card>
  );
}
