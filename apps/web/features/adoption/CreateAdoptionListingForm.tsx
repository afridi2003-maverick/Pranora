'use client';

import React, { useState } from 'react';
import { useLocale } from '@pranora/i18n';
import { Card, Button, Input } from '@pranora/ui';
import type { CreateListingPayload } from '@pranora/api';
import type { SpeciesType, PetGender } from '@pranora/types';
import {
  DISTRICT_MAP,
  MOCK_ELIGIBLE_PETS,
  type EligiblePetForAdoption,
} from './mockData';

interface CreateAdoptionListingFormProps {
  isApprovedLister?: boolean;
  userRole?: 'shelter' | 'adoption_lister' | 'admin' | 'owner';
  shelterId?: string | null;
  pets?: EligiblePetForAdoption[];
  onSubmitListing?: (payload: CreateListingPayload) => Promise<{ success: boolean; error?: string }>;
  onCancel?: () => void;
}

export function CreateAdoptionListingForm({
  isApprovedLister = true,
  userRole = 'shelter',
  shelterId = null,
  pets = MOCK_ELIGIBLE_PETS,
  onSubmitListing,
  onCancel,
}: CreateAdoptionListingFormProps) {
  const { isBangla } = useLocale();

  const [selectedPetId, setSelectedPetId] = useState<string>('');
  const [species, setSpecies] = useState<SpeciesType>('dog');
  const [gender, setGender] = useState<PetGender>('unknown');
  const [ageMonths, setAgeMonths] = useState<number | ''>('');
  const [titleBn, setTitleBn] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [descriptionBn, setDescriptionBn] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [districtId, setDistrictId] = useState<number>(1);
  const [areaText, setAreaText] = useState('');
  const [isVaccinated, setIsVaccinated] = useState(false);
  const [isNeutered, setIsNeutered] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [isStrippingExif, setIsStrippingExif] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Auto-populate when a pet profile is picked
  const handleSelectPet = (pet: EligiblePetForAdoption) => {
    if (pet.has_active_listing) return;

    setSelectedPetId(pet.id);
    setSpecies(pet.species);
    setGender(pet.gender);
    setAgeMonths(pet.age_months);
    setIsVaccinated(pet.is_vaccinated);
    setIsNeutered(pet.is_neutered);

    if (pet.photo_url) {
      setPhotos((prev) => (prev.includes(pet.photo_url!) ? prev : [pet.photo_url!, ...prev]));
    }

    const speciesBn = pet.species === 'dog' ? 'কুকুর' : pet.species === 'cat' ? 'বিড়াল' : 'প্রাণী';
    const speciesEn = pet.species.charAt(0).toUpperCase() + pet.species.slice(1);

    if (!titleBn) {
      setTitleBn(`${pet.name} - চমৎকার ${speciesBn} দত্তকের জন্য প্রস্তুত`);
    }
    if (!titleEn) {
      setTitleEn(`${pet.name} - Loving ${speciesEn} looking for a forever home`);
    }
  };

  // Canvas-based on-device EXIF stripper for privacy
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsStrippingExif(true);

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            // Export pure image pixels without EXIF metadata
            const cleanDataUrl = canvas.toDataURL('image/jpeg', 0.85);
            setPhotos((prev) => [...prev, cleanDataUrl]);
          }
          setIsStrippingExif(false);
        };
        img.src = loadEvent.target?.result as string;
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (targetStatus: 'available' | 'draft') => {
    setStatusMessage(null);

    if (!selectedPetId) {
      setStatusMessage({
        type: 'error',
        text: isBangla ? 'অনুগ্রহ করে একটি পোষা প্রাণীর প্রোফাইল বেছে নিন' : 'Please select a pet profile',
      });
      return;
    }

    if (!districtId) {
      setStatusMessage({
        type: 'error',
        text: isBangla ? 'অনুগ্রহ করে জেলা নির্বাচন করুন' : 'Please select a district',
      });
      return;
    }

    const payload: CreateListingPayload = {
      pet_id: selectedPetId,
      shelter_id: shelterId,
      species,
      gender,
      age_months: ageMonths === '' ? null : Number(ageMonths),
      title_bn: titleBn.trim() || null,
      title_en: titleEn.trim() || null,
      description_bn: descriptionBn.trim() || null,
      description_en: descriptionEn.trim() || null,
      photos,
      is_vaccinated: isVaccinated,
      is_neutered: isNeutered,
      district_id: districtId,
      status: targetStatus,
    };

    setIsSubmitting(true);
    try {
      if (onSubmitListing) {
        const res = await onSubmitListing(payload);
        if (!res.success) {
          setStatusMessage({
            type: 'error',
            text: res.error || (isBangla ? 'তালিকা তৈরি করা যায়নি' : 'Failed to create listing'),
          });
          return;
        }
      }

      setStatusMessage({
        type: 'success',
        text:
          targetStatus === 'available'
            ? isBangla
              ? '✅ দত্তক তালিকা সফলভাবে প্রকাশিত হয়েছে!'
              : '✅ Adoption listing published successfully!'
            : isBangla
            ? '💾 দত্তক তালিকা খসড়া হিসেবে সংরক্ষিত হয়েছে!'
            : '💾 Adoption listing saved as draft!',
      });
    } catch {
      setStatusMessage({
        type: 'error',
        text: isBangla ? 'সার্ভারে সমস্যা হয়েছে' : 'Server error occurred',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* 1. Lister Verification Status Banner */}
      <Card
        className={`p-4 border ${
          isApprovedLister
            ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100'
            : 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-100'
        }`}
      >
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">{isApprovedLister ? '🛡️' : '⚠️'}</span>
            <div>
              <p className="font-semibold text-sm">
                {isApprovedLister
                  ? isBangla
                    ? `অনুমোদিত লিস্টার প্রোফাইল (${userRole === 'shelter' ? 'ভেরিফাইড আশ্রয়কেন্দ্র' : 'অনুমোদিত ব্যক্তি'})`
                    : `Approved Lister Profile (${userRole === 'shelter' ? 'Verified Shelter' : 'Approved Individual'})`
                  : isBangla
                  ? 'দত্তক তালিকা তৈরির অনুমোদন প্রয়োজন'
                  : 'Lister Approval Required'}
              </p>
              <p className="text-xs opacity-80">
                {isApprovedLister
                  ? isBangla
                    ? 'ভুয়া ও অননুমোদিত কেনাবেচা রোধে কেবল যাচাইকৃত প্রোফাইল দত্তকের জন্য তালিকাভুক্ত করতে পারে।'
                    : 'Only verified shelters and approved individuals can publish listings to prevent illicit breeding.'
                  : isBangla
                  ? 'দত্তক তালিকা পোস্ট করার জন্য আপনার প্রোফাইলটি ভেরিফাইড আশ্রয়কেন্দ্র বা লিস্টার হিসেবে অনুমোদিত হতে হবে।'
                  : 'You must have a verified shelter or approved adoption lister role to publish listings.'}
              </p>
            </div>
          </div>
          <span
            className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase ${
              isApprovedLister
                ? 'bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100'
                : 'bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100'
            }`}
          >
            {isApprovedLister
              ? isBangla ? 'অনুমোদিত' : 'Verified'
              : isBangla ? 'অপেক্ষমাণ' : 'Pending'}
          </span>
        </div>
      </Card>

      {/* 2. Step 1: Select Pet Profile */}
      <Card className="p-6 bg-white dark:bg-neutral-900 border-stroke-subtle shadow-sm space-y-4">
        <div>
          <h2 className="text-lg font-bold text-foreground">
            {isBangla ? '১. পোষা প্রাণীর প্রোফাইল নির্বাচন করুন (ADP-2)' : '1. Select Pet Profile (ADP-2)'}
          </h2>
          <p className="text-sm text-foreground-secondary">
            {isBangla
              ? 'প্রাণীর বিদ্যমান প্রোফাইল বেছে নিন। তথ্য স্বয়ংক্রিয়ভাবে যুক্ত হবে।'
              : 'Choose an existing pet profile to auto-populate species, age, and photos.'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {pets.map((pet) => {
            const isSelected = selectedPetId === pet.id;
            return (
              <div
                key={pet.id}
                onClick={() => handleSelectPet(pet)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative ${
                  pet.has_active_listing
                    ? 'opacity-50 cursor-not-allowed bg-neutral-100 dark:bg-neutral-800 border-neutral-300'
                    : isSelected
                    ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-sm ring-2 ring-emerald-500/20'
                    : 'border-stroke-subtle hover:border-neutral-400 bg-white dark:bg-neutral-900'
                }`}
              >
                {pet.photo_url && (
                  <img
                    src={pet.photo_url}
                    alt={pet.name}
                    className="w-full h-28 object-cover rounded-lg mb-2"
                  />
                )}
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-foreground">{pet.name}</h3>
                  <span className="text-xs capitalize font-medium text-foreground-secondary">
                    {pet.species}
                  </span>
                </div>
                <p className="text-xs text-foreground-secondary mt-0.5">
                  {pet.age_months} {isBangla ? 'মাস' : 'months'} · {pet.gender}
                </p>
                {pet.has_active_listing && (
                  <span className="inline-block mt-1 text-[10px] font-bold text-amber-700 dark:text-amber-400">
                    {isBangla ? 'ইতিমধ্যে তালিকাভুক্ত' : 'Already Listed'}
                  </span>
                )}
                {isSelected && (
                  <span className="absolute top-2 right-2 bg-emerald-600 text-white rounded-full p-1 text-xs">
                    ✓
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* 3. Step 2: Listing Details */}
      <Card className="p-6 bg-white dark:bg-neutral-900 border-stroke-subtle shadow-sm space-y-4">
        <div>
          <h2 className="text-lg font-bold text-foreground">
            {isBangla ? '২. তালিকার বিবরণ (দ্বিভাষিক)' : '2. Listing Details (Bilingual)'}
          </h2>
          <p className="text-sm text-foreground-secondary">
            {isBangla
              ? 'বাংলা ও ইংরেজিতে শিরোনাম এবং বিস্তারিত তথ্য দিন।'
              : 'Provide titles and detailed descriptions in Bangla and English.'}
          </p>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              {isBangla ? 'শিরোনাম (বাংলা)' : 'Title (Bangla)'}
            </label>
            <Input
              value={titleBn}
              onChange={(e) => setTitleBn(e.target.value)}
              placeholder="যেমন: টফি - শান্ত ও আদুরে ছানা"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              {isBangla ? 'শিরোনাম (ইংরেজি)' : 'Title (English)'}
            </label>
            <Input
              value={titleEn}
              onChange={(e) => setTitleEn(e.target.value)}
              placeholder="e.g. Toffee - Gentle & Playful Deshi Pup"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              {isBangla ? 'বিবরণ (বাংলা)' : 'Description (Bangla)'}
            </label>
            <textarea
              rows={3}
              className="w-full px-3 py-2 text-sm rounded-lg border border-stroke-subtle bg-transparent text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={descriptionBn}
              onChange={(e) => setDescriptionBn(e.target.value)}
              placeholder="প্রাণীটির স্বভাব, খাদ্যভ্যাস, আচরণ ও পরিবারের প্রয়োজনীয়তা..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              {isBangla ? 'বিবরণ (ইংরেজি)' : 'Description (English)'}
            </label>
            <textarea
              rows={3}
              className="w-full px-3 py-2 text-sm rounded-lg border border-stroke-subtle bg-transparent text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={descriptionEn}
              onChange={(e) => setDescriptionEn(e.target.value)}
              placeholder="Temperament, habits, friendly with kids/other pets..."
            />
          </div>
        </div>
      </Card>

      {/* 4. Step 3: Location & Health Details */}
      <Card className="p-6 bg-white dark:bg-neutral-900 border-stroke-subtle shadow-sm space-y-4">
        <div>
          <h2 className="text-lg font-bold text-foreground">
            {isBangla ? '৩. এলাকা ও স্বাস্থ্য তথ্য' : '3. Area & Health Information'}
          </h2>
          <p className="text-xs text-foreground-secondary">
            {isBangla
              ? 'নিরাপত্তার স্বার্থে কেবল জেলা ও এলাকা উল্লেখ করুন (বাড়ির সুনির্দিষ্ট ঠিকানা প্রকাশ করবেন না)।'
              : 'For animal safety, only mention district & general area. No exact street addresses.'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              {isBangla ? 'জেলা / District *' : 'District *'}
            </label>
            <select
              value={districtId}
              onChange={(e) => setDistrictId(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm rounded-lg border border-stroke-subtle bg-white dark:bg-neutral-800 text-foreground"
            >
              {Object.entries(DISTRICT_MAP).map(([id, names]) => (
                <option key={id} value={id}>
                  {isBangla ? names.bn : names.en}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              {isBangla ? 'এলাকা / পাড়া (ঐচ্ছিক)' : 'Area / Neighborhood (Optional)'}
            </label>
            <Input
              value={areaText}
              onChange={(e) => setAreaText(e.target.value)}
              placeholder={isBangla ? 'যেমন: ধানমন্ডি, মিরপুর' : 'e.g. Dhanmondi, Mirpur'}
            />
          </div>
        </div>

        <div className="flex items-center gap-6 pt-2">
          <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-foreground">
            <input
              type="checkbox"
              checked={isVaccinated}
              onChange={(e) => setIsVaccinated(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded"
            />
            <span>💉 {isBangla ? 'ভ্যাকসিন দেওয়া আছে' : 'Vaccinated'}</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-foreground">
            <input
              type="checkbox"
              checked={isNeutered}
              onChange={(e) => setIsNeutered(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded"
            />
            <span>✂️ {isBangla ? 'নিউটার্ড / স্পেড' : 'Neutered / Spayed'}</span>
          </label>
        </div>
      </Card>

      {/* 5. Step 4: Photos with EXIF Stripping */}
      <Card className="p-6 bg-white dark:bg-neutral-900 border-stroke-subtle shadow-sm space-y-4">
        <div>
          <h2 className="text-lg font-bold text-foreground">
            {isBangla ? '৪. ছবি (EXIF ডাটা স্বয়ংক্রিয়ভাবে অপসারিত)' : '4. Photos (EXIF Stripped)'}
          </h2>
          <p className="text-xs text-foreground-secondary">
            {isBangla
              ? 'ক্যানভাস প্রক্রিয়াকরণের মাধ্যমে ডিভাইসেই ছবির জিপিএস ও মেটাডাটা মুছে ফেলা হয়।'
              : 'GPS coordinates and device metadata are stripped on-device via Canvas before upload.'}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {photos.map((src, idx) => (
            <div key={idx} className="relative w-24 h-24 rounded-lg overflow-hidden border border-stroke-subtle">
              <img src={src} alt="Pet photo" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => handleRemovePhoto(idx)}
                className="absolute top-1 right-1 bg-black/70 hover:bg-black text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>
          ))}

          <label className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-stroke-subtle rounded-lg cursor-pointer hover:border-emerald-500 text-foreground-secondary hover:text-emerald-600">
            <span className="text-2xl">+</span>
            <span className="text-[10px] mt-1 font-semibold">
              {isStrippingExif
                ? isBangla ? 'প্রসেসিং...' : 'Stripping...'
                : isBangla ? 'ছবি যোগ করুন' : 'Add Photo'}
            </span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoUpload}
              className="hidden"
            />
          </label>
        </div>
      </Card>

      {/* Status Feedback */}
      {statusMessage && (
        <div
          className={`p-3 rounded-lg text-sm font-semibold ${
            statusMessage.type === 'success'
              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
              : 'bg-rose-100 text-rose-900 border border-rose-300'
          }`}
        >
          {statusMessage.text}
        </div>
      )}

      {/* 6. Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-2">
        {onCancel && (
          <Button variant="ghost" onClick={onCancel} disabled={isSubmitting}>
            {isBangla ? 'বাতিল' : 'Cancel'}
          </Button>
        )}

        <Button
          variant="secondary"
          onClick={() => handleSubmit('draft')}
          disabled={isSubmitting || !isApprovedLister}
        >
          {isBangla ? 'খসড়া সংরক্ষণ করুন' : 'Save as Draft'}
        </Button>

        <Button
          variant="primary"
          onClick={() => handleSubmit('available')}
          disabled={isSubmitting || !isApprovedLister}
        >
          {isSubmitting
            ? isBangla ? 'প্রকাশ করা হচ্ছে...' : 'Publishing...'
            : isBangla ? 'তালিকা প্রকাশ করুন' : 'Publish Listing'}
        </Button>
      </div>
    </div>
  );
}
