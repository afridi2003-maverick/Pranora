'use client';

import React, { useState } from 'react';
import { useLocale } from '@pranora/i18n';
import { Button, Textarea, Card } from '@pranora/ui';
import type { RescueStatus } from '@pranora/types';

interface AddCaseUpdateFormProps {
  caseId: string;
  currentStatus: RescueStatus;
  onSubmit: (payload: {
    case_id: string;
    note?: string | null;
    status?: RescueStatus | null;
    photos?: string[];
  }) => Promise<{ error?: string }>;
  isSubmitting?: boolean;
}

const STATUS_TRANSITIONS: { id: RescueStatus | 'keep'; bn: string; en: string }[] = [
  { id: 'keep', bn: 'বর্তমান অবস্থা অপরিবর্তিত রাখুন', en: 'Keep Current Status' },
  { id: 'rescue_in_progress', bn: 'উদ্ধার চলছে (Rescue in Progress)', en: 'Rescue in Progress' },
  { id: 'under_review', bn: 'পুনর্বিবেচনা প্রয়োজন (Under Review)', en: 'Needs Re-evaluation' },
  { id: 'closed', bn: 'কেস সম্পন্ন (Close Case)', en: 'Closed / Concluded' },
];

export function AddCaseUpdateForm({
  caseId,
  currentStatus: _currentStatus,
  onSubmit,
  isSubmitting = false,
}: AddCaseUpdateFormProps) {
  const { isBangla } = useLocale();

  const [note, setNote] = useState('');
  const [targetStatus, setTargetStatus] = useState<RescueStatus | 'keep'>('keep');
  const [photos, setPhotos] = useState<string[]>([]);
  const [isStrippingExif, setIsStrippingExif] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Client-side canvas EXIF stripping
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsStrippingExif(true);
    const cleanUrls: string[] = [];

    for (let i = 0; i < Math.min(files.length, 4 - photos.length); i++) {
      const file = files[i];
      if (!file) continue;

      try {
        const cleanUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
              const canvas = document.createElement('canvas');
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
              ctx.drawImage(img, 0, 0, width, height);
              resolve(canvas.toDataURL('image/jpeg', 0.85));
            };
            img.onerror = reject;
            img.src = event.target?.result as string;
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        cleanUrls.push(cleanUrl);
      } catch (err) {
        console.error('EXIF stripping error:', err);
      }
    }

    setPhotos((prev) => [...prev, ...cleanUrls].slice(0, 4));
    setIsStrippingExif(false);
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!note.trim() && photos.length === 0 && targetStatus === 'keep') {
      setErrorMessage(
        isBangla
          ? 'অনুগ্রহ করে একটি নোট, ছবি অথবা অবস্থার পরিবর্তন প্রদান করুন।'
          : 'Please provide a note, photo, or status change.'
      );
      return;
    }

    const payload = {
      case_id: caseId,
      note: note.trim() || null,
      status: targetStatus === 'keep' ? null : targetStatus,
      photos,
    };

    const res = await onSubmit(payload);
    if (res.error) {
      setErrorMessage(res.error);
    } else {
      setNote('');
      setPhotos([]);
      setTargetStatus('keep');
      setSuccessMessage(
        isBangla ? 'আপডেটটি সফলভাবে যুক্ত হয়েছে!' : 'Case update posted successfully!'
      );
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  return (
    <Card className="p-5 bg-white dark:bg-neutral-900 border-stroke-subtle shadow-sm">
      <h3 className="text-base font-bold text-foreground mb-1 flex items-center gap-2">
        <span>✍️</span> {isBangla ? 'নতুন কেস আপডেট ও অগ্রগতি লিখুন' : 'Post Case Progress Update'}
      </h3>
      <p className="text-xs text-neutral-500 mb-4">
        {isBangla
          ? 'উদ্ধার কাজের অগ্রগতি, চিকিৎসকের পরামর্শ বা অবস্থার পরিবর্তন টাইমলাইনে রেকর্ড করুন।'
          : 'Record on-site treatment, transfer details, or status changes on the official timeline.'}
      </p>

      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs mb-4">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="p-3 bg-green-50 border border-green-200 text-green-800 rounded-lg text-xs mb-4">
          ✓ {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Note Textarea */}
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">
            {isBangla ? 'আপডেট নোট / বিবরণ' : 'Progress Note / Observation'}
          </label>
          <Textarea
            rows={3}
            placeholder={
              isBangla
                ? 'যেমন: প্রাণীটিকে উদ্ধার করে প্রাথমিক চিকিৎসা প্রদান করা হয়েছে। এখন হাসপাতালে নেওয়ার প্রস্তুতি চলছে...'
                : 'e.g. Animal stabilized with on-site first aid. En route to Central Vet Hospital...'
            }
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        {/* Status Transition Selector */}
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">
            {isBangla ? 'অবস্থা পরিবর্তন (ঐচ্ছিক)' : 'Update Case Status (Optional)'}
          </label>
          <select
            value={targetStatus}
            onChange={(e) => setTargetStatus(e.target.value as RescueStatus | 'keep')}
            className="w-full px-3 py-2 border border-stroke-subtle rounded-lg bg-white dark:bg-neutral-900 text-foreground text-sm"
          >
            {STATUS_TRANSITIONS.map((s) => (
              <option key={s.id} value={s.id}>
                {isBangla ? s.bn : s.en}
              </option>
            ))}
          </select>
        </div>

        {/* Photos Upload with EXIF Strip */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-semibold text-foreground">
              {isBangla ? 'ছবি যুক্ত করুন (সর্বোচ্চ ৪টি)' : 'Attach Photos (Max 4)'}
            </label>
            <span className="text-[11px] text-green-700 font-medium">
              🔒 {isBangla ? 'EXIF/GPS স্বয়ংক্রিয়ভাবে সরানো হয়' : 'EXIF Stripped'}
            </span>
          </div>

          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handlePhotoUpload}
            disabled={photos.length >= 4 || isStrippingExif}
            className="block w-full text-xs text-neutral-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
          />

          {isStrippingExif && (
            <p className="text-xs text-amber-600 mt-1">
              {isBangla ? 'ছবি প্রসেসিং হচ্ছে...' : 'Processing photos...'}
            </p>
          )}

          {photos.length > 0 && (
            <div className="grid grid-cols-4 gap-2 mt-2">
              {photos.map((src, idx) => (
                <div key={idx} className="relative rounded-lg overflow-hidden aspect-square border border-stroke-subtle">
                  <img src={src} alt="Update Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(idx)}
                    className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-2 border-t border-stroke-subtle">
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting || isStrippingExif}
          >
            {isSubmitting
              ? isBangla ? 'সংরক্ষণ হচ্ছে...' : 'Posting...'
              : isBangla ? 'আপডেট পোস্ট করুন' : 'Post Update'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
