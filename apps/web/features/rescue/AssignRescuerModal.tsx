'use client';

import React, { useState } from 'react';
import { useLocale } from '@pranora/i18n';
import { Modal, Button, Input } from '@pranora/ui';
import {
  MOCK_VERIFIED_RESCUERS,
  type RescuerProfileBrief,
} from './assignmentMockData';

interface AssignRescuerModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseId: string;
  reportSpecies?: string;
  reportArea?: string;
  onAssign: (caseId: string, rescuerId: string) => Promise<{ success: boolean; error?: string }>;
  rescuers?: RescuerProfileBrief[];
}

export function AssignRescuerModal({
  isOpen,
  onClose,
  caseId,
  reportSpecies,
  reportArea,
  onAssign,
  rescuers = MOCK_VERIFIED_RESCUERS,
}: AssignRescuerModalProps) {
  const { isBangla } = useLocale();
  const [search, setSearch] = useState('');
  const [isSubmittingId, setIsSubmittingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filteredRescuers = rescuers.filter((r) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      r.name.toLowerCase().includes(q) ||
      r.name_bn.includes(q) ||
      r.district_name_en.toLowerCase().includes(q) ||
      r.district_name_bn.includes(q)
    );
  });

  const handleAssignClick = async (rescuerId: string) => {
    setIsSubmittingId(rescuerId);
    setError(null);
    try {
      const res = await onAssign(caseId, rescuerId);
      if (res.success) {
        onClose();
      } else if (res.error) {
        setError(res.error);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to assign rescuer';
      setError(msg);
    } finally {
      setIsSubmittingId(null);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isBangla ? 'উদ্ধারকারী নিয়োগ করুন' : 'Assign Verified Rescuer'}
    >
      <div className="space-y-4 max-w-lg">
        {/* Case Context Header */}
        <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-stroke-subtle text-xs space-y-1">
          <p className="font-semibold text-foreground">
            {isBangla ? 'কেস আইডি: ' : 'Case ID: '}
            <span className="font-mono">{caseId}</span>
          </p>
          {reportSpecies && (
            <p className="text-neutral-600 dark:text-neutral-400">
              {isBangla ? 'প্রাণী: ' : 'Animal: '}
              <span className="font-semibold capitalize text-foreground">{reportSpecies}</span>
            </p>
          )}
          {reportArea && (
            <p className="text-neutral-600 dark:text-neutral-400">
              📍 {reportArea}
            </p>
          )}
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
            {error}
          </div>
        )}

        {/* Search */}
        <Input
          placeholder={
            isBangla
              ? 'উদ্ধারকারীর নাম বা এলাকা দিয়ে খুঁজুন...'
              : 'Search rescuer by name or coverage district...'
          }
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Rescuers List */}
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {filteredRescuers.map((rescuer) => {
            const isBusy = rescuer.active_cases_count >= 2 || !rescuer.is_available;
            const isThisSubmitting = isSubmittingId === rescuer.id;

            return (
              <div
                key={rescuer.id}
                className="p-3 rounded-xl border border-stroke-subtle bg-white dark:bg-neutral-900 flex items-center justify-between gap-3 hover:border-primary transition-colors"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm text-foreground">
                      {isBangla ? rescuer.name_bn : rescuer.name}
                    </span>
                    <span className="text-primary text-xs" title="Verified Rescuer">
                      ☑️
                    </span>
                  </div>

                  <p className="text-xs text-neutral-500 mt-0.5">
                    📍 {isBangla ? rescuer.district_name_bn : rescuer.district_name_en}
                  </p>

                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                        rescuer.active_cases_count === 0
                          ? 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {isBangla
                        ? `${rescuer.active_cases_count}টি সক্রিয় কেস`
                        : `${rescuer.active_cases_count} active cases`}
                    </span>

                    {!rescuer.is_available && (
                      <span className="text-[11px] text-neutral-400 italic">
                        {isBangla ? '(অনুপলব্ধ)' : '(Unavailable)'}
                      </span>
                    )}
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  disabled={isThisSubmitting || Boolean(isSubmittingId)}
                  onClick={() => handleAssignClick(rescuer.id)}
                >
                  {isThisSubmitting
                    ? isBangla ? 'নিয়োগ হচ্ছে...' : 'Assigning...'
                    : isBusy
                    ? isBangla ? 'তবুও নিয়োগ' : 'Assign Anyway'
                    : isBangla ? 'নিয়োগ দিন' : 'Assign'}
                </Button>
              </div>
            );
          })}

          {filteredRescuers.length === 0 && (
            <p className="text-xs text-neutral-500 text-center py-4">
              {isBangla
                ? 'কোনো উদ্ধারকারী খুঁজে পাওয়া যায়নি।'
                : 'No verified rescuers found matching query.'}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-stroke-subtle flex justify-end">
          <Button variant="ghost" size="sm" onClick={onClose}>
            {isBangla ? 'বাতিল' : 'Cancel'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
