'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@pranora/i18n';
import { LanguageHeader } from '../../../components/LanguageHeader';
import { AdoptionList } from '../../../features/adoption';
import { Button } from '@pranora/ui';
import type { AdoptionListingRow } from '@pranora/api';

export default function AdoptionPublicPage() {
  const { isBangla } = useLocale();
  const router = useRouter();

  const handleApply = (listing: AdoptionListingRow) => {
    // Navigate directly to the one-page application form (ADP-3)
    router.push(`/adoption/apply/${listing.id}`);
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-foreground">
      <LanguageHeader />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Hero Banner */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 dark:bg-green-950/40 text-primary border border-green-200 dark:border-green-800 text-xs font-semibold mb-3">
            🐾 {isBangla ? 'পাবলিক দত্তক পোর্টাল' : 'Public Adoption Portal'}
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-foreground mb-2">
            {isBangla ? 'দত্তক নিন, একটি জীবন ভালোবাসায় ভরিয়ে তুলুন' : 'Adopt, Save a Life'}
          </h1>
          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            {isBangla
              ? 'শেল্টার ও উদ্ধারকারীদের যত্নশীল আশ্রয়ে থাকা প্রাণীদের প্রোফাইল ব্রাউজ করুন। কোনো লগইন ছাড়াই সকল তথ্য দেখুন।'
              : 'Browse profiles of rescued pets lovingly sheltered across Bangladesh. Freely explore without logging in.'}
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <Button
              variant="primary"
              size="sm"
              onClick={() => router.push('/adoption/create')}
            >
              ➕ {isBangla ? 'পোষা প্রাণী তালিকাভুক্ত করুন (ADP-2)' : 'List Pet for Adoption (ADP-2)'}
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => router.push('/adoption/applications')}
            >
              📋 {isBangla ? 'আমার আবেদন ট্র্যাকার (ADP-4)' : 'My Applications (ADP-4)'}
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => router.push('/adoption/saved')}
            >
              ♥ {isBangla ? 'সংরক্ষিত তালিকা (ADP-7)' : 'Saved Pets (ADP-7)'}
            </Button>
          </div>
        </div>

        {/* Human Review Guarantee Banner */}
        <div className="mb-8 p-4 rounded-xl border border-primary/20 bg-primary/5 flex items-start gap-3">
          <span className="text-2xl flex-shrink-0">🤝</span>
          <div>
            <h2 className="text-xs sm:text-sm font-bold text-foreground">
              {isBangla ? '১০০% মানবিক যাচাই ও সুরক্ষা' : '100% Human Reviewed & Safe'}
            </h2>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5 leading-relaxed">
              {isBangla
                ? 'প্রাণীর সুরক্ষা ও কল্যাণে প্রতিটি দত্তক আবেদন মানুষের হাত দিয়েই যাচাই ও অনুমোদিত হয় (কোনো এআই বা স্বয়ংক্রিয় সিদ্ধান্ত নয়)। সুরক্ষিত দুই-পক্ষীয় হস্তান্তরের মাধ্যমে মালিকানা নিশ্চিত করা হয়।'
                : 'Every application is personally reviewed and decided by real shelter staff or rescuer guardians. We never use AI to decide adoptions.'}
            </p>
          </div>
        </div>

        {/* Adoption Listings Grid & Filters */}
        <AdoptionList onApply={handleApply} />
      </main>
    </div>
  );
}
