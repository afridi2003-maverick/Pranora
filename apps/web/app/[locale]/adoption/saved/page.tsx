'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@pranora/i18n';
import { Button, Card } from '@pranora/ui';
import { LanguageHeader } from '../../../../components/LanguageHeader';
import {
  AdoptionCard,
  AdoptionDetailModal,
  MOCK_ADOPTION_LISTINGS,
  MOCK_SAVED_LISTING_IDS,
} from '../../../../features/adoption';
import type { AdoptionListingRow } from '@pranora/api';

export default function SavedAdoptionListingsPage() {
  const { isBangla } = useLocale();
  const router = useRouter();

  const [savedIds, setSavedIds] = useState<Set<string>>(new Set(MOCK_SAVED_LISTING_IDS));
  const [selectedListing, setSelectedListing] = useState<AdoptionListingRow | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const savedListings = MOCK_ADOPTION_LISTINGS.filter((item) => savedIds.has(item.id));

  const handleToggleSave = (id: string) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleOpenDetail = (listing: AdoptionListingRow) => {
    setSelectedListing(listing);
    setIsDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
  };

  const handleApply = (listing: AdoptionListingRow) => {
    router.push(`/adoption/apply/${listing.id}`);
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-foreground">
      <LanguageHeader />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
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
              ♥ {isBangla ? 'সংরক্ষিত দত্তক তালিকা' : 'Saved Adoption Listings'}
            </h1>
            <p className="text-sm text-foreground-secondary mt-1">
              {isBangla
                ? 'আপনার বুকমার্ক করা প্রাণীদের তালিকা সহজে পর্যালোচনা ও আবেদন করুন (ADP-7)।'
                : 'Review and manage your bookmarked pets for future adoption (ADP-7).'}
            </p>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => router.push('/adoption')}
          >
            {isBangla ? 'আরও প্রাণী দেখুন' : 'Browse More Pets'}
          </Button>
        </div>

        {savedListings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedListings.map((listing) => (
              <AdoptionCard
                key={listing.id}
                listing={listing}
                onSelect={handleOpenDetail}
                onSave={handleToggleSave}
                isSaved={true}
              />
            ))}
          </div>
        ) : (
          <Card className="text-center py-16 px-4 rounded-2xl border border-dashed border-stroke-subtle">
            <span className="text-4xl block mb-2">♥</span>
            <h3 className="text-base font-semibold text-foreground mb-1">
              {isBangla ? 'কোনো প্রাণী সংরক্ষিত নেই' : 'No saved pets yet'}
            </h3>
            <p className="text-xs text-foreground-secondary mb-4 max-w-sm mx-auto">
              {isBangla
                ? 'পাবলিক তালিকায় কোনো প্রাণীর কার্ডে হার্ট (♥) আইকনে ক্লিক করে সংরক্ষণ করতে পারেন।'
                : 'Tap the heart icon on any adoption card to save it for later.'}
            </p>
            <Button
              variant="primary"
              onClick={() => router.push('/adoption')}
            >
              🐾 {isBangla ? 'দত্তক তালিকা দেখুন' : 'Browse Adoption Listings'}
            </Button>
          </Card>
        )}

        {/* Detail Modal */}
        <AdoptionDetailModal
          listing={selectedListing}
          isOpen={isDetailOpen}
          onClose={handleCloseDetail}
          onApply={handleApply}
          onSave={handleToggleSave}
          isSaved={selectedListing ? savedIds.has(selectedListing.id) : false}
        />
      </main>
    </div>
  );
}
