import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useLocale } from '@pranora/i18n';
import {
  LostFoundBoard,
  MOCK_LOST_FOUND_ITEMS,
} from '../../features/rescue';

export default function LostFoundBoardScreen() {
  const router = useRouter();
  const { isBangla } = useLocale();

  const handleSighting = async (_params: {
    reportId: string;
    message: string;
    locationText?: string;
    contactPhone?: string;
  }) => {
    await new Promise((r) => setTimeout(r, 400));
    return { success: true };
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="p-4 border-b border-gray-100 bg-gray-50 flex-row items-center justify-between">
        <View className="flex-1 mr-2">
          <Text className="text-lg font-bold text-gray-900">
            📢 {isBangla ? 'হারানো ও প্রাপ্ত প্রাণী' : 'Lost & Found Board'}
          </Text>
          <Text className="text-xs text-gray-500 mt-0.5" numberOfLines={1}>
            {isBangla ? '~১ কিমি গোপনীয়তা গ্রিড • ফোন গোপন' : '~1 km privacy grid • phone hidden'}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => router.push('/rescue/report')}
          className="px-3 py-1.5 rounded-lg bg-primary"
        >
          <Text className="text-xs font-bold text-white">
            ➕ {isBangla ? 'রিপোর্ট' : 'Report'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Board */}
      <LostFoundBoard
        initialItems={MOCK_LOST_FOUND_ITEMS}
        onSubmitSighting={handleSighting}
      />
    </View>
  );
}
