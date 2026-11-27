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
  getHomeVisitClinics,
  submitHomeVisitRequest,
  type HomeVisitProviderOption,
  type HomeVisitBookingResult,
} from '@pranora/api';

export default function MobileHomeVisitScreen() {
  const router = useRouter();
  const { isBangla } = useLocale();

  const [clinics, setClinics] = useState<HomeVisitProviderOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClinicId, setSelectedClinicId] = useState<string>('');
  const [address, setAddress] = useState('House 14, Road 7, Dhanmondi, Dhaka');
  const [lat] = useState(23.7465);
  const [lng] = useState(90.3752);

  const [petName, setPetName] = useState('');
  const [petSpecies, setPetSpecies] = useState<'dog' | 'cat' | 'bird' | 'rabbit' | 'livestock'>('dog');
  const [visitDate, setVisitDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [timeSlot, setTimeSlot] = useState<'morning' | 'afternoon' | 'evening'>('morning');
  const [symptoms, setSymptoms] = useState('');
  const [phone, setPhone] = useState('+880 1711223344');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'sslcommerz' | 'bkash'>('cash');

  const [submitting, setSubmitting] = useState(false);
  const [submittedBooking, setSubmittedBooking] = useState<HomeVisitBookingResult | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await getHomeVisitClinics(lat, lng);
        setClinics(data);
        if (data.length > 0) {
          setSelectedClinicId(data[0].clinicId);
        }
      } catch (err) {
        console.error('Failed to load home visit clinics:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [lat, lng]);

  const selectedClinic = clinics.find((c) => c.clinicId === selectedClinicId) || clinics[0];

  const handleSubmit = async () => {
    if (!selectedClinic) {
      Alert.alert('Error', isBangla ? 'ক্লিনিক নির্বাচন করুন' : 'Select a clinic');
      return;
    }
    if (!petName.trim()) {
      Alert.alert('Error', isBangla ? 'পোষা প্রাণীর নাম লিখুন' : 'Enter pet name');
      return;
    }
    if (!address.trim() || address.length < 5) {
      Alert.alert('Error', isBangla ? 'সঠিক ঠিকানা লিখুন' : 'Enter detailed address');
      return;
    }
    if (!symptoms.trim() || symptoms.length < 3) {
      Alert.alert('Error', isBangla ? 'সমস্যা বিস্তারিত লিখুন' : 'Describe symptoms');
      return;
    }

    try {
      setSubmitting(true);
      const res = await submitHomeVisitRequest({
        clinicId: selectedClinic.clinicId,
        locationId: selectedClinic.locationId,
        petName,
        petSpecies,
        visitDate,
        timeSlot,
        address,
        lat,
        lng,
        symptoms,
        phone,
        paymentMethod,
      });
      setSubmittedBooking(res);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (submittedBooking) {
    return (
      <SafeAreaView className="flex-1 bg-white p-5 justify-center items-center">
        <View className="w-16 h-16 bg-emerald-100 rounded-full items-center justify-center mb-4">
          <Text className="text-emerald-700 text-3xl font-bold">✓</Text>
        </View>
        <Text className="text-xl font-bold text-gray-900 mb-2 text-center">
          {isBangla ? 'হোম ভিজিট অনুরোধ সফল!' : 'Home Visit Request Sent!'}
        </Text>
        <Text className="text-gray-600 text-sm mb-6 text-center">
          {isBangla
            ? 'ক্লিনিক শীঘ্রই কল করে সময় ও ডাক্তার নিশ্চিত করবে।'
            : 'Clinic will call you shortly to confirm the appointment.'}
        </Text>

        <View className="bg-gray-50 border border-gray-200 rounded-xl p-4 w-full mb-6">
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-500 text-sm">{isBangla ? 'কোড:' : 'Tracking Code:'}</Text>
            <Text className="font-bold text-emerald-700 text-sm">{submittedBooking.code}</Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-500 text-sm">{isBangla ? 'তারিখ ও সময়:' : 'Date & Time:'}</Text>
            <Text className="font-semibold text-gray-800 text-sm">
              {submittedBooking.visitDate} ({submittedBooking.timeSlot})
            </Text>
          </View>
          <View className="flex-row justify-between pt-2 border-t border-gray-200">
            <Text className="text-gray-800 font-bold text-sm">{isBangla ? 'সর্বমোট ফি:' : 'Total Fee:'}</Text>
            <Text className="text-emerald-800 font-bold text-base">৳ {submittedBooking.totalFee}</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-emerald-700 py-3 px-6 rounded-xl w-full items-center"
        >
          <Text className="text-white font-bold">{isBangla ? 'ঠিক আছে' : 'Done'}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="p-4" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="mb-4">
          <View className="flex-row items-center gap-2 mb-1">
            <Text className="text-2xl">🏡</Text>
            <Text className="text-xl font-bold text-gray-900">
              {isBangla ? 'বাসায় ডাক্তার (হোম ভিজিট)' : 'Home Vet Visit'}
            </Text>
          </View>
          <Text className="text-xs text-gray-500">
            {isBangla
              ? 'অভিজ্ঞ ভেট ডাক্তার আপনার বাসায় এসে চিকিৎসা সেবা প্রদান করবেন।'
              : 'Licensed vets visit your home for treatment and checkups.'}
          </Text>
        </View>

        {/* 1. Address */}
        <View className="bg-white p-4 rounded-xl border border-gray-200 mb-4 shadow-sm">
          <Text className="font-bold text-gray-800 text-sm mb-2">
            📍 {isBangla ? '১. আপনার ঠিকানা' : '1. Your Address'}
          </Text>
          <TextInput
            value={address}
            onChangeText={setAddress}
            placeholder="Address details"
            className="border border-gray-300 rounded-lg p-2.5 text-gray-800 text-sm"
          />
        </View>

        {/* 2. Clinic List */}
        <View className="bg-white p-4 rounded-xl border border-gray-200 mb-4 shadow-sm">
          <Text className="font-bold text-gray-800 text-sm mb-2">
            🩺 {isBangla ? '২. ক্লিনিক নির্বাচন' : '2. Select Clinic'}
          </Text>

          {loading ? (
            <ActivityIndicator color="#2F7B53" />
          ) : (
            clinics.map((c) => {
              const isSelected = selectedClinicId === c.clinicId;
              return (
                <TouchableOpacity
                  key={c.clinicId}
                  onPress={() => setSelectedClinicId(c.clinicId)}
                  className={`p-3 rounded-lg border mb-2.5 ${
                    isSelected ? 'border-emerald-600 bg-emerald-50' : 'border-gray-200 bg-white'
                  }`}
                >
                  <View className="flex-row justify-between items-center mb-1">
                    <Text className="font-bold text-gray-900 text-sm">
                      {isBangla ? c.nameBn : c.nameEn}
                    </Text>
                    <Text className="text-xs font-semibold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                      ★ {c.ratingAvg}
                    </Text>
                  </View>
                  <Text className="text-xs text-gray-500 mb-2">
                    {c.distanceKm} km {isBangla ? 'দূরে' : 'away'} · {isBangla ? 'কভারেজ:' : 'Coverage:'} {c.homeVisitRadiusKm} km
                  </Text>
                  <View className="flex-row justify-between pt-1 border-t border-gray-100">
                    <Text className="text-xs text-gray-600">{isBangla ? 'ফি (ডাক্তার + যাতায়াত):' : 'Fee (Vet + Travel):'}</Text>
                    <Text className="text-sm font-bold text-emerald-700">৳ {c.totalFee}</Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* 3. Pet Info */}
        <View className="bg-white p-4 rounded-xl border border-gray-200 mb-4 shadow-sm">
          <Text className="font-bold text-gray-800 text-sm mb-2">
            🐾 {isBangla ? '৩. পোষা প্রাণীর তথ্য' : '3. Pet Details'}
          </Text>
          <TextInput
            value={petName}
            onChangeText={setPetName}
            placeholder={isBangla ? 'প্রাণীর নাম (যেমন: বাঘা)' : 'Pet Name (e.g. Milo)'}
            className="border border-gray-300 rounded-lg p-2.5 text-gray-800 text-sm mb-3"
          />

          <View className="flex-row gap-2 mb-3">
            {(['dog', 'cat', 'bird', 'rabbit'] as const).map((sp) => (
              <TouchableOpacity
                key={sp}
                onPress={() => setPetSpecies(sp)}
                className={`flex-1 py-2 rounded-lg border items-center ${
                  petSpecies === sp ? 'border-emerald-600 bg-emerald-50' : 'border-gray-200 bg-white'
                }`}
              >
                <Text className={`text-xs font-semibold ${petSpecies === sp ? 'text-emerald-700' : 'text-gray-600'}`}>
                  {sp.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            value={symptoms}
            onChangeText={setSymptoms}
            placeholder={isBangla ? 'সমস্যা ও লক্ষণ লিখুন...' : 'Describe symptoms...'}
            multiline
            numberOfLines={3}
            className="border border-gray-300 rounded-lg p-2.5 text-gray-800 text-sm"
          />
        </View>

        {/* 4. Time Window & Contact */}
        <View className="bg-white p-4 rounded-xl border border-gray-200 mb-6 shadow-sm">
          <Text className="font-bold text-gray-800 text-sm mb-2">
            📅 {isBangla ? '৪. সময় ও যোগাযোগ' : '4. Time Slot & Contact'}
          </Text>

          <View className="flex-row gap-2 mb-3">
            {[
              { id: 'morning', labelBn: 'সকাল', labelEn: 'Morning' },
              { id: 'afternoon', labelBn: 'দুপুর', labelEn: 'Afternoon' },
              { id: 'evening', labelBn: 'সন্ধ্যা', labelEn: 'Evening' },
            ].map((slot) => (
              <TouchableOpacity
                key={slot.id}
                onPress={() => setTimeSlot(slot.id as any)}
                className={`flex-1 py-2.5 rounded-lg border items-center ${
                  timeSlot === slot.id ? 'border-emerald-600 bg-emerald-50' : 'border-gray-200 bg-white'
                }`}
              >
                <Text className={`text-xs font-bold ${timeSlot === slot.id ? 'text-emerald-700' : 'text-gray-600'}`}>
                  {isBangla ? slot.labelBn : slot.labelEn}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            value={phone}
            onChangeText={setPhone}
            placeholder="+880 1711223344"
            keyboardType="phone-pad"
            className="border border-gray-300 rounded-lg p-2.5 text-gray-800 text-sm"
          />
        </View>

        {/* Submit */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={submitting}
          className="bg-emerald-700 py-3.5 rounded-xl items-center mb-8 shadow-sm"
        >
          <Text className="text-white font-bold text-base">
            {submitting
              ? (isBangla ? 'অনুরোধ পাঠানো হচ্ছে...' : 'Submitting...')
              : (isBangla ? 'হোম ভিজিট বুক করুন' : 'Book Home Visit')}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
