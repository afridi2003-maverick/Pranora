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
    // Navigate directly to the one-page application form (ADP-3)
    router.push(`/adoption/apply/${listing.id}`);
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

        <View className="flex-row items-center gap-2">
          <TouchableOpacity
            onPress={() => router.push('/adoption/saved')}
            className="bg-rose-100 px-2.5 py-1.5 rounded-lg border border-rose-300"
          >
            <Text className="text-rose-900 text-xs font-bold">
              ♥ {isBangla ? 'সেভ' : 'Saved'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/adoption/matches')}
            className="bg-amber-100 px-2.5 py-1.5 rounded-lg border border-amber-300"
          >
            <Text className="text-amber-900 text-xs font-bold">
              🎯 {isBangla ? 'ম্যাচ' : 'Match'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/adoption/applications')}
            className="bg-emerald-100 px-2.5 py-1.5 rounded-lg border border-emerald-300"
          >
            <Text className="text-emerald-900 text-xs font-bold">
              📋 {isBangla ? 'আবেদন' : 'Apps'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/adoption/create')}
            className="bg-emerald-600 px-3 py-1.5 rounded-lg"
          >
            <Text className="text-white text-xs font-bold">
              + {isBangla ? 'তালিকা' : 'Create'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <AdoptionListScreen onApply={handleApply} />
    </View>
  );
}
