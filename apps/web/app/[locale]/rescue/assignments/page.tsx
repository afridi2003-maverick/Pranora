'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@pranora/i18n';
import { Button } from '@pranora/ui';
import {
  RescuerCasesList,
  AssignRescuerModal,
  RescuerProfileCard,
  MOCK_ASSIGNMENTS,
} from '../../../../features/rescue';
import {
  assignRescuer,
  respondToAssignment,
  findNearbyRescuers,
  upsertRescuerProfile,
} from '@pranora/api';
import type { SpeciesType } from '@pranora/types';
import { useSession } from '../../../../hooks/useSession';
import { useToast } from '../../../../components/ToastProvider';

export default function RescuerAssignmentsPage() {
  const { isBangla, locale } = useLocale();
  const router = useRouter();
  const { supabase, user, isConfigured, isAuthenticated } = useSession();
  const { showToast } = useToast();

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  const handleSaveProfile = async (profile: {
    isAvailable: boolean;
    radiusKm: number;
    species: SpeciesType[];
  }) => {
    if (isConfigured && isAuthenticated && user) {
      await upsertRescuerProfile(supabase, {
        userId: user.id,
        radiusKm: profile.radiusKm,
        species: profile.species,
        isAvailable: profile.isAvailable,
      });
      showToast({
        type: 'success',
        message: isBangla ? 'কভারেজ প্রোফাইল সংরক্ষিত হয়েছে' : 'Coverage profile updated',
      });
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 300));
  };

  const handleFindNearby = async (params: {
    lat: number;
    lng: number;
    radius_m?: number;
  }) => {
    if (isConfigured && isAuthenticated) {
      const items = await findNearbyRescuers(supabase, {
        lat: params.lat,
        lng: params.lng,
        radius_m: params.radius_m,
      });
      return items.map((r) => ({
        id: r.rescuer_id,
        name: r.display_name || 'Rescuer',
        name_bn: r.display_name || 'উদ্ধারকারী',
        phone: '+8801700000000',
        district_name_en: 'Dhaka Coverage',
        district_name_bn: 'ঢাকা কভারেজ এলাকা',
        active_cases_count: r.active_cases_count,
        is_available: r.is_available,
        distance_meters: r.distance_meters,
        radius_km: Number(r.radius_km),
        species: r.species,
      }));
    }
    return [];
  };

  const handleRespond = async (
    assignmentId: string,
    accept: boolean,
    declineReason?: string
  ): Promise<void> => {
    if (isConfigured && isAuthenticated) {
      await respondToAssignment(supabase, assignmentId, accept, declineReason);
      showToast({
        type: 'success',
        message: accept
          ? isBangla
            ? 'অ্যাসাইনমেন্ট গৃহীত হয়েছে'
            : 'Assignment accepted'
          : isBangla
          ? 'অ্যাসাইনমেন্ট প্রত্যাখ্যাত হয়েছে'
          : 'Assignment declined',
      });
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 300));
  };

  const handleAssign = async (
    caseId: string,
    rescuerId: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (isConfigured && isAuthenticated) {
      try {
        await assignRescuer(supabase, caseId, rescuerId);
        showToast({
          type: 'success',
          message: isBangla ? 'উদ্ধারকারী নিযুক্ত হয়েছে' : 'Rescuer assigned',
        });
        return { success: true };
      } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Assign failed' };
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 300));
    return { success: true };
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-foreground">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Header & Coordinator Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 dark:bg-green-950/40 text-primary border border-green-200 dark:border-green-800 text-xs font-semibold mb-2">
              🚑 {isBangla ? 'উদ্ধারকারী পোর্টাল' : 'Rescuer Portal'}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">
              {isBangla ? 'দায়িত্বপ্রাপ্ত ও প্রস্তাবিত কেসসমূহ' : 'Assigned & Offered Rescue Cases'}
            </h1>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
              {isBangla
                ? 'সমন্বয়কারী দল কর্তৃক আপনাকে পাঠানো কেস গ্রহণ বা প্রত্যাখ্যান করুন এবং চলমান উদ্ধার কাজ পরিচালনা করুন।'
                : 'Accept or decline dispatched cases and manage active on-site rescues.'}
            </p>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsAssignModalOpen(true)}
          >
            ➕ {isBangla ? 'উদ্ধারকারী নিয়োগ' : 'Assign Rescuer'}
          </Button>
        </div>

        {/* Rescuer Availability & Coverage Profile */}
        <RescuerProfileCard
          districtName={isBangla ? 'ঢাকা মেট্রো ও পার্শ্ববর্তী এলাকা' : 'Dhaka Metro & Outskirts'}
          onSave={handleSaveProfile}
        />

        {/* Rescuer Cases List */}
        <RescuerCasesList
          initialAssignments={MOCK_ASSIGNMENTS}
          onRespond={handleRespond}
          onViewCase={(caseId) => router.push(`/${locale}/rescue/cases/${caseId}`)}
        />

        {/* Assign Rescuer Modal (for Shelter/Admin dispatchers) */}
        <AssignRescuerModal
          isOpen={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
          caseId="case-201"
          reportSpecies="dog"
          reportArea="Mirpur 10, Dhaka"
          lat={23.8069}
          lng={90.3687}
          onAssign={handleAssign}
          onFindNearby={handleFindNearby}
        />
      </main>
    </div>
  );
}
