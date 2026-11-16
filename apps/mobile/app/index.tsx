import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useLocale } from '@pranora/i18n';

export default function HomeScreen() {
  const { isBangla, toggleLocale } = useLocale();

  return (
    <View className="flex-1 items-center justify-center bg-green-50 p-6">
      <Text className="text-3xl font-bold text-primary mb-2 text-center">
        🐾 {isBangla ? 'প্রাণোরা' : 'Pranora'}
      </Text>
      <Text className="text-base text-black/87 mb-8 text-center">
        {isBangla
          ? 'আপনার পোষা প্রাণীর সম্পূর্ণ যত্ন, এক জায়গায়।'
          : 'Complete care for your pet, all in one place.'}
      </Text>

      {/* Language Toggle Button */}
      <TouchableOpacity
        onPress={toggleLocale}
        className="px-5 py-2.5 rounded-full bg-white border border-green-600 mb-6 flex-row items-center justify-center"
        activeOpacity={0.7}
      >
        <Text className="text-green-700 font-bold text-sm">
          🌐 {isBangla ? 'Switch to English' : 'বাংলায় দেখুন'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="w-full py-4 rounded-xl bg-emergency items-center mb-4"
        activeOpacity={0.8}
      >
        <Text className="text-white text-lg font-bold">
          🚨 {isBangla ? 'জরুরি সেবা' : 'Emergency Help'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
