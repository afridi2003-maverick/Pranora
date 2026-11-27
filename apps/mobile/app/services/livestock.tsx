import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useLocale } from '@pranora/i18n';
import {
  DLS_LIVESTOCK_VACCINES,
  getLivestockHospitals,
  submitLivestockCall,
  validateLivestockMedication,
  type LivestockHospitalResult,
  type LivestockCallResult,
  type LivestockSpecies,
} from '@pranora/api';

const SPECIES_OPTIONS: { id: LivestockSpecies; labelBn: string; labelEn: string; icon: string }[] = [
  { id: 'cow', labelBn: 'গরু', labelEn: 'Cattle/Cow', icon: '🐄' },
  { id: 'goat', labelBn: 'ছাগল', labelEn: 'Goat', icon: '🐐' },
  { id: 'sheep', labelBn: 'ভেড়া', labelEn: 'Sheep', icon: '🐑' },
  { id: 'buffalo', labelBn: 'মহিষ', labelEn: 'Buffalo', icon: '🐃' },
  { id: 'poultry', labelBn: 'হাঁস-মুরগি', labelEn: 'Poultry', icon: '🐔' },
];

const SERVICE_TYPES: {
  id: 'emergency_calving' | 'disease_treatment' | 'vaccination_campaign' | 'artificial_insemination';
  labelBn: string;
  labelEn: string;
}[] = [
  { id: 'disease_treatment', labelBn: 'রোগের চিকিৎসা ও পরামর্শ', labelEn: 'Disease Treatment' },
  { id: 'emergency_calving', labelBn: 'জরুরি প্রসব ও অস্ত্রোপচার', labelEn: 'Emergency Calving' },
  { id: 'vaccination_campaign', labelBn: 'সরকারি নিয়মিত টিকা', labelEn: 'Vaccine Campaign' },
  { id: 'artificial_insemination', labelBn: 'উন্নত জাতের কৃত্রিম প্রজনন', labelEn: 'Artificial Insemination' },
];

export default function MobileLivestockScreen() {
  const router = useRouter();
  const { isBangla } = useLocale();

  const [hospitals, setHospitals] = useState<LivestockHospitalResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHospitalId, setSelectedHospitalId] = useState('');

  // Form Fields
  const [farmerName, setFarmerName] = useState('');
  const [species, setSpecies] = useState<LivestockSpecies>('cow');
  const [animalCount, setAnimalCount] = useState<number>(1);
  const [serviceType, setServiceType] = useState<
    'emergency_calving' | 'disease_treatment' | 'vaccination_campaign' | 'artificial_insemination'
  >('disease_treatment');
  const [problemDescription, setProblemDescription] = useState('');
  const [address, setAddress] = useState('গ্রাম: হেমায়েতপুর, সাভার, ঢাকা');
  const [phone, setPhone] = useState('+880 1711223344');

  // Drug Safety Checker (BVC Compliance)
  const [drugCheckInput, setDrugCheckInput] = useState('');
  const [drugWarning, setDrugWarning] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [submittedCall, setSubmittedCall] = useState<LivestockCallResult | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await getLivestockHospitals(23.7465, 90.3752);
        setHospitals(data);
        if (data.length > 0) setSelectedHospitalId(data[0].clinicId);
      } catch (err) {
        console.error('Failed to load livestock hospitals:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const selectedHospital = hospitals.find((h) => h.clinicId === selectedHospitalId) || hospitals[0];

  const handleCheckDrug = (val: string) => {
    setDrugCheckInput(val);
    if (!val.trim()) {
      setDrugWarning(null);
      return;
    }
    const check = validateLivestockMedication(val);
    if (!check.isSafe) {
      setDrugWarning(check.warning || null);
    } else {
      setDrugWarning(null);
    }
  };

  const handleSubmit = async () => {
    if (!farmerName.trim()) {
      Alert.alert('ত্রুটি', isBangla ? 'খামারির নাম লিখুন' : 'Enter farmer name');
      return;
    }
    if (!address.trim() || address.length < 5) {
      Alert.alert('ত্রুটি', isBangla ? 'খামার বা বাড়ির পূর্ণ ঠিকানা লিখুন' : 'Enter farm address');
      return;
    }
    if (!phone.trim() || phone.length < 8) {
      Alert.alert('ত্রুটি', isBangla ? 'সঠিক মোবাইল নম্বর লিখুন' : 'Enter valid phone number');
      return;
    }

    try {
      setSubmitting(true);
      const res = await submitLivestockCall({
        clinicId: selectedHospital?.clinicId || '20000000-0000-0000-0000-000000000006',
        locationId: selectedHospital?.locationId || '30000000-0000-0000-0000-000000000006',
        farmerName,
        species,
        animalCount,
        serviceType,
        problemDescription,
        address,
        phone,
      });
      setSubmittedCall(res);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Call dispatch failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#059669" />
        <Text className="mt-3 text-sm text-gray-500">
          {isBangla ? 'প্রাণিসম্পদ তথ্য লোড হচ্ছে...' : 'Loading livestock hospitals...'}
        </Text>
      </View>
    );
  }

  // Success view
  if (submittedCall) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          <View className="bg-white rounded-2xl border border-emerald-200 p-6 items-center shadow-sm">
            <View className="w-16 h-16 bg-emerald-100 rounded-full items-center justify-center mb-4">
              <Text className="text-3xl">🐄</Text>
            </View>

            <Text className="text-xl font-bold text-gray-900 text-center mb-1">
              {isBangla ? 'জরুরি কল পাঠানো হয়েছে!' : 'Livestock Call Dispatched!'}
            </Text>
            <Text className="text-xs text-gray-500 text-center mb-6">
              {isBangla
                ? 'নিকটস্থ উপজেলা প্রাণিসম্পদ দপ্তর ও ভ্রাম্যমাণ ভেটেরিনারি দল দ্রুত যোগাযোগ করবে।'
                : 'The Upazila Livestock Office mobile veterinary team has been alerted.'}
            </Text>

            <View className="w-full bg-gray-50 rounded-xl p-4 border border-gray-200 mb-6 space-y-2">
              <View className="flex-row justify-between">
                <Text className="text-xs text-gray-500">{isBangla ? 'কল কোড:' : 'Call Code:'}</Text>
                <Text className="text-xs font-bold text-emerald-700 font-mono">{submittedCall.code}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-xs text-gray-500">{isBangla ? 'খামারি:' : 'Farmer:'}</Text>
                <Text className="text-xs font-semibold text-gray-800">{submittedCall.farmerName}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-xs text-gray-500">{isBangla ? 'দায়িত্বপ্রাপ্ত কেন্দ্র:' : 'Assigned Center:'}</Text>
                <Text className="text-xs font-semibold text-gray-800 flex-1 text-right ml-2" numberOfLines={1}>
                  {submittedCall.assignedHospital}
                </Text>
              </View>
              <View className="flex-row justify-between pt-2 border-t border-gray-200">
                <Text className="text-xs text-gray-500">{isBangla ? 'স্ট্যাটাস:' : 'Status:'}</Text>
                <View className="bg-emerald-100 px-2 py-0.5 rounded">
                  <Text className="text-[10px] font-bold text-emerald-800">
                    {isBangla ? 'টিম প্রেরিত (Dispatched)' : 'Dispatched'}
                  </Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => router.push('/services')}
              className="w-full bg-emerald-700 py-3.5 rounded-xl items-center mb-3"
            >
              <Text className="text-white font-bold text-sm">
                {isBangla ? 'সেবা তালিকায় ফিরুন' : 'Browse Services'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setSubmittedCall(null);
                setProblemDescription('');
              }}
              className="w-full bg-white border border-gray-300 py-3 rounded-xl items-center"
            >
              <Text className="text-gray-700 font-medium text-xs">
                {isBangla ? 'নতুন কল করুন' : 'Submit Another Call'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row items-center mb-2">
          <Text className="text-3xl mr-2">🐄</Text>
          <View className="flex-1">
            <View className="flex-row items-center gap-2">
              <Text className="text-lg font-bold text-gray-900">
                {isBangla ? 'গবাদি পশুর চিকিৎসা ও খামারি সেবা' : 'Livestock & Farm Vets'}
              </Text>
              <View className="bg-emerald-100 px-2 py-0.5 rounded-full">
                <Text className="text-[10px] font-bold text-emerald-800">LIV-1</Text>
              </View>
            </View>
            <Text className="text-xs text-gray-500">
              {isBangla
                ? 'উপজেলা প্রাণিসম্পদ হাসপাতাল (DLS), কৃত্রিম প্রজনন ও ভ্রাম্যমাণ ভেট'
                : 'DLS Upazila Hospitals, subsidized vaccines & emergency mobile units'}
            </Text>
          </View>
        </View>

        {/* DLS Vaccine Guide */}
        <View className="bg-white rounded-xl p-4 border border-emerald-100 shadow-sm mb-4">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-xs font-bold text-gray-800 flex-row items-center">
              💉 {isBangla ? 'সরকারি ভর্তুকির টিকা সূচি (DLS)' : 'Subsidized Livestock Vaccines'}
            </Text>
            <View className="bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              <Text className="text-[10px] font-bold text-emerald-800">
                {isBangla ? 'সরকারি মূল্য ৳১০–৳৩০' : 'Govt Rate ৳10–৳30'}
              </Text>
            </View>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
            {DLS_LIVESTOCK_VACCINES.map((v) => (
              <View
                key={v.id}
                className="bg-emerald-50/50 border border-emerald-100 rounded-lg p-2.5 mr-2"
                style={{ width: 180 }}
              >
                <View className="flex-row justify-between items-start mb-1">
                  <Text className="text-xs font-bold text-gray-900 flex-1 mr-1" numberOfLines={1}>
                    {isBangla ? v.nameBn : v.nameEn}
                  </Text>
                  <Text className="text-[10px] font-bold text-emerald-800 bg-white px-1 py-0.5 rounded">
                    ৳{v.subsidizedPrice}
                  </Text>
                </View>
                <Text className="text-[10px] text-gray-600 mb-0.5" numberOfLines={1}>
                  🐾 {isBangla ? v.targetSpeciesBn : v.targetSpeciesEn}
                </Text>
                <Text className="text-[9px] text-gray-500" numberOfLines={1}>
                  🗓️ {isBangla ? v.seasonBn : v.seasonEn}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* BVC Drug Safety Checker */}
        <View className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 mb-4">
          <View className="flex-row items-center mb-1">
            <Text className="mr-1">⚠️</Text>
            <Text className="text-xs font-bold text-amber-900">
              {isBangla
                ? 'ঔষধ নিরাপত্তা সতর্কতা (BVC ও পরিবেশ নীতিমালা)'
                : 'Livestock Drug Safety Checker (BVC)'}
            </Text>
          </View>
          <Text className="text-[10px] text-amber-800 mb-2">
            {isBangla
              ? 'ডাইক্লোফেনাক ও কিটোপ্রোফেন গবাদি পশুর জন্য নিষিদ্ধ। নিরাপদ বিকল্প (Meloxicam, Tolfenamic acid) ব্যবহার করুন।'
              : 'Diclofenac & Ketoprofen are banned in Bangladesh. Check safe alternatives:'}
          </Text>

          <TextInput
            value={drugCheckInput}
            onChangeText={handleCheckDrug}
            placeholder={isBangla ? 'ঔষধের নাম লিখুন (যেমন: Diclofenac...)' : 'Type drug name to verify...'}
            placeholderTextColor="#9CA3AF"
            className="bg-white border border-amber-200 rounded-lg px-3 py-2 text-xs text-gray-800 mb-1"
          />

          {drugWarning ? (
            <View className="bg-red-50 border border-red-200 rounded p-2 mt-1">
              <Text className="text-[11px] font-bold text-red-700">🚫 {drugWarning}</Text>
            </View>
          ) : drugCheckInput.trim().length > 2 ? (
            <View className="bg-emerald-50 border border-emerald-200 rounded p-2 mt-1">
              <Text className="text-[11px] font-bold text-emerald-700">
                ✅ {isBangla ? 'DLS নির্দেশিকা অনুযায়ী নিরাপদ।' : 'Safe for livestock under DLS guidelines.'}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Dispatch Form Card */}
        <View className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm mb-6">
          <Text className="text-sm font-bold text-gray-900 mb-3">
            {isBangla
              ? 'উপজেলা প্রাণিসম্পদ ডাক্তার / ভ্রাম্যমাণ ভেটেরিনারি কল'
              : 'Request Livestock Vet / Mobile Unit'}
          </Text>

          {/* Species selector */}
          <Text className="text-xs font-semibold text-gray-700 mb-1.5">
            {isBangla ? 'পশুর প্রজাতি নির্বাচন করুন' : 'Select Livestock Species'}
          </Text>
          <View className="flex-row flex-wrap gap-2 mb-3">
            {SPECIES_OPTIONS.map((sp) => (
              <TouchableOpacity
                key={sp.id}
                onPress={() => setSpecies(sp.id)}
                className={`flex-row items-center px-3 py-2 rounded-xl border ${
                  species === sp.id
                    ? 'bg-emerald-50 border-emerald-600'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <Text className="mr-1">{sp.icon}</Text>
                <Text
                  className={`text-xs font-medium ${
                    species === sp.id ? 'text-emerald-800 font-bold' : 'text-gray-700'
                  }`}
                >
                  {isBangla ? sp.labelBn : sp.labelEn}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Animal count */}
          <Text className="text-xs font-semibold text-gray-700 mb-1.5">
            {isBangla ? 'পশুর সংখ্যা' : 'Number of Animals'}
          </Text>
          <View className="flex-row items-center gap-3 mb-3">
            <TouchableOpacity
              onPress={() => setAnimalCount((c) => Math.max(1, c - 1))}
              className="w-8 h-8 rounded-full bg-gray-100 border border-gray-300 items-center justify-center"
            >
              <Text className="text-sm font-bold text-gray-700">-</Text>
            </TouchableOpacity>
            <Text className="text-base font-bold text-gray-800 min-w-8 text-center">{animalCount}</Text>
            <TouchableOpacity
              onPress={() => setAnimalCount((c) => c + 1)}
              className="w-8 h-8 rounded-full bg-gray-100 border border-gray-300 items-center justify-center"
            >
              <Text className="text-sm font-bold text-gray-700">+</Text>
            </TouchableOpacity>
          </View>

          {/* Service type */}
          <Text className="text-xs font-semibold text-gray-700 mb-1.5">
            {isBangla ? 'প্রয়োজনীয় সেবা' : 'Service Type'}
          </Text>
          <View className="flex-row flex-wrap gap-2 mb-3">
            {SERVICE_TYPES.map((st) => (
              <TouchableOpacity
                key={st.id}
                onPress={() => setServiceType(st.id)}
                className={`px-2.5 py-1.5 rounded-lg border ${
                  serviceType === st.id
                    ? 'bg-emerald-50 border-emerald-600'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <Text
                  className={`text-[11px] ${
                    serviceType === st.id ? 'text-emerald-800 font-bold' : 'text-gray-700'
                  }`}
                >
                  {isBangla ? st.labelBn : st.labelEn}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Center selection */}
          <Text className="text-xs font-semibold text-gray-700 mb-1.5">
            {isBangla ? 'নিকটস্থ প্রাণিসম্পদ হাসপাতাল' : 'Nearby Livestock Hospital'}
          </Text>
          <View className="space-y-2 mb-3">
            {hospitals.slice(0, 3).map((h) => (
              <TouchableOpacity
                key={h.clinicId}
                onPress={() => setSelectedHospitalId(h.clinicId)}
                className={`p-2.5 rounded-xl border ${
                  selectedHospitalId === h.clinicId
                    ? 'bg-emerald-50/60 border-emerald-600'
                    : 'bg-white border-gray-200'
                }`}
              >
                <View className="flex-row justify-between items-start">
                  <Text className="text-xs font-bold text-gray-800 flex-1 mr-2">
                    {isBangla ? h.nameBn : h.nameEn}
                  </Text>
                  <Text className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                    {h.distanceKm} km
                  </Text>
                </View>
                <Text className="text-[10px] text-gray-500 mt-0.5">
                  📍 {isBangla ? h.addressBn : h.addressEn}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Farmer name */}
          <Text className="text-xs font-semibold text-gray-700 mb-1">
            {isBangla ? 'খামারির নাম' : 'Farmer Name'} *
          </Text>
          <TextInput
            value={farmerName}
            onChangeText={setFarmerName}
            placeholder={isBangla ? 'যেমন: মো: রফিকুল ইসলাম' : 'e.g. Md. Rafiqul Islam'}
            placeholderTextColor="#9CA3AF"
            className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-800 mb-3"
          />

          {/* Farm Address */}
          <Text className="text-xs font-semibold text-gray-700 mb-1">
            {isBangla ? 'খামার বা বাড়ির পূর্ণ ঠিকানা' : 'Farm / Village Address'} *
          </Text>
          <TextInput
            value={address}
            onChangeText={setAddress}
            placeholder={isBangla ? 'গ্রাম, ইউনিয়ন, উপজেলা' : 'Village, Union, Upazila'}
            placeholderTextColor="#9CA3AF"
            className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-800 mb-3"
          />

          {/* Phone */}
          <Text className="text-xs font-semibold text-gray-700 mb-1">
            {isBangla ? 'মোবাইল নম্বর' : 'Phone Number'} *
          </Text>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder="+880 1711223344"
            placeholderTextColor="#9CA3AF"
            className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-800 mb-3"
          />

          {/* Problem description */}
          <Text className="text-xs font-semibold text-gray-700 mb-1">
            {isBangla ? 'লক্ষণ বা সমস্যার বিবরণ' : 'Problem Description'}
          </Text>
          <TextInput
            value={problemDescription}
            onChangeText={setProblemDescription}
            multiline
            numberOfLines={3}
            placeholder={isBangla ? 'পশুর লক্ষণ, খাদ্যাভ্যাস বা জরুরি সমস্যা লিখুন...' : 'Describe symptoms or urgent calving details...'}
            placeholderTextColor="#9CA3AF"
            className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-800 mb-4"
            style={{ textAlignVertical: 'top' }}
          />

          {/* Submit button */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={submitting}
            className={`py-3.5 rounded-xl items-center ${
              submitting ? 'bg-emerald-400' : 'bg-emerald-700'
            }`}
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text className="text-white font-bold text-sm">
                {isBangla ? 'জরুরি কল পাঠান' : 'Dispatch Livestock Call'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
