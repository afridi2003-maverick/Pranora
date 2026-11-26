'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLocale } from '@pranora/i18n';
import { Button } from '@pranora/ui';
import {
  AdoptionApplicationForm,
  MOCK_ADOPTION_LISTINGS,
} from '../../../../../features/adoption';
import {
  getAdoptionListingById,
  submitAdoptionApplication,
  type AdoptionListingRow,
  type CreateApplicationPayload,
} from '@pranora/api';
import { useSession } from '../../../../../hooks/useSession';
import { useToast } from '../../../../../components/ToastProvider';

export default function AdoptionApplyPage() {
  const { isBangla, locale } = useLocale();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const listingId = params?.id || 'adp-001';
  const { supabase, user, isConfigured, isAuthenticated } = useSession();
  const { showToast } = useToast();

  const fallbackListing =
    MOCK_ADOPTION_LISTINGS.find((l) => l.id === listingId) ||
    MOCK_ADOPTION_LISTINGS[0]!;
  const [listing, setListing] = useState<AdoptionListingRow>(fallbackListing);

  useEffect(() => {
    if (!isConfigured || !listingId) return;
    let active = true;
    getAdoptionListingById(supabase, listingId)
      .then((row) => {
        if (active && row) setListing(row);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [isConfigured, listingId, supabase]);

  const handleApplicationSubmit = async (payload: CreateApplicationPayload) => {
    if (isConfigured && isAuthenticated && user) {
      try {
        await submitAdoptionApplication(supabase, user.id, payload);
        showToast({
          type: 'success',
          message: isBangla ? 'আবেদন জমা হয়েছে!' : 'Application submitted!',
        });
        return { success: true };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : 'Submission failed',
        };
      }
    }
    return { success: true };
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-foreground">
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/${locale}/adoption`)}
          >
            ← {isBangla ? 'তালিকায় ফিরুন' : 'Back to Listings'}
          </Button>
        </div>

        <AdoptionApplicationForm
          listing={listing}
          onSubmitApplication={handleApplicationSubmit}
          onCancel={() => router.push(`/${locale}/adoption`)}
        />
      </main>
    </div>
  );
}
