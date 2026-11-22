'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@pranora/i18n';
import { Button } from '@pranora/ui';
import { LanguageHeader } from '../../../../components/LanguageHeader';
import { CreateAdoptionListingForm } from '../../../../features/adoption';
import type { CreateListingPayload } from '@pranora/api';

export default function CreateAdoptionListingPage() {
  const { isBangla } = useLocale();
  const router = useRouter();

  const handleListingSubmit = async (_payload: CreateListingPayload) => {
    // In production, calls Supabase createAdoptionListing client RPC
    return { success: true };
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
                ← {isBangla ? 'তালিকায় ফিরুন' : 'Back to Listings'}
              </Button>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground mt-2">
              {isBangla
                ? 'পোষা প্রাণীর প্রোফাইল থেকে দত্তক তালিকা তৈরি করুন'
                : 'Create Adoption Listing from Pet Profile'}
            </h1>
            <p className="text-sm text-foreground-secondary mt-1">
              {isBangla
                ? 'যাচাইকৃত আশ্রয়কেন্দ্র বা অনুমোদিত ব্যক্তিদের জন্য নিরাপদ দত্তক তালিকা ব্যবস্থা (ADP-2)।'
                : 'Safe adoption listing workflow for verified shelters & approved individuals (ADP-2).'}
            </p>
          </div>
        </div>

        <CreateAdoptionListingForm
          isApprovedLister={true}
          userRole="shelter"
          onSubmitListing={handleListingSubmit}
          onCancel={() => router.push('/adoption')}
        />
      </main>
    </div>
  );
}
