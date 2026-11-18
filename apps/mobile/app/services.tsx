import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useLocale } from '@pranora/i18n';
import { ServiceGrid } from '../features/services';

export default function ServicesScreen() {
  const router = useRouter();
  const { t, isBangla, toggleLocale } = useLocale();

  const handleSelectCategory = (_slug: string, navigateTo: string) => {
    router.push(navigateTo as never);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row justify-between items-center px-4 py-3 bg-white border-b border-gray-200">
        <View>
          <Text className="text-xl font-bold text-gray-900">
            🐾 {t('services:pageTitle')}
          </Text>
        </View>
        <TouchableOpacity
          onPress={toggleLocale}
          className="px-3 py-1.5 rounded-full bg-green-50 border border-green-200"
          activeOpacity={0.8}
        >
          <Text className="text-xs font-semibold text-green-800">
            {isBangla ? 'EN' : 'বাং'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Grid Content */}
      <ServiceGrid onSelectCategory={handleSelectCategory} />
    </SafeAreaView>
  );
}
