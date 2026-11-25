'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLocale } from '@pranora/i18n';
import { Button, Card } from '@pranora/ui';
import {
  AdoptionFollowupCard,
  findFollowupById,
  getFollowupsForHandover,
  MOCK_ADOPTION_FOLLOWUPS,
} from '../../../../../features/adoption';
import { submitAdoptionFollowup } from '@pranora/api';
import { useSession } from '../../../../../hooks/useSession';
import { useToast } from '../../../../../components/ToastProvider';

export default function AdoptionFollowupPage() {
  const { isBangla, locale } = useLocale();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id || 'flw-001';
  const { supabase, isConfigured, isAuthenticated } = useSession();
  const { showToast } = useToast();

  // Check if id is a followupId or a handoverId
  let followupsList = getFollowupsForHandover(id);
  let selectedFollowupId = id;

  if (followupsList.length === 0) {
    const single = findFollowupById(id);
    if (single) {
      followupsList = getFollowupsForHandover(single.followup.handover_id);
      selectedFollowupId = single.followup.id;
    } else {
      followupsList = Object.values(MOCK_ADOPTION_FOLLOWUPS);
      selectedFollowupId = followupsList[0]?.followup.id || '';
    }
  }

  const handleSubmitFollowup = async (
    followupId: string,
    payload: {
      wellbeing: 'good' | 'okay' | 'needs_help';
      note?: string | null;
      photos: string[];
    }
  ) => {
    if (isConfigured && isAuthenticated) {
      try {
        await submitAdoptionFollowup(
          supabase,
          followupId,
          payload.wellbeing,
          payload.note,
          payload.photos
        );
        showToast({
          type: 'success',
          message: isBangla ? 'ফলো-আপ জমা হয়েছে!' : 'Follow-up submitted!',
        });
        return { success: true };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : 'Follow-up submission failed',
        };
      }
    }
    return { success: true };
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-foreground">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/${locale}/adoption/applications`)}
          >
            ← {isBangla ? 'আমার আবেদনে ফিরুন' : 'Back to Applications'}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/${locale}/adoption`)}
          >
            {isBangla ? 'পাবলিক তালিকা' : 'Browse Listings'}
          </Button>
        </div>

        {followupsList.length > 0 ? (
          <AdoptionFollowupCard
            followups={followupsList}
            initialSelectedId={selectedFollowupId}
            onSubmitFollowup={handleSubmitFollowup}
            onBack={() => router.push(`/${locale}/adoption/applications`)}
          />
        ) : (
          <Card className="p-8 text-center space-y-4">
            <p className="text-foreground-secondary">
              {isBangla ? 'ফলো-আপ তথ্য পাওয়া যায়নি।' : 'Follow-up records not found.'}
            </p>
            <Button
              variant="primary"
              onClick={() => router.push(`/${locale}/adoption/applications`)}
            >
              {isBangla ? 'আবেদন তালিকায় ফিরুন' : 'Back to Applications'}
            </Button>
          </Card>
        )}
      </main>
    </div>
  );
}
