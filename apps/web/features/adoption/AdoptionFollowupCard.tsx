'use client';

import React, { useState } from 'react';
import { useLocale } from '@pranora/i18n';
import { Card, Button } from '@pranora/ui';
import type { FollowupWithHandover } from './mockData';
import { DISTRICT_MAP } from './mockData';

interface AdoptionFollowupCardProps {
  followups: FollowupWithHandover[];
  initialSelectedId?: string;
  onSubmitFollowup?: (
    followupId: string,
    payload: {
      wellbeing: 'good' | 'okay' | 'needs_help';
      note?: string | null;
      photos: string[];
    }
  ) => Promise<{ success: boolean; error?: string }>;
  onBack?: () => void;
}

export function AdoptionFollowupCard({
  followups: initialFollowups,
  initialSelectedId,
  onSubmitFollowup,
  onBack,
}: AdoptionFollowupCardProps) {
  const { isBangla } = useLocale();
  const [followups, setFollowups] = useState<FollowupWithHandover[]>(initialFollowups);
  const [selectedId, setSelectedId] = useState<string>(
    initialSelectedId || followups[0]?.followup.id || ''
  );

  // Form states
  const [wellbeing, setWellbeing] = useState<'good' | 'okay' | 'needs_help'>('good');
  const [note, setNote] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const selectedItem = followups.find((f) => f.followup.id === selectedId) || followups[0];
  if (!selectedItem) {
    return (
      <Card className="p-8 text-center">
        <p className="text-foreground-secondary">
          {isBangla ? 'কোনো ফলো-আপ তথ্য পাওয়া যায়নি।' : 'No follow-up records found.'}
        </p>
      </Card>
    );
  }

  const { followup, listing, petName } = selectedItem;
  const isAnswered = Boolean(followup.answered_at);
  const isDue = new Date(followup.due_on).getTime() <= Date.now();

  const district = DISTRICT_MAP[listing.district_id]
    ? isBangla
      ? DISTRICT_MAP[listing.district_id]?.bn
      : DISTRICT_MAP[listing.district_id]?.en
    : isBangla
    ? 'বাংলাদেশ'
    : 'Bangladesh';

  const photo = listing.photos?.[0] || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800';

  // Canvas on-device EXIF stripper
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            const cleanDataUrl = canvas.toDataURL('image/jpeg', 0.85);
            setPhotos((prev) => (prev.length < 6 ? [...prev, cleanDataUrl] : prev));
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      if (onSubmitFollowup) {
        const res = await onSubmitFollowup(followup.id, {
          wellbeing,
          note: note.trim() || null,
          photos,
        });

        if (!res.success) {
          setErrorMessage(res.error || (isBangla ? 'জমা দেওয়া সম্ভব হয়নি।' : 'Failed to submit check-in.'));
          setIsSubmitting(false);
          return;
        }
      }

      const answeredIso = new Date().toISOString();
      setFollowups((prev) =>
        prev.map((item) =>
          item.followup.id === followup.id
            ? {
                ...item,
                followup: {
                  ...item.followup,
                  answered_at: answeredIso,
                  wellbeing,
                  note: note.trim() || null,
                  photos,
                },
              }
            : item
        )
      );

      setSuccessMessage(
        isBangla
          ? 'ধন্যবাদ! আপনার চেক-ইন সফলভাবে সংরক্ষিত হয়েছে।'
          : 'Thank you! Your check-in report has been recorded.'
      );
    } catch {
      setErrorMessage(isBangla ? 'সার্ভারে সমস্যা হয়েছে।' : 'Server error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* 1. Pet Header Card */}
      <Card className="p-5 bg-white dark:bg-neutral-900 border-stroke-subtle shadow-sm flex items-center gap-4">
        <img
          src={photo}
          alt={petName}
          className="w-20 h-20 rounded-xl object-cover border border-stroke-subtle flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold uppercase bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
              {listing.species}
            </span>
            <span className="text-xs text-foreground-secondary">📍 {district}</span>
          </div>
          <h2 className="text-lg font-bold text-foreground truncate mt-1">
            {petName}
          </h2>
          <p className="text-xs text-foreground-secondary">
            {isBangla
              ? 'দত্তক পরবর্তী কল্যাণ যাচাই সূচি (Post-Adoption Follow-ups — ADP-9)'
              : 'Post-Adoption Welfare Milestones (ADP-9)'}
          </p>
        </div>
      </Card>

      {/* 2. Milestone Stepper (30, 90, 180 days) */}
      <Card className="p-5 bg-white dark:bg-neutral-900 border-stroke-subtle shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-foreground">
          {isBangla ? 'ফলো-আপ সময়সীমা (Check-in Milestones)' : 'Check-in Milestones'}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {followups.map((item, idx) => {
            const f = item.followup;
            const isSelected = f.id === selectedId;
            const itemAnswered = Boolean(f.answered_at);
            const itemDue = new Date(f.due_on).getTime() <= Date.now();
            const milestoneLabel = idx === 0 ? '৩০ দিন' : idx === 1 ? '৯০ দিন' : '১৮০ দিন';
            const milestoneLabelEn = idx === 0 ? '30 Days' : idx === 1 ? '90 Days' : '180 Days';

            return (
              <button
                key={f.id}
                type="button"
                onClick={() => {
                  setSelectedId(f.id);
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between gap-2 ${
                  isSelected
                    ? 'ring-2 ring-emerald-500 border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20'
                    : 'border-stroke-subtle hover:bg-neutral-50 dark:hover:bg-neutral-800/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">
                    {isBangla ? milestoneLabel : milestoneLabelEn}
                  </span>
                  <span className="text-xs">
                    {itemAnswered ? '✅' : itemDue ? '🔔' : '⏳'}
                  </span>
                </div>

                <div>
                  <p className="text-[11px] text-foreground-secondary">
                    {isBangla ? 'নির্ধারিত তারিখ:' : 'Due Date:'}
                  </p>
                  <p className="text-xs font-medium text-foreground">
                    {new Date(f.due_on).toLocaleDateString()}
                  </p>
                </div>

                <div className="pt-1">
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      itemAnswered
                        ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300'
                        : itemDue
                        ? 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 animate-pulse'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    {itemAnswered
                      ? isBangla ? 'সম্পন্ন' : 'Completed'
                      : itemDue
                      ? isBangla ? 'এখনই প্রয়োজন' : 'Due Now'
                      : isBangla ? 'আসন্ন' : 'Upcoming'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      {/* 3. Followup Action or Review Card */}
      <Card className="p-6 bg-white dark:bg-neutral-900 border-stroke-subtle shadow-sm space-y-6">
        {isAnswered ? (
          /* View Completed Check-in Details */
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stroke-subtle">
              <div>
                <h3 className="text-base font-bold text-foreground">
                  {isBangla ? 'চেক-ইন বিবরণী' : 'Check-in Report'}
                </h3>
                <p className="text-xs text-foreground-secondary">
                  {isBangla ? 'জমা দেওয়ার তারিখ: ' : 'Submitted on: '}
                  {new Date(followup.answered_at!).toLocaleString()}
                </p>
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200">
                ✅ {isBangla ? 'যাচাই সম্পন্ন' : 'Verified'}
              </span>
            </div>

            {/* Wellbeing Result */}
            <div>
              <p className="text-xs text-foreground-secondary font-medium mb-1">
                {isBangla ? 'সার্বিক অবস্থা ও আচরণ:' : 'Overall Wellbeing:'}
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-stroke-subtle bg-neutral-50 dark:bg-neutral-800/60 text-sm font-semibold">
                <span>
                  {followup.wellbeing === 'good' ? '😺' : followup.wellbeing === 'okay' ? '😐' : '🚨'}
                </span>
                <span>
                  {followup.wellbeing === 'good'
                    ? isBangla ? 'খুব ভালো আছে / চঞ্চল ও সুস্থ' : 'Doing Great (Healthy & Happy)'
                    : followup.wellbeing === 'okay'
                    ? isBangla ? 'মোটামুটি চলছে / অভ্যস্ত হচ্ছে' : 'Doing Okay (Adjusting)'
                    : isBangla ? 'সহায়তা বা চিকিৎসা পরামর্শ প্রয়োজন' : 'Needs Assistance / Medical Help'}
                </span>
              </div>
            </div>

            {/* Note */}
            {followup.note && (
              <div>
                <p className="text-xs text-foreground-secondary font-medium mb-1">
                  {isBangla ? 'অভিভাবকের মন্তব্য:' : 'Guardian Note:'}
                </p>
                <p className="text-xs bg-neutral-50 dark:bg-neutral-800/50 p-3 rounded-lg border border-stroke-subtle text-foreground whitespace-pre-line">
                  {followup.note}
                </p>
              </div>
            )}

            {/* Photos */}
            {followup.photos && followup.photos.length > 0 && (
              <div>
                <p className="text-xs text-foreground-secondary font-medium mb-2">
                  {isBangla ? 'সংযুক্ত ছবিসমূহ:' : 'Attached Photos:'}
                </p>
                <div className="flex flex-wrap gap-3">
                  {followup.photos.map((url: string, i: number) => (
                    <img
                      key={i}
                      src={url}
                      alt="Followup photo"
                      className="w-24 h-24 object-cover rounded-lg border border-stroke-subtle"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : isDue ? (
          /* Check-in Form for Due Milestone */
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-foreground">
                {isBangla ? 'পোষা প্রাণীর কল্যাণ চেক-ইন' : 'Pet Welfare Check-In'}
              </h3>
              <p className="text-xs text-foreground-secondary mt-0.5">
                {isBangla
                  ? 'আপনার নতুন সঙ্গী কেমন আছে তা জানিয়ে আশ্রয়কেন্দ্র ও পূর্ববর্তী অভিভাবককে আশ্বস্ত করুন।'
                  : 'Let the shelter and previous guardian know how your adopted pet is settling in.'}
              </p>
            </div>

            {/* Wellbeing Options */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-foreground">
                {isBangla ? 'প্রাণীর বর্তমান সার্বিক অবস্থা:*' : 'How is the pet doing?*'}
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    value: 'good' as const,
                    icon: '😺',
                    titleBn: 'খুব ভালো আছে',
                    descBn: 'সুস্থ, চঞ্চল ও নিয়মিত খাওয়া-দাওয়া করছে',
                    titleEn: 'Doing Great',
                    descEn: 'Healthy, playful, eating well',
                  },
                  {
                    value: 'okay' as const,
                    icon: '😐',
                    titleBn: 'মোটামুটি চলছে',
                    descBn: 'নতুন পরিবেশে ধীরে ধীরে খাপ খাইয়ে নিচ্ছে',
                    titleEn: 'Doing Okay',
                    descEn: 'Adjusting gradually to new home',
                  },
                  {
                    value: 'needs_help' as const,
                    icon: '🚨',
                    titleBn: 'সহায়তা প্রয়োজন',
                    descBn: 'খাদ্যাভ্যাস বা আচরণে সমস্যা / ভেট পরামর্শ চাই',
                    titleEn: 'Needs Help',
                    descEn: 'Behavior or health concerns / needs vet',
                  },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setWellbeing(opt.value)}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      wellbeing === opt.value
                        ? 'ring-2 ring-emerald-500 border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20'
                        : 'border-stroke-subtle hover:bg-neutral-50 dark:hover:bg-neutral-800/40'
                    }`}
                  >
                    <div className="text-2xl mb-1">{opt.icon}</div>
                    <p className="text-xs font-bold text-foreground">
                      {isBangla ? opt.titleBn : opt.titleEn}
                    </p>
                    <p className="text-[11px] text-foreground-secondary mt-0.5">
                      {isBangla ? opt.descBn : opt.descEn}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Emergency alert if needs_help */}
            {wellbeing === 'needs_help' && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-xl text-amber-950 dark:text-amber-100 text-xs space-y-1">
                <p className="font-bold">
                  ⚠️ {isBangla ? 'পরামর্শ ও সেবা নির্দেশিকা:' : 'Care & Support Notice:'}
                </p>
                <p>
                  {isBangla
                    ? 'প্রাণীর অসুস্থতা বা জরুরি প্রয়োজনে প্রাণোরা নিকটস্থ ভেটেরিনারি ম্যাপ (/map) ব্যবহার করুন অথবা আশ্রয়কেন্দ্রের সাথে সরাসরি যোগাযোগ করুন।'
                    : 'For health issues or veterinary care, use Pranora Nearest Vet Map (/map) or contact the shelter directly.'}
                </p>
              </div>
            )}

            {/* Note Textarea */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-foreground">
                {isBangla ? 'বিস্তারিত মন্তব্য ও আপডেট (ঐচ্ছিক):' : 'Notes & Updates (Optional):'}
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                placeholder={
                  isBangla
                    ? 'প্রাণীর খাদ্যাভ্যাস, ওজন বৃদ্ধি, খেলাধুলা বা পরিবারের সাথে মেশার অভিজ্ঞতা লিখুন...'
                    : 'Describe diet, weight, habits, or how they are bonding with your family...'
                }
                className="w-full text-xs p-3 rounded-lg border border-stroke-subtle bg-white dark:bg-neutral-900 text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              />
            </div>

            {/* Photos upload with on-device EXIF Stripping */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-foreground">
                {isBangla ? 'সাম্প্রতিক ছবি আপলোড করুন (EXIF ডাটা অপসারিত):' : 'Upload Recent Photos (EXIF Stripped):'}
              </label>

              <div className="flex flex-wrap gap-3">
                {photos.map((src, idx) => (
                  <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border border-stroke-subtle group">
                    <img src={src} alt="Pet photo" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(idx)}
                      className="absolute top-1 right-1 w-5 h-5 bg-rose-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold"
                    >
                      ✕
                    </button>
                  </div>
                ))}

                {photos.length < 6 && (
                  <label className="w-20 h-20 rounded-lg border-2 border-dashed border-stroke-subtle hover:border-emerald-500 cursor-pointer flex flex-col items-center justify-center text-foreground-secondary hover:text-emerald-600 transition-colors">
                    <span className="text-xl">+</span>
                    <span className="text-[10px] mt-0.5">{isBangla ? 'ছবি যোগ' : 'Add'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handlePhotoUpload}
                    />
                  </label>
                )}
              </div>
              <p className="text-[10px] text-foreground-secondary">
                {isBangla
                  ? '🔒 নিরাপত্তার জন্য ডিভাইসের ভেতরেই ছবির জিপিএস ও মেটাডাটা অপসারণ করা হয়।'
                  : '🔒 Location coordinates and device metadata are stripped on-device before uploading.'}
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 bg-rose-100 text-rose-900 rounded-lg text-xs font-semibold">
                {errorMessage}
              </div>
            )}

            {successMessage && (
              <div className="p-3 bg-emerald-100 text-emerald-900 rounded-lg text-xs font-semibold">
                {successMessage}
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              className="w-full py-2.5 font-bold"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? isBangla ? 'জমা দেওয়া হচ্ছে...' : 'Submitting...'
                : isBangla ? 'চেক-ইন জমা দিন (Submit Check-in)' : 'Submit Check-in'}
            </Button>
          </form>
        ) : (
          /* Future / Scheduled Milestone */
          <div className="text-center py-8 space-y-3">
            <span className="text-3xl">⏳</span>
            <h4 className="text-sm font-bold text-foreground">
              {isBangla ? 'এই চেক-ইনের সময় এখনো হয়নি' : 'Milestone Not Yet Due'}
            </h4>
            <p className="text-xs text-foreground-secondary max-w-md mx-auto">
              {isBangla
                ? `এই চেক-ইনটি আগামী ${new Date(followup.due_on).toLocaleDateString()} তারিখে উন্মুক্ত হবে। সময় হলে আপনাকে নোটিফিকেশনের মাধ্যমে মনে করিয়ে দেওয়া হবে।`
                : `This check-in is scheduled for ${new Date(followup.due_on).toLocaleDateString()}. You will receive a notification reminder when it is due.`}
            </p>
          </div>
        )}

        {/* Back navigation */}
        {onBack && (
          <div className="pt-2 border-t border-stroke-subtle flex justify-end">
            <Button variant="ghost" size="sm" onClick={onBack}>
              {isBangla ? 'ফিরে যান' : 'Back'}
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
