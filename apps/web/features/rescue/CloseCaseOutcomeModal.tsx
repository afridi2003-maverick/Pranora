'use client';

import React, { useState } from 'react';
import { useLocale } from '@pranora/i18n';
import { Modal, Button, Textarea, Input } from '@pranora/ui';
import type { RescueOutcome } from '@pranora/types';

interface CloseCaseOutcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseId: string;
  animalSpecies?: string;
  isLostReport?: boolean;
  onSubmit: (payload: {
    case_id: string;
    outcome: RescueOutcome;
    note?: string | null;
    pet_id?: string | null;
  }) => Promise<{ error?: string; success?: boolean }>;
  isSubmitting?: boolean;
}

export const RESCUE_OUTCOME_OPTIONS: {
  id: RescueOutcome;
  bn: string;
  en: string;
  icon: string;
  descriptionBn: string;
  descriptionEn: string;
}[] = [
  {
    id: 'treated',
    bn: 'চিকিৎসাপ্রাপ্ত ও সুস্থ',
    en: 'Treated & Recovered',
    icon: '🩺',
    descriptionBn: 'পশু হাসপাতালে চিকিৎসা ও ড্রেসিং সম্পন্ন হয়েছে।',
    descriptionEn: 'Medical treatment and stabilization complete.',
  },
  {
    id: 'sent_to_shelter',
    bn: 'শেল্টারে স্থানান্তর',
    en: 'Sent to Shelter',
    icon: '🏛️',
    descriptionBn: 'দীর্ঘমেয়াদী আশ্রয়ের জন্য রেজিস্টার্ড শেল্টারে নেওয়া হয়েছে।',
    descriptionEn: 'Transferred to verified animal shelter for care.',
  },
  {
    id: 'returned_to_owner',
    bn: 'মালিকের কাছে হস্তান্তর (পুনর্মিলন)',
    en: 'Returned to Owner',
    icon: '🤝',
    descriptionBn: 'হারিয়ে যাওয়া পোষা প্রাণীকে তার আসল অভিভাবকের কাছে ফিরিয়ে দেওয়া হয়েছে।',
    descriptionEn: 'Lost pet successfully reunited with registered owner.',
  },
  {
    id: 'adopted',
    bn: 'সরাসরি দত্তক সম্পন্ন',
    en: 'Adopted on Site',
    icon: '🏠',
    descriptionBn: 'ঘটনাস্থল বা ক্লিনিক থেকে আগ্রহী পরিবারে দত্তক হস্তান্তর সম্পন্ন।',
    descriptionEn: 'Direct adoption completed with approved family.',
  },
  {
    id: 'released',
    bn: 'প্রাকৃতিক পরিবেশে অবমুক্ত',
    en: 'Released to Habitat',
    icon: '🌿',
    descriptionBn: 'সুস্থ হওয়ার পর নিরাপদ প্রাকৃতিক এলাকায় মুক্ত করা হয়েছে।',
    descriptionEn: 'Released safely back into natural habitat.',
  },
  {
    id: 'died',
    bn: 'চিকিৎসাধীন অবস্থায় মৃত',
    en: 'Deceased',
    icon: '🕊️',
    descriptionBn: 'গুরুতর আঘাত বা অসুস্থতার কারণে প্রাণীটি মারা গেছে।',
    descriptionEn: 'Succumbed to severe injuries or illness despite care.',
  },
  {
    id: 'not_found',
    bn: 'ঘটনাস্থলে পাওয়া যায়নি',
    en: 'Not Found at Location',
    icon: '❓',
    descriptionBn: 'উদ্ধারকারী দল এলাকায় তল্লাশি চালিয়েও প্রাণীর সন্ধান পায়নি।',
    descriptionEn: 'Animal could not be located after extensive on-site search.',
  },
  {
    id: 'other',
    bn: 'অন্যান্য ফলাফল',
    en: 'Other Outcome',
    icon: '📝',
    descriptionBn: 'বিশেষ বা অনুল্লিখিত কোনো পরিস্থিতি।',
    descriptionEn: 'Other outcome or operational conclusion.',
  },
];

export function CloseCaseOutcomeModal({
  isOpen,
  onClose,
  caseId,
  animalSpecies,
  isLostReport = false,
  onSubmit,
  isSubmitting = false,
}: CloseCaseOutcomeModalProps) {
  const { isBangla } = useLocale();

  // If report was lost/found, default to 'returned_to_owner', otherwise 'treated'
  const [selectedOutcome, setSelectedOutcome] = useState<RescueOutcome>(
    isLostReport ? 'returned_to_owner' : 'treated'
  );
  const [note, setNote] = useState('');
  const [petId, setPetId] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const payload = {
      case_id: caseId,
      outcome: selectedOutcome,
      note: note.trim() || null,
      pet_id: petId.trim() || null,
    };

    const res = await onSubmit(payload);
    if (res.error) {
      setErrorMessage(res.error);
    } else {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isBangla ? 'কেস সমাপ্তি ও ফলাফল রেকর্ড করুন' : 'Record Outcome & Close Case'}
    >
      <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
        {/* Context Note */}
        <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-stroke-subtle text-xs">
          <p className="font-semibold text-foreground">
            {isBangla ? 'কেস আইডি: ' : 'Case ID: '}
            <span className="font-mono">{caseId}</span>
            {animalSpecies && ` (${animalSpecies})`}
          </p>
          <p className="text-neutral-500 mt-0.5">
            {isBangla
              ? 'কেস সম্পন্ন করার জন্য অবশ্যই একটি চূড়ান্ত ফলাফল নির্বাচন করতে হবে।'
              : 'Closing a rescue case strictly requires recording a definitive outcome.'}
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
            {errorMessage}
          </div>
        )}

        {/* Outcome Selector */}
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            {isBangla ? 'উদ্ধার ফলাফল নির্বাচন করুন' : 'Select Final Outcome'} *
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
            {RESCUE_OUTCOME_OPTIONS.map((opt) => {
              const isSelected = selectedOutcome === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSelectedOutcome(opt.id)}
                  className={`p-2.5 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                    isSelected
                      ? 'border-primary bg-primary/5 ring-2 ring-primary/20 text-foreground font-semibold'
                      : 'border-stroke-subtle hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                  }`}
                >
                  <span className="text-xl flex-shrink-0">{opt.icon}</span>
                  <div>
                    <span className="text-xs font-bold block">
                      {isBangla ? opt.bn : opt.en}
                    </span>
                    <span className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-tight block mt-0.5">
                      {isBangla ? opt.descriptionBn : opt.descriptionEn}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Outcome Note */}
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">
            {isBangla ? 'সমাপ্তি বিবরণ / নোট' : 'Closing Notes / Medical Summary'}
          </label>
          <Textarea
            rows={3}
            placeholder={
              isBangla
                ? 'চিকিৎসা বিবরণ, প্রেসক্রিপশন, আশ্রয়দাতার তথ্য বা পুনর্মিলন প্রক্রিয়া লিখুন...'
                : 'Medical treatment summary, clinic notes, shelter details, or owner handover...'
            }
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        {/* Optional Pet ID Link (PET-5 integration) */}
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">
            {isBangla ? 'সংযুক্ত পোষা প্রাণীর প্রোফাইল আইডি (ঐচ্ছিক)' : 'Linked Pet Profile ID (Optional)'}
          </label>
          <Input
            placeholder={isBangla ? 'যেমন: pet-uuid' : 'e.g. pet-uuid if created in PET-5'}
            value={petId}
            onChange={(e) => setPetId(e.target.value)}
          />
          <p className="text-[11px] text-neutral-400 mt-1">
            {isBangla
              ? 'প্রাণীটির জন্য স্থায়ী পেট প্রোফাইল তৈরি থাকলে তা কেসে লিঙ্ক করতে পারেন।'
              : 'Link a newly registered pet profile for ongoing healthcare or adoption listing.'}
          </p>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-2 pt-3 border-t border-stroke-subtle">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting}>
            {isBangla ? 'বাতিল' : 'Cancel'}
          </Button>
          <Button variant="danger" size="sm" type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? isBangla ? 'সম্পন্ন হচ্ছে...' : 'Closing Case...'
              : isBangla ? 'কেস সম্পন্ন নিশ্চিত করুন' : 'Confirm & Close Case'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
