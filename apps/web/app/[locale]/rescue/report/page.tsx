'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@pranora/i18n';
import { Button, Card } from '@pranora/ui';
import { AnimalReportForm } from '../../../../features/rescue';
import { createAnimalReport, listMyPets, type CreateReportPayload, type PetRow } from '@pranora/api';
import { useSession } from '../../../../hooks/useSession';

const MOCK_USER_PETS: PetRow[] = [
  {
    id: 'pet-001',
    owner_id: 'user-current',
    shelter_id: null,
    rescue_case_id: null,
    name: 'Milo (মাইলো)',
    species: 'dog',
    breed_id: 1,
    breed_other: null,
    gender: 'male',
    date_of_birth: '2023-01-10',
    birth_approx: false,
    weight_kg: 14.5,
    color: 'Brown & White',
    photo_url: null,
    microchip_no: '985141002345678',
    is_neutered: true,
    allergies: null,
    notes: 'Microchipped, friendly',
    public_qr_slug: 'milo-qr',
    deleted_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'pet-002',
    owner_id: 'user-current',
    shelter_id: null,
    rescue_case_id: null,
    name: 'Luna (লুনা)',
    species: 'cat',
    breed_id: 4,
    breed_other: null,
    gender: 'female',
    date_of_birth: '2023-08-15',
    birth_approx: true,
    weight_kg: 3.6,
    color: 'White',
    photo_url: null,
    microchip_no: null,
    is_neutered: false,
    allergies: null,
    notes: 'Indoor cat, ginger ears',
    public_qr_slug: 'luna-qr',
    deleted_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export default function RescueReportPage() {
  const router = useRouter();
  const { isBangla, locale } = useLocale();
  const { supabase, user, isConfigured, isAuthenticated } = useSession();
  const [pets, setPets] = useState<PetRow[]>(MOCK_USER_PETS);
  const [submittedReportId, setSubmittedReportId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isConfigured || !isAuthenticated) return;
    let active = true;
    async function loadPets() {
      const res = await listMyPets(supabase);
      if (!active || res.error || res.data.length === 0) return;
      setPets(res.data);
    }
    void loadPets();
    return () => {
      active = false;
    };
  }, [isConfigured, isAuthenticated, supabase]);

  const handleSubmit = async (payload: CreateReportPayload): Promise<{ error?: string; reportId?: string }> => {
    setIsSubmitting(true);
    try {
      if (isConfigured && isAuthenticated && user) {
        const created = await createAnimalReport(supabase, user.id, payload);
        setSubmittedReportId(created.id);
        return { reportId: created.id };
      }

      // Demo fallback when offline/unauthenticated
      await new Promise((resolve) => setTimeout(resolve, 400));
      const generatedId = `rep-${Date.now().toString(36)}`;
      setSubmittedReportId(generatedId);
      return { reportId: generatedId };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to submit animal report';
      return { error: message };
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmittedReportId(null);
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-foreground">
      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Emergency Notice Banner */}
        <div className="mb-6 p-4 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50/70 dark:bg-red-950/30 flex items-start gap-3">
          <span className="text-2xl flex-shrink-0">🚨</span>
          <div>
            <h2 className="text-sm font-bold text-red-900 dark:text-red-200">
              {isBangla ? 'জরুরি উদ্ধার ও প্রাথমিক সতর্কতা' : 'Urgent Emergency Notice'}
            </h2>
            <p className="text-xs text-red-700 dark:text-red-300 mt-0.5">
              {isBangla
                ? 'প্রাণীর জীবন যদি অবিলম্বে ঝুঁকিপূর্ণ হয় তবে জাতীয় জরুরি সেবা ৯৯৯ অথবা নিকটস্থ ভেটেরিনারি হাসপাতালে তাৎক্ষণিক কল করুন।'
                : 'If an animal is critically wounded or facing immediate life threat, contact emergency helpline (999) or local vet directly.'}
            </p>
          </div>
        </div>

        {submittedReportId ? (
          <Card className="p-8 text-center max-w-xl mx-auto border-green-200 dark:border-green-800 bg-white dark:bg-neutral-900 shadow-sm">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
              ✓
            </div>
            <h1 className="text-2xl font-bold text-green-800 dark:text-green-300 mb-2">
              {isBangla ? 'রিপোর্টটি সফলভাবে জমা হয়েছে' : 'Report Submitted Successfully'}
            </h1>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
              {isBangla
                ? 'আমাদের দল ও নিকটস্থ রেসকিউ স্বেচ্ছাসেবকরা অবিলম্বে তথ্যটি যাচাই করবেন।'
                : 'Our verified responder network and local shelters have been notified for review.'}
            </p>

            <div className="inline-block px-4 py-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-xs font-mono text-neutral-700 dark:text-neutral-300 mb-6">
              {isBangla ? 'রিপোর্ট ট্র্যাকিং আইডি: ' : 'Report ID: '}
              <span className="font-bold">{submittedReportId}</span>
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              <Button
                variant="primary"
                onClick={() => router.push(`/${locale}/rescue/status?id=${submittedReportId}`)}
              >
                🔍 {isBangla ? 'অগ্রগতি ট্র্যাক করুন' : 'Track Status'}
              </Button>
              <Button variant="secondary" onClick={handleReset}>
                {isBangla ? 'নতুন রিপোর্ট করুন' : 'Submit Another Report'}
              </Button>
            </div>
          </Card>
        ) : (
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-stroke-subtle shadow-sm p-6 sm:p-8">
            <div className="mb-6 pb-4 border-b border-stroke-subtle">
              <h1 className="text-2xl font-bold text-foreground">
                🐾 {isBangla ? 'প্রাণীর রিপোর্ট দাখিল করুন' : 'Report an Animal'}
              </h1>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                {isBangla
                  ? 'আহত, হারিয়ে যাওয়া, খুঁজে পাওয়া বা পরিত্যক্ত যেকোনো প্রাণীর বিবরণ জমা দিন।'
                  : 'Report injured, lost, found, or abandoned animals to activate local rescue and volunteer networks.'}
              </p>
            </div>

            <AnimalReportForm
              userPets={pets}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
            />
          </div>
        )}
      </main>
    </div>
  );
}
