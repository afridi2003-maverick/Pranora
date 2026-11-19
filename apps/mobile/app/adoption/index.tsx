import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useLocale } from '@pranora/i18n';
import { AdoptionListScreen } from '../../features/adoption';
import type { AdoptionListingRow } from '@pranora/api';

export default function AdoptionScreen() {
  const router = useRouter();
  const { isBangla } = useLocale();

  const handleApply = (listing: AdoptionListingRow) => {
    // Navigate to login or adoption application
    router.push(`/(auth)/login?redirect=/adoption&listingId=${listing.id}`);
  };

  return (
    <View className="flex-1 bg-white">
      {/* Top Header Banner */}
      <View className="p-3.5 bg-green-50 border-b border-green-200 flex-row items-center justify-between">
        <View className="flex-1 pr-2">
          <Text className="text-base font-bold text-green-900">
            🐾 {isBangla ? 'দত্তক পোর্টাল (উন্মুক্ত)' : 'Public Adoption Portal'}
          </Text>
          <Text className="text-[11px] text-green-800 mt-0.5 leading-4">
            {isBangla
              ? 'লগইন ছাড়াই ব্রাউজ করুন। প্রতিটি আবেদন মানুষ দ্বারা যাচাই করা হয়।'
              : 'Browse freely without login. Every application is reviewed by real caregivers.'}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => router.push('/adoption/create')}
          className="bg-emerald-600 px-3 py-1.5 rounded-lg"
        >
          <Text className="text-white text-xs font-bold">
            + {isBangla ? 'তালিকা তৈরি' : 'Create'}
          </Text>
        </TouchableOpacity>
      </View>

      <AdoptionListScreen onApply={handleApply} />
    </View>
  );
}
