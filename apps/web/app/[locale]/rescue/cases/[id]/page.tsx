'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLocale } from '@pranora/i18n';
import { Button } from '@pranora/ui';
import {
  RescueCaseDetails,
  MOCK_CASE_DETAILS,
  type RescueCaseFullDetails,
} from '../../../../../features/rescue';
import {
  addRescueCaseUpdate,
  closeRescueCase,
  getRescueCaseById,
  getRescueCaseUpdates,
} from '@pranora/api';
import type { RescueStatus, RescueOutcome } from '@pranora/types';
import { useSession } from '../../../../../hooks/useSession';
import { useToast } from '../../../../../components/ToastProvider';

export default function RescueCasePage() {
  const { isBangla, locale } = useLocale();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const caseId = params?.id || 'case-201';
  const { supabase, user, isConfigured, isAuthenticated } = useSession();
  const { showToast } = useToast();

  // Load from mock data or generate fallback
  const fallbackCaseData: RescueCaseFullDetails = MOCK_CASE_DETAILS[caseId] || {
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
      escalated_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    updates: [],
  };

  const [caseData, setCaseData] = useState<RescueCaseFullDetails>(fallbackCaseData);

  useEffect(() => {
    if (!isConfigured || !caseId) return;
    let active = true;
    async function loadCase() {
      try {
        const [rc, updates] = await Promise.all([
          getRescueCaseById(supabase, caseId),
          getRescueCaseUpdates(supabase, caseId),
        ]);
        if (!active || !rc) return;
        setCaseData((prev) => ({
          ...prev,
          rescueCase: rc,
          updates,
        }));
      } catch {
        // Fallback to mock
      }
    }
    void loadCase();
    return () => {
      active = false;
    };
  }, [isConfigured, caseId, supabase]);

  const handleAddUpdate = async (payload: {
    case_id: string;
    note?: string | null;
    status?: RescueStatus | null;
    photos?: string[];
  }): Promise<{ error?: string }> => {
    if (isConfigured && isAuthenticated && user) {
      try {
        await addRescueCaseUpdate(supabase, user.id, payload);
        showToast({ type: 'success', message: isBangla ? 'আপডেট যোগ হয়েছে' : 'Update added' });
        return {};
      } catch (err) {
        return { error: err instanceof Error ? err.message : 'Failed to add update' };
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 300));
    return {};
  };

  const handleCloseCase = async (payload: {
    case_id: string;
    outcome: RescueOutcome;
    note?: string | null;
    pet_id?: string | null;
  }): Promise<{ error?: string }> => {
    if (isConfigured && isAuthenticated) {
      try {
        await closeRescueCase(
          supabase,
          payload.case_id,
          payload.outcome,
          payload.note,
          payload.pet_id
        );
        showToast({ type: 'success', message: isBangla ? 'কেস সম্পন্ন হয়েছে' : 'Case closed' });
        return {};
      } catch (err) {
        return { error: err instanceof Error ? err.message : 'Failed to close case' };
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 300));
    return {};
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-foreground pb-12">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        {/* Navigation Breadcrumb */}
        <div className="mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/${locale}/rescue/assignments`)}
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
