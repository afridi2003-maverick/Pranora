import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useLocale } from '@pranora/i18n';
import { CreateAdoptionListingForm } from '../../features/adoption';
import type { CreateListingPayload } from '@pranora/api';

export default function CreateAdoptionListingScreen() {
  const router = useRouter();
  const { isBangla } = useLocale();

  const handleListingSubmit = async (_payload: CreateListingPayload) => {
    // In production, calls createAdoptionListing client RPC
    return { success: true };
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
      {/* Header bar */}
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
          {isBangla ? 'দত্তক তালিকা তৈরি' : 'Create Adoption Listing'}
        </Text>

        <View style={{ width: 40 }} />
      </View>

      <CreateAdoptionListingForm
        isApprovedLister={true}
        userRole="shelter"
        onSubmitListing={handleListingSubmit}
        onCancel={() => router.back()}
      />
    </View>
  );
}
