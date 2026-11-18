import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useLocale } from '@pranora/i18n';
import { AnimalReportForm } from '../../features/rescue';
import type { PetRow, CreateReportPayload } from '@pranora/api';

const MOCK_USER_PETS: PetRow[] = [
  {
    id: 'pet-001',
    owner_id: 'user-current',
    shelter_id: null,
    rescue_case_id: null,
    name: 'Milo (মাইলো)',
    species: 'dog',
    breed_id: 1,
    breed_other: null,
    gender: 'male',
    date_of_birth: '2023-01-10',
    birth_approx: false,
    weight_kg: 14.5,
    color: 'Brown & White',
    photo_url: null,
    microchip_no: '985141002345678',
    is_neutered: true,
    allergies: null,
    notes: 'Microchipped, friendly',
    public_qr_slug: 'milo-qr',
    deleted_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'pet-002',
    owner_id: 'user-current',
    shelter_id: null,
    rescue_case_id: null,
    name: 'Luna (লুনা)',
    species: 'cat',
    breed_id: 4,
    breed_other: null,
    gender: 'female',
    date_of_birth: '2023-08-15',
    birth_approx: true,
    weight_kg: 3.6,
    color: 'White',
    photo_url: null,
    microchip_no: null,
    is_neutered: false,
    allergies: null,
    notes: 'Indoor cat',
    public_qr_slug: 'luna-qr',
    deleted_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export default function RescueReportScreen() {
  const router = useRouter();
  const { isBangla } = useLocale();
  const [submittedReportId, setSubmittedReportId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (_payload: CreateReportPayload): Promise<{ error?: string; reportId?: string }> => {
    setIsSubmitting(true);
    try {
      // Simulate network request
      await new Promise((resolve) => setTimeout(resolve, 600));

      const generatedId = `rep-${Date.now().toString(36)}`;
      setSubmittedReportId(generatedId);
      return { reportId: generatedId };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to submit animal report';
      return { error: message };
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      {/* Emergency Header Warning */}
      <View className="bg-red-50 p-3 border-b border-red-200 flex-row items-center gap-2">
        <Text className="text-xl">🚨</Text>
        <Text className="text-xs text-red-900 flex-1 leading-4">
          {isBangla
            ? 'জরুরি জীবনহানির ঝুঁকিতে জাতীয় হেল্পলাইন ৯৯৯ অথবা নিকটস্থ ভেট হাসপাতালে সরাসরি কল করুন।'
            : 'For extreme life threats, call 999 or your local vet hospital immediately.'}
        </Text>
      </View>

      {submittedReportId ? (
        <ScrollView className="flex-1 p-6" contentContainerStyle={{ alignItems: 'center', justifyContent: 'center' }}>
          <View className="w-16 h-16 rounded-full bg-green-100 items-center justify-center mb-4">
            <Text className="text-3xl text-green-700">✓</Text>
          </View>
          <Text className="text-2xl font-bold text-green-800 text-center mb-2">
            {isBangla ? 'রিপোর্টটি সফলভাবে জমা হয়েছে' : 'Report Submitted'}
          </Text>
          <Text className="text-sm text-gray-600 text-center mb-4">
            {isBangla
              ? 'উদ্ধারকারী দল ও ভলান্টিয়ার নেটওয়ার্ককে ইতিমধ্যে জানানো হয়েছে।'
              : 'Our rescue team and volunteer network have been notified.'}
          </Text>

          <View className="bg-gray-100 px-4 py-2 rounded-lg mb-6">
            <Text className="text-xs font-mono text-gray-700">
              {isBangla ? 'ট্র্যাকিং আইডি: ' : 'Tracking ID: '}
              <Text className="font-bold">{submittedReportId}</Text>
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => setSubmittedReportId(null)}
            className="w-full py-3 rounded-xl bg-primary items-center mb-3"
            activeOpacity={0.8}
          >
            <Text className="text-white font-bold">
              {isBangla ? 'নতুন রিপোর্ট করুন' : 'Submit Another Report'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.back()}
            className="w-full py-3 rounded-xl border border-gray-300 items-center"
            activeOpacity={0.7}
          >
            <Text className="text-gray-700 font-semibold">
              {isBangla ? 'মূল পর্দায় ফিরে যান' : 'Back to Home'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <AnimalReportForm
          userPets={MOCK_USER_PETS}
          onSubmit={handleSubmit}
          onCancel={() => router.back()}
          isSubmitting={isSubmitting}
        />
      )}
    </View>
  );
}
