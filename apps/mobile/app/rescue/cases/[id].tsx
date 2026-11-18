import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useLocale } from '@pranora/i18n';
import {
  RescueCaseDetails,
  MOCK_CASE_DETAILS,
  type RescueCaseFullDetails,
} from '../../../features/rescue';
import type { RescueStatus, RescueOutcome } from '@pranora/types';

export default function RescueCaseScreen() {
  const router = useRouter();
  const { isBangla } = useLocale();
  const params = useLocalSearchParams<{ id?: string }>();
  const caseId = params.id || 'case-201';

  const caseData: RescueCaseFullDetails = MOCK_CASE_DETAILS[caseId] || {
    rescueCase: {
      id: caseId,
      report_id: `rep-${caseId}`,
      status: 'rescue_in_progress',
      shelter_id: null,
      assigned_rescuer_id: 'rescuer-current',
      pet_id: null,
      outcome: null,
      outcome_note: null,
      closed_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    report: {
      id: `rep-${caseId}`,
      reporter_id: 'user-reporter-1',
      kind: 'injured',
      species: 'dog',
      urgency: 'high',
      pet_id: null,
      last_seen_at: null,
      contact_phone: '+8801711223344',
      description: 'জরুরি উদ্ধার কার্যক্রম চলছে।',
      photos: ['https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800'],
      location: null,
      area_text: 'মিরপুর ১০, ঢাকা',
      upazila_id: null,
      district_id: 1,
      status: 'rescue_in_progress',
      duplicate_of: null,
      reviewed_by: null,
      reviewed_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    updates: [],
  };

  const handleAddUpdate = async (payload: {
    case_id: string;
    note?: string | null;
    status?: RescueStatus | null;
    photos?: string[];
  }): Promise<{ error?: string }> => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    console.log('Mobile case update:', payload);
    return {};
  };

  const handleCloseCase = async (payload: {
    case_id: string;
    outcome: RescueOutcome;
    note?: string | null;
    pet_id?: string | null;
  }): Promise<{ error?: string }> => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    console.log('Mobile close case:', payload);
    return {};
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header Bar */}
      <View className="p-3.5 bg-gray-50 border-b border-gray-100 flex-row items-center justify-between">
        <TouchableOpacity onPress={() => router.back()} className="px-2 py-1">
          <Text className="text-primary font-bold text-xs">
            ← {isBangla ? 'পেছনে যান' : 'Back'}
          </Text>
        </TouchableOpacity>
        <Text className="text-xs font-bold text-gray-900 font-mono">
          Case #{caseId.slice(0, 8)}
        </Text>
      </View>

      <RescueCaseDetails
        initialDetails={caseData}
        onAddUpdate={handleAddUpdate}
        onCloseCase={handleCloseCase}
      />
    </View>
  );
}
