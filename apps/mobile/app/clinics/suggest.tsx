import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  SafeAreaView,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useLocale } from '@pranora/i18n';
import {
  submitClinicSuggestion,
  type ClinicSuggestionResult,
} from '@pranora/api';

export default function MobileSuggestClinicScreen() {
  const router = useRouter();
  const { isBangla } = useLocale();

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('+880 17');
  const [is24h, setIs24h] = useState(false);
  const [hasEmergency, setHasEmergency] = useState(false);
  const [offersHomeVisit, setOffersHomeVisit] = useState(false);
  const [notes, setNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<ClinicSuggestionResult | null>(null);

  const handleSubmit = async () => {
    if (!name.trim() || name.length < 2) {
      Alert.alert('Required', isBangla ? 'ক্লিনিকের সঠিক নাম লিখুন' : 'Enter valid clinic name');
      return;
    }
    if (!address.trim() || address.length < 5) {
      Alert.alert('Required', isBangla ? 'বিস্তারিত ঠিকানা লিখুন' : 'Enter detailed address');
      return;
    }
    if (!phone.trim() || phone.length < 8) {
      Alert.alert('Required', isBangla ? 'সঠিক ফোন নম্বর লিখুন' : 'Enter valid phone number');
      return;
    }

    try {
      setSubmitting(true);
      const res = await submitClinicSuggestion({
        name,
        address,
        phone,
        is24h,
        hasEmergency,
        offersHomeVisit,
        notes: notes.trim() || undefined,
      });
      setSubmitted(res);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <SafeAreaView className="flex-1 bg-white p-5 justify-center items-center">
        <View className="w-16 h-16 bg-emerald-100 rounded-full items-center justify-center mb-4">
          <Text className="text-3xl">✓</Text>
        </View>
        <Text className="text-xl font-bold text-gray-900 mb-2 text-center">
          {isBangla ? 'অনুরোধ জমা হয়েছে!' : 'Suggestion Submitted!'}
        </Text>
        <Text className="text-gray-600 text-sm mb-6 text-center">
          {isBangla
            ? 'অ্যাডমিন দল তথ্য যাচাই করে ম্যাপে অন্তর্ভুক্ত করবে।'
            : 'Our admin team will review and verify this clinic.'}
        </Text>

        <View className="bg-gray-50 border border-gray-200 rounded-xl p-4 w-full mb-6">
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-500 text-xs">{isBangla ? 'ক্লিনিক:' : 'Clinic:'}</Text>
            <Text className="font-bold text-gray-900 text-xs">{submitted.name}</Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-500 text-xs">{isBangla ? 'ঠিকানা:' : 'Address:'}</Text>
            <Text className="font-semibold text-gray-800 text-xs flex-1 text-right ml-2">{submitted.address}</Text>
          </View>
          <View className="flex-row justify-between pt-2 border-t border-gray-200">
            <Text className="text-gray-700 font-bold text-xs">{isBangla ? 'স্ট্যাটাস:' : 'Status:'}</Text>
            <Text className="text-amber-700 font-bold text-xs bg-amber-100 px-2 py-0.5 rounded">
              {isBangla ? 'যাচাই প্রক্রিয়াধীন' : 'Under Review'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-emerald-700 py-3.5 px-6 rounded-xl w-full items-center"
        >
          <Text className="text-white font-bold">{isBangla ? 'ম্যাপে ফিরে যান' : 'Back to Map'}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="p-4" showsVerticalScrollIndicator={false}>
        <View className="mb-4">
          <View className="flex-row items-center gap-2 mb-1">
            <Text className="text-2xl">➕</Text>
            <Text className="text-xl font-bold text-gray-900">
              {isBangla ? 'ক্লিনিক যোগের অনুরোধ' : 'Suggest a Clinic'}
            </Text>
          </View>
          <Text className="text-xs text-gray-500">
            {isBangla
              ? 'নতুন কোনো পশু হাসপাতাল বা ডাক্তারের তথ্য দিয়ে সাহায্য করুন'
              : 'Help the community by submitting unlisted veterinary clinics'}
          </Text>
        </View>

        <View className="bg-white p-4 rounded-xl border border-gray-200 mb-4 shadow-sm">
          <Text className="font-bold text-gray-800 text-sm mb-3">
            🏥 {isBangla ? '১. প্রাথমিক তথ্য' : '1. Clinic Info'}
          </Text>

          <TextInput
            value={name}
            onChangeText={setName}
            placeholder={isBangla ? 'ক্লিনিকের নাম (যেমন: মিরপুর পেট কেয়ার)' : 'Clinic Name'}
            className="border border-gray-300 rounded-lg p-2.5 text-gray-800 text-sm mb-3"
          />

          <TextInput
            value={address}
            onChangeText={setAddress}
            placeholder={isBangla ? 'পূর্ণাঙ্গ ঠিকানা ও এলাকা' : 'Full Address & Area'}
            multiline
            numberOfLines={2}
            className="border border-gray-300 rounded-lg p-2.5 text-gray-800 text-sm mb-3"
          />

          <TextInput
            value={phone}
            onChangeText={setPhone}
            placeholder="+880 1712-345678"
            keyboardType="phone-pad"
            className="border border-gray-300 rounded-lg p-2.5 text-gray-800 text-sm"
          />
        </View>

        <View className="bg-white p-4 rounded-xl border border-gray-200 mb-6 shadow-sm">
          <Text className="font-bold text-gray-800 text-sm mb-3">
            ⚙️ {isBangla ? '২. সুযোগ-সুবিধা' : '2. Features'}
          </Text>

          <View className="flex-row items-center justify-between py-2 border-b border-gray-100">
            <Text className="text-xs text-gray-800 font-medium">🌙 {isBangla ? '২৪/৭ খোলা থাকে' : 'Open 24/7'}</Text>
            <Switch value={is24h} onValueChange={setIs24h} trackColor={{ false: '#d1d5db', true: '#10b981' }} />
          </View>

          <View className="flex-row items-center justify-between py-2 border-b border-gray-100">
            <Text className="text-xs text-gray-800 font-medium">🚨 {isBangla ? 'জরুরি সেবা উপলব্ধ' : 'Emergency Available'}</Text>
            <Switch value={hasEmergency} onValueChange={setHasEmergency} trackColor={{ false: '#d1d5db', true: '#ef4444' }} />
          </View>

          <View className="flex-row items-center justify-between py-2 border-b border-gray-100">
            <Text className="text-xs text-gray-800 font-medium">🏡 {isBangla ? 'হোম ভিজিট সেবা রয়েছে' : 'Offers Home Visits'}</Text>
            <Switch value={offersHomeVisit} onValueChange={setOffersHomeVisit} trackColor={{ false: '#d1d5db', true: '#10b981' }} />
          </View>

          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder={isBangla ? 'অতিরিক্ত কোনো তথ্য বা ল্যান্ডমার্ক...' : 'Additional notes or landmark...'}
            className="border border-gray-300 rounded-lg p-2 text-xs text-gray-800 mt-3"
          />
        </View>

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={submitting}
          className="bg-emerald-700 py-3.5 rounded-xl items-center mb-8 shadow-sm"
        >
          <Text className="text-white font-bold text-base">
            {submitting ? (isBangla ? 'জমা হচ্ছে...' : 'Submitting...') : (isBangla ? 'অনুরোধ জমা দিন' : 'Submit Suggestion')}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
