'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@pranora/i18n';
import { Button } from '@pranora/ui';
import { SmartMatchList } from '../../../../features/adoption';
import {
  getAdoptionMatches,
  getAdopterPreferences,
  saveAdopterPreferences,
  MOCK_ADOPTION_MATCHES,
} from '@pranora/api';
import type { AdoptionMatch, AdopterPreference } from '@pranora/validation';
import type { AdoptionListingRow } from '@pranora/api';

export default function SmartAdoptionMatchesPage() {
  const { locale, isBangla } = useLocale();
  const router = useRouter();

  const [matches, setMatches] = useState<AdoptionMatch[]>(MOCK_ADOPTION_MATCHES);
  const [preferences, setPreferences] = useState<AdopterPreference | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const mockUserId = 'u0000000-0000-0000-0000-000000000001';

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        const [prefs, matchedListings] = await Promise.all([
          getAdopterPreferences(null, mockUserId).catch(() => null),
          getAdoptionMatches(null, mockUserId, 15).catch(() => MOCK_ADOPTION_MATCHES),
        ]);
        if (mounted) {
          setPreferences(prefs);
          if (matchedListings && matchedListings.length > 0) {
            setMatches(matchedListings);
          }
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  const handleSavePreferences = async (newPrefs: AdopterPreference) => {
    await saveAdopterPreferences(null, mockUserId, newPrefs);
    setPreferences(newPrefs);
    const refreshedMatches = await getAdoptionMatches(null, mockUserId, 15).catch(
      () => MOCK_ADOPTION_MATCHES
    );
    setMatches(refreshedMatches);
  };

  const handleApply = (listing: AdoptionListingRow) => {
    router.push(`/${locale}/adoption/apply/${listing.id}`);
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-foreground py-8">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Navigation header */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/${locale}/adoption`)}
            className="text-xs"
          >
            ← {isBangla ? 'সকল দত্তক তালিকায় ফিরে যান' : 'Back to All Listings'}
          </Button>
        </div>

        {/* Page Hero */}
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 text-xs font-semibold">
            <span>🎯</span>
            <span>{isBangla ? 'স্মার্ট দত্তক ম্যাচিং (ADP-10)' : 'Smart Adoption Matching (ADP-10)'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">
            {isBangla
              ? 'আপনার জীবনধারার সাথে সবচেয়ে সামঞ্জস্যপূর্ণ সঙ্গী'
              : 'Find Your Perfectly Matched Pet'}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto">
            {isBangla
              ? 'আপনার বাসস্থান, সময় এবং পরিবারের বৈশিষ্ট্যের সাথে খাপ খাইয়ে প্রতিটি প্রাণীর জন্য ম্যাচ স্কোর গণনা করা হয়।'
              : 'Our matching algorithm computes a compatibility score based on your lifestyle, home, and preferences.'}
          </p>
        </div>

        {/* Main Content */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-80 rounded-2xl bg-muted/60 animate-pulse" />
            ))}
          </div>
        ) : (
          <SmartMatchList
            initialMatches={matches}
            currentPreferences={preferences}
            onSavePreferences={handleSavePreferences}
            onApplyAdoption={handleApply}
          />
        )}
      </main>
    </div>
  );
}
