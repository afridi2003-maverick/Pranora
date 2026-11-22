'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLocale } from '@pranora/i18n';
import { Button, Card } from '@pranora/ui';
import { LanguageHeader } from '../../../../../components/LanguageHeader';
import {
  AdoptionHandoverCard,
  findHandoverByIdOrListing,
  MOCK_HANDOVERS,
} from '../../../../../features/adoption';

export default function AdoptionHandoverPage() {
  const { isBangla } = useLocale();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const idOrListingId = params?.id || 'hnd-001';

  const handoverDetails =
    findHandoverByIdOrListing(idOrListingId) ||
    MOCK_HANDOVERS['hnd-001']!;

  const handleConfirmHandover = async (_handoverId: string) => {
    // In production, calls Supabase RPC confirm_handover
    return { success: true };
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-foreground">
      <LanguageHeader />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/adoption/applications')}
          >
            ← {isBangla ? 'আমার আবেদনে ফিরুন' : 'Back to Applications'}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/adoption')}
          >
            {isBangla ? 'পাবলিক তালিকা' : 'Browse Listings'}
          </Button>
        </div>

        {handoverDetails ? (
          <AdoptionHandoverCard
            initialDetails={handoverDetails}
            currentUserId="user-current"
            onConfirmHandover={handleConfirmHandover}
            onBack={() => router.push('/adoption/applications')}
          />
        ) : (
          <Card className="p-8 text-center space-y-4">
            <p className="text-foreground-secondary">
              {isBangla ? 'হস্তান্তরের তথ্য পাওয়া যায়নি।' : 'Handover record not found.'}
            </p>
            <Button
              variant="primary"
              onClick={() => router.push('/adoption/applications')}
            >
              {isBangla ? 'আবেদন তালিকায় ফিরুন' : 'Back to Applications'}
            </Button>
          </Card>
        )}
      </main>
    </div>
  );
}
