'use client';

import React from 'react';
import { useLocale } from '@pranora/i18n';
import { Input, Button } from '@pranora/ui';
import type { SpeciesType, PetGender } from '@pranora/types';
import { DISTRICT_MAP } from './mockData';

export interface FilterState {
  species?: SpeciesType;
  districtId?: number;
  ageGroup?: 'all' | 'baby' | 'young' | 'adult';
  gender?: PetGender;
  search?: string;
}

interface AdoptionFiltersProps {
  filters: FilterState;
  onChange: (updated: FilterState) => void;
  onReset: () => void;
  totalCount: number;
}

const SPECIES_OPTIONS: { id: SpeciesType | 'all'; bn: string; en: string; icon: string }[] = [
  { id: 'all', bn: 'সকল প্রাণী', en: 'All Species', icon: '🐾' },
  { id: 'dog', bn: 'কুকুর', en: 'Dogs', icon: '🐕' },
  { id: 'cat', bn: 'বিড়াল', en: 'Cats', icon: '🐈' },
  { id: 'bird', bn: 'পাখি', en: 'Birds', icon: '🦜' },
  { id: 'rabbit', bn: 'খরগোশ', en: 'Rabbits', icon: '🐇' },
  { id: 'other', bn: 'অন্যান্য', en: 'Other', icon: '✨' },
];

const AGE_OPTIONS = [
  { id: 'all', bn: 'সকল বয়স', en: 'All Ages' },
  { id: 'baby', bn: 'ছানা (<৬ মাস)', en: 'Baby (<6 mo)' },
  { id: 'young', bn: 'তরুণ (৬-২৪ মাস)', en: 'Young (6-24 mo)' },
  { id: 'adult', bn: 'প্রাপ্তবয়স্ক (২+ বছর)', en: 'Adult (2+ yrs)' },
];

export function AdoptionFilters({
  filters,
  onChange,
  onReset,
  totalCount,
}: AdoptionFiltersProps) {
  const { isBangla } = useLocale();

  const handleSpeciesClick = (speciesId: SpeciesType | 'all') => {
    onChange({
      ...filters,
      species: speciesId === 'all' ? undefined : speciesId,
    });
  };

  const hasActiveFilters = Boolean(
    filters.species ||
      filters.districtId ||
      (filters.ageGroup && filters.ageGroup !== 'all') ||
      filters.gender ||
      filters.search
  );

  return (
    <div className="space-y-4 mb-6">
      {/* Top Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Input
            placeholder={
              isBangla
                ? 'নাম, স্বভাব বা বৈশিষ্ট্য দিয়ে খুঁজুন...'
                : 'Search by name, personality, or trait...'
            }
            value={filters.search || ''}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            className="w-full"
          />
        </div>

        {/* Dropdowns row */}
        <div className="flex flex-wrap items-center gap-2">
          {/* District Selector */}
          <select
            value={filters.districtId || ''}
            onChange={(e) =>
              onChange({
                ...filters,
                districtId: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            className="px-3 py-2 border border-stroke-subtle rounded-lg bg-white dark:bg-neutral-900 text-foreground text-sm"
          >
            <option value="">{isBangla ? 'সকল জেলা' : 'All Districts'}</option>
            {Object.entries(DISTRICT_MAP).map(([id, d]) => (
              <option key={id} value={id}>
                {isBangla ? d.bn : d.en}
              </option>
            ))}
          </select>

          {/* Age Group Selector */}
          <select
            value={filters.ageGroup || 'all'}
            onChange={(e) =>
              onChange({
                ...filters,
                ageGroup: e.target.value as FilterState['ageGroup'],
              })
            }
            className="px-3 py-2 border border-stroke-subtle rounded-lg bg-white dark:bg-neutral-900 text-foreground text-sm"
          >
            {AGE_OPTIONS.map((a) => (
              <option key={a.id} value={a.id}>
                {isBangla ? a.bn : a.en}
              </option>
            ))}
          </select>

          {/* Gender Selector */}
          <select
            value={filters.gender || ''}
            onChange={(e) =>
              onChange({
                ...filters,
                gender: e.target.value ? (e.target.value as PetGender) : undefined,
              })
            }
            className="px-3 py-2 border border-stroke-subtle rounded-lg bg-white dark:bg-neutral-900 text-foreground text-sm"
          >
            <option value="">{isBangla ? 'সকল লিঙ্গ' : 'All Genders'}</option>
            <option value="male">{isBangla ? 'পুরুষ ♂' : 'Male ♂'}</option>
            <option value="female">{isBangla ? 'স্ত্রী ♀' : 'Female ♀'}</option>
          </select>

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={onReset}>
              ✕ {isBangla ? 'রিসেট' : 'Reset'}
            </Button>
          )}
        </div>
      </div>

      {/* Species Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {SPECIES_OPTIONS.map((s) => {
          const isSelected =
            (s.id === 'all' && !filters.species) || filters.species === s.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => handleSpeciesClick(s.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                isSelected
                  ? 'bg-primary text-white border-primary shadow-sm'
                  : 'bg-white dark:bg-neutral-900 border-stroke-subtle text-foreground hover:bg-neutral-50 dark:hover:bg-neutral-800'
              }`}
            >
              <span>{s.icon}</span>
              <span>{isBangla ? s.bn : s.en}</span>
            </button>
          );
        })}
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-neutral-500 pt-1">
        <span>
          {isBangla
            ? `মোট ${totalCount} টি প্রাণী দত্তকের জন্য প্রস্তুত`
            : `${totalCount} animals ready for adoption`}
        </span>
      </div>
    </div>
  );
}
