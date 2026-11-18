'use client';

import React, { useState } from 'react';
import { useLocale } from '@pranora/i18n';
import { Button, Input, Textarea, Card } from '@pranora/ui';
import {
  CreateAnimalReportSchema,
  type CreateAnimalReportInput,
  type AnimalReportKind,
  type UrgencyLevel,
} from '@pranora/validation';
import type { PetRow, CreateReportPayload } from '@pranora/api';
import type { SpeciesType } from '@pranora/types';

interface AnimalReportFormProps {
  userPets?: PetRow[];
  onSubmit: (payload: CreateReportPayload) => Promise<{ error?: string; reportId?: string }>;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

const KINDS: { id: AnimalReportKind; bn: string; en: string; icon: string }[] = [
  { id: 'injured', bn: 'আহত প্রাণী', en: 'Injured Animal', icon: '🚑' },
  { id: 'lost', bn: 'হারিয়ে যাওয়া পোষা প্রাণী', en: 'Lost Pet', icon: '🔍' },
  { id: 'found', bn: 'খুঁজে পাওয়া প্রাণী', en: 'Found Animal', icon: '🐾' },
  { id: 'abandoned', bn: 'পরিত্যক্ত প্রাণী', en: 'Abandoned Animal', icon: '📦' },
];

const URGENCIES: { id: UrgencyLevel; bn: string; en: string; color: string }[] = [
  { id: 'critical', bn: 'খুব জরুরি (গুরুতর আহত)', en: 'Critical (Severe)', color: 'bg-red-600 text-white border-red-700' },
  { id: 'high', bn: 'উচ্চ (অবিলম্বে প্রয়োজন)', en: 'High (Immediate)', color: 'bg-amber-600 text-white border-amber-700' },
  { id: 'medium', bn: 'মাঝারি', en: 'Medium', color: 'bg-green-700 text-white border-green-800' },
  { id: 'low', bn: 'কম', en: 'Low', color: 'bg-green-100 text-green-900 border-green-300' },
];

const SPECIES_LIST: { id: SpeciesType; bn: string; en: string }[] = [
  { id: 'dog', bn: 'কুকুর', en: 'Dog' },
  { id: 'cat', bn: 'বিড়াল', en: 'Cat' },
  { id: 'bird', bn: 'পাখি', en: 'Bird' },
  { id: 'rabbit', bn: 'খরগোশ', en: 'Rabbit' },
  { id: 'cow', bn: 'গরু', en: 'Cow' },
  { id: 'goat', bn: 'ছাগল', en: 'Goat' },
  { id: 'poultry', bn: 'হাঁস-মুরগি', en: 'Poultry' },
  { id: 'other', bn: 'অন্যান্য', en: 'Other' },
];

export function AnimalReportForm({
  userPets = [],
  onSubmit,
  onCancel,
  isSubmitting = false,
}: AnimalReportFormProps) {
  const { isBangla } = useLocale();

  const [kind, setKind] = useState<AnimalReportKind>('injured');
  const [urgency, setUrgency] = useState<UrgencyLevel>('medium');
  const [species, setSpecies] = useState<SpeciesType>('dog');
  const [petId, setPetId] = useState<string>('');
  const [lastSeenAt, setLastSeenAt] = useState<string>('');
  const [contactPhone, setContactPhone] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [areaText, setAreaText] = useState<string>('');
  const [districtId, setDistrictId] = useState<number>(1); // Default: Dhaka (1)
  const [latitude, setLatitude] = useState<number>(23.8103); // Default: Dhaka Center
  const [longitude, setLongitude] = useState<number>(90.4125);
  const [photos, setPhotos] = useState<string[]>([]);
  const [isStrippingExif, setIsStrippingExif] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof CreateAnimalReportInput | 'root', string>>>({});

  // Handle linking user's existing pet when report kind is 'lost'
  const handleSelectOwnPet = (selectedPetId: string) => {
    setPetId(selectedPetId);
    const chosenPet = userPets.find((p) => p.id === selectedPetId);
    if (chosenPet) {
      setSpecies(chosenPet.species);
      if (chosenPet.photo_url) {
        setPhotos((prev) => (prev.includes(chosenPet.photo_url!) ? prev : [chosenPet.photo_url!, ...prev]));
      }
    }
  };

  // Strip EXIF / GPS metadata by re-encoding image through HTML Canvas
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsStrippingExif(true);
    const cleanDataUrls: string[] = [];

    for (let i = 0; i < Math.min(files.length, 6 - photos.length); i++) {
      const file = files[i];
      if (!file) continue;
      try {
        const cleanUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
              const canvas = document.createElement('canvas');
              // Scale down image if larger than 1200px
              const maxDim = 1200;
              let width = img.width;
              let height = img.height;
              if (width > maxDim || height > maxDim) {
                if (width > height) {
                  height = Math.round((height * maxDim) / width);
                  width = maxDim;
                } else {
                  width = Math.round((width * maxDim) / height);
                  height = maxDim;
                }
              }
              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext('2d');
              if (!ctx) {
                resolve(event.target?.result as string);
                return;
              }
              // Drawing to canvas removes EXIF headers
              ctx.drawImage(img, 0, 0, width, height);
              resolve(canvas.toDataURL('image/jpeg', 0.82));
            };
            img.onerror = reject;
            img.src = event.target?.result as string;
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        cleanDataUrls.push(cleanUrl);
      } catch (err) {
        console.error('Error stripping EXIF from photo:', err);
      }
    }

    setPhotos((prev) => [...prev, ...cleanDataUrls].slice(0, 6));
    setIsStrippingExif(false);
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleGetCurrentLocation = () => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(pos.coords.latitude);
          setLongitude(pos.coords.longitude);
        },
        (err) => {
          console.warn('Geolocation denied or unavailable:', err);
        }
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const payloadToValidate: CreateAnimalReportInput = {
      kind,
      urgency,
      species,
      pet_id: kind === 'lost' && petId ? petId : null,
      last_seen_at: lastSeenAt ? new Date(lastSeenAt).toISOString() : null,
      contact_phone: contactPhone || null,
      description: description || null,
      photos,
      latitude,
      longitude,
      area_text: areaText || null,
      district_id: districtId,
      upazila_id: null,
    };

    const parseResult = CreateAnimalReportSchema.safeParse(payloadToValidate);
    if (!parseResult.success) {
      const fieldErrors: Partial<Record<keyof CreateAnimalReportInput | 'root', string>> = {};
      parseResult.error.errors.forEach((err) => {
        const fieldName = err.path[0] as keyof CreateAnimalReportInput;
        fieldErrors[fieldName] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    const res = await onSubmit({
      ...parseResult.data,
      photos: parseResult.data.photos ?? [],
    });

    if (res.error) {
      setErrors({ root: res.error });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto p-4">
      {/* Root Error */}
      {errors.root && (
        <div className="p-4 bg-red-50 border border-red-300 text-red-800 rounded-lg text-sm">
          {errors.root}
        </div>
      )}

      {/* Report Kind Selector */}
      <div>
        <label className="block text-sm font-semibold mb-2 text-foreground">
          {isBangla ? 'কী ধরনের রিপোর্ট করতে চান?' : 'What kind of report is this?'}
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {KINDS.map((k) => (
            <button
              key={k.id}
              type="button"
              onClick={() => setKind(k.id)}
              className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                kind === k.id
                  ? 'border-green-600 bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-300 font-bold ring-2 ring-green-600/20'
                  : 'border-stroke-subtle hover:bg-neutral-50 dark:hover:bg-neutral-800 text-foreground'
              }`}
            >
              <span className="text-2xl">{k.icon}</span>
              <span className="text-xs">{isBangla ? k.bn : k.en}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Urgency Level Selector */}
      <div>
        <label className="block text-sm font-semibold mb-2 text-foreground">
          {isBangla ? 'জরুরিত্ব মাত্রা' : 'Urgency Level'}
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {URGENCIES.map((u) => (
            <button
              key={u.id}
              type="button"
              onClick={() => setUrgency(u.id)}
              className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-all ${
                urgency === u.id
                  ? `${u.color} ring-2 ring-offset-1 ring-green-600`
                  : 'border-stroke-subtle bg-white dark:bg-neutral-900 text-foreground hover:bg-neutral-50'
              }`}
            >
              {isBangla ? u.bn : u.en}
            </button>
          ))}
        </div>
      </div>

      {/* Lost Pet Profile Link (Only for Lost Reports) */}
      {kind === 'lost' && userPets.length > 0 && (
        <Card className="p-4 bg-green-50/50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
          <label className="block text-sm font-semibold mb-1 text-green-900 dark:text-green-200">
            {isBangla ? 'আপনার পোষা প্রাণী নির্বাচন করুন (ঐচ্ছিক)' : 'Select Your Pet Profile (Optional)'}
          </label>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-2">
            {isBangla
              ? 'এটি নির্বাচন করলে প্রজাতি ও ছবি স্বয়ংক্রিয়ভাবে যুক্ত হবে।'
              : 'Selecting a pet auto-fills species and records from its life profile.'}
          </p>
          <select
            value={petId}
            onChange={(e) => handleSelectOwnPet(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-neutral-900 text-foreground text-sm"
          >
            <option value="">{isBangla ? '-- কোনোটি নয় --' : '-- None --'}</option>
            {userPets.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.species})
              </option>
            ))}
          </select>
        </Card>
      )}

      {/* Species Selection */}
      <div>
        <label className="block text-sm font-semibold mb-2 text-foreground">
          {isBangla ? 'প্রাণীর প্রজাতি' : 'Species'}
        </label>
        <div className="flex flex-wrap gap-2">
          {SPECIES_LIST.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSpecies(s.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                species === s.id
                  ? 'bg-green-600 text-white border-green-600'
                  : 'border-stroke-subtle bg-neutral-50 dark:bg-neutral-800 text-foreground hover:border-green-400'
              }`}
            >
              {isBangla ? s.bn : s.en}
            </button>
          ))}
        </div>
      </div>

      {/* Last Seen At (For Lost/Found) */}
      {(kind === 'lost' || kind === 'found') && (
        <div>
          <label className="block text-sm font-semibold mb-1 text-foreground">
            {isBangla ? 'সর্বশেষ কখন দেখা গেছে?' : 'Last Seen Time'}
          </label>
          <input
            type="datetime-local"
            value={lastSeenAt}
            onChange={(e) => setLastSeenAt(e.target.value)}
            className="w-full px-3 py-2 border border-stroke-subtle rounded-lg bg-white dark:bg-neutral-900 text-foreground text-sm"
          />
        </div>
      )}

      {/* Location & Area Details */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-foreground">
          {isBangla ? 'ঘটনার স্থান / এলাকা' : 'Incident Location'}
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium mb-1 text-neutral-600 dark:text-neutral-400">
              {isBangla ? 'জেলা' : 'District'}
            </label>
            <select
              value={districtId}
              onChange={(e) => setDistrictId(Number(e.target.value))}
              className="w-full px-3 py-2 border border-stroke-subtle rounded-lg bg-white dark:bg-neutral-900 text-foreground text-sm"
            >
              <option value={1}>{isBangla ? 'ঢাকা' : 'Dhaka'}</option>
              <option value={2}>{isBangla ? 'চট্টগ্রাম' : 'Chattogram'}</option>
              <option value={3}>{isBangla ? 'রাজশাহী' : 'Rajshahi'}</option>
              <option value={4}>{isBangla ? 'খুলনা' : 'Khulna'}</option>
              <option value={5}>{isBangla ? 'বরিশাল' : 'Barishal'}</option>
              <option value={6}>{isBangla ? 'সিলেট' : 'Sylhet'}</option>
              <option value={7}>{isBangla ? 'রংপুর' : 'Rangpur'}</option>
              <option value={8}>{isBangla ? 'ময়মনসিংহ' : 'Mymensingh'}</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1 text-neutral-600 dark:text-neutral-400">
              {isBangla ? 'নির্দিষ্ট এলাকা / ল্যান্ডমার্ক' : 'Specific Area / Landmark'}
            </label>
            <Input
              placeholder={isBangla ? 'যেমন: মিরপুর ১০, গোল চত্বরের উত্তর পাশে' : 'e.g. Mirpur 10, north of roundabout'}
              value={areaText}
              onChange={(e) => setAreaText(e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={handleGetCurrentLocation}>
            📍 {isBangla ? 'বর্তমান অবস্থান ব্যবহার করুন' : 'Use Current GPS Location'}
          </Button>
          <span className="text-xs text-neutral-500">
            {latitude.toFixed(4)}, {longitude.toFixed(4)}
          </span>
        </div>
      </div>

      {/* Photo Upload with EXIF-Stripping Privacy Notice */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm font-semibold text-foreground">
            {isBangla ? 'ছবি আপলোড করুন (সর্বোচ্চ ৬টি)' : 'Upload Photos (Max 6)'}
          </label>
          <span className="text-xs text-green-700 dark:text-green-400 font-medium">
            🔒 {isBangla ? 'EXIF/GPS স্বয়ংক্রিয়ভাবে সরানো হয়' : 'EXIF/GPS metadata stripped'}
          </span>
        </div>
        <p className="text-xs text-neutral-500 mb-2">
          {isBangla
            ? 'প্রাণীর অবস্থান ও আপনার গোপনীয়তা রক্ষায় ছবির অভ্যন্তরীণ মেটাডেটা স্বয়ংক্রিয়ভাবে মুছে ফেলা হবে।'
            : 'Images are re-encoded on-device to remove sensitive GPS and device metadata.'}
        </p>

        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handlePhotoUpload}
          disabled={photos.length >= 6 || isStrippingExif}
          className="block w-full text-sm text-neutral-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 dark:file:bg-green-950 dark:file:text-green-300"
        />

        {isStrippingExif && (
          <p className="text-xs text-amber-600 mt-1">
            {isBangla ? 'মেটাডেটা সরানো ও ছবি প্রসেসিং হচ্ছে...' : 'Processing and stripping metadata...'}
          </p>
        )}

        {/* Thumbnail Preview */}
        {photos.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-3">
            {photos.map((src, idx) => (
              <div key={idx} className="relative rounded-lg overflow-hidden border border-stroke-subtle aspect-square">
                <img src={src} alt="Uploaded preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removePhoto(idx)}
                  className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-black"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Contact Phone (Never Public) */}
      <div>
        <label className="block text-sm font-semibold mb-1 text-foreground">
          {isBangla ? 'জরুরি যোগাযোগের ফোন নম্বর (গোপনীয়)' : 'Emergency Contact Phone (Confidential)'}
        </label>
        <p className="text-xs text-neutral-500 mb-2">
          {isBangla
            ? 'এই নম্বরটি সর্বসাধারণের কাছে কখনো প্রকাশ করা হবে না; কেবল নিযুক্ত উদ্ধারকারী বা শেল্টার এটি দেখতে পারবে।'
            : 'This number is never public. It is shared only with verified responders.'}
        </p>
        <Input
          type="tel"
          placeholder="+8801XXXXXXXXX"
          value={contactPhone}
          onChange={(e) => setContactPhone(e.target.value)}
        />
        {errors.contact_phone && (
          <p className="text-xs text-red-600 mt-1">{errors.contact_phone}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-semibold mb-1 text-foreground">
          {isBangla ? 'বিস্তারিত বিবরণ' : 'Detailed Description'}
        </label>
        <Textarea
          rows={4}
          placeholder={
            isBangla
              ? 'প্রাণীর শারীরিক অবস্থা, আঘাতের ধরন বা কোনো বিশেষ চিহ্ন লিখুন...'
              : "Describe the animal's condition, injury, color marks, or specific identifiers..."
          }
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        {errors.description && (
          <p className="text-xs text-red-600 mt-1">{errors.description}</p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-stroke-subtle">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
            {isBangla ? 'বাতিল' : 'Cancel'}
          </Button>
        )}
        <Button type="submit" variant="primary" disabled={isSubmitting || isStrippingExif}>
          {isSubmitting
            ? isBangla ? 'জমা দেওয়া হচ্ছে...' : 'Submitting...'
            : isBangla ? 'রিপোর্ট জমা দিন' : 'Submit Report'}
        </Button>
      </div>
    </form>
  );
}
