'use client';

import React, { useState, useMemo } from 'react';
import { useLocale } from '@pranora/i18n';
import type { AdoptionListingRow } from '@pranora/api';
import { AdoptionCard } from './AdoptionCard';
import { AdoptionFilters, type FilterState } from './AdoptionFilters';
import { AdoptionDetailModal } from './AdoptionDetailModal';
import { MOCK_ADOPTION_LISTINGS } from './mockData';

interface AdoptionListProps {
  initialListings?: AdoptionListingRow[];
  onApply?: (listing: AdoptionListingRow) => void;
}

export function AdoptionList({
  initialListings = MOCK_ADOPTION_LISTINGS,
  onApply,
}: AdoptionListProps) {
  const { isBangla } = useLocale();

  const [filters, setFilters] = useState<FilterState>({});
  const [selectedListing, setSelectedListing] = useState<AdoptionListingRow | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

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

  const filteredListings = useMemo(() => {
    return initialListings.filter((item) => {
      // 1. Species Filter
      if (filters.species && item.species !== filters.species) {
        return false;
      }

      // 2. District Filter
      if (filters.districtId && item.district_id !== filters.districtId) {
        return false;
      }

      // 3. Gender Filter
      if (filters.gender && item.gender !== filters.gender) {
        return false;
      }

      // 4. Age Group Filter
      if (filters.ageGroup && filters.ageGroup !== 'all') {
        const months = item.age_months ?? 0;
        if (filters.ageGroup === 'baby' && months >= 6) return false;
        if (filters.ageGroup === 'young' && (months < 6 || months >= 24)) return false;
        if (filters.ageGroup === 'adult' && months < 24) return false;
      }

      // 5. Keyword Search Filter
      if (filters.search && filters.search.trim()) {
        const query = filters.search.toLowerCase().trim();
        const tBn = (item.title_bn || '').toLowerCase();
        const tEn = (item.title_en || '').toLowerCase();
        const dBn = (item.description_bn || '').toLowerCase();
        const dEn = (item.description_en || '').toLowerCase();
        if (
          !tBn.includes(query) &&
          !tEn.includes(query) &&
          !dBn.includes(query) &&
          !dEn.includes(query)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [initialListings, filters]);

  return (
    <div>
      <AdoptionFilters
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters({})}
        totalCount={filteredListings.length}
      />

      {filteredListings.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map((listing) => (
            <AdoptionCard
              key={listing.id}
              listing={listing}
              onSelect={handleOpenDetail}
              onSave={handleToggleSave}
              isSaved={savedIds.has(listing.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-4 rounded-2xl border border-dashed border-stroke-subtle bg-white/40 dark:bg-neutral-900/40">
          <span className="text-4xl block mb-2">🐾</span>
          <h3 className="text-base font-semibold text-foreground mb-1">
            {isBangla ? 'কোনো প্রাণী খুঁজে পাওয়া যায়নি' : 'No animals match your filters'}
          </h3>
          <p className="text-xs text-neutral-500 mb-4 max-w-sm mx-auto">
            {isBangla
              ? 'অন্য জেলা বা ফিল্টার পরিবর্তন করে পুনরায় চেষ্টা করুন।'
              : 'Try adjusting your district, species, or age preferences.'}
          </p>
          <button
            type="button"
            onClick={() => setFilters({})}
            className="text-xs font-semibold text-primary hover:underline"
          >
            {isBangla ? 'সব ফিল্টার সাফ করুন' : 'Clear all filters'}
          </button>
        </div>
      )}

      {/* Detail Modal */}
      <AdoptionDetailModal
        listing={selectedListing}
        isOpen={isDetailOpen}
        onClose={handleCloseDetail}
        onApply={onApply}
      />
    </div>
  );
}
