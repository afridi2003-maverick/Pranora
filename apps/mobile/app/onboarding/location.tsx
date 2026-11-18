import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { useLocale } from '@pranora/i18n';

const BANGLADESH_DIVISIONS = [
  { id: 3, nameBn: 'ঢাকা', nameEn: 'Dhaka' },
  { id: 2, nameBn: 'চট্টগ্রাম', nameEn: 'Chattogram' },
  { id: 6, nameBn: 'রাজশাহী', nameEn: 'Rajshahi' },
  { id: 4, nameBn: 'খুলনা', nameEn: 'Khulna' },
  { id: 1, nameBn: 'বরিশাল', nameEn: 'Barishal' },
  { id: 8, nameBn: 'সিলেট', nameEn: 'Sylhet' },
  { id: 7, nameBn: 'রংপুর', nameEn: 'Rangpur' },
  { id: 5, nameBn: 'ময়মনসিংহ', nameEn: 'Mymensingh' },
];

export default function MobileLocationScreen() {
  const { isBangla } = useLocale();

  const [isDetecting, setIsDetecting] = useState(false);
  const [denied, setDenied] = useState(false);
  const [selectedDivId, setSelectedDivId] = useState<number>(3);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const handleAllowLocation = () => {
    setIsDetecting(true);
    setStatusMsg(null);

    // Simulate location permission & detection
    setTimeout(() => {
      setIsDetecting(false);
      setStatusMsg(isBangla ? '📍 অবস্থান নির্ধারিত হয়েছে' : '📍 Location acquired');
    }, 800);
  };

  return (
    <SafeAreaView className="flex-1 bg-green-50/50 justify-between p-6">
      <View className="items-center mt-8">
        <View className="w-20 h-20 rounded-full bg-green-100 items-center justify-center mb-4">
          <Text className="text-4xl">📍</Text>
        </View>
        <Text className="text-2xl font-bold text-green-900 mb-2 text-center">
          {isBangla ? 'আপনার অবস্থান' : 'Your Location'}
        </Text>
        <Text className="text-sm text-gray-600 text-center px-4 leading-relaxed">
          {isBangla
            ? 'নিকটস্থ পশু চিকিৎসক, জরুরি ক্লিনিক ও উদ্ধার সেবা পেতে অবস্থানের অনুমতি দিন।'
            : 'Allow location access to find nearby veterinary clinics, emergency care, and rescues.'}
        </Text>
      </View>

      <View className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm my-auto">
        {statusMsg && (
          <View className="p-3 bg-green-50 rounded-xl border border-green-200 mb-4">
            <Text className="text-green-800 text-xs font-bold text-center">
              {statusMsg}
            </Text>
          </View>
        )}

        {!denied ? (
          <View className="space-y-3">
            <TouchableOpacity
              onPress={handleAllowLocation}
              disabled={isDetecting}
              className="w-full py-4 bg-green-700 rounded-2xl items-center shadow-xs"
              activeOpacity={0.8}
            >
              {isDetecting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-bold text-base">
                  🎯 {isBangla ? 'অবস্থানের অনুমতি দিন' : 'Allow Location'}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setDenied(true)}
              className="w-full py-3.5 bg-gray-50 rounded-2xl items-center mt-2 border border-gray-200"
              activeOpacity={0.7}
            >
              <Text className="text-gray-700 font-bold text-sm">
                {isBangla ? 'ম্যানুয়ালি এলাকা বেছে নিন' : 'Choose Region Manually'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <Text className="text-xs font-bold text-gray-700 mb-2">
              {isBangla ? 'বিভাগ নির্বাচন করুন:' : 'Select Administrative Division:'}
            </Text>

            <View className="flex-row flex-wrap gap-2 mb-4">
              {BANGLADESH_DIVISIONS.map((d) => {
                const selected = selectedDivId === d.id;
                return (
                  <TouchableOpacity
                    key={d.id}
                    onPress={() => setSelectedDivId(d.id)}
                    className={`px-3 py-2 rounded-xl border ${
                      selected
                        ? 'bg-green-100 border-green-600'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <Text
                      className={`text-xs font-bold ${
                        selected ? 'text-green-800' : 'text-gray-700'
                      }`}
                    >
                      {isBangla ? d.nameBn : d.nameEn}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              onPress={() => {
                setStatusMsg(
                  isBangla
                    ? `বিভাগ: ${BANGLADESH_DIVISIONS.find((d) => d.id === selectedDivId)?.nameBn}`
                    : `Division: ${BANGLADESH_DIVISIONS.find((d) => d.id === selectedDivId)?.nameEn}`
                );
              }}
              className="w-full py-3.5 bg-green-700 rounded-2xl items-center shadow-xs"
              activeOpacity={0.8}
            >
              <Text className="text-white font-bold text-sm">
                {isBangla ? 'নিশ্চিত করুন' : 'Confirm'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <TouchableOpacity className="items-center mb-4" activeOpacity={0.7}>
        <Text className="text-xs text-gray-500 font-bold">
          {isBangla ? 'পরে করুন (এড়িয়ে যান)' : 'Skip for now'}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
