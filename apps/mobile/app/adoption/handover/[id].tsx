import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useLocale } from '@pranora/i18n';
import {
  AdoptionHandoverCard,
  findHandoverByIdOrListing,
  MOCK_HANDOVERS,
} from '../../../features/adoption';

export default function AdoptionHandoverScreen() {
  const router = useRouter();
  const { isBangla } = useLocale();
  const params = useLocalSearchParams<{ id?: string }>();
  const idOrListingId = params.id || 'hnd-001';

  const handoverDetails =
    findHandoverByIdOrListing(idOrListingId) ||
    MOCK_HANDOVERS['hnd-001']!;

  const handleConfirmHandover = async (_handoverId: string) => {
    // In production, calls confirm_handover RPC
    return { success: true };
  };

  const handleGoToFollowup = (handoverId: string) => {
    router.push({
      pathname: '/adoption/followup/[id]',
      params: { id: handoverId },
    });
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
          {isBangla ? 'মালিকানা হস্তান্তর' : 'Adoption Handover'}
        </Text>

        <View style={{ width: 40 }} />
      </View>

      <AdoptionHandoverCard
        initialDetails={handoverDetails}
        currentUserId="user-current"
        onConfirmHandover={handleConfirmHandover}
        onGoToFollowup={handleGoToFollowup}
        onBack={() => router.back()}
      />
    </View>
  );
}
