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
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useLocale } from '@pranora/i18n';
import {
  BOARDING_ROOM_TYPES,
  calculateBoardingCost,
  getBoardingHostels,
  submitBoardingBooking,
  type BoardingRoomType,
  type BoardingBookingResult,
} from '@pranora/api';

export default function MobileBoardingScreen() {
  const router = useRouter();
  const { isBangla } = useLocale();

  const [hostels, setHostels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClinicId, setSelectedClinicId] = useState('');

  const [roomType, setRoomType] = useState<BoardingRoomType>('deluxe_ac');
  const [petName, setPetName] = useState('');
  const [checkInDate, setCheckInDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [checkOutDate, setCheckOutDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 4);
    return d.toISOString().split('T')[0];
  });

  const [vaccinationUpToDate, setVaccinationUpToDate] = useState(true);
  const [emergencyContact, setEmergencyContact] = useState('+880 1812345678');
  const [phone, setPhone] = useState('+880 1711223344');

  const [submitting, setSubmitting] = useState(false);
  const [submittedBooking, setSubmittedBooking] = useState<BoardingBookingResult | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await getBoardingHostels(23.7465, 90.3752);
        setHostels(data);
        if (data.length > 0) setSelectedClinicId(data[0].clinicId);
      } catch (err) {
        console.error('Failed to load hostels:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const selectedHostel = hostels.find((h) => h.clinicId === selectedClinicId) || hostels[0];
  const cost = calculateBoardingCost(checkInDate, checkOutDate, roomType);

  const handleSubmit = async () => {
    if (!selectedHostel) {
      Alert.alert('Error', isBangla ? 'হোস্টেল নির্বাচন করুন' : 'Select a facility');
      return;
    }
    if (!petName.trim()) {
      Alert.alert('Error', isBangla ? 'প্রাণীর নাম লিখুন' : 'Enter pet name');
      return;
    }
    if (!vaccinationUpToDate) {
      Alert.alert('Required', isBangla ? 'ভ্যাকসিন দেওয়া থাকা বাধ্যতামূলক' : 'Vaccination is required');
      return;
    }

    try {
      setSubmitting(true);
      const res = await submitBoardingBooking({
        clinicId: selectedHostel.clinicId,
        locationId: selectedHostel.locationId,
        petName,
        petSpecies: 'dog',
        checkInDate,
        checkOutDate,
        roomType,
        vaccinationUpToDate,
        emergencyContact,
        phone,
      });
      setSubmittedBooking(res);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Reservation failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (submittedBooking) {
    return (
      <SafeAreaView className="flex-1 bg-white p-5 justify-center items-center">
        <View className="w-16 h-16 bg-amber-100 rounded-full items-center justify-center mb-4">
          <Text className="text-3xl">🏨</Text>
        </View>
        <Text className="text-xl font-bold text-gray-900 mb-2 text-center">
          {isBangla ? 'বোর্ডিং বুকিং সফল!' : 'Boarding Reserved!'}
        </Text>
        <Text className="text-gray-600 text-sm mb-6 text-center">
          {isBangla ? 'হোস্টেল কতৃপক্ষ শীঘ্রই যোগাযোগ করবে।' : 'Facility team will contact you shortly.'}
        </Text>

        <View className="bg-gray-50 border border-gray-200 rounded-xl p-4 w-full mb-6">
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-500 text-sm">{isBangla ? 'কোড:' : 'Code:'}</Text>
            <Text className="font-bold text-amber-800 text-sm">{submittedBooking.code}</Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-500 text-sm">{isBangla ? 'কক্ষ:' : 'Room:'}</Text>
            <Text className="font-semibold text-gray-800 text-sm">{submittedBooking.roomName}</Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-500 text-sm">{isBangla ? 'মেয়াদ:' : 'Duration:'}</Text>
            <Text className="font-semibold text-gray-800 text-sm">
              {submittedBooking.nights} {isBangla ? 'রাত' : 'nights'}
            </Text>
          </View>
          <View className="flex-row justify-between pt-2 border-t border-gray-200">
            <Text className="text-gray-800 font-bold text-sm">{isBangla ? 'সর্বমোট বিল:' : 'Total Bill:'}</Text>
            <Text className="text-amber-800 font-bold text-base">৳ {submittedBooking.totalAmount}</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-amber-700 py-3.5 px-6 rounded-xl w-full items-center"
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
            <Text className="text-2xl">🏨</Text>
            <Text className="text-xl font-bold text-gray-900">
              {isBangla ? 'পোষা প্রাণীর বোর্ডিং' : 'Pet Boarding'}
            </Text>
          </View>
          <Text className="text-xs text-gray-500">
            {isBangla ? 'ভ্রমণে যাওয়ার সময় নির্ভরযোগ্য হোস্টেল আবাসন' : 'Safe boarding & day-care while you travel'}
          </Text>
        </View>

        {/* 1. Room Tiers */}
        <View className="bg-white p-4 rounded-xl border border-gray-200 mb-4 shadow-sm">
          <Text className="font-bold text-gray-800 text-sm mb-3">
            🛏️ {isBangla ? '১. রুমের ধরন নির্বাচন' : '1. Room Type'}
          </Text>

          {BOARDING_ROOM_TYPES.map((r) => {
            const isSelected = roomType === r.id;
            return (
              <TouchableOpacity
                key={r.id}
                onPress={() => setRoomType(r.id)}
                className={`p-3 rounded-xl border mb-2.5 ${
                  isSelected ? 'border-amber-600 bg-amber-50' : 'border-gray-200 bg-white'
                }`}
              >
                <View className="flex-row justify-between items-center mb-1">
                  <Text className="font-bold text-gray-900 text-sm">
                    {isBangla ? r.nameBn : r.nameEn}
                  </Text>
                  <Text className="font-bold text-amber-800 text-sm">৳ {r.nightlyRate}/night</Text>
                </View>
                <Text className="text-xs text-gray-500">
                  {isBangla ? r.descriptionBn : r.descriptionEn}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 2. Dates & Duration */}
        <View className="bg-white p-4 rounded-xl border border-gray-200 mb-4 shadow-sm">
          <Text className="font-bold text-gray-800 text-sm mb-2">
            📅 {isBangla ? '২. তারিখ পরিসীমা' : '2. Date Range'}
          </Text>
          <View className="flex-row gap-2 mb-2">
            <View className="flex-1">
              <Text className="text-[10px] text-gray-500 mb-1">{isBangla ? 'চেক-ইন' : 'Check-in'}</Text>
              <TextInput
                value={checkInDate}
                onChangeText={setCheckInDate}
                placeholder="YYYY-MM-DD"
                className="border border-gray-300 rounded-lg p-2 text-xs text-gray-800"
              />
            </View>
            <View className="flex-1">
              <Text className="text-[10px] text-gray-500 mb-1">{isBangla ? 'চেক-আউট' : 'Check-out'}</Text>
              <TextInput
                value={checkOutDate}
                onChangeText={setCheckOutDate}
                placeholder="YYYY-MM-DD"
                className="border border-gray-300 rounded-lg p-2 text-xs text-gray-800"
              />
            </View>
          </View>
          <Text className="text-xs text-amber-800 font-bold text-right">
            {cost.nights} {isBangla ? 'রাত অবস্থান' : 'Nights Stay'}
          </Text>
        </View>

        {/* 3. Pet & Vaccine */}
        <View className="bg-white p-4 rounded-xl border border-gray-200 mb-4 shadow-sm">
          <Text className="font-bold text-gray-800 text-sm mb-2">
            🐾 {isBangla ? '৩. প্রাণীর তথ্য' : '3. Pet Details'}
          </Text>
          <TextInput
            value={petName}
            onChangeText={setPetName}
            placeholder={isBangla ? 'প্রাণীর নাম (যেমন: রকি)' : 'Pet Name'}
            className="border border-gray-300 rounded-lg p-2.5 text-gray-800 text-sm mb-3"
          />

          <View className="flex-row items-center justify-between p-2.5 bg-emerald-50 rounded-lg border border-emerald-200">
            <Text className="text-xs text-emerald-900 flex-1 pr-2">
              {isBangla ? 'রেবিস ও কোর ভ্যাকসিন দেওয়া আছে' : 'All vaccines up-to-date'}
            </Text>
            <Switch
              value={vaccinationUpToDate}
              onValueChange={setVaccinationUpToDate}
              trackColor={{ false: '#d1d5db', true: '#10b981' }}
            />
          </View>
        </View>

        {/* 4. Contact */}
        <View className="bg-white p-4 rounded-xl border border-gray-200 mb-4 shadow-sm">
          <Text className="font-bold text-gray-800 text-sm mb-2">
            📞 {isBangla ? '৪. জরুরি যোগাযোগ' : '4. Contacts'}
          </Text>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            placeholder={isBangla ? 'আপনার ফোন' : 'Your Phone'}
            keyboardType="phone-pad"
            className="border border-gray-300 rounded-lg p-2 text-xs text-gray-800 mb-2"
          />
          <TextInput
            value={emergencyContact}
            onChangeText={setEmergencyContact}
            placeholder={isBangla ? 'বিকল্প জরুরি ফোন' : 'Emergency Contact'}
            keyboardType="phone-pad"
            className="border border-gray-300 rounded-lg p-2 text-xs text-gray-800"
          />
        </View>

        {/* Bill */}
        <View className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <View className="flex-row justify-between mb-1">
            <Text className="text-gray-600 text-xs">
              {cost.nights} {isBangla ? 'রাত রুম ভাড়া:' : 'nights room:'}
            </Text>
            <Text className="font-semibold text-gray-800 text-xs">৳ {cost.subtotal}</Text>
          </View>
          <View className="flex-row justify-between mb-1">
            <Text className="text-gray-600 text-xs">{isBangla ? 'খাবার ও কেয়ার:' : 'Food & Care:'}</Text>
            <Text className="font-semibold text-gray-800 text-xs">৳ {cost.foodAndCareFee}</Text>
          </View>
          <View className="flex-row justify-between pt-2 border-t border-amber-200">
            <Text className="font-bold text-gray-900 text-sm">{isBangla ? 'সর্বমোট বিল:' : 'Total Bill:'}</Text>
            <Text className="font-bold text-amber-800 text-base">৳ {cost.totalAmount}</Text>
          </View>
        </View>

        {/* Submit */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={submitting}
          className="bg-amber-700 py-3.5 rounded-xl items-center mb-8 shadow-sm"
        >
          <Text className="text-white font-bold text-base">
            {submitting ? (isBangla ? 'সংরক্ষণ হচ্ছে...' : 'Reserving...') : (isBangla ? 'বোর্ডিং বুক করুন' : 'Book Boarding')}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
