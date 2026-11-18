import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useLocale } from '@pranora/i18n';
import { getAllMockClinics } from '@pranora/api';

export default function MobileClinicsListScreen() {
  const router = useRouter();
  const { isBangla } = useLocale();
  const [search, setSearch] = useState('');
  const clinics = getAllMockClinics();

  const filtered = clinics.filter((c) => {
    const name = (isBangla ? c.provider.nameBn : c.provider.nameEn) || c.provider.nameEn || '';
    const address = (isBangla ? c.location.addressBn : c.location.addressEn) || c.location.addressEn || '';
    return (
      name.toLowerCase().includes(search.toLowerCase()) ||
      address.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white p-4 border-b border-gray-100">
        <Text className="text-xl font-bold text-green-900 mb-1">
          🏥 {isBangla ? 'ক্লিনিক ও পশু হাসপাতাল' : 'Clinics & Vet Hospitals'}
        </Text>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder={isBangla ? 'ক্লিনিকের নাম বা এলাকা খুঁজুন...' : 'Search clinic or area...'}
          className="mt-2 p-2.5 bg-gray-100 rounded-lg text-sm"
        />
      </View>

      <ScrollView className="flex-1 p-3">
        {filtered.map((clinic) => {
          const name = (isBangla ? clinic.provider.nameBn : clinic.provider.nameEn) || clinic.provider.nameEn;
          const address = (isBangla ? clinic.location.addressBn : clinic.location.addressEn) || clinic.location.addressEn;
          const photo = clinic.location.photos[0] || 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=800';

          return (
            <TouchableOpacity
              key={clinic.location.id}
              onPress={() => router.push(`/clinics/${clinic.location.id}` as any)}
              className="bg-white rounded-xl overflow-hidden mb-3 border border-gray-100 shadow-sm"
              activeOpacity={0.8}
            >
              <Image source={{ uri: photo }} className="w-full h-32" resizeMode="cover" />
              <View className="p-3">
                <View className="flex-row items-center gap-1.5 mb-1">
                  <Text className="text-sm font-bold text-gray-900 flex-1 truncate">{name}</Text>
                  {clinic.provider.isGovernment && (
                    <Text className="text-[10px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.5 rounded">
                      সরকারি
                    </Text>
                  )}
                  {clinic.location.is24h && (
                    <Text className="text-[10px] bg-green-100 text-green-800 font-bold px-1.5 py-0.5 rounded">
                      ২৪/৭
                    </Text>
                  )}
                </View>
                <Text className="text-xs text-gray-500 mb-2 truncate">📍 {address}</Text>
                <View className="flex-row justify-between items-center pt-2 border-t border-gray-50">
                  <Text className="text-xs text-amber-700 font-bold">
                    ★ {clinic.provider.ratingAvg.toFixed(1)} ({clinic.provider.ratingCount})
                  </Text>
                  <Text className="text-xs text-green-700 font-bold">
                    {isBangla ? 'পরামর্শ ফি: ৳' : 'Fee: ৳'}
                    {clinic.vets[0]?.consultationFee ?? clinic.services[0]?.price ?? 500}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
