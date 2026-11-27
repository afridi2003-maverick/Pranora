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
  GROOMING_PACKAGES,
  GROOMING_ADDONS,
  calculateGroomingPrice,
  getGroomingSalons,
  submitGroomingBooking,
  type GroomingPackageType,
  type PetSize,
  type GroomingBookingResult,
} from '@pranora/api';

export default function MobileGroomingScreen() {
  const router = useRouter();
  const { isBangla } = useLocale();

  const [salons, setSalons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClinicId, setSelectedClinicId] = useState('');

  const [packageType, setPackageType] = useState<GroomingPackageType>('bath_brush');
  const [petSize, setPetSize] = useState<PetSize>('small');
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [petName, setPetName] = useState('');
  const [appointmentDate, setAppointmentDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [appointmentTime, setAppointmentTime] = useState('11:30');
  const [phone, setPhone] = useState('+880 1711223344');
  const [submitting, setSubmitting] = useState(false);
  const [submittedBooking, setSubmittedBooking] = useState<GroomingBookingResult | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await getGroomingSalons(23.7465, 90.3752);
        setSalons(data);
        if (data.length > 0) setSelectedClinicId(data[0].clinicId);
      } catch (err) {
        console.error('Failed to load salons:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const selectedSalon = salons.find((s) => s.clinicId === selectedClinicId) || salons[0];
  const priceInfo = calculateGroomingPrice(packageType, petSize, selectedAddons);

  const toggleAddon = (id: string) => {
    setSelectedAddons((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    if (!selectedSalon) {
      Alert.alert('Error', isBangla ? 'সেলুন নির্বাচন করুন' : 'Select a salon');
      return;
    }
    if (!petName.trim()) {
      Alert.alert('Error', isBangla ? 'প্রাণীর নাম লিখুন' : 'Enter pet name');
      return;
    }

    try {
      setSubmitting(true);
      const res = await submitGroomingBooking({
        clinicId: selectedSalon.clinicId,
        locationId: selectedSalon.locationId,
        petName,
        petSpecies: 'dog',
        petSize,
        packageType,
        appointmentDate,
        appointmentTime,
        phone,
        addons: selectedAddons,
      });
      setSubmittedBooking(res);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Booking failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (submittedBooking) {
    return (
      <SafeAreaView className="flex-1 bg-white p-5 justify-center items-center">
        <View className="w-16 h-16 bg-emerald-100 rounded-full items-center justify-center mb-4">
          <Text className="text-3xl">✂️</Text>
        </View>
        <Text className="text-xl font-bold text-gray-900 mb-2 text-center">
          {isBangla ? 'গ্রুমিং বুকিং নিশ্চিত হয়েছে!' : 'Grooming Confirmed!'}
        </Text>
        <Text className="text-gray-600 text-sm mb-6 text-center">
          {isBangla ? 'সেলুনে আপনার স্লট সংরক্ষিত রাখা হয়েছে।' : 'Slot reserved at the salon.'}
        </Text>

        <View className="bg-gray-50 border border-gray-200 rounded-xl p-4 w-full mb-6">
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-500 text-sm">{isBangla ? 'কোড:' : 'Code:'}</Text>
            <Text className="font-bold text-emerald-700 text-sm">{submittedBooking.code}</Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-500 text-sm">{isBangla ? 'প্যাকেজ:' : 'Package:'}</Text>
            <Text className="font-semibold text-gray-800 text-sm">{submittedBooking.packageName}</Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-500 text-sm">{isBangla ? 'তারিখ ও সময়:' : 'Time:'}</Text>
            <Text className="font-semibold text-gray-800 text-sm">
              {submittedBooking.appointmentDate} at {submittedBooking.appointmentTime}
            </Text>
          </View>
          <View className="flex-row justify-between pt-2 border-t border-gray-200">
            <Text className="text-gray-800 font-bold text-sm">{isBangla ? 'সর্বমোট ফি:' : 'Total Fee:'}</Text>
            <Text className="text-emerald-800 font-bold text-base">৳ {submittedBooking.totalAmount}</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-emerald-700 py-3.5 px-6 rounded-xl w-full items-center"
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
            <Text className="text-2xl">✂️</Text>
            <Text className="text-xl font-bold text-gray-900">
              {isBangla ? 'গ্রুমিং ও বাথ' : 'Pet Grooming'}
            </Text>
          </View>
          <Text className="text-xs text-gray-500">
            {isBangla ? 'গোসল, হেয়ারকাট, নখ ও কান পরিচর্যা' : 'Bathing, styling, nail trim & coat care'}
          </Text>
        </View>

        {/* 1. Packages */}
        <View className="bg-white p-4 rounded-xl border border-gray-200 mb-4 shadow-sm">
          <Text className="font-bold text-gray-800 text-sm mb-3">
            🧴 {isBangla ? '১. প্যাকেজ নির্বাচন' : '1. Select Package'}
          </Text>

          {GROOMING_PACKAGES.map((pkg) => {
            const isSelected = packageType === pkg.id;
            return (
              <TouchableOpacity
                key={pkg.id}
                onPress={() => setPackageType(pkg.id)}
                className={`p-3 rounded-xl border mb-2.5 ${
                  isSelected ? 'border-emerald-600 bg-emerald-50' : 'border-gray-200 bg-white'
                }`}
              >
                <View className="flex-row justify-between items-center mb-1">
                  <Text className="font-bold text-gray-900 text-sm">
                    {isBangla ? pkg.nameBn : pkg.nameEn}
                  </Text>
                  <Text className="font-bold text-emerald-800 text-sm">৳ {pkg.basePrice}</Text>
                </View>
                <Text className="text-xs text-gray-500">
                  {isBangla ? pkg.descriptionBn : pkg.descriptionEn}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 2. Pet Size */}
        <View className="bg-white p-4 rounded-xl border border-gray-200 mb-4 shadow-sm">
          <Text className="font-bold text-gray-800 text-sm mb-2">
            📏 {isBangla ? '২. প্রাণীর আকার' : '2. Pet Size'}
          </Text>
          <View className="flex-row gap-2">
            {[
              { id: 'small', label: isBangla ? 'ছোট (<৫ কেজি)' : 'Small (<5kg)' },
              { id: 'medium', label: isBangla ? 'মাঝারি (+৳২০০)' : 'Med (+৳200)' },
              { id: 'large', label: isBangla ? 'বড় (+৳৪০০)' : 'Large (+৳400)' },
            ].map((s) => (
              <TouchableOpacity
                key={s.id}
                onPress={() => setPetSize(s.id as any)}
                className={`flex-1 py-2 rounded-lg border items-center ${
                  petSize === s.id ? 'border-emerald-600 bg-emerald-50' : 'border-gray-200 bg-white'
                }`}
              >
                <Text className={`text-xs font-semibold ${petSize === s.id ? 'text-emerald-800' : 'text-gray-600'}`}>
                  {s.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 3. Pet & Schedule */}
        <View className="bg-white p-4 rounded-xl border border-gray-200 mb-4 shadow-sm">
          <Text className="font-bold text-gray-800 text-sm mb-2">
            🐾 {isBangla ? '৩. তথ্য ও সময়' : '3. Info & Slot'}
          </Text>
          <TextInput
            value={petName}
            onChangeText={setPetName}
            placeholder={isBangla ? 'প্রাণীর নাম (যেমন: টমি)' : 'Pet Name'}
            className="border border-gray-300 rounded-lg p-2.5 text-gray-800 text-sm mb-3"
          />

          <View className="flex-row gap-2 mb-3">
            {['10:00', '11:30', '14:00', '16:00'].map((slot) => (
              <TouchableOpacity
                key={slot}
                onPress={() => setAppointmentTime(slot)}
                className={`flex-1 py-2 rounded-lg border items-center ${
                  appointmentTime === slot ? 'border-emerald-600 bg-emerald-50' : 'border-gray-200 bg-white'
                }`}
              >
                <Text className={`text-xs font-bold ${appointmentTime === slot ? 'text-emerald-700' : 'text-gray-600'}`}>
                  {slot}
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

        {/* Price Box */}
        <View className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6">
          <View className="flex-row justify-between mb-1">
            <Text className="text-gray-600 text-xs">{isBangla ? 'বেস প্যাকেজ:' : 'Base Package:'}</Text>
            <Text className="font-semibold text-gray-800 text-xs">৳ {priceInfo.basePrice}</Text>
          </View>
          {priceInfo.sizeSurcharge > 0 && (
            <View className="flex-row justify-between mb-1">
              <Text className="text-gray-600 text-xs">{isBangla ? 'আকার চার্জ:' : 'Size Charge:'}</Text>
              <Text className="font-semibold text-gray-800 text-xs">৳ {priceInfo.sizeSurcharge}</Text>
            </View>
          )}
          <View className="flex-row justify-between pt-2 border-t border-emerald-200">
            <Text className="font-bold text-gray-900 text-sm">{isBangla ? 'মোট প্রদেয়:' : 'Total Payable:'}</Text>
            <Text className="font-bold text-emerald-800 text-base">৳ {priceInfo.totalAmount}</Text>
          </View>
        </View>

        {/* Submit */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={submitting}
          className="bg-emerald-700 py-3.5 rounded-xl items-center mb-8 shadow-sm"
        >
          <Text className="text-white font-bold text-base">
            {submitting ? (isBangla ? 'বুকিং হচ্ছে...' : 'Booking...') : (isBangla ? 'গ্রুমিং বুক করুন' : 'Book Grooming')}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
