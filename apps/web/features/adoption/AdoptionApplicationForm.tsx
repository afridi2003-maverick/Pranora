'use client';

import React, { useState } from 'react';
import { useLocale } from '@pranora/i18n';
import { Card, Button } from '@pranora/ui';
import type { AdoptionListingRow, CreateApplicationPayload } from '@pranora/api';
import type { HomeType } from '@pranora/types';
import { DISTRICT_MAP } from './mockData';
import { formatAge } from './AdoptionCard';

interface AdoptionApplicationFormProps {
  listing: AdoptionListingRow;
  applicantId?: string;
  onSubmitApplication?: (payload: CreateApplicationPayload) => Promise<{ success: boolean; error?: string }>;
  onCancel?: () => void;
  onSuccess?: () => void;
}

const HOME_TYPES: { id: HomeType; bn: string; en: string }[] = [
  { id: 'own_flat', bn: 'নিজের ফ্ল্যাট (Own Flat)', en: 'Own Flat' },
  { id: 'rented_flat', bn: 'ভাড়া ফ্ল্যাট (Rented Flat)', en: 'Rented Flat' },
  { id: 'own_house', bn: 'নিজের বাড়ি (Own House)', en: 'Own House' },
  { id: 'rented_house', bn: 'ভাড়া বাড়ি (Rented House)', en: 'Rented House' },
  { id: 'other', bn: 'অন্যান্য (Other)', en: 'Other' },
];

export function AdoptionApplicationForm({
  listing,
  applicantId: _applicantId = 'current-user-id',
  onSubmitApplication,
  onCancel,
  onSuccess,
}: AdoptionApplicationFormProps) {
  const { isBangla } = useLocale();

  const [homeType, setHomeType] = useState<HomeType>('own_flat');
  const [hasOtherPets, setHasOtherPets] = useState(false);
  const [experience, setExperience] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const title = isBangla
    ? listing.title_bn || listing.title_en || 'প্রাণী'
    : listing.title_en || listing.title_bn || 'Pet';

  const district = DISTRICT_MAP[listing.district_id]
    ? isBangla
      ? DISTRICT_MAP[listing.district_id]?.bn
      : DISTRICT_MAP[listing.district_id]?.en
    : isBangla
    ? 'বাংলাদেশ'
    : 'Bangladesh';

  const photo = listing.photos[0] || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (reason.trim().length < 10) {
      setErrorMessage(
        isBangla
          ? 'দত্তক নেওয়ার কারণ কমপক্ষে ১০ অক্ষরে বিস্তারিত লিখুন।'
          : 'Please provide at least 10 characters explaining why you want to adopt.'
      );
      return;
    }

    const payload: CreateApplicationPayload = {
      listing_id: listing.id,
      home_type: homeType,
      has_other_pets: hasOtherPets,
      experience: experience.trim() || null,
      reason: reason.trim(),
    };

    setIsSubmitting(true);
    try {
      if (onSubmitApplication) {
        const res = await onSubmitApplication(payload);
        if (!res.success) {
          setErrorMessage(res.error || (isBangla ? 'আবেদন জমা দেওয়া সম্ভব হয়নি।' : 'Failed to submit application.'));
          return;
        }
      }

      setIsSubmitted(true);
      if (onSuccess) onSuccess();
    } catch {
      setErrorMessage(isBangla ? 'সার্ভারে সমস্যা হয়েছে।' : 'Server error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <Card className="p-8 text-center max-w-lg mx-auto bg-white dark:bg-neutral-900 border-stroke-subtle shadow-md space-y-4">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-3xl mx-auto">
          ✓
        </div>
        <h2 className="text-xl font-bold text-foreground">
          {isBangla ? 'আবেদন সফলভাবে জমা হয়েছে!' : 'Application Submitted Successfully!'}
        </h2>
        <p className="text-sm text-foreground-secondary leading-relaxed">
          {isBangla
            ? `"${title}" এর জন্য আপনার দত্তক আবেদন লিস্টার বা আশ্রয়কেন্দ্রে পাঠানো হয়েছে। মানুষ দ্বারা পর্যালোচনার পর আপনি বিজ্ঞপ্তির মাধ্যমে ফলাফল জানতে পারবেন।`
            : `Your application for "${title}" has been sent to the guardian. You will receive an in-app and push notification upon human review.`}
        </p>

        <div className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded-xl text-xs text-neutral-600 dark:text-neutral-400">
          🤝 {isBangla ? '১০০% মানবিক পর্যালোচনা — কোনো এআই সিদ্ধান্ত নয়।' : '100% Human decision — never automated by AI.'}
        </div>

        <div className="pt-4 flex justify-center gap-3">
          {onCancel && (
            <Button variant="primary" onClick={onCancel}>
              {isBangla ? 'অন্যান্য প্রাণী দেখুন' : 'Browse More Listings'}
            </Button>
          )}
        </div>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
      {/* 1. Target Pet Mini Card */}
      <Card className="p-4 bg-white dark:bg-neutral-900 border-stroke-subtle shadow-sm flex items-center gap-4">
        <img
          src={photo}
          alt={title}
          className="w-20 h-20 rounded-xl object-cover border border-stroke-subtle flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold uppercase bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
              {listing.species}
            </span>
            <span className="text-xs text-foreground-secondary">
              📍 {district}
            </span>
          </div>
          <h3 className="text-base font-bold text-foreground truncate mt-1">
            {title}
          </h3>
          <p className="text-xs text-foreground-secondary mt-0.5">
            {formatAge(listing.age_months, isBangla)} · {listing.gender}
            {listing.is_vaccinated && ' · 💉 ' + (isBangla ? 'ভ্যাকসিনেটেড' : 'Vaccinated')}
          </p>
        </div>
      </Card>

      {/* 2. One-page Application Form (ADP-3) */}
      <Card className="p-6 bg-white dark:bg-neutral-900 border-stroke-subtle shadow-sm space-y-5">
        <div>
          <h2 className="text-lg font-bold text-foreground">
            {isBangla ? 'দত্তক আবেদন ফরম (ADP-3)' : 'Adoption Application Form (ADP-3)'}
          </h2>
          <p className="text-xs text-foreground-secondary mt-0.5">
            {isBangla
              ? 'প্রাণীর সুরক্ষার্থে আপনার পারিবারিক পরিবেশ ও প্রস্তুতি সম্পর্কে কিছু তথ্য দিন।'
              : 'Please share your home environment and preparation for the pet.'}
          </p>
        </div>

        {/* Home Type */}
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            {isBangla ? '১. আপনার বাসার ধরন *' : '1. Your Home Environment *'}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {HOME_TYPES.map((type) => {
              const isSelected = homeType === type.id;
              return (
                <label
                  key={type.id}
                  className={`flex items-center gap-2.5 p-3 rounded-lg border text-xs font-medium cursor-pointer transition-all ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/20 text-emerald-950 dark:text-emerald-100'
                      : 'border-stroke-subtle bg-white dark:bg-neutral-800 text-foreground hover:border-neutral-400'
                  }`}
                >
                  <input
                    type="radio"
                    name="home_type"
                    value={type.id}
                    checked={isSelected}
                    onChange={() => setHomeType(type.id)}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>{isBangla ? type.bn : type.en}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Other Pets */}
        <div>
          <label className="flex items-center gap-2.5 cursor-pointer text-sm font-medium text-foreground">
            <input
              type="checkbox"
              checked={hasOtherPets}
              onChange={(e) => setHasOtherPets(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded"
            />
            <span>
              🐾 {isBangla
                ? 'বাসায় বর্তমানে অন্য কোনো পোষা প্রাণী আছে'
                : 'I currently have other pets in my household'}
            </span>
          </label>
        </div>

        {/* Previous Experience */}
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">
            {isBangla
              ? '২. আগের পোষা প্রাণী পালনের অভিজ্ঞতা (ঐচ্ছিক)'
              : '2. Previous Pet Care Experience (Optional)'}
          </label>
          <textarea
            rows={2}
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            placeholder={
              isBangla
                ? 'যেমন: ছোটবেলা থেকেই বিড়াল লালন-পালনের অভিজ্ঞতা আছে...'
                : 'e.g. Raised rescued cats for 4 years, familiar with diet and vets...'
            }
            className="w-full px-3 py-2 text-sm rounded-lg border border-stroke-subtle bg-transparent text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Reason for Adoption */}
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">
            {isBangla
              ? '৩. কেন আপনি এই প্রাণীটিকে দত্তক নিতে চান? *'
              : '3. Why do you want to adopt this pet? *'}
          </label>
          <textarea
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={
              isBangla
                ? 'পরিবারের প্রস্তুতি, সময় দেওয়ার সুযোগ এবং প্রাণীর প্রতি আপনার ভালোবাসার পরিকল্পনা লিখুন (কমপক্ষে ১০ অক্ষর)...'
                : 'Describe your daily routine, family agreement, and love for this animal (minimum 10 characters)...'
            }
            className="w-full px-3 py-2 text-sm rounded-lg border border-stroke-subtle bg-transparent text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500"
            required
          />
        </div>

        {/* Human Decision Guarantee Banner */}
        <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-100 flex items-start gap-2">
          <span className="text-lg">🛡️</span>
          <div>
            <p className="font-semibold">
              {isBangla ? '১০০% মানবিক পর্যালোচনা নিশ্চিতকরণ' : '100% Human Review Guarantee'}
            </p>
            <p className="opacity-80 mt-0.5">
              {isBangla
                ? 'আপনার আবেদনটি সরাসরি উদ্ধারকারী বা আশ্রয়কেন্দ্র পরিচালক নিজে বিবেচনা করবেন। কোনো এআই সিদ্ধান্তের সাথে জড়িত নয়।'
                : 'Your application is reviewed directly by real caretakers. AI is never used to accept or reject.'}
            </p>
          </div>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-lg text-xs font-semibold bg-rose-100 text-rose-900 border border-rose-300">
            {errorMessage}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {onCancel && (
            <Button variant="ghost" type="button" onClick={onCancel} disabled={isSubmitting}>
              {isBangla ? 'বাতিল' : 'Cancel'}
            </Button>
          )}

          <Button variant="primary" type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? isBangla ? 'জমা দেওয়া হচ্ছে...' : 'Submitting...'
              : isBangla ? 'আবেদন জমা দিন' : 'Submit Application'}
          </Button>
        </div>
      </Card>
    </form>
  );
}
