'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@pranora/i18n';
import { Button } from '@pranora/ui';
import { AdoptionApplicationStatusTracker } from '../../../../features/adoption';
import {
  getMyApplicationsWithListings,
  withdrawAdoptionApplication,
  type AdoptionApplicationWithListing,
} from '@pranora/api';
import { useSession } from '../../../../hooks/useSession';
import { useToast } from '../../../../components/ToastProvider';

export default function MyAdoptionApplicationsPage() {
  const { locale, isBangla } = useLocale();
  const router = useRouter();
  const { supabase, user, isConfigured, isAuthenticated } = useSession();
  const { showToast } = useToast();
  const [applications, setApplications] = useState<AdoptionApplicationWithListing[] | undefined>(
    undefined
  );

  useEffect(() => {
    if (!isConfigured || !isAuthenticated || !user) return;
    let active = true;
    getMyApplicationsWithListings(supabase, user.id)
      .then((rows) => {
        if (active && rows.length > 0) setApplications(rows);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [isConfigured, isAuthenticated, user, supabase]);

  const handleWithdraw = async (applicationId: string) => {
    if (isConfigured && isAuthenticated && user) {
      try {
        await withdrawAdoptionApplication(supabase, applicationId, user.id);
        showToast({
          type: 'info',
          message: isBangla ? 'আবেদন প্রত্যাহার করা হয়েছে' : 'Application withdrawn',
        });
        return { success: true };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : 'Withdraw failed',
        };
      }
    }
    return { success: true };
  };

  const handleViewListing = (listingId: string) => {
    router.push(`/${locale}/adoption?listingId=${listingId}`);
  };

  const handleGoToHandover = (listingId: string) => {
    router.push(`/${locale}/adoption/handover/${listingId}`);
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-foreground">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/${locale}/adoption`)}
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
          initialApplications={applications}
          onWithdrawApplication={handleWithdraw}
          onViewListing={handleViewListing}
          onGoToHandover={handleGoToHandover}
        />
      </main>
    </div>
  );
}
