import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useLocale } from '@pranora/i18n';
import {
  AdoptionFollowupCard,
  findFollowupById,
  getFollowupsForHandover,
  MOCK_ADOPTION_FOLLOWUPS,
} from '../../../features/adoption';

export default function AdoptionFollowupScreen() {
  const router = useRouter();
  const { isBangla } = useLocale();
  const params = useLocalSearchParams<{ id?: string }>();
  const id = params.id || 'flw-001';

  let followupsList = getFollowupsForHandover(id);
  let selectedFollowupId = id;

  if (followupsList.length === 0) {
    const single = findFollowupById(id);
    if (single) {
      followupsList = getFollowupsForHandover(single.followup.handover_id);
      selectedFollowupId = single.followup.id;
    } else {
      followupsList = Object.values(MOCK_ADOPTION_FOLLOWUPS);
      selectedFollowupId = followupsList[0]?.followup.id || '';
    }
  }

  const handleSubmitFollowup = async (
    _followupId: string,
    _payload: {
      wellbeing: 'good' | 'okay' | 'needs_help';
      note?: string | null;
      photos: string[];
    }
  ) => {
    // In production, calls submitAdoptionFollowup RPC
    return { success: true };
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
      {/* Header Bar */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: '#e5e7eb',
        }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ fontSize: 14, color: '#059669', fontWeight: '600' }}>
            ← {isBangla ? 'পেছনে' : 'Back'}
          </Text>
        </TouchableOpacity>

        <Text style={{ fontSize: 16, fontWeight: '700', color: '#111827' }}>
          {isBangla ? 'দত্তক ফলো-আপ চেক-ইন' : 'Adoption Follow-Up'}
        </Text>

        <View style={{ width: 40 }} />
      </View>

      <AdoptionFollowupCard
        followups={followupsList}
        initialSelectedId={selectedFollowupId}
        onSubmitFollowup={handleSubmitFollowup}
        onBack={() => router.back()}
      />
    </View>
  );
}
