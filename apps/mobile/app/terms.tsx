import React from 'react';
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useLocale } from '@pranora/i18n';

export default function TermsScreen() {
  const router = useRouter();
  const { t, isBangla, toggleLocale } = useLocale();

  const sections = [
    'platform',
    'disclaimer',
    'rescue',
    'prohibited',
    'liability',
    'governing',
  ] as const;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row justify-between items-center px-4 py-3 bg-white border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()} className="p-1">
          <Text className="text-gray-600 font-bold text-base">←</Text>
        </TouchableOpacity>
        <Text className="text-base font-bold text-gray-900">
          📄 {t('legal:terms.title')}
        </Text>
        <TouchableOpacity
          onPress={toggleLocale}
          className="px-2.5 py-1 rounded-full bg-green-50 border border-green-200"
        >
          <Text className="text-xs font-semibold text-green-800">
            {isBangla ? 'EN' : 'বাং'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false}>
        <View className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm mb-6">
          <Text className="text-xs text-gray-500 mb-2">
            {t('legal:terms.lastUpdated')}
          </Text>
          <Text className="text-sm text-gray-700 leading-5 mb-5">
            {t('legal:terms.intro')}
          </Text>

          <View className="gap-4">
            {sections.map((section) => (
              <View key={section} className="bg-gray-50 rounded-xl p-3.5 border border-gray-100">
                <Text className="text-sm font-bold text-gray-900 mb-1">
                  {t(`legal:terms.sections.${section}.title` as never)}
                </Text>
                <Text className="text-xs text-gray-600 leading-4">
                  {t(`legal:terms.sections.${section}.content` as never)}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
