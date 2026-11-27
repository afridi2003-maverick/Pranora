'use client';

import React, { useState } from 'react';
import { useLocale } from '@pranora/i18n';
import { Card, Button } from '@pranora/ui';
import type { SpeciesType } from '@pranora/types';

interface RescuerProfileCardProps {
  initialAvailable?: boolean;
  initialRadiusKm?: number;
  initialSpecies?: SpeciesType[];
  districtName?: string;
  onSave?: (profile: {
    isAvailable: boolean;
    radiusKm: number;
    species: SpeciesType[];
  }) => Promise<void>;
}

export function RescuerProfileCard({
  initialAvailable = true,
  initialRadiusKm = 5,
  initialSpecies = ['dog', 'cat'],
  districtName,
  onSave,
}: RescuerProfileCardProps) {
  const { isBangla } = useLocale();

  const [isAvailable, setIsAvailable] = useState(initialAvailable);
  const [radiusKm, setRadiusKm] = useState(initialRadiusKm);
  const [species, setSpecies] = useState<SpeciesType[]>(initialSpecies);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const RADIUS_OPTIONS = [3, 5, 10, 15, 25];

  const SPECIES_LIST: { id: SpeciesType; bn: string; en: string; icon: string }[] = [
    { id: 'dog', bn: 'কুকুর', en: 'Dog', icon: '🐕' },
    { id: 'cat', bn: 'বিড়াল', en: 'Cat', icon: '🐈' },
    { id: 'rabbit', bn: 'খরগোশ', en: 'Rabbit', icon: '🐇' },
    { id: 'other', bn: 'অন্যান্য', en: 'Other', icon: '✨' },
  ];

  const toggleSpecies = (sp: SpeciesType) => {
    setSpecies((prev) => {
      if (prev.includes(sp)) {
        if (prev.length <= 1) return prev;
        return prev.filter((s) => s !== sp);
      }
      return [...prev, sp];
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      if (onSave) {
        await onSave({ isAvailable, radiusKm, species });
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="p-5 mb-6 border border-stroke-subtle shadow-sm bg-white dark:bg-neutral-900 rounded-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stroke-subtle">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-foreground">
              {isBangla ? 'উদ্ধারকারী প্রাপ্যতা ও কভারেজ এলাকা' : 'Rescuer Availability & Coverage'}
            </h2>
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                isAvailable
                  ? 'bg-green-100 text-green-800 dark:bg-green-950/60 dark:text-green-300'
                  : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-green-500 animate-pulse' : 'bg-neutral-400'}`} />
              {isAvailable
                ? isBangla ? 'অনলাইন / প্রস্তুত' : 'Online / Ready'
                : isBangla ? 'অফলাইন / অনুপলব্ধ' : 'Offline / Away'}
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            {districtName ? `📍 ${districtName} • ` : ''}
            {isBangla
              ? 'জরুরি কেস অফার পাওয়ার জন্য আপনার এলাকা ও প্রাপ্যতা নির্ধারণ করুন।'
              : 'Set your coverage range and status to receive dispatch offers.'}
          </p>
        </div>

        {/* Quick Availability Switch */}
        <button
          type="button"
          onClick={() => setIsAvailable(!isAvailable)}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm ${
            isAvailable
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 text-neutral-800 dark:text-neutral-200'
          }`}
        >
          <span>{isAvailable ? '🟢' : '⚪'}</span>
          <span>
            {isAvailable
              ? isBangla ? 'প্রাপ্য (সক্রিয়)' : 'Available (Active)'
              : isBangla ? 'অনুপলব্ধ (বিরতি)' : 'Unavailable (Break)'}
          </span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
        {/* Coverage Radius */}
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            🎯 {isBangla ? 'অপারেশনাল কভারেজ ব্যাসার্ধ (RSC-9)' : 'Coverage Radius (RSC-9)'}
          </label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {RADIUS_OPTIONS.map((km) => (
              <button
                key={km}
                type="button"
                onClick={() => setRadiusKm(km)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  radiusKm === km
                    ? 'bg-primary text-white shadow-sm ring-2 ring-primary/20'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200'
                }`}
              >
                {km} {isBangla ? 'কিমি' : 'km'}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-neutral-500">
            {isBangla
              ? `আপনার বেস পয়েন্ট থেকে ${radiusKm} কিমি দূরত্বের ভেতরের কেসগুলো আপনাকে অফার করা হবে।`
              : `Dispatches within ${radiusKm} km of your base coordinates will be routed to you.`}
          </p>
        </div>

        {/* Supported Species */}
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            🐾 {isBangla ? 'উদ্ধারযোগ্য প্রাণী প্রজাতি' : 'Supported Species'}
          </label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {SPECIES_LIST.map((sp) => {
              const active = species.includes(sp.id);
              return (
                <button
                  key={sp.id}
                  type="button"
                  onClick={() => toggleSpecies(sp.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                    active
                      ? 'bg-green-50 dark:bg-green-950/40 text-primary border border-green-300 dark:border-green-800'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 border border-transparent'
                  }`}
                >
                  <span>{sp.icon}</span>
                  <span>{isBangla ? sp.bn : sp.en}</span>
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-neutral-500">
            {isBangla
              ? 'যে সকল প্রাণীর চিকিৎসায় বা উদ্ধারে আপনার অভিজ্ঞতা ও প্রস্তুতি রয়েছে।'
              : 'Species you are equipped and willing to rescue.'}
          </p>
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-4 pt-3 border-t border-stroke-subtle flex items-center justify-between">
        {saveSuccess ? (
          <span className="text-xs text-green-600 font-semibold flex items-center gap-1">
            ✓ {isBangla ? 'প্রোফাইল সেটিংস সংরক্ষিত হয়েছে' : 'Coverage profile updated'}
          </span>
        ) : (
          <span className="text-[11px] text-neutral-400">
            {isBangla ? 'পরিবর্তন করার পর সংরক্ষণ করুন' : 'Remember to save changes'}
          </span>
        )}

        <Button
          variant="primary"
          size="sm"
          disabled={isSaving}
          onClick={handleSave}
        >
          {isSaving
            ? isBangla ? 'সংরক্ষণ হচ্ছে...' : 'Saving...'
            : isBangla ? 'সেটিংস সংরক্ষণ' : 'Save Settings'}
        </Button>
      </div>
    </Card>
  );
}
