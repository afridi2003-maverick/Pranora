import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useLocale } from '@pranora/i18n';

export default function HomeScreen() {
  const router = useRouter();
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

      {/* Navigation Buttons */}
      <View className="w-full gap-3 mb-6">
        <TouchableOpacity
          onPress={() => router.push('/pets')}
          className="w-full py-3.5 rounded-xl bg-primary items-center"
          activeOpacity={0.8}
        >
          <Text className="text-white text-base font-bold">
            🐾 {isBangla ? 'আমার পোষা প্রাণী' : 'My Pets'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/services' as never)}
          className="w-full py-3.5 rounded-xl bg-white border border-primary items-center"
          activeOpacity={0.8}
        >
          <Text className="text-primary text-base font-bold">
            🩺 {isBangla ? 'সেবাসমূহ' : 'Services'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/notifications')}
          className="w-full py-3.5 rounded-xl bg-white border border-gray-300 items-center"
          activeOpacity={0.8}
        >
          <Text className="text-gray-800 text-base font-semibold">
            🔔 {isBangla ? 'বিজ্ঞপ্তি' : 'Notifications'}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        className="w-full py-4 rounded-xl bg-emergency items-center mb-4"
        activeOpacity={0.8}
      >
        <Text className="text-white text-lg font-bold">
          🚨 {isBangla ? 'জরুরি সেবা' : 'Emergency Help'}
        </Text>
      </TouchableOpacity>

      {/* Legal Footer Links */}
      <View className="flex-row gap-4 justify-center mt-2">
        <TouchableOpacity onPress={() => router.push('/privacy' as never)}>
          <Text className="text-xs text-gray-500 underline">
            {isBangla ? 'গোপনীয়তা নীতি' : 'Privacy Policy'}
          </Text>
        </TouchableOpacity>
        <Text className="text-xs text-gray-400">•</Text>
        <TouchableOpacity onPress={() => router.push('/terms' as never)}>
          <Text className="text-xs text-gray-500 underline">
            {isBangla ? 'ব্যবহারের শর্তাবলী' : 'Terms of Service'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
