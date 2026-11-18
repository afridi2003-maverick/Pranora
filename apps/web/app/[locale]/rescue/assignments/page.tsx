'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@pranora/i18n';
import { Button } from '@pranora/ui';
import { LanguageHeader } from '../../../../components/LanguageHeader';
import {
  RescuerCasesList,
  AssignRescuerModal,
  MOCK_ASSIGNMENTS,
} from '../../../../features/rescue';

export default function RescuerAssignmentsPage() {
  const { isBangla } = useLocale();
  const router = useRouter();

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  const handleRespond = async (
    assignmentId: string,
    accept: boolean,
    declineReason?: string
  ): Promise<void> => {
    // 500ms simulation
    await new Promise((resolve) => setTimeout(resolve, 500));
    console.log('Assignment response:', { assignmentId, accept, declineReason });
  };

  const handleAssign = async (
    caseId: string,
    rescuerId: string
  ): Promise<{ success: boolean; error?: string }> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    console.log('Assigned rescuer:', { caseId, rescuerId });
    return { success: true };
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-foreground">
      <LanguageHeader />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Header & Coordinator Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 dark:bg-green-950/40 text-primary border border-green-200 dark:border-green-800 text-xs font-semibold mb-2">
              🚑 {isBangla ? 'উদ্ধারকারী পোর্টাল' : 'Rescuer Portal'}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">
              {isBangla ? 'দায়িত্বপ্রাপ্ত ও প্রস্তাবিত কেসসমূহ' : 'Assigned & Offered Rescue Cases'}
            </h1>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
              {isBangla
                ? 'সমন্বয়কারী দল কর্তৃক আপনাকে পাঠানো কেস গ্রহণ বা প্রত্যাখ্যান করুন এবং চলমান উদ্ধার কাজ পরিচালনা করুন।'
                : 'Accept or decline dispatched cases and manage active on-site rescues.'}
            </p>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsAssignModalOpen(true)}
          >
            ➕ {isBangla ? 'উদ্ধারকারী নিয়োগ' : 'Assign Rescuer'}
          </Button>
        </div>

        {/* Rescuer Cases List */}
        <RescuerCasesList
          initialAssignments={MOCK_ASSIGNMENTS}
          onRespond={handleRespond}
          onViewCase={(caseId) => router.push(`/rescue/cases/${caseId}`)}
        />

        {/* Assign Rescuer Modal (for Shelter/Admin dispatchers) */}
        <AssignRescuerModal
          isOpen={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
          caseId="case-201"
          reportSpecies="dog (কুকুর)"
          reportArea="Mirpur 10, Dhaka"
          onAssign={handleAssign}
        />
      </main>
    </div>
  );
}
