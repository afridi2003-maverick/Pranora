'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLocale } from '@pranora/i18n';
import { Button } from '@pranora/ui';
import {
  AdoptionApplicationForm,
  MOCK_ADOPTION_LISTINGS,
} from '../../../../../features/adoption';
import type { CreateApplicationPayload } from '@pranora/api';

export default function AdoptionApplyPage() {
  const { isBangla, locale } = useLocale();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const listingId = params?.id || 'adp-001';

  const listing =
    MOCK_ADOPTION_LISTINGS.find((l) => l.id === listingId) ||
    MOCK_ADOPTION_LISTINGS[0]!;

  const handleApplicationSubmit = async (_payload: CreateApplicationPayload) => {
    // In production, calls Supabase submitAdoptionApplication API
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
