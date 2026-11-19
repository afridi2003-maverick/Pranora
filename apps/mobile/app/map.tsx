import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Linking,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useLocale } from '@pranora/i18n';
import {
  getNearbyClinicsWithFallback,
  type NearbyClinicResult,
  buildBookingUrl,
  buildDirectionsUrl,
  buildTelUrl,
} from '@pranora/api';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const DEFAULT_DHAKA_COORDS = { lat: 23.7465, lng: 90.3752 }; // Dhanmondi

export default function MobileMapScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ emergency?: string }>();
  const { isBangla } = useLocale();

  // Location & Filter state
  const [userCoords, setUserCoords] = useState(DEFAULT_DHAKA_COORDS);
  const [search, setSearch] = useState('');
  const [filterOpenNow, setFilterOpenNow] = useState(false);
  const [filter24h, setFilter24h] = useState(false);
  const [filterEmergency, setFilterEmergency] = useState(params.emergency === 'true');
  const [filterGovt, setFilterGovt] = useState<'all' | 'govt' | 'private'>('all');
  const [selectedSpecies] = useState<'all' | 'dog' | 'cat'>('all');

  // Clinics state
  const [clinics, setClinics] = useState<NearbyClinicResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClinicId, setSelectedClinicId] = useState<string | null>(null);
  const [bottomSheetExpanded, setBottomSheetExpanded] = useState(false);

  useEffect(() => {
    let active = true;
    async function loadClinics() {
      setLoading(true);
      try {
        const results = await getNearbyClinicsWithFallback({
          lat: userCoords.lat,
          lng: userCoords.lng,
          radiusM: 20000,
          openNow: filterOpenNow,
          emergency: filterEmergency,
          species: selectedSpecies !== 'all' ? selectedSpecies : undefined,
          limit: 50,
        });
        if (active) {
          setClinics(results);
          if (results.length > 0 && !selectedClinicId) {
            setSelectedClinicId(results[0]?.locationId ?? null);
          }
        }
      } catch (err) {
        console.error('Failed to load nearby clinics:', err);
      } finally {
        if (active) setLoading(false);
      }
    }
    loadClinics();
    return () => {
      active = false;
    };
  }, [userCoords, filterOpenNow, filterEmergency, selectedSpecies]);

  const filteredClinics = useMemo(() => {
    return clinics.filter((c) => {
      const name = (isBangla ? c.nameBn : c.nameEn) || c.nameEn || '';
      const address = (isBangla ? c.addressBn : c.addressEn) || c.addressEn || '';
      const matchesSearch =
        name.toLowerCase().includes(search.toLowerCase()) ||
        address.toLowerCase().includes(search.toLowerCase());

      if (!matchesSearch) return false;
      if (filter24h && !c.is24h) return false;
      if (filterGovt === 'govt' && !c.isGovernment) return false;
      if (filterGovt === 'private' && c.isGovernment) return false;

      return true;
    });
  }, [clinics, search, filter24h, filterGovt, isBangla]);

  const handleCall = (phone: string | null) => {
    if (phone) {
      Linking.openURL(buildTelUrl(phone)).catch(() => {
        Alert.alert(isBangla ? 'ভুল' : 'Error', isBangla ? 'কল করা সম্ভব হচ্ছে না' : 'Cannot place call');
      });
    }
  };

  const handleDirections = (lat: number, lng: number) => {
    Linking.openURL(buildDirectionsUrl(lat, lng)).catch(() => {
      Alert.alert(isBangla ? 'ভুল' : 'Error', isBangla ? 'ম্যাপ খোলা যাচ্ছে না' : 'Cannot open maps');
    });
  };

  const handleBook = (locationId: string) => {
    const url = buildBookingUrl({ locationId });
    router.push(url as any);
  };

  return (
    <View className="flex-1 bg-slate-900">
      {/* Top Floating Search & Filter Card */}
      <View className="absolute top-3 left-3 right-3 z-30 bg-white/95 rounded-2xl p-3 shadow-lg border border-gray-100">
        <View className="flex-row items-center gap-2 mb-2">
          <Text className="text-base">📍</Text>
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder={isBangla ? 'ক্লিনিকের নাম বা এলাকা খুঁজুন...' : 'Search clinic or area...'}
            className="flex-1 p-2 bg-gray-100 rounded-lg text-xs"
          />
          <TouchableOpacity
            onPress={() => setFilterEmergency((p) => !p)}
            className={`px-3 py-2 rounded-lg flex-row items-center gap-1 ${
              filterEmergency ? 'bg-red-600' : 'bg-red-50 border border-red-200'
            }`}
          >
            <Text className="text-xs">🚨</Text>
            <Text className={`text-[11px] font-bold ${filterEmergency ? 'text-white' : 'text-red-700'}`}>
              {isBangla ? 'জরুরি' : 'SOS'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Filter Badges Horizontal Scroll */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-1.5 pt-1">
          <TouchableOpacity
            onPress={() => setFilterOpenNow((p) => !p)}
            className={`px-2.5 py-1 rounded-full border ${
              filterOpenNow ? 'bg-green-700 border-green-700' : 'bg-gray-100 border-gray-200'
            }`}
          >
            <Text className={`text-[11px] ${filterOpenNow ? 'text-white font-bold' : 'text-gray-700'}`}>
              {isBangla ? 'এখন খোলা' : 'Open Now'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setFilter24h((p) => !p)}
            className={`px-2.5 py-1 rounded-full border ${
              filter24h ? 'bg-green-700 border-green-700' : 'bg-gray-100 border-gray-200'
            }`}
          >
            <Text className={`text-[11px] ${filter24h ? 'text-white font-bold' : 'text-gray-700'}`}>
              {isBangla ? '২৪/৭ খোলা' : '24/7'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setFilterGovt((p) => (p === 'govt' ? 'all' : 'govt'))}
            className={`px-2.5 py-1 rounded-full border ${
              filterGovt === 'govt' ? 'bg-blue-600 border-blue-600' : 'bg-gray-100 border-gray-200'
            }`}
          >
            <Text className={`text-[11px] ${filterGovt === 'govt' ? 'text-white font-bold' : 'text-gray-700'}`}>
              🏛️ {isBangla ? 'সরকারি' : 'Govt'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setFilterGovt((p) => (p === 'private' ? 'all' : 'private'))}
            className={`px-2.5 py-1 rounded-full border ${
              filterGovt === 'private' ? 'bg-purple-600 border-purple-600' : 'bg-gray-100 border-gray-200'
            }`}
          >
            <Text className={`text-[11px] ${filterGovt === 'private' ? 'text-white font-bold' : 'text-gray-700'}`}>
              🏥 {isBangla ? 'বেসরকারি' : 'Private'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Interactive Map Visualizer (Center User Pin & Markers) */}
      <View className="flex-1 items-center justify-center relative overflow-hidden">
        {/* Radar Rings */}
        <View className="absolute w-72 h-72 rounded-full border border-green-500/20" />
        <View className="absolute w-96 h-96 rounded-full border border-green-500/10" />

        {/* User Current Location Pin */}
        <View className="items-center z-10">
          <View className="w-5 h-5 rounded-full bg-blue-500 border-2 border-white shadow-md" />
          <Text className="text-[10px] text-blue-200 bg-black/60 px-1.5 py-0.5 rounded mt-1 font-bold">
            {isBangla ? 'আমার অবস্থান' : 'You'}
          </Text>
        </View>

        {/* Clinic Pins */}
        {filteredClinics.map((c) => {
          const dx = (c.lng - userCoords.lng) * 2500;
          const dy = (userCoords.lat - c.lat) * 2500;
          const isSelected = c.locationId === selectedClinicId;

          return (
            <TouchableOpacity
              key={c.locationId}
              onPress={() => setSelectedClinicId(c.locationId)}
              style={{
                position: 'absolute',
                transform: [{ translateX: dx }, { translateY: dy }],
              }}
              className={`items-center z-20 ${isSelected ? 'scale-125 z-30' : ''}`}
            >
              <View
                className={`w-9 h-9 rounded-full items-center justify-center border-2 border-white shadow-lg ${
                  c.hasEmergency ? 'bg-red-600' : c.isGovernment ? 'bg-blue-600' : 'bg-green-700'
                }`}
              >
                <Text className="text-sm">{c.hasEmergency ? '🚨' : c.isGovernment ? '🏛️' : '🏥'}</Text>
              </View>
              <View className="bg-black/80 px-2 py-0.5 rounded mt-0.5">
                <Text className="text-[10px] text-white font-bold truncate max-w-[100px]">
                  {isBangla ? c.nameBn ?? c.nameEn : c.nameEn}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}

        {/* GPS Re-center FAB */}
        <TouchableOpacity
          onPress={() => setUserCoords(DEFAULT_DHAKA_COORDS)}
          className="absolute right-4 bottom-56 z-20 w-11 h-11 bg-white rounded-full items-center justify-center shadow-lg border border-gray-200"
        >
          <Text className="text-lg">🎯</Text>
        </TouchableOpacity>
      </View>

      {/* Distance-Sorted Clinic List Bottom Sheet (MAP-2) */}
      <View
        style={{ height: bottomSheetExpanded ? SCREEN_HEIGHT * 0.65 : 230 }}
        className="bg-white rounded-t-3xl shadow-2xl border-t border-gray-200 z-30"
      >
        {/* Drag Handle */}
        <TouchableOpacity
          onPress={() => setBottomSheetExpanded((p) => !p)}
          className="items-center py-2 border-b border-gray-100"
        >
          <View className="w-12 h-1.5 bg-gray-300 rounded-full mb-1" />
          <Text className="text-[11px] text-gray-500 font-bold">
            {isBangla
              ? `${filteredClinics.length}টি ক্লিনিক পাওয়া গেছে (${bottomSheetExpanded ? 'সংক্ষিপ্ত করুন ▼' : 'সম্পূর্ণ তালিকা দেখুন ▲'})`
              : `${filteredClinics.length} clinics nearby (${bottomSheetExpanded ? 'Collapse ▼' : 'Expand full list ▲'})`}
          </Text>
        </TouchableOpacity>

        {loading ? (
          <View className="flex-1 items-center justify-center p-4">
            <ActivityIndicator size="small" color="#2F7B53" />
          </View>
        ) : (
          <ScrollView className="flex-1 px-4 py-2" showsVerticalScrollIndicator={false}>
            {filteredClinics.map((clinic) => {
              const isSelected = clinic.locationId === selectedClinicId;
              const name = (isBangla ? clinic.nameBn : clinic.nameEn) || clinic.nameEn;
              const address = (isBangla ? clinic.addressBn : clinic.addressEn) || clinic.addressEn;
              const distanceKm = (clinic.distanceM / 1000).toFixed(1);

              return (
                <TouchableOpacity
                  key={clinic.locationId}
                  onPress={() => setSelectedClinicId(clinic.locationId)}
                  className={`p-3 rounded-xl mb-2.5 border ${
                    isSelected ? 'bg-green-50/70 border-green-600' : 'bg-gray-50 border-gray-200'
                  }`}
                  activeOpacity={0.7}
                >
                  <View className="flex-row justify-between items-start mb-1">
                    <View className="flex-1 mr-2">
                      <View className="flex-row items-center gap-1.5 flex-wrap">
                        <Text className="text-sm font-bold text-gray-900">{name}</Text>
                        {clinic.isGovernment && (
                          <Text className="text-[9px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.5 rounded">
                            সরকারি
                          </Text>
                        )}
                      </View>
                      <Text className="text-[11px] text-gray-500 truncate mt-0.5">📍 {address}</Text>
                    </View>

                    <View className="items-end">
                      <Text className="text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded">
                        {distanceKm} km
                      </Text>
                      <Text className="text-[10px] text-emerald-600 font-bold mt-0.5">
                        {clinic.isOpenNow ? (isBangla ? '● এখন খোলা' : '● Open') : (isBangla ? '● বন্ধ' : '● Closed')}
                      </Text>
                    </View>
                  </View>

                  {/* Actions Row */}
                  <View className="flex-row gap-2 mt-2 pt-2 border-t border-gray-200">
                    <TouchableOpacity
                      onPress={() => handleCall(clinic.phone)}
                      className="flex-1 py-1.5 bg-white border border-gray-300 rounded-lg items-center justify-center flex-row gap-1"
                    >
                      <Text className="text-xs">📞</Text>
                      <Text className="text-[11px] text-gray-800 font-bold">{isBangla ? 'কল' : 'Call'}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => handleDirections(clinic.lat, clinic.lng)}
                      className="flex-1 py-1.5 bg-white border border-gray-300 rounded-lg items-center justify-center flex-row gap-1"
                    >
                      <Text className="text-xs">🗺️</Text>
                      <Text className="text-[11px] text-gray-800 font-bold">{isBangla ? 'পথ' : 'Dir'}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => handleBook(clinic.locationId)}
                      className="flex-1 py-1.5 bg-green-700 rounded-lg items-center justify-center flex-row gap-1"
                    >
                      <Text className="text-xs">📅</Text>
                      <Text className="text-[11px] text-white font-bold">{isBangla ? 'বুক' : 'Book'}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => router.push(`/clinics/${clinic.locationId}` as any)}
                      className="py-1.5 px-3 bg-gray-200 rounded-lg items-center justify-center"
                    >
                      <Text className="text-[11px] text-gray-800 font-bold">{isBangla ? 'বিস্তারিত' : 'Detail'}</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
      </View>
    </View>
  );
}
