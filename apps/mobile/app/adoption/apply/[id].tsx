import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useLocale } from '@pranora/i18n';
import {
  AdoptionApplicationForm,
  MOCK_ADOPTION_LISTINGS,
} from '../../../features/adoption';
import type { CreateApplicationPayload } from '@pranora/api';

export default function AdoptionApplyScreen() {
  const router = useRouter();
  const { isBangla } = useLocale();
  const params = useLocalSearchParams<{ id?: string }>();
  const listingId = params.id || 'adp-001';

  const listing =
    MOCK_ADOPTION_LISTINGS.find((l) => l.id === listingId) ||
    MOCK_ADOPTION_LISTINGS[0]!;

  const handleApplicationSubmit = async (_payload: CreateApplicationPayload) => {
    // In production, calls submitAdoptionApplication RPC
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
          {isBangla ? 'দত্তকের আবেদন' : 'Apply for Adoption'}
        </Text>

        <View style={{ width: 40 }} />
      </View>

      <AdoptionApplicationForm
        listing={listing}
        onSubmitApplication={handleApplicationSubmit}
        onCancel={() => router.back()}
      />
    </View>
  );
}
