'use client';

import React, { useState } from 'react';
import { useLocale } from '@pranora/i18n';
import { Button } from '@pranora/ui';
import type { AdoptionMatch, AdopterPreference } from '@pranora/validation';
import { SmartMatchCard } from './SmartMatchCard';
import { AdopterPreferenceModal } from './AdopterPreferenceModal';
import { AdoptionDetailModal } from './AdoptionDetailModal';
import type { AdoptionListingRow } from '@pranora/api';

interface SmartMatchListProps {
  initialMatches: AdoptionMatch[];
  currentPreferences: AdopterPreference | null;
  onSavePreferences: (prefs: AdopterPreference) => Promise<void>;
  onApplyAdoption?: (listing: AdoptionListingRow) => void;
}

export function SmartMatchList({
  initialMatches,
  currentPreferences,
  onSavePreferences,
  onApplyAdoption,
}: SmartMatchListProps) {
  const { isBangla } = useLocale();
  const [matches] = useState<AdoptionMatch[]>(initialMatches);
  const [isPrefModalOpen, setIsPrefModalOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<AdoptionMatch | null>(null);

  // Convert match to AdoptionListingRow for detail modal
  const selectedListing: AdoptionListingRow | null = selectedMatch
    ? {
        id: selectedMatch.listing_id,
        pet_id: '00000000-0000-0000-0000-000000000000',
        posted_by: '00000000-0000-0000-0000-000000000000',
        shelter_id: null,
        species: selectedMatch.species as any,
        age_months: selectedMatch.age_months,
        gender: selectedMatch.gender as any,
        title_bn: selectedMatch.title_bn,
        title_en: selectedMatch.title_en,
        description_bn: selectedMatch.description_bn,
        description_en: selectedMatch.description_en,
        photos: selectedMatch.photos,
        is_vaccinated: selectedMatch.is_vaccinated,
        is_neutered: selectedMatch.is_neutered,
        district_id: selectedMatch.district_id,
        upazila_id: null,
        status: selectedMatch.status as any,
        created_at: selectedMatch.created_at,
        updated_at: selectedMatch.created_at,
      }
    : null;

  return (
    <div className="space-y-6">
      {/* Top Banner / Pref CTA */}
      <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-primary/10 border border-emerald-500/20 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
            <span>🎯</span>
            <span>{isBangla ? 'আপনার জন্য সেরা ম্যাচ' : 'Best Matches for You'}</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isBangla
              ? 'আপনার বাসস্থান, জেলা ও পছন্দের ভিত্তিতে কৃত্রিম বুদ্ধিমত্তা চালিত ম্যাচিং স্কোর।'
              : 'AI-assisted compatibility scoring based on your housing, district, and lifestyle preferences.'}
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => setIsPrefModalOpen(true)}
          className="gap-1.5 shrink-0"
        >
          <span>⚙️</span>
          <span>{isBangla ? 'পছন্দ পরিবর্তন করুন' : 'Edit Preferences'}</span>
        </Button>
      </div>

      {/* Grid of matches */}
      {matches.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-2xl p-8 space-y-3">
          <span className="text-4xl">🐾</span>
          <h3 className="font-bold text-base text-foreground">
            {isBangla ? 'কোনো ম্যাচ পাওয়া যায়নি' : 'No compatible matches found'}
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {isBangla
              ? 'আপনার পছন্দের মানদণ্ড পরিবর্তন করে পুনরায় চেষ্টা করুন।'
              : 'Try broadening your preferences to see more pets available for adoption.'}
          </p>
          <Button variant="primary" size="sm" onClick={() => setIsPrefModalOpen(true)}>
            {isBangla ? 'পছন্দ আপডেট করুন' : 'Update Preferences'}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {matches.map((match) => (
            <SmartMatchCard
              key={match.listing_id}
              match={match}
              onSelect={(m) => setSelectedMatch(m)}
            />
          ))}
        </div>
      )}

      {/* Preference Edit Modal */}
      <AdopterPreferenceModal
        isOpen={isPrefModalOpen}
        onClose={() => setIsPrefModalOpen(false)}
        currentPreferences={currentPreferences}
        onSave={onSavePreferences}
      />

      {/* Detail Modal */}
      {selectedListing && (
        <AdoptionDetailModal
          isOpen={!!selectedListing}
          listing={selectedListing}
          onClose={() => setSelectedMatch(null)}
          onApply={onApplyAdoption}
        />
      )}
    </div>
  );
}
