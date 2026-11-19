'use client';

import React, { useState } from 'react';
import { useLocale } from '@pranora/i18n';
import { Card, Button } from '@pranora/ui';
import type { HandoverFullDetails } from './mockData';
import { DISTRICT_MAP } from './mockData';

interface AdoptionHandoverCardProps {
  initialDetails: HandoverFullDetails;
  currentUserId?: string;
  onConfirmHandover?: (handoverId: string) => Promise<{ success: boolean; bothConfirmed?: boolean; error?: string }>;
  onBack?: () => void;
}

export function AdoptionHandoverCard({
  initialDetails,
  currentUserId = 'user-current',
  onConfirmHandover,
  onBack,
}: AdoptionHandoverCardProps) {
  const { isBangla } = useLocale();
  const [details, setDetails] = useState<HandoverFullDetails>(initialDetails);
  const [isConfirming, setIsConfirming] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { handover, listing, petName, giverName, adopterName } = details;

  const isGiver = handover.from_user_id === currentUserId;
  const isAdopter = handover.to_user_id === currentUserId;
  const isGiverConfirmed = Boolean(handover.giver_confirmed_at);
  const isAdopterConfirmed = Boolean(handover.adopter_confirmed_at);
  const isCompleted = Boolean(handover.completed_at) || (isGiverConfirmed && isAdopterConfirmed);

  const canConfirm =
    !isCompleted &&
    ((isGiver && !isGiverConfirmed) || (isAdopter && !isAdopterConfirmed));

  const district = DISTRICT_MAP[listing.district_id]
    ? isBangla
      ? DISTRICT_MAP[listing.district_id]?.bn
      : DISTRICT_MAP[listing.district_id]?.en
    : isBangla
    ? 'বাংলাদেশ'
    : 'Bangladesh';

  const photo = listing.photos?.[0] || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800';

  const handleConfirm = async () => {
    setIsConfirming(true);
    setErrorMessage(null);

    try {
      if (onConfirmHandover) {
        const res = await onConfirmHandover(handover.id);
        if (!res.success) {
          setErrorMessage(res.error || (isBangla ? 'হস্তান্তর নিশ্চিত করা সম্ভব হয়নি।' : 'Failed to confirm handover.'));
          return;
        }
      }

      const nowIso = new Date().toISOString();
      setDetails((prev) => {
        const nextGiver = isGiver ? nowIso : prev.handover.giver_confirmed_at;
        const nextAdopter = isAdopter ? nowIso : prev.handover.adopter_confirmed_at;
        const bothDone = Boolean(nextGiver && nextAdopter);

        return {
          ...prev,
          handover: {
            ...prev.handover,
            giver_confirmed_at: nextGiver,
            adopter_confirmed_at: nextAdopter,
            completed_at: bothDone ? nowIso : null,
          },
        };
      });
    } catch {
      setErrorMessage(isBangla ? 'সার্ভারে সমস্যা হয়েছে।' : 'Server error occurred.');
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* 1. Header Pet Card */}
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
            {isBangla ? 'দুই-পক্ষীয় নিশ্চিতকরণ ও মালিকানা হস্তান্তর (ADP-6)' : 'Two-Sided Handover & Transfer (ADP-6)'}
          </p>
        </div>
      </Card>

      {/* 2. Completed State Banner */}
      {isCompleted && (
        <Card className="p-6 bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100 space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🎉</span>
            <div>
              <h3 className="font-extrabold text-base">
                {isBangla
                  ? 'হস্তান্তর সম্পন্ন! মালিকানা সফলভাবে স্থানান্তরিত হয়েছে'
                  : 'Handover Completed! Ownership Transferred'}
              </h3>
              <p className="text-xs opacity-90">
                {isBangla
                  ? 'উভয় পক্ষ নিশ্চিত করায় প্রাণীর প্রোফাইল ও মেডিকেল রেকর্ড নতুন গ্রহীতার নামে নিবন্ধিত হয়েছে।'
                  : 'Both parties confirmed. Pet profile and veterinary medical records transferred to the adopter.'}
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-emerald-200 dark:border-emerald-800/80 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span>📅 {isBangla ? 'কল্যাণ যাচাই সূচি (Follow-ups): ৩০, ৯০ ও ১৮০ দিন' : 'Follow-up checks: 30, 90 & 180 days'}</span>
            <span className="font-bold text-[11px] px-2.5 py-0.5 bg-white/70 dark:bg-black/30 rounded-full">
              ✅ {isBangla ? 'একক হস্তান্তর সম্পন্ন' : 'One-Handover Policy'}
            </span>
          </div>
        </Card>
      )}

      {/* 3. Two-Sided Confirmation Progress */}
      <Card className="p-6 bg-white dark:bg-neutral-900 border-stroke-subtle shadow-sm space-y-6">
        <div>
          <h3 className="text-base font-bold text-foreground">
            {isBangla ? 'উভয় পক্ষের হস্তান্তর স্থিতি' : 'Two-Sided Handover Status'}
          </h3>
          <p className="text-xs text-foreground-secondary mt-0.5">
            {isBangla
              ? 'প্রাণীর সুরক্ষার্থে দাতা ও গ্রহীতা উভয়ের সম্মতি মিললে তবেই মালিকানা পরিবর্তন হয়।'
              : 'Ownership changes only when both the giver and the adopter confirm the handover.'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Party A: Giver */}
          <div
            className={`p-4 rounded-xl border ${
              isGiverConfirmed
                ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800'
                : 'bg-neutral-50 dark:bg-neutral-800/50 border-stroke-subtle'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-foreground-secondary">
                {isBangla ? '১. দাতা (বর্তমান অভিভাবক)' : '1. Giver (Current Guardian)'}
              </span>
              <span className="text-lg">{isGiverConfirmed ? '✅' : '⏳'}</span>
            </div>
            <p className="font-bold text-sm text-foreground">{giverName}</p>
            <p className="text-xs text-foreground-secondary mt-1">
              {isGiverConfirmed
                ? isBangla
                  ? `নিশ্চিত করেছেন: ${new Date(handover.giver_confirmed_at!).toLocaleString()}`
                  : `Confirmed: ${new Date(handover.giver_confirmed_at!).toLocaleString()}`
                : isBangla
                ? 'দাতার নিশ্চিতকরণের অপেক্ষায়'
                : 'Awaiting giver confirmation'}
            </p>
          </div>

          {/* Party B: Adopter */}
          <div
            className={`p-4 rounded-xl border ${
              isAdopterConfirmed
                ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800'
                : 'bg-neutral-50 dark:bg-neutral-800/50 border-stroke-subtle'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-foreground-secondary">
                {isBangla ? '২. গ্রহীতা (নতুন দত্তককারী)' : '2. Adopter (New Guardian)'}
              </span>
              <span className="text-lg">{isAdopterConfirmed ? '✅' : '⏳'}</span>
            </div>
            <p className="font-bold text-sm text-foreground">{adopterName}</p>
            <p className="text-xs text-foreground-secondary mt-1">
              {isAdopterConfirmed
                ? isBangla
                  ? `নিশ্চিত করেছেন: ${new Date(handover.adopter_confirmed_at!).toLocaleString()}`
                  : `Confirmed: ${new Date(handover.adopter_confirmed_at!).toLocaleString()}`
                : isBangla
                ? 'গ্রহীতার নিশ্চিতকরণের অপেক্ষায়'
                : 'Awaiting adopter confirmation'}
            </p>
          </div>
        </div>

        {/* Action Button */}
        {canConfirm && (
          <div className="p-4 bg-amber-50/70 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800 space-y-3">
            <p className="text-xs text-amber-950 dark:text-amber-100 font-medium">
              {isGiver
                ? isBangla
                  ? 'আপনি কি প্রাণীটিকে সফলভাবে নতুন দত্তককারীর কাছে হস্তান্তর করেছেন?'
                  : 'Have you safely handed over the pet to the approved adopter?'
                : isBangla
                ? 'আপনি কি প্রাণীটিকে সুস্থ অবস্থায় ব্যক্তিগতভাবে বুঝে পেয়েছেন?'
                : 'Have you received the pet in good condition?'}
            </p>

            <Button
              variant="primary"
              className="w-full py-2.5"
              onClick={handleConfirm}
              disabled={isConfirming}
            >
              {isConfirming
                ? isBangla ? 'নিশ্চিত করা হচ্ছে...' : 'Confirming...'
                : isBangla ? 'হস্তান্তর নিশ্চিত করুন (Confirm Handover)' : 'Confirm Handover'}
            </Button>
          </div>
        )}

        {errorMessage && (
          <div className="p-3 bg-rose-100 text-rose-900 rounded-lg text-xs font-semibold">
            {errorMessage}
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
