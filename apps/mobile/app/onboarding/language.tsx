import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { useLocale } from '@pranora/i18n';
import type { Locale } from '@pranora/types';

export default function MobileLanguageOnboardingScreen() {
  const { locale, setLocale, isBangla } = useLocale();
  const [selectedLocale, setSelectedLocale] = useState<Locale>(locale);

  const handleSelect = async (loc: Locale) => {
    setSelectedLocale(loc);
    await setLocale(loc);
  };

  return (
    <SafeAreaView className="flex-1 bg-green-50/50 justify-between p-6">
      <View className="items-center mt-12">
        <Text className="text-5xl mb-4">🌐</Text>
        <Text className="text-2xl font-bold text-green-900 mb-2 text-center">
          {isBangla ? 'ভাষা বেছে নিন' : 'Choose Your Language'}
        </Text>
        <Text className="text-sm text-gray-600 text-center px-4 leading-relaxed">
          {isBangla
            ? 'প্রাণোরায় সেবা পেতে আপনার পছন্দের ভাষা নির্বাচন করুন। এটি পরবর্তীতে পরিবর্তন করা যাবে।'
            : 'Select your preferred language for Pranora. You can change this later in settings.'}
        </Text>
      </View>

      <View className="space-y-4 my-auto">
        {/* Option 1: Bangla */}
        <TouchableOpacity
          onPress={() => handleSelect('bn')}
          className={`p-5 rounded-2xl border-2 flex-row items-center justify-between mb-4 bg-white ${
            selectedLocale === 'bn' ? 'border-green-600 bg-green-50/50' : 'border-gray-200'
          }`}
          activeOpacity={0.8}
        >
          <View className="flex-row items-center gap-4">
            <View className="w-12 h-12 rounded-full bg-green-100 items-center justify-center">
              <Text className="text-green-800 font-bold text-lg">বাং</Text>
            </View>
            <View>
              <View className="flex-row items-center gap-2">
                <Text className="text-lg font-bold text-gray-900">বাংলা</Text>
                <View className="bg-green-600 px-2 py-0.5 rounded-full">
                  <Text className="text-white text-xs font-bold">ডিফল্ট</Text>
                </View>
              </View>
              <Text className="text-xs text-gray-500 mt-0.5">
                আপনার পোষা প্রাণীর সম্পূর্ণ সেবা বাংলায়
              </Text>
            </View>
          </View>

          <View className="w-6 h-6 rounded-full border-2 border-green-600 items-center justify-center">
            {selectedLocale === 'bn' && (
              <View className="w-3.5 h-3.5 rounded-full bg-green-600" />
            )}
          </View>
        </TouchableOpacity>

        {/* Option 2: English */}
        <TouchableOpacity
          onPress={() => handleSelect('en')}
          className={`p-5 rounded-2xl border-2 flex-row items-center justify-between bg-white ${
            selectedLocale === 'en' ? 'border-green-600 bg-green-50/50' : 'border-gray-200'
          }`}
          activeOpacity={0.8}
        >
          <View className="flex-row items-center gap-4">
            <View className="w-12 h-12 rounded-full bg-blue-100 items-center justify-center">
              <Text className="text-blue-800 font-bold text-lg">EN</Text>
            </View>
            <View>
              <Text className="text-lg font-bold text-gray-900">English</Text>
              <Text className="text-xs text-gray-500 mt-0.5">
                Complete pet care services in English
              </Text>
            </View>
          </View>

          <View className="w-6 h-6 rounded-full border-2 border-green-600 items-center justify-center">
            {selectedLocale === 'en' && (
              <View className="w-3.5 h-3.5 rounded-full bg-green-600" />
            )}
          </View>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        className="w-full py-4 bg-green-700 rounded-2xl items-center shadow-sm"
        activeOpacity={0.8}
      >
        <Text className="text-white font-bold text-lg">
          {selectedLocale === 'bn' ? 'চালিয়ে যান →' : 'Continue →'}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
