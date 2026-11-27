'use client';

import React, { useState, useMemo } from 'react';
import { useLocale } from '@pranora/i18n';
import { Input, Button } from '@pranora/ui';
import type { LostFoundBoardItem } from '@pranora/api';
import type { SpeciesType } from '@pranora/types';
import { LostFoundCard } from './LostFoundCard';
import { ReportSightingModal } from './ReportSightingModal';
import { MOCK_LOST_FOUND_ITEMS } from './lostFoundMockData';

interface LostFoundBoardProps {
  initialItems?: LostFoundBoardItem[];
  onSubmitSighting?: (params: {
    reportId: string;
    message: string;
    locationText?: string;
    contactPhone?: string;
  }) => Promise<{ success: boolean; error?: string }>;
}

export function LostFoundBoard({
  initialItems = MOCK_LOST_FOUND_ITEMS,
  onSubmitSighting,
}: LostFoundBoardProps) {
  const { isBangla } = useLocale();

  const [items] = useState<LostFoundBoardItem[]>(initialItems);
  const [kindFilter, setKindFilter] = useState<'all' | 'lost' | 'found'>('all');
  const [speciesFilter, setSpeciesFilter] = useState<SpeciesType | 'all'>('all');
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState<LostFoundBoardItem | null>(null);
  const [isSightingModalOpen, setIsSightingModalOpen] = useState(false);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (kindFilter !== 'all' && item.kind !== kindFilter) return false;
      if (speciesFilter !== 'all' && item.species !== speciesFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesArea = item.area_text?.toLowerCase().includes(q);
        const matchesDesc = item.description?.toLowerCase().includes(q);
        if (!matchesArea && !matchesDesc) return false;
      }
      return true;
    });
  }, [items, kindFilter, speciesFilter, search]);

  const handleOpenSighting = (item: LostFoundBoardItem) => {
    setSelectedItem(item);
    setIsSightingModalOpen(true);
  };

  const handleSubmitSighting = async (params: {
    reportId: string;
    message: string;
    locationText?: string;
    contactPhone?: string;
  }) => {
    if (onSubmitSighting) {
      return onSubmitSighting(params);
    }
    await new Promise((r) => setTimeout(r, 400));
    return { success: true };
  };

  const SPECIES_OPTIONS: { id: SpeciesType | 'all'; bn: string; en: string; icon: string }[] = [
    { id: 'all', bn: 'সকল প্রাণী', en: 'All', icon: '🐾' },
    { id: 'dog', bn: 'কুকুর', en: 'Dogs', icon: '🐕' },
    { id: 'cat', bn: 'বিড়াল', en: 'Cats', icon: '🐈' },
    { id: 'rabbit', bn: 'খরগোশ', en: 'Rabbits', icon: '🐇' },
    { id: 'other', bn: 'অন্যান্য', en: 'Other', icon: '✨' },
  ];

  return (
    <div className="space-y-6">
      {/* Controls & Filter Bar */}
      <div className="bg-white dark:bg-neutral-900 border border-stroke-subtle p-4 rounded-2xl shadow-sm space-y-4">
        {/* Kind Toggle Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-1.5 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl">
            <button
              type="button"
              onClick={() => setKindFilter('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                kindFilter === 'all'
                  ? 'bg-white dark:bg-neutral-900 text-foreground shadow-sm'
                  : 'text-neutral-500 hover:text-foreground'
              }`}
            >
              {isBangla ? 'সকল রিপোর্ট' : 'All Reports'} ({items.length})
            </button>
            <button
              type="button"
              onClick={() => setKindFilter('lost')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                kindFilter === 'lost'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-neutral-500 hover:text-foreground'
              }`}
            >
              <span>⚠️</span>
              <span>{isBangla ? 'হারানো প্রাণী' : 'Lost'}</span>
            </button>
            <button
              type="button"
              onClick={() => setKindFilter('found')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                kindFilter === 'found'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-neutral-500 hover:text-foreground'
              }`}
            >
              <span>🐾</span>
              <span>{isBangla ? 'পাওয়া গেছে' : 'Found'}</span>
            </button>
          </div>

          <div className="text-xs text-neutral-500">
            {isBangla ? 'মোট ফলাফল: ' : 'Showing: '}
            <span className="font-bold text-foreground">{filteredItems.length}</span>
          </div>
        </div>

        {/* Species & Search */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex flex-wrap gap-1.5 flex-1 w-full">
            {SPECIES_OPTIONS.map((sp) => (
              <button
                key={sp.id}
                type="button"
                onClick={() => setSpeciesFilter(sp.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                  speciesFilter === sp.id
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200'
                }`}
              >
                <span>{sp.icon}</span>
                <span>{isBangla ? sp.bn : sp.en}</span>
              </button>
            ))}
          </div>

          <div className="w-full sm:w-64">
            <Input
              placeholder={isBangla ? 'এলাকা বা বিবরণ দিয়ে খুঁজুন...' : 'Search by area or description...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Grid of Cards */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map((item) => (
            <LostFoundCard
              key={item.id}
              item={item}
              onOpenSightingModal={handleOpenSighting}
            />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center bg-white dark:bg-neutral-900 border border-stroke-subtle rounded-2xl">
          <span className="text-4xl block mb-2">🔍</span>
          <h3 className="text-base font-bold text-foreground mb-1">
            {isBangla ? 'কোনো রিপোর্ট পাওয়া যায়নি' : 'No Reports Found'}
          </h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto mb-4">
            {isBangla
              ? 'আপনার অনুসন্ধান বা ফিল্টারের সাথে মিলে এমন কোনো উন্মুক্ত হারানো/পাওয়া প্রাণীর তথ্য এই মুহূর্তে নেই।'
              : 'No matching lost or found animal reports found for the selected filters.'}
          </p>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setKindFilter('all');
              setSpeciesFilter('all');
              setSearch('');
            }}
          >
            {isBangla ? 'সব ফিল্টার সাফ করুন' : 'Clear Filters'}
          </Button>
        </div>
      )}

      {/* Sighting Modal */}
      <ReportSightingModal
        item={selectedItem}
        isOpen={isSightingModalOpen}
        onClose={() => setIsSightingModalOpen(false)}
        onSubmitSighting={handleSubmitSighting}
      />
    </div>
  );
}
