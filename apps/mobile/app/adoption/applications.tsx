import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useLocale } from '@pranora/i18n';
import { AdoptionApplicationStatusTracker } from '../../features/adoption';

export default function MyAdoptionApplicationsScreen() {
  const router = useRouter();
  const { isBangla } = useLocale();

  const handleWithdraw = async (_applicationId: string) => {
    // In production, calls withdrawAdoptionApplication
    return { success: true };
  };

  const handleViewListing = (_listingId: string) => {
    router.push('/adoption');
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
          {isBangla ? 'আমার আবেদনসমূহ' : 'My Applications'}
        </Text>

        <View style={{ width: 40 }} />
      </View>

      <AdoptionApplicationStatusTracker
        onWithdrawApplication={handleWithdraw}
        onViewListing={handleViewListing}
      />
    </View>
  );
}
