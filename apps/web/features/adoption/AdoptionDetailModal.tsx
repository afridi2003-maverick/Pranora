'use client';

import React, { useState } from 'react';
import { useLocale } from '@pranora/i18n';
import { Modal, Button } from '@pranora/ui';
import type { AdoptionListingRow } from '@pranora/api';
import type { ListingReportReason } from '@pranora/validation';
import { DISTRICT_MAP } from './mockData';
import { formatAge } from './AdoptionCard';
import { ReportListingModal } from './ReportListingModal';

interface AdoptionDetailModalProps {
  listing: AdoptionListingRow | null;
  isOpen: boolean;
  onClose: () => void;
  onApply?: (listing: AdoptionListingRow) => void;
  onSave?: (listingId: string) => void;
  isSaved?: boolean;
  onReport?: (payload: {
    listingId: string;
    reason: ListingReportReason;
    details?: string;
  }) => Promise<{ success: boolean; error?: string }>;
}

export function AdoptionDetailModal({
  listing,
  isOpen,
  onClose,
  onApply,
  onSave,
  isSaved = false,
  onReport,
}: AdoptionDetailModalProps) {
  const { isBangla } = useLocale();
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [isReportOpen, setIsReportOpen] = useState(false);

  if (!listing) return null;

  const title = isBangla
    ? listing.title_bn || listing.title_en || 'প্রাণী'
    : listing.title_en || listing.title_bn || 'Animal';

  const description = isBangla
    ? listing.description_bn || listing.description_en
    : listing.description_en || listing.description_bn;

  const district = DISTRICT_MAP[listing.district_id]
    ? isBangla
      ? DISTRICT_MAP[listing.district_id]?.bn
      : DISTRICT_MAP[listing.district_id]?.en
    : isBangla
    ? 'বাংলাদেশ'
    : 'Bangladesh';

  const photos = listing.photos.length > 0
    ? listing.photos
    : ['https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800'];

  return (
    <>
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-5 max-w-lg">
        {/* Main Photo */}
        <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800">
          <img
            src={photos[activePhotoIdx] || photos[0]}
            alt={title}
            className="w-full h-full object-cover"
          />

          <div className="absolute top-3 left-3 flex gap-2">
            {listing.status === 'available' ? (
              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-600 text-white shadow-sm">
                {isBangla ? 'দত্তকের জন্য প্রস্তুত' : 'Ready for Adoption'}
              </span>
            ) : (
              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-amber-500 text-white shadow-sm">
                {isBangla ? 'সংরক্ষিত' : 'Reserved'}
              </span>
            )}
          </div>
        </div>

        {/* Thumbnail selector if multiple photos */}
        {photos.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {photos.map((src, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActivePhotoIdx(idx)}
                className={`w-16 h-12 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                  activePhotoIdx === idx
                    ? 'border-primary ring-2 ring-primary/20'
                    : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <img src={src} alt="Thumbnail" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {/* Key Attributes Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-stroke-subtle text-xs">
          <div>
            <span className="text-neutral-500 block">{isBangla ? 'প্রজাতি' : 'Species'}</span>
            <span className="font-bold text-foreground capitalize">{listing.species}</span>
          </div>
          <div>
            <span className="text-neutral-500 block">{isBangla ? 'বয়স' : 'Age'}</span>
            <span className="font-bold text-foreground">{formatAge(listing.age_months, isBangla)}</span>
          </div>
          <div>
            <span className="text-neutral-500 block">{isBangla ? 'লিঙ্গ' : 'Gender'}</span>
            <span className="font-bold text-foreground">
              {listing.gender === 'male'
                ? isBangla ? 'পুরুষ ♂' : 'Male ♂'
                : listing.gender === 'female'
                ? isBangla ? 'স্ত্রী ♀' : 'Female ♀'
                : isBangla ? 'অজানা' : 'Unknown'}
            </span>
          </div>
          <div>
            <span className="text-neutral-500 block">{isBangla ? 'এলাকা' : 'Area'}</span>
            <span className="font-bold text-foreground">{district}</span>
          </div>
        </div>

        {/* Health Indicators */}
        <div className="flex flex-wrap gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium border ${
              listing.is_vaccinated
                ? 'bg-green-50 text-green-800 border-green-200 dark:bg-green-950/40 dark:text-green-300 dark:border-green-800'
                : 'bg-neutral-100 text-neutral-600 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-400'
            }`}
          >
            💉 {isBangla ? 'টিকা সম্পন্ন' : 'Vaccinated'}:{' '}
            {listing.is_vaccinated ? (isBangla ? 'হ্যাঁ' : 'Yes') : isBangla ? 'না / প্রক্রিয়াধীন' : 'Pending'}
          </span>

          <span
            className={`px-3 py-1 rounded-full text-xs font-medium border ${
              listing.is_neutered
                ? 'bg-green-50 text-green-800 border-green-200 dark:bg-green-950/40 dark:text-green-300 dark:border-green-800'
                : 'bg-neutral-100 text-neutral-600 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-400'
            }`}
          >
            ✂️ {isBangla ? 'নির্বীজিত' : 'Neutered'}:{' '}
            {listing.is_neutered ? (isBangla ? 'হ্যাঁ' : 'Yes') : isBangla ? 'না' : 'No'}
          </span>

          {listing.shelter_id && (
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-800 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800">
              🏛️ {isBangla ? 'যাচাইকৃত শেল্টার তালিকা' : 'Verified Shelter Listing'}
            </span>
          )}
        </div>

        {/* Detailed Story / Description */}
        {description && (
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-1">
              {isBangla ? 'প্রাণীর বিবরণ ও স্বভাব' : 'About this Animal'}
            </h4>
            <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed whitespace-pre-line">
              {description}
            </p>
          </div>
        )}

        {/* Safety & Location Disclaimer */}
        <div className="p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800/50 text-[11px] text-neutral-500 leading-normal">
          🔒 {isBangla
            ? 'সুরক্ষা নিশ্চিত করতে সঠিক বাসা বা উদ্ধারকারীর ব্যক্তিগত ঠিকানা জনসমক্ষে প্রকাশ করা হয় না। কেবল জেলা ও এলাকা উল্লেখ রয়েছে।'
            : 'For safety, exact residential addresses are not published publicly; only district and general area are shown.'}
        </div>

        {/* Action Button */}
        <div className="pt-2 border-t border-stroke-subtle flex flex-col gap-2">
          <div className="flex gap-2">
            {onApply && (
              <Button
                variant="primary"
                className="flex-1 py-3"
                onClick={() => onApply(listing)}
              >
                🐾 {isBangla ? 'দত্তকের আবেদন করুন' : 'Apply for Adoption'}
              </Button>
            )}
            {onSave && (
              <Button
                variant={isSaved ? 'danger' : 'secondary'}
                className="px-4 py-3"
                onClick={() => onSave(listing.id)}
              >
                {isSaved ? '♥ ' + (isBangla ? 'সংরক্ষিত' : 'Saved') : '♡ ' + (isBangla ? 'সংরক্ষণ' : 'Save')}
              </Button>
            )}
          </div>
          <p className="text-[11px] text-center text-neutral-500">
            {isBangla
              ? 'আবেদন করার জন্য একাউন্টে লগইন করতে হবে। অনুমোদন সরাসরি লিস্টার দ্বারা নিয়ন্ত্রিত হয়।'
              : 'Requires logging in to submit application. Approvals are always decided by humans.'}
          </p>

          {/* Report Button */}
          <div className="flex justify-center pt-1">
            <button
              type="button"
              onClick={() => setIsReportOpen(true)}
              className="text-xs text-neutral-400 hover:text-rose-600 transition-colors flex items-center gap-1.5"
            >
              <span>🚩</span>
              <span>{isBangla ? 'বিজ্ঞাপনটি রিপোর্ট করুন' : 'Report this listing'}</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>

    <ReportListingModal
      listing={listing}
      isOpen={isReportOpen}
      onClose={() => setIsReportOpen(false)}
      onReport={onReport}
    />
    </>
  );
}
