'use client';

import React, { useState } from 'react';
import { useLocale } from '@pranora/i18n';
import { Card, Button, Modal } from '@pranora/ui';
import type { AnimalReportRow, PotentialDuplicateReport } from '@pranora/api';

interface DuplicateReportsCardProps {
  currentReport: AnimalReportRow;
  duplicates?: PotentialDuplicateReport[];
  onMergeDuplicate?: (duplicateId: string, targetId: string) => Promise<{ success: boolean; error?: string }>;
}

export function DuplicateReportsCard({
  currentReport,
  duplicates = [],
  onMergeDuplicate,
}: DuplicateReportsCardProps) {
  const { isBangla } = useLocale();

  const [candidates, setCandidates] = useState<PotentialDuplicateReport[]>(duplicates);
  const [selectedCandidate, setSelectedCandidate] = useState<PotentialDuplicateReport | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const [isMerging, setIsMerging] = useState(false);
  const [mergeSuccessMsg, setMergeSuccessMsg] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (candidates.length === 0 && !mergeSuccessMsg) {
    return null;
  }

  const handleOpenCompare = (candidate: PotentialDuplicateReport) => {
    setSelectedCandidate(candidate);
    setIsComparing(true);
    setErrorMessage(null);
  };

  const handleExecuteMerge = async () => {
    if (!selectedCandidate) return;

    setIsMerging(true);
    setErrorMessage(null);

    try {
      if (onMergeDuplicate) {
        const res = await onMergeDuplicate(selectedCandidate.id, currentReport.id);
        if (!res.success) {
          setErrorMessage(res.error || (isBangla ? 'রিপোর্ট একীভূত করা সম্ভব হয়নি।' : 'Failed to merge report.'));
          setIsMerging(false);
          return;
        }
      }

      // Optimistically remove from candidates list
      setCandidates((prev) => prev.filter((c) => c.id !== selectedCandidate.id));
      setIsComparing(false);
      setMergeSuccessMsg(
        isBangla
          ? `রিপোর্ট #${selectedCandidate.id.slice(0, 8)} সফলভাবে বর্তমান কেসে একীভূত করা হয়েছে।`
          : `Report #${selectedCandidate.id.slice(0, 8)} successfully merged into this case.`
      );
      setSelectedCandidate(null);
    } catch {
      setErrorMessage(isBangla ? 'সার্ভারে সমস্যা হয়েছে।' : 'Server error occurred.');
    } finally {
      setIsMerging(false);
    }
  };

  return (
    <>
      <Card className="p-4 bg-amber-50/80 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200">
            <span className="text-xl">⚠️</span>
            <h4 className="text-sm font-bold">
              {isBangla
                ? `সম্ভাব্য নকল রিপোর্ট শনাক্ত হয়েছে (${candidates.length})`
                : `Potential Duplicate Reports Detected (${candidates.length})`}
            </h4>
          </div>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-200 dark:bg-amber-900/80 text-amber-950 dark:text-amber-100">
            {isBangla ? 'RSC-8 মার্জ সুবিধা' : 'RSC-8 Merge Tool'}
          </span>
        </div>

        <p className="text-xs text-amber-900/90 dark:text-amber-200/90 leading-relaxed">
          {isBangla
            ? 'একই ভৌগোলিক সীমার মধ্যে একই প্রজাতির প্রাণীর একাধিক রিপোর্ট পাওয়া গেছে। উদ্ধারকর্মীদের সমন্বয়ের সুবিধার্থে এগুলো একীভূত করতে পারেন।'
            : 'Multiple reports of the same species were submitted in close proximity. Compare and merge duplicates to avoid duplicated dispatch.'}
        </p>

        {mergeSuccessMsg && (
          <div className="p-2.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 border border-emerald-300 text-emerald-900 dark:text-emerald-200 text-xs font-semibold">
            ✅ {mergeSuccessMsg}
          </div>
        )}

        {/* Candidate List */}
        <div className="space-y-2 pt-1">
          {candidates.map((dup) => (
            <div
              key={dup.id}
              className="p-3 rounded-xl bg-white dark:bg-neutral-900 border border-amber-200 dark:border-amber-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
            >
              <div className="flex items-start gap-3 min-w-0">
                <img
                  src={
                    dup.photos[0] ||
                    'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400'
                  }
                  alt="Duplicate photo"
                  className="w-14 h-14 rounded-lg object-cover flex-shrink-0 border border-stroke-subtle"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-foreground">
                      #{dup.id.slice(0, 8)}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 font-semibold uppercase text-neutral-700 dark:text-neutral-300">
                      {dup.species}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                      📍 {Math.round(dup.distance_meters)} {isBangla ? 'মিটার দূরে' : 'm away'}
                    </span>
                  </div>
                  <p className="text-xs text-foreground-secondary truncate mt-1">
                    {dup.description || dup.area_text || (isBangla ? 'কোনো বিবরণ নেই' : 'No description')}
                  </p>
                  <p className="text-[10px] text-foreground-secondary mt-0.5">
                    🕒 {new Date(dup.created_at).toLocaleString(isBangla ? 'bn-BD' : 'en-US')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleOpenCompare(dup)}
                >
                  🔍 {isBangla ? 'তুলনা ও একীভূত' : 'Compare & Merge'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Comparison & Merge Modal */}
      {selectedCandidate && (
        <Modal
          isOpen={isComparing}
          onClose={() => setIsComparing(false)}
          title={isBangla ? 'রিপোর্ট তুলনা ও একীভূতকরণ' : 'Compare & Merge Reports'}
        >
          <div className="space-y-5 max-w-2xl">
            <p className="text-xs text-foreground-secondary">
              {isBangla
                ? 'উভয় রিপোর্টের ছবি ও বিবরণ যাচাই করুন। একীভূত করলে নকল রিপোর্টটি বন্ধ হবে এবং এর প্রমাণাদি বর্তমান কেসে স্থানান্তরিত হবে।'
                : 'Review details side-by-side. Merging will close the duplicate report and transfer its evidence into the primary case.'}
            </p>

            {/* Side-by-Side Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Primary Report */}
              <div className="p-3.5 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-2">
                <div className="flex items-center justify-between border-b border-emerald-200 dark:border-emerald-800/60 pb-2">
                  <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                    👑 {isBangla ? 'মূল রিপোর্ট (লক্ষ্য)' : 'Primary Report (Target)'}
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-700">
                    #{currentReport.id.slice(0, 8)}
                  </span>
                </div>
                <img
                  src={
                    currentReport.photos[0] ||
                    'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600'
                  }
                  alt="Primary report"
                  className="w-full h-36 rounded-lg object-cover border border-emerald-200"
                />
                <div className="text-xs space-y-1">
                  <p><span className="font-semibold">{isBangla ? 'প্রজাতি:' : 'Species:'}</span> {currentReport.species}</p>
                  <p><span className="font-semibold">{isBangla ? 'জরুরিতা:' : 'Urgency:'}</span> {currentReport.urgency}</p>
                  <p><span className="font-semibold">{isBangla ? 'এলাকা:' : 'Area:'}</span> {currentReport.area_text || '—'}</p>
                  <p className="text-[11px] text-foreground-secondary line-clamp-3">
                    <span className="font-semibold text-foreground">{isBangla ? 'বিবরণ:' : 'Description:'}</span>{' '}
                    {currentReport.description || '—'}
                  </p>
                </div>
              </div>

              {/* Duplicate Candidate Report */}
              <div className="p-3.5 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50/40 dark:bg-amber-950/20 space-y-2">
                <div className="flex items-center justify-between border-b border-amber-200 dark:border-amber-800/60 pb-2">
                  <span className="text-xs font-bold text-amber-900 dark:text-amber-200">
                    📑 {isBangla ? 'সম্ভাব্য নকল রিপোর্ট' : 'Candidate Duplicate'}
                  </span>
                  <span className="text-[10px] font-semibold text-amber-700">
                    #{selectedCandidate.id.slice(0, 8)}
                  </span>
                </div>
                <img
                  src={
                    selectedCandidate.photos[0] ||
                    'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=600'
                  }
                  alt="Candidate report"
                  className="w-full h-36 rounded-lg object-cover border border-amber-200"
                />
                <div className="text-xs space-y-1">
                  <p><span className="font-semibold">{isBangla ? 'প্রজাতি:' : 'Species:'}</span> {selectedCandidate.species}</p>
                  <p><span className="font-semibold">{isBangla ? 'দূরত্ব:' : 'Distance:'}</span> ~{Math.round(selectedCandidate.distance_meters)}m</p>
                  <p><span className="font-semibold">{isBangla ? 'এলাকা:' : 'Area:'}</span> {selectedCandidate.area_text || '—'}</p>
                  <p className="text-[11px] text-foreground-secondary line-clamp-3">
                    <span className="font-semibold text-foreground">{isBangla ? 'বিবরণ:' : 'Description:'}</span>{' '}
                    {selectedCandidate.description || '—'}
                  </p>
                </div>
              </div>
            </div>

            {errorMessage && (
              <div className="p-2.5 rounded-lg bg-rose-100 text-rose-900 text-xs font-semibold">
                {errorMessage}
              </div>
            )}

            {/* Modal Actions */}
            <div className="pt-3 border-t border-stroke-subtle flex items-center justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsComparing(false)}
                disabled={isMerging}
              >
                {isBangla ? 'বাতিল' : 'Cancel'}
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={handleExecuteMerge}
                disabled={isMerging}
              >
                {isMerging
                  ? isBangla ? 'একীভূত করা হচ্ছে...' : 'Merging...'
                  : isBangla ? '🔗 একীভূত নিশ্চিত করুন (Confirm Merge)' : '🔗 Confirm Merge'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
