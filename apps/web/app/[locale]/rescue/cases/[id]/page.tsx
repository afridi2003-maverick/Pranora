'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLocale } from '@pranora/i18n';
import { Button } from '@pranora/ui';
import { LanguageHeader } from '../../../../../components/LanguageHeader';
import {
  RescueCaseDetails,
  MOCK_CASE_DETAILS,
  type RescueCaseFullDetails,
} from '../../../../../features/rescue';
import type { RescueStatus, RescueOutcome } from '@pranora/types';

export default function RescueCasePage() {
  const { isBangla } = useLocale();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const caseId = params?.id || 'case-201';

  // Load from mock data or generate fallback
  const caseData: RescueCaseFullDetails = MOCK_CASE_DETAILS[caseId] || {
    rescueCase: {
      id: caseId,
      report_id: `rep-${caseId}`,
      status: 'rescue_in_progress',
      shelter_id: null,
      assigned_rescuer_id: 'rescuer-current',
      pet_id: null,
      outcome: null,
      outcome_note: null,
      closed_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    report: {
      id: `rep-${caseId}`,
      reporter_id: 'user-reporter-1',
      kind: 'injured',
      species: 'dog',
      urgency: 'high',
      pet_id: null,
      last_seen_at: null,
      contact_phone: '+8801711223344',
      description: 'জরুরি উদ্ধারের প্রয়োজন। ভেটেরিনারি কেয়ারের জন্য প্রস্তুতি নেওয়া হচ্ছে।',
      photos: ['https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800'],
      location: null,
      area_text: 'মিরপুর, ঢাকা',
      upazila_id: null,
      district_id: 1,
      status: 'rescue_in_progress',
      duplicate_of: null,
      reviewed_by: null,
      reviewed_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    updates: [],
  };

  const handleAddUpdate = async (payload: {
    case_id: string;
    note?: string | null;
    status?: RescueStatus | null;
    photos?: string[];
  }): Promise<{ error?: string }> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    console.log('Case update submitted:', payload);
    return {};
  };

  const handleCloseCase = async (payload: {
    case_id: string;
    outcome: RescueOutcome;
    note?: string | null;
    pet_id?: string | null;
  }): Promise<{ error?: string }> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    console.log('Case closed with outcome:', payload);
    return {};
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-foreground pb-12">
      <LanguageHeader />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        {/* Navigation Breadcrumb */}
        <div className="mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/rescue/assignments')}
          >
            ← {isBangla ? 'উদ্ধারকারী ড্যাশবোর্ডে ফিরুন' : 'Back to Assignments'}
          </Button>
        </div>

        {/* Case Details & Updates Timeline */}
        <RescueCaseDetails
          initialDetails={caseData}
          onAddUpdate={handleAddUpdate}
          onCloseCase={handleCloseCase}
        />
      </main>
    </div>
  );
}
