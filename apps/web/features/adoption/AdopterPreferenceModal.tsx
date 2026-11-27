'use client';

import React, { useState } from 'react';
import { useLocale } from '@pranora/i18n';
import { Modal, Button } from '@pranora/ui';
import type { AdopterPreference } from '@pranora/validation';
import { DISTRICT_MAP } from './mockData';

interface AdopterPreferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPreferences: AdopterPreference | null;
  onSave: (preferences: AdopterPreference) => Promise<void>;
}

export function AdopterPreferenceModal({
  isOpen,
  onClose,
  currentPreferences,
  onSave,
}: AdopterPreferenceModalProps) {
  const { isBangla } = useLocale();

  const [species, setSpecies] = useState<'dog' | 'cat' | 'bird' | 'rabbit' | 'other' | 'any'>(
    currentPreferences?.species || 'any'
  );
  const [preferredGender, setPreferredGender] = useState<'male' | 'female' | 'unknown' | 'any'>(
    currentPreferences?.preferred_gender || 'any'
  );
  const [ageGroup, setAgeGroup] = useState<'any' | 'baby' | 'young' | 'adult' | 'senior'>(
    currentPreferences?.age_group || 'any'
  );
  const [districtId, setDistrictId] = useState<number | null>(
    currentPreferences?.district_id ?? null
  );
  const [wantsVaccinated, setWantsVaccinated] = useState<boolean>(
    currentPreferences?.wants_vaccinated ?? true
  );
  const [wantsNeutered, setWantsNeutered] = useState<boolean>(
    currentPreferences?.wants_neutered ?? false
  );
  const [hasOtherPets, setHasOtherPets] = useState<boolean>(
    currentPreferences?.has_other_pets ?? false
  );
  const [homeType, setHomeType] = useState<
    'own_house' | 'rented_house' | 'own_flat' | 'rented_flat' | 'other'
  >(currentPreferences?.home_type || 'own_flat');

  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave({
        species,
        preferred_gender: preferredGender,
        age_group: ageGroup,
        district_id: districtId,
        wants_vaccinated: wantsVaccinated,
        wants_neutered: wantsNeutered,
        has_other_pets: hasOtherPets,
        home_type: homeType,
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isBangla ? '🎯 স্মার্ট দত্তক ম্যাচিং পছন্দ নির্ধারণ' : '🎯 Smart Adoption Matching Preferences'}
      variant="center"
      className="max-w-xl w-full"
    >
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
        <p className="text-xs text-muted-foreground">
          {isBangla
            ? 'আপনার জীবনধারা ও পরিবারের সাথে সবচেয়ে মানানসই পোষা প্রাণী খুঁজে পেতে নিচের তথ্যগুলো পূরণ করুন।'
            : 'Set your pet preferences and home environment to find the most compatible adoption matches.'}
        </p>

        {/* Species Selection */}
        <div>
          <label className="text-xs font-semibold text-foreground block mb-1.5">
            {isBangla ? 'প্রাণীর ধরন (Species)' : 'Species Preference'}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'any', labelBn: 'যেকোনো', labelEn: 'Any', emoji: '🐾' },
              { id: 'dog', labelBn: 'কুকুর', labelEn: 'Dog', emoji: '🐶' },
              { id: 'cat', labelBn: 'বিড়াল', labelEn: 'Cat', emoji: '🐱' },
            ].map((sp) => (
              <button
                key={sp.id}
                type="button"
                onClick={() => setSpecies(sp.id as any)}
                className={`p-2.5 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                  species === sp.id
                    ? 'border-primary bg-primary/10 text-primary font-bold'
                    : 'border-border bg-card text-foreground hover:border-primary/40'
                }`}
              >
                <span>{sp.emoji}</span>
                <span>{isBangla ? sp.labelBn : sp.labelEn}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Gender Selection */}
        <div>
          <label className="text-xs font-semibold text-foreground block mb-1.5">
            {isBangla ? 'পছন্দের লিঙ্গ (Gender)' : 'Preferred Gender'}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'any', labelBn: 'যেকোনো', labelEn: 'Any' },
              { id: 'male', labelBn: 'পুরুষ (Male)', labelEn: 'Male' },
              { id: 'female', labelBn: 'স্ত্রী (Female)', labelEn: 'Female' },
            ].map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => setPreferredGender(g.id as any)}
                className={`p-2 rounded-xl border text-xs font-medium text-center transition-colors ${
                  preferredGender === g.id
                    ? 'border-primary bg-primary/10 text-primary font-bold'
                    : 'border-border bg-card text-foreground hover:border-primary/40'
                }`}
              >
                {isBangla ? g.labelBn : g.labelEn}
              </button>
            ))}
          </div>
        </div>

        {/* Age Group */}
        <div>
          <label className="text-xs font-semibold text-foreground block mb-1.5">
            {isBangla ? 'বয়সসীমা (Age Group)' : 'Age Group'}
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {[
              { id: 'any', labelBn: 'সকল', labelEn: 'All' },
              { id: 'baby', labelBn: 'ছানা (<৬ মাস)', labelEn: 'Baby (<6m)' },
              { id: 'young', labelBn: 'তরুণ (৬-২৩ মাস)', labelEn: 'Young (6-23m)' },
              { id: 'adult', labelBn: 'প্রাপ্তবয়স্ক (২+ বছর)', labelEn: 'Adult (2+ yrs)' },
            ].map((ag) => (
              <button
                key={ag.id}
                type="button"
                onClick={() => setAgeGroup(ag.id as any)}
                className={`p-2 rounded-xl border text-[11px] font-medium text-center transition-colors ${
                  ageGroup === ag.id
                    ? 'border-primary bg-primary/10 text-primary font-bold'
                    : 'border-border bg-card text-foreground hover:border-primary/40'
                }`}
              >
                {isBangla ? ag.labelBn : ag.labelEn}
              </button>
            ))}
          </div>
        </div>

        {/* District */}
        <div>
          <label className="text-xs font-semibold text-foreground block mb-1">
            {isBangla ? 'পছন্দের জেলা (District)' : 'Preferred District'}
          </label>
          <select
            value={districtId ?? ''}
            onChange={(e) => setDistrictId(e.target.value ? Number(e.target.value) : null)}
            className="w-full p-2.5 bg-card border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">{isBangla ? 'সকল জেলা (দেশজুড়ে)' : 'All Districts (Nationwide)'}</option>
            {Object.entries(DISTRICT_MAP).map(([id, d]) => (
              <option key={id} value={id}>
                {isBangla ? d.bn : d.en}
              </option>
            ))}
          </select>
        </div>

        {/* Home Type */}
        <div>
          <label className="text-xs font-semibold text-foreground block mb-1">
            {isBangla ? 'বাসস্থানের ধরন (Housing)' : 'Housing Type'}
          </label>
          <select
            value={homeType}
            onChange={(e) => setHomeType(e.target.value as any)}
            className="w-full p-2.5 bg-card border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="own_flat">{isBangla ? 'নিজের ফ্ল্যাট' : 'Own Flat'}</option>
            <option value="rented_flat">{isBangla ? 'ভাড়া ফ্ল্যাট' : 'Rented Flat'}</option>
            <option value="own_house">{isBangla ? 'নিজের বাড়ি (বাগান সহ)' : 'Own House (with yard)'}</option>
            <option value="rented_house">{isBangla ? 'ভাড়া বাড়ি' : 'Rented House'}</option>
            <option value="other">{isBangla ? 'অন্যান্য' : 'Other'}</option>
          </select>
        </div>

        {/* Health & Household Checkboxes */}
        <div className="space-y-2 pt-2 border-t border-border/40">
          <label className="flex items-center gap-2 cursor-pointer text-xs text-foreground">
            <input
              type="checkbox"
              checked={wantsVaccinated}
              onChange={(e) => setWantsVaccinated(e.target.checked)}
              className="rounded border-border text-primary focus:ring-primary"
            />
            <span>{isBangla ? '💉 শুধুমাত্র ভ্যাকসিনেটেড প্রাণী প্রাধান্য দিন' : 'Prefer vaccinated pets'}</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-xs text-foreground">
            <input
              type="checkbox"
              checked={wantsNeutered}
              onChange={(e) => setWantsNeutered(e.target.checked)}
              className="rounded border-border text-primary focus:ring-primary"
            />
            <span>{isBangla ? '✂️ শুধুমাত্র নিউটার্ড (বন্ধ্যাকরণকৃত) প্রাণী প্রাধান্য দিন' : 'Prefer spayed/neutered pets'}</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-xs text-foreground">
            <input
              type="checkbox"
              checked={hasOtherPets}
              onChange={(e) => setHasOtherPets(e.target.checked)}
              className="rounded border-border text-primary focus:ring-primary"
            />
            <span>{isBangla ? '🐾 বাড়িতে ইতিমধ্যে অন্য পোষা প্রাণী আছে' : 'I already have other pets at home'}</span>
          </label>
        </div>

        {/* Form Actions */}
        <div className="pt-4 border-t border-border flex items-center justify-end gap-2">
          <Button variant="ghost" size="sm" type="button" onClick={onClose}>
            {isBangla ? 'বাতিল' : 'Cancel'}
          </Button>
          <Button variant="primary" size="sm" type="submit" isLoading={isSaving}>
            {isBangla ? 'পছন্দ সংরক্ষণ করুন' : 'Save & Match'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
