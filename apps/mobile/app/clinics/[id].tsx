import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
  ActivityIndicator,
  Share,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useLocale } from '@pranora/i18n';
import { getClinicFullDetail, type ClinicFullDetail } from '@pranora/api';

const WEEKDAYS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const WEEKDAYS_BN = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];

export default function MobileClinicDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { isBangla } = useLocale();

  const [clinic, setClinic] = useState<ClinicFullDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedPhotoIdx, setSelectedPhotoIdx] = useState<number>(0);
  const [showAllHours, setShowAllHours] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      try {
        const data = await getClinicFullDetail(id);
        if (isMounted) setClinic(data);
      } catch (err) {
        console.error('Failed to load clinic:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleCall = () => {
    const phone = clinic?.location.phone || clinic?.provider.phone;
    if (phone) {
      Linking.openURL(`tel:${phone}`).catch(() => {
        Alert.alert(isBangla ? 'ভুল' : 'Error', isBangla ? 'কল করা সম্ভব হচ্ছে না' : 'Cannot place call');
      });
    }
  };

  const handleDirections = () => {
    if (!clinic) return;
    const { lat, lng } = clinic.location;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    Linking.openURL(url).catch(() => {
      Alert.alert(isBangla ? 'ভুল' : 'Error', isBangla ? 'ম্যাপ খোলা যাচ্ছে না' : 'Cannot open maps');
    });
  };

  const handleShare = async () => {
    if (!clinic) return;
    const name = isBangla ? clinic.provider.nameBn ?? '' : clinic.provider.nameEn ?? '';
    try {
      await Share.share({
        message: `${name} - Pranora Pet Care https://pranora.com.bd/clinics/${clinic.location.id}`,
      });
    } catch {
      // Ignored
    }
  };

  const handleBook = (serviceId?: string, vetId?: string) => {
    if (!clinic) return;
    const path = `/book?locationId=${clinic.location.id}${serviceId ? `&serviceId=${serviceId}` : ''}${vetId ? `&vetId=${vetId}` : ''}`;
    router.push(path as any);
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white p-6">
        <ActivityIndicator size="large" color="#2F7B53" />
        <Text className="text-gray-500 mt-3 text-sm">
          {isBangla ? 'ক্লিনিকের তথ্য লোড হচ্ছে...' : 'Loading clinic details...'}
        </Text>
      </View>
    );
  }

  if (!clinic) {
    return (
      <View className="flex-1 items-center justify-center bg-white p-6">
        <Text className="text-4xl mb-3">🏥</Text>
        <Text className="text-lg font-bold text-gray-800 text-center mb-2">
          {isBangla ? 'ক্লিনিক পাওয়া যায়নি' : 'Clinic Not Found'}
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-4 px-6 py-2.5 rounded-full bg-green-700"
        >
          <Text className="text-white font-bold">{isBangla ? 'ফিরে যান' : 'Go Back'}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { location, provider, hours, vets, services } = clinic;
  const clinicName = (isBangla ? provider.nameBn : provider.nameEn) || provider.nameEn || '';
  const clinicSubName = isBangla ? provider.nameEn : provider.nameBn;
  const address = (isBangla ? location.addressBn : location.addressEn) || location.addressEn || '';
  const description =
    (isBangla ? provider.descriptionBn : provider.descriptionEn) || provider.descriptionEn || '';

  const photos =
    location.photos && location.photos.length > 0
      ? location.photos
      : ['https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=800'];

  const currentDayIndex = new Date().getDay();

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 110 }}>
        {/* Hero Photo Header */}
        <View className="relative w-full h-64 bg-gray-900">
          <Image
            source={{ uri: photos[selectedPhotoIdx] || photos[0] }}
            className="w-full h-full"
            resizeMode="cover"
          />

          {/* Badges Overlay */}
          <View className="absolute top-4 left-4 flex-row flex-wrap gap-1.5">
            {provider.verification === 'verified' && (
              <View className="bg-green-700 px-2.5 py-1 rounded-full shadow">
                <Text className="text-white text-xs font-bold">✓ {isBangla ? 'যাচাইকৃত' : 'Verified'}</Text>
              </View>
            )}
            {provider.isGovernment ? (
              <View className="bg-blue-600 px-2.5 py-1 rounded-full shadow">
                <Text className="text-white text-xs font-bold">🏛️ {isBangla ? 'সরকারি' : 'Govt'}</Text>
              </View>
            ) : (
              <View className="bg-purple-700 px-2.5 py-1 rounded-full shadow">
                <Text className="text-white text-xs font-bold">🏥 {isBangla ? 'বেসরকারি' : 'Private'}</Text>
              </View>
            )}
            {location.is24h && (
              <View className="bg-emerald-600 px-2.5 py-1 rounded-full shadow">
                <Text className="text-white text-xs font-bold">🕒 ২৪/৭</Text>
              </View>
            )}
            {location.hasEmergency && (
              <View className="bg-red-600 px-2.5 py-1 rounded-full shadow">
                <Text className="text-white text-xs font-bold">🚨 {isBangla ? 'জরুরি' : 'Emergency'}</Text>
              </View>
            )}
          </View>

          {/* Photo Dots / Selector */}
          {photos.length > 1 && (
            <View className="absolute bottom-3 right-4 flex-row gap-1 bg-black/50 px-2 py-1 rounded-full">
              {photos.map((_, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => setSelectedPhotoIdx(i)}
                  className={`w-2 h-2 rounded-full ${selectedPhotoIdx === i ? 'bg-white' : 'bg-white/40'}`}
                />
              ))}
            </View>
          )}
        </View>

        {/* Title & Info Card */}
        <View className="bg-white p-4 mb-3 border-b border-gray-100">
          <Text className="text-xl font-bold text-gray-900 mb-1">{clinicName}</Text>
          {clinicSubName && <Text className="text-xs text-gray-500 mb-2">{clinicSubName}</Text>}

          <View className="flex-row items-center gap-2 mb-3">
            <View className="flex-row items-center bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              <Text className="text-amber-800 text-xs font-bold">★ {provider.ratingAvg.toFixed(1)}</Text>
              <Text className="text-amber-600 text-[10px] ml-1">({provider.ratingCount})</Text>
            </View>
            <Text className="text-xs text-gray-500 truncate flex-1">📍 {address}</Text>
          </View>

          {/* Action Row: Call, Directions, Share */}
          <View className="flex-row gap-2 pt-3 border-t border-gray-100">
            <TouchableOpacity
              onPress={handleCall}
              className="flex-1 py-2.5 rounded-lg bg-green-50 border border-green-200 items-center justify-center flex-row gap-1"
            >
              <Text className="text-sm">📞</Text>
              <Text className="text-green-800 text-xs font-bold">{isBangla ? 'কল করুন' : 'Call'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleDirections}
              className="flex-1 py-2.5 rounded-lg bg-gray-50 border border-gray-200 items-center justify-center flex-row gap-1"
            >
              <Text className="text-sm">🗺️</Text>
              <Text className="text-gray-800 text-xs font-bold">{isBangla ? 'পথ দেখুন' : 'Directions'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleShare}
              className="py-2.5 px-4 rounded-lg bg-gray-50 border border-gray-200 items-center justify-center"
            >
              <Text className="text-sm">📤</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Overview & Hours */}
        <View className="bg-white p-4 mb-3 border-b border-gray-100">
          <Text className="text-sm font-bold text-gray-900 mb-2">
            ℹ️ {isBangla ? 'ক্লিনিক পরিচিতি' : 'About Clinic'}
          </Text>
          <Text className="text-xs text-gray-600 leading-relaxed mb-3">{description}</Text>

          {/* Species Chips */}
          <Text className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
            {isBangla ? 'চিকিৎসা করা প্রজাতি' : 'Species Treated'}
          </Text>
          <View className="flex-row flex-wrap gap-1.5 mb-3">
            {location.speciesTreated.map((sp) => (
              <View key={sp} className="bg-gray-100 px-2 py-1 rounded">
                <Text className="text-[11px] text-gray-700 capitalize">{sp}</Text>
              </View>
            ))}
          </View>

          {/* Operating Hours Box */}
          <View className="bg-green-50/60 p-3 rounded-lg border border-green-100">
            <View className="flex-row justify-between items-center mb-1.5">
              <Text className="text-xs font-bold text-green-900">
                🕒 {isBangla ? 'সাপ্তাহিক সময়সূচি' : 'Operating Hours'}
              </Text>
              {location.is24h && (
                <Text className="text-[10px] font-bold text-green-700 bg-green-200 px-1.5 py-0.5 rounded">
                  ২৪/৭ খোলা
                </Text>
              )}
            </View>

            {location.is24h ? (
              <Text className="text-xs text-green-800">
                {isBangla ? 'সার্বক্ষণিক ২৪ ঘণ্টা সেবা খোলা থাকে।' : 'Open 24 hours every day.'}
              </Text>
            ) : (
              <View>
                {(showAllHours ? [0, 1, 2, 3, 4, 5, 6] : [currentDayIndex]).map((dIdx) => {
                  const h = hours.find((x) => x.weekday === dIdx);
                  const isToday = dIdx === currentDayIndex;
                  return (
                    <View key={dIdx} className="flex-row justify-between py-1">
                      <Text className={`text-xs ${isToday ? 'font-bold text-green-900' : 'text-gray-600'}`}>
                        {isBangla ? WEEKDAYS_BN[dIdx] : WEEKDAYS_EN[dIdx]} {isToday ? `(${isBangla ? 'আজ' : 'Today'})` : ''}
                      </Text>
                      <Text className={`text-xs ${isToday ? 'font-bold text-green-900' : 'text-gray-600'}`}>
                        {h ? `${h.openTime.slice(0, 5)} - ${h.closeTime.slice(0, 5)}` : (isBangla ? 'বন্ধ' : 'Closed')}
                      </Text>
                    </View>
                  );
                })}
                <TouchableOpacity onPress={() => setShowAllHours((p) => !p)} className="mt-1 pt-1 border-t border-green-100">
                  <Text className="text-[11px] text-green-800 font-bold text-center">
                    {showAllHours ? (isBangla ? 'সংক্ষিপ্ত ▲' : 'Show less ▲') : (isBangla ? 'পুরো সপ্তাহের সূচি ▼' : 'View full schedule ▼')}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Doctors List */}
        <View className="bg-white p-4 mb-3 border-b border-gray-100">
          <Text className="text-sm font-bold text-gray-900 mb-3">
            🩺 {isBangla ? 'কর্মরত রেজিস্টার্ড পশু চিকিৎসকগণ' : 'Attending Registered Vets'}
          </Text>

          {vets.map((vet) => {
            const vName = (isBangla ? vet.fullNameBn : vet.fullNameEn) || vet.fullNameEn;
            return (
              <View key={vet.id} className="flex-row gap-3 py-2.5 border-b border-gray-100 last:border-b-0">
                <Image
                  source={{ uri: vet.photoUrl || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200' }}
                  className="w-12 h-12 rounded-full border border-green-600"
                />
                <View className="flex-1">
                  <Text className="text-sm font-bold text-gray-900">{vName}</Text>
                  {vet.bvcRegNo && (
                    <Text className="text-[10px] text-green-700 font-bold">{isBangla ? 'BVC রেজি:' : 'BVC Reg:'} {vet.bvcRegNo}</Text>
                  )}
                  {vet.degrees && <Text className="text-[11px] text-gray-600">{vet.degrees}</Text>}
                  {vet.specialization && <Text className="text-[10px] text-gray-500">{vet.specialization}</Text>}
                  <View className="flex-row justify-between items-center mt-1.5">
                    <Text className="text-xs font-bold text-gray-800">
                      {isBangla ? 'ফি: ৳' : 'Fee: ৳'}{vet.consultationFee ?? 500}
                    </Text>
                    <TouchableOpacity
                      onPress={() => handleBook(undefined, vet.id)}
                      className="px-3 py-1 rounded bg-green-50 border border-green-200"
                    >
                      <Text className="text-[10px] text-green-800 font-bold">{isBangla ? 'পরামর্শ নিন' : 'Consult'}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* Services & Pricing */}
        <View className="bg-white p-4 mb-3 border-b border-gray-100">
          <Text className="text-sm font-bold text-gray-900 mb-2">
            📋 {isBangla ? 'সেবা ও মূল্য তালিকা' : 'Services & Pricing'}
          </Text>

          {services.map((svc) => {
            const sName = (isBangla ? svc.nameBn : svc.nameEn) || svc.nameEn;
            return (
              <View key={svc.id} className="flex-row justify-between items-center py-2.5 border-b border-gray-50 last:border-b-0">
                <View className="flex-1 mr-2">
                  <Text className="text-xs font-bold text-gray-900">{sName}</Text>
                  {svc.durationMinutes && (
                    <Text className="text-[10px] text-gray-500">⏱️ {svc.durationMinutes} {isBangla ? 'মিনিট' : 'mins'}</Text>
                  )}
                </View>
                <View className="flex-row items-center gap-2">
                  <Text className="text-xs font-bold text-green-700">৳{svc.price}</Text>
                  <TouchableOpacity
                    onPress={() => handleBook(svc.serviceId)}
                    className="px-2.5 py-1 rounded bg-green-700"
                  >
                    <Text className="text-[10px] text-white font-bold">{isBangla ? 'বুক' : 'Book'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Floating Bottom Bar */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 flex-row gap-2 shadow-lg">
        <TouchableOpacity
          onPress={handleCall}
          className="flex-1 py-3 rounded-xl bg-gray-100 items-center justify-center flex-row gap-1"
        >
          <Text className="text-base">📞</Text>
          <Text className="text-gray-800 font-bold text-sm">{isBangla ? 'কল করুন' : 'Call'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleBook()}
          className="flex-2 py-3 px-6 rounded-xl bg-green-700 items-center justify-center flex-row gap-1"
        >
          <Text className="text-base">📅</Text>
          <Text className="text-white font-bold text-sm">{isBangla ? 'বুক করুন' : 'Book Appointment'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
