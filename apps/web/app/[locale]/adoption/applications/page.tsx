'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@pranora/i18n';
import { Button } from '@pranora/ui';
import { LanguageHeader } from '../../../../components/LanguageHeader';
import { AdoptionApplicationStatusTracker } from '../../../../features/adoption';

export default function MyAdoptionApplicationsPage() {
  const { isBangla } = useLocale();
  const router = useRouter();

  const handleWithdraw = async (_applicationId: string) => {
    // In production, calls withdrawAdoptionApplication
    return { success: true };
  };

  const handleViewListing = (listingId: string) => {
    router.push(`/adoption?listingId=${listingId}`);
  };

  const handleGoToHandover = (listingId: string) => {
    router.push(`/adoption/handover/${listingId}`);
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-foreground">
      <LanguageHeader />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/adoption')}
              >
                ← {isBangla ? 'পাবলিক তালিকায় ফিরুন' : 'Back to Listings'}
              </Button>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground mt-2">
              {isBangla ? 'আমার দত্তক আবেদনসমূহ' : 'My Adoption Applications'}
            </h1>
            <p className="text-sm text-foreground-secondary mt-1">
              {isBangla
                ? 'আবেদনের বর্তমান স্থিতি ও মানব পর্যালোচনার অগ্রগতি ট্র্যাক করুন (ADP-4)।'
                : 'Track the status and review progress of your adoption requests (ADP-4).'}
            </p>
          </div>
        </div>

        <AdoptionApplicationStatusTracker
          onWithdrawApplication={handleWithdraw}
          onViewListing={handleViewListing}
          onGoToHandover={handleGoToHandover}
        />
      </main>
    </div>
  );
}
