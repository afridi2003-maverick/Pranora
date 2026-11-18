'use client';

import React from 'react';
import { useLocale } from '@pranora/i18n';
import { Card, Button } from '@pranora/ui';
import type { AdoptionListingRow } from '@pranora/api';
import { DISTRICT_MAP } from './mockData';

interface AdoptionCardProps {
  listing: AdoptionListingRow;
  onSelect: (listing: AdoptionListingRow) => void;
  onSave?: (listingId: string) => void;
  isSaved?: boolean;
}

export function formatAge(months: number | null, isBangla: boolean): string {
  if (months === null || months === undefined) return isBangla ? 'বয়স অজানা' : 'Age unknown';
  if (months < 12) {
    return isBangla ? `${months} মাস` : `${months} mo`;
  }
  const years = Math.floor(months / 12);
  const rem = months % 12;
  if (rem === 0) {
    return isBangla ? `${years} বছর` : `${years} yr`;
  }
  return isBangla ? `${years} বছর ${rem} মাস` : `${years}y ${rem}m`;
}

export function AdoptionCard({ listing, onSelect, onSave, isSaved = false }: AdoptionCardProps) {
  const { isBangla } = useLocale();

  const title = isBangla
    ? listing.title_bn || listing.title_en || 'প্রাণী'
    : listing.title_en || listing.title_bn || 'Animal';

  const district = DISTRICT_MAP[listing.district_id]
    ? isBangla
      ? DISTRICT_MAP[listing.district_id]?.bn
      : DISTRICT_MAP[listing.district_id]?.en
    : isBangla
    ? 'বাংলাদেশ'
    : 'Bangladesh';

  const photo = listing.photos[0] || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600';

  return (
    <Card className="overflow-hidden flex flex-col h-full bg-white dark:bg-neutral-900 border-stroke-subtle hover:shadow-md transition-shadow group">
      {/* Photo Container */}
      <div className="relative aspect-[4/3] w-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
        <img
          src={photo}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Status Chip */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {listing.status === 'available' ? (
            <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-green-600 text-white shadow-sm">
              {isBangla ? 'দত্তকের জন্য প্রস্তুত' : 'Available'}
            </span>
          ) : (
            <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-500 text-white shadow-sm">
              {isBangla ? 'সংরক্ষিত' : 'Reserved'}
            </span>
          )}

          {listing.shelter_id && (
            <span className="px-2 py-1 text-[11px] font-medium rounded-full bg-black/60 text-white backdrop-blur-sm">
              🏛️ {isBangla ? 'শেল্টার' : 'Shelter'}
            </span>
          )}
        </div>

        {/* Save Bookmark Button */}
        {onSave && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSave(listing.id);
            }}
            className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-colors ${
              isSaved
                ? 'bg-red-500 text-white'
                : 'bg-white/80 dark:bg-neutral-900/80 text-neutral-700 dark:text-neutral-200 hover:bg-white'
            }`}
            title={isBangla ? 'সেভ করুন' : 'Save'}
          >
            {isSaved ? '♥' : '♡'}
          </button>
        )}
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Header Row: Species & Age */}
          <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 mb-1">
            <span className="font-semibold text-primary capitalize flex items-center gap-1">
              {listing.species === 'dog' ? '🐕' : listing.species === 'cat' ? '🐈' : '🐾'}{' '}
              {listing.species}
            </span>
            <span>
              {listing.gender === 'male' ? '♂ ' : listing.gender === 'female' ? '♀ ' : ''}
              {formatAge(listing.age_months, isBangla)}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-bold text-base text-foreground line-clamp-1 mb-2 group-hover:text-primary transition-colors">
            {title}
          </h3>

          {/* Location */}
          <p className="text-xs text-neutral-600 dark:text-neutral-400 flex items-center gap-1 mb-3">
            <span>📍</span> {district}
          </p>

          {/* Medical Badges */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {listing.is_vaccinated && (
              <span className="px-2 py-0.5 text-[11px] font-medium rounded-md bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-900">
                💉 {isBangla ? 'টিকা দেওয়া' : 'Vaccinated'}
              </span>
            )}
            {listing.is_neutered && (
              <span className="px-2 py-0.5 text-[11px] font-medium rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700">
                ✂️ {isBangla ? 'নির্বীজিত' : 'Neutered'}
              </span>
            )}
          </div>
        </div>

        {/* Action Button */}
        <Button
          variant="secondary"
          size="sm"
          className="w-full mt-2"
          onClick={() => onSelect(listing)}
        >
          {isBangla ? 'বিস্তারিত দেখুন' : 'View Details'}
        </Button>
      </div>
    </Card>
  );
}
