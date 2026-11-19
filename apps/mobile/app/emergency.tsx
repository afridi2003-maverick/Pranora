import React from 'react';
import { View, Text, TouchableOpacity, Linking, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useLocale } from '@pranora/i18n';

export default function EmergencyScreen() {
  const router = useRouter();
  const { isBangla } = useLocale();

  return (
    <SafeAreaView className="flex-1 bg-red-50">
      <View className="p-5 flex-1 justify-between">
        <View>
          {/* Header */}
          <View className="bg-red-600 rounded-2xl p-5 mb-5 shadow-sm">
            <Text className="text-white text-2xl font-black mb-1">
              🚨 {isBangla ? 'জরুরি ভেটেরিনারি সেবা' : 'Emergency Veterinary Help'}
            </Text>
            <Text className="text-red-100 text-sm">
              {isBangla
                ? 'প্রাণোরা জরুরি নেটওয়ার্ক: নিকটস্থ ২৪/৭ ক্লিনিক ও ট্রায়াজ সাপোর্ট'
                : 'Pranora Emergency Network: 24/7 clinics and emergency triage'}
            </Text>
          </View>

          {/* Guidelines */}
          <View className="bg-white rounded-2xl p-5 mb-4 border border-red-200 shadow-sm">
            <Text className="text-gray-900 font-bold text-base mb-2">
              📋 {isBangla ? 'জরুরি প্রাথমিক সতর্কতা' : 'Urgent First-Aid Precautions'}
            </Text>
            <Text className="text-gray-700 text-sm mb-2 leading-5">
              • {isBangla
                ? 'পোষা প্রাণীকে শান্ত রাখুন এবং শ্বাস চলাচলের পথ খোলা রাখুন।'
                : 'Keep your pet calm and ensure airways are unobstructed.'}
            </Text>
            <Text className="text-gray-700 text-sm mb-2 leading-5">
              • {isBangla
                ? 'রক্তপাত হলে পরিষ্কার কাপড় দিয়ে মৃদু চাপ দিয়ে রাখুন।'
                : 'For bleeding, apply gentle direct pressure with a clean cloth.'}
            </Text>
            <Text className="text-gray-700 text-sm leading-5">
              • {isBangla
                ? 'চিকিৎসকের নির্দেশনা ছাড়া কোনো ওষুধ বা বমি করানোর চেষ্টা করবেন না।'
                : 'Do not administer medications or induce vomiting without vet instruction.'}
            </Text>
          </View>

          {/* Hotline Card */}
          <View className="bg-white rounded-2xl p-5 border border-red-200 shadow-sm">
            <Text className="text-gray-800 font-bold text-sm mb-1">
              📞 {isBangla ? 'কেন্দ্রীয় জরুরি হটলাইন' : 'Central Emergency Hotline'}
            </Text>
            <Text className="text-red-600 font-black text-xl mb-3">
              +880 1711-223344
            </Text>
            <TouchableOpacity
              onPress={() => Linking.openURL('tel:+8801711223344')}
              className="bg-red-600 py-3 rounded-xl items-center"
              activeOpacity={0.8}
            >
              <Text className="text-white font-bold text-sm">
                📞 {isBangla ? 'এখনই কল করুন' : 'Call Emergency Hotline'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom CTA to Map */}
        <View className="gap-3 mb-2">
          <TouchableOpacity
            onPress={() => router.push({ pathname: '/map', params: { emergency: 'true' } })}
            className="bg-emergency py-4 rounded-xl items-center shadow"
            activeOpacity={0.8}
          >
            <Text className="text-white font-black text-base">
              🗺️ {isBangla ? 'জরুরি ক্লিনিক ম্যাপ দেখুন' : 'View Emergency Clinic Map'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-white border border-gray-300 py-3 rounded-xl items-center"
            activeOpacity={0.8}
          >
            <Text className="text-gray-700 font-semibold text-sm">
              {isBangla ? 'ফিরে যান' : 'Go Back'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
