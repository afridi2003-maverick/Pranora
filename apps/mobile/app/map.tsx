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
  searchAreas,
  getDivisions,
  getDistrictsByDivision,
  getUpazilasByDistrict,
  getUpazilaById,
  type AreaSearchResult,
  clusterMarkers,
  autoExpandRadius,
  RADIUS_TIERS_KM,
  saveNearbyCache,
  getNearbyCache,
} from '@pranora/api';
import { Modal } from 'react-native';

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

  // MAP-8 & MAP-10
  const [radiusKm, setRadiusKm] = useState<number>(10);
  const [autoExpandNotice, setAutoExpandNotice] = useState<string | null>(null);
  const [activeLayer, setActiveLayer] = useState<'all' | 'vet' | 'grooming' | 'boarding' | 'home_visit' | 'emergency'>('all');

  // Area Picker state (MAP-4)
  const [locationName, setLocationName] = useState('ধানমন্ডি, ঢাকা');
  const [areaModalVisible, setAreaModalVisible] = useState(false);
  const [selectedDivisionId, setSelectedDivisionId] = useState(3); // Default Dhaka
  const [selectedDistrictId, setSelectedDistrictId] = useState(18); // Default Dhaka
  const [selectedUpazilaId, setSelectedUpazilaId] = useState(1801); // Default Dhanmondi
  const [showAreaSuggestions, setShowAreaSuggestions] = useState(false);

  const areaSuggestions = useMemo(() => {
    if (!search.trim()) return [];
    return searchAreas(search);
  }, [search]);

  const handleSelectArea = (result: AreaSearchResult) => {
    setUserCoords({ lat: result.lat, lng: result.lng });
    setLocationName(isBangla ? result.nameBn : result.nameEn);
    setShowAreaSuggestions(false);
    setSearch('');
  };

  const availableDivisions = useMemo(() => getDivisions(), []);
  const availableDistricts = useMemo(() => getDistrictsByDivision(selectedDivisionId), [selectedDivisionId]);
  const availableUpazilas = useMemo(() => getUpazilasByDistrict(selectedDistrictId), [selectedDistrictId]);

  const handleConfirmAreaPicker = () => {
    const upazila = getUpazilaById(selectedUpazilaId) || availableUpazilas[0];
    if (upazila) {
      setUserCoords({ lat: upazila.lat, lng: upazila.lng });
      setLocationName(isBangla ? upazila.nameBn : upazila.nameEn);
    }
    setAreaModalVisible(false);
  };

  // Clinics state
  const [clinics, setClinics] = useState<NearbyClinicResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClinicId, setSelectedClinicId] = useState<string | null>(null);
  const [bottomSheetExpanded, setBottomSheetExpanded] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    let active = true;
    async function loadClinics() {
      setLoading(true);
      try {
        const results = await getNearbyClinicsWithFallback({
          lat: userCoords.lat,
          lng: userCoords.lng,
          radiusM: radiusKm * 1000,
          openNow: filterOpenNow,
          emergency: filterEmergency || activeLayer === 'emergency',
          species: selectedSpecies !== 'all' ? selectedSpecies : undefined,
          limit: 50,
        });
        if (active) {
          // MAP-12: Cache results locally
          saveNearbyCache(results, userCoords, radiusKm * 1000);
          setIsOffline(false);

          if (results.length === 0) {
            const expansion = autoExpandRadius(radiusKm, 0);
            if (expansion.didExpand) {
              setRadiusKm(expansion.nextRadiusKm);
              setAutoExpandNotice(
                isBangla
                  ? `${radiusKm} কিমিতে পাওয়া যায়নি, বাড়ানো হয়েছে ${expansion.nextRadiusKm} কিমি`
                  : `Expanded radius to ${expansion.nextRadiusKm} km`
              );
            }
          } else {
            setAutoExpandNotice(null);
          }

          setClinics(results);
          if (results.length > 0 && !selectedClinicId) {
            setSelectedClinicId(results[0]?.locationId ?? null);
          }
        }
      } catch (err) {
        console.error('Failed to load nearby clinics:', err);
        // MAP-12: Fallback to local cache
        const cached = getNearbyCache(userCoords);
        if (cached && cached.clinics.length > 0) {
          setClinics(cached.clinics);
          setIsOffline(true);
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    loadClinics();
    return () => {
      active = false;
    };
  }, [userCoords, radiusKm, activeLayer, filterOpenNow, filterEmergency, selectedSpecies, isBangla]);

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

      // Layer filtering (MAP-10)
      if (activeLayer === 'grooming' && !c.offersHomeVisit) return false;
      if (activeLayer === 'boarding' && c.isGovernment) return false;
      if (activeLayer === 'home_visit' && !c.offersHomeVisit) return false;
      if (activeLayer === 'emergency' && !c.hasEmergency && !c.is24h) return false;

      return true;
    });
  }, [clinics, search, filter24h, filterGovt, activeLayer, isBangla]);

  const mobileClusters = useMemo(() => {
    return clusterMarkers(filteredClinics, 12, 50);
  }, [filteredClinics]);

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
        {/* Current Location & Area Picker Button (MAP-4) */}
        <View className="flex-row items-center justify-between pb-1.5 mb-1.5 border-b border-gray-100">
          <View className="flex-row items-center gap-1">
            <Text className="text-xs">🎯</Text>
            <Text className="text-xs font-bold text-gray-800">{locationName}</Text>
          </View>
          <TouchableOpacity
            onPress={() => setAreaModalVisible(true)}
            className="px-2 py-0.5 bg-green-100 rounded-md flex-row items-center gap-1"
          >
            <Text className="text-[10px] text-green-800 font-bold">
              {isBangla ? 'এলাকা পরিবর্তন' : 'Change Area'}
            </Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row items-center gap-2 mb-2">
          <Text className="text-base">📍</Text>
          <TextInput
            value={search}
            onChangeText={(txt) => {
              setSearch(txt);
              setShowAreaSuggestions(true);
            }}
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

        {/* Area Suggestions Dropdown (MAP-4) */}
        {showAreaSuggestions && areaSuggestions.length > 0 && (
          <View className="bg-white rounded-xl border border-gray-200 mt-1 mb-2 max-h-48 overflow-hidden">
            <ScrollView nestedScrollEnabled>
              {areaSuggestions.map((area) => (
                <TouchableOpacity
                  key={`${area.type}-${area.id}`}
                  onPress={() => handleSelectArea(area)}
                  className="p-2 border-b border-gray-100 flex-row items-center justify-between"
                >
                  <View>
                    <Text className="text-xs font-bold text-gray-800">
                      {isBangla ? area.nameBn : area.nameEn}
                    </Text>
                    <Text className="text-[10px] text-gray-500">
                      {isBangla ? area.parentNameBn : area.parentNameEn}
                    </Text>
                  </View>
                  <Text className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">
                    {area.type === 'upazila' ? (isBangla ? 'থানা' : 'Thana') : (isBangla ? 'জেলা' : 'District')}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Filter Badges & Service Layers Horizontal Scroll (MAP-10) */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-1.5 pt-1">
          {/* Service Layers */}
          {[
            { id: 'all', icon: '🌐', labelBn: 'সকল', labelEn: 'All' },
            { id: 'vet', icon: '🩺', labelBn: 'চিকিৎসা', labelEn: 'Vet' },
            { id: 'grooming', icon: '✂️', labelBn: 'গ্রুমিং', labelEn: 'Grooming' },
            { id: 'boarding', icon: '🏨', labelBn: 'বোর্ডিং', labelEn: 'Boarding' },
            { id: 'home_visit', icon: '🏡', labelBn: 'হোম ভিজিট', labelEn: 'Home Visit' },
            { id: 'emergency', icon: '🚨', labelBn: '২৪/৭ জরুরি', labelEn: '24/7' },
          ].map((layer) => (
            <TouchableOpacity
              key={layer.id}
              onPress={() => setActiveLayer(layer.id as any)}
              className={`px-2.5 py-1 rounded-full border flex-row items-center gap-1 ${
                activeLayer === layer.id ? 'bg-emerald-700 border-emerald-700' : 'bg-gray-100 border-gray-200'
              }`}
            >
              <Text className="text-[10px]">{layer.icon}</Text>
              <Text className={`text-[11px] ${activeLayer === layer.id ? 'text-white font-bold' : 'text-gray-700'}`}>
                {isBangla ? layer.labelBn : layer.labelEn}
              </Text>
            </TouchableOpacity>
          ))}

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
            onPress={() => setFilterGovt((p) => (p === 'govt' ? 'all' : 'govt'))}
            className={`px-2.5 py-1 rounded-full border ${
              filterGovt === 'govt' ? 'bg-blue-600 border-blue-600' : 'bg-gray-100 border-gray-200'
            }`}
          >
            <Text className={`text-[11px] ${filterGovt === 'govt' ? 'text-white font-bold' : 'text-gray-700'}`}>
              🏛️ {isBangla ? 'সরকারি' : 'Govt'}
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Radius Selector Row (MAP-8) */}
        <View className="flex-row items-center justify-between pt-1.5 border-t border-gray-100 mt-1">
          <Text className="text-[10px] text-gray-500 font-semibold">
            📏 {isBangla ? 'পরিধি:' : 'Radius:'} <Text className="font-bold text-emerald-700">{radiusKm} km</Text>
          </Text>
          <View className="flex-row gap-1">
            {RADIUS_TIERS_KM.map((tier) => (
              <TouchableOpacity
                key={tier}
                onPress={() => setRadiusKm(tier)}
                className={`px-2 py-0.5 rounded text-[10px] ${
                  radiusKm === tier ? 'bg-emerald-700' : 'bg-gray-100'
                }`}
              >
                <Text className={`text-[10px] font-bold ${radiusKm === tier ? 'text-white' : 'text-gray-600'}`}>
                  {tier}k
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Auto-Expand Notice (MAP-8) */}
        {autoExpandNotice && (
          <View className="bg-amber-50 p-1.5 rounded mt-1 border border-amber-200 flex-row justify-between items-center">
            <Text className="text-[10px] text-amber-800 flex-1">⚠️ {autoExpandNotice}</Text>
            <TouchableOpacity onPress={() => setAutoExpandNotice(null)}>
              <Text className="text-[10px] font-bold text-amber-700 ml-1">✕</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* MAP-12 Offline Cache Banner */}
        {isOffline && (
          <View className="bg-amber-100/90 border border-amber-300 rounded-lg p-1.5 mt-1 flex-row items-center justify-between">
            <View className="flex-row items-center flex-1 mr-2">
              <Text className="text-xs mr-1">📡</Text>
              <Text className="text-[10px] text-amber-900 font-medium flex-1">
                {isBangla
                  ? 'অফলাইন মোড: সংরক্ষিত নিকটস্থ ক্লিনিক তালিকা প্রদর্শিত হচ্ছে'
                  : 'Offline Mode: Showing locally cached clinics'}
              </Text>
            </View>
            <View className="bg-amber-200 px-1.5 py-0.5 rounded">
              <Text className="text-[9px] font-bold text-amber-900 font-mono">CACHED</Text>
            </View>
          </View>
        )}
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

        {/* Clustered Map Markers (MAP-9) */}
        {mobileClusters.map((cluster) => {
          const dx = (cluster.lng - userCoords.lng) * 2500;
          const dy = (userCoords.lat - cluster.lat) * 2500;

          if (cluster.isCluster) {
            return (
              <TouchableOpacity
                key={cluster.id}
                onPress={() => {
                  if (cluster.items[0]?.locationId) {
                    setSelectedClinicId(cluster.items[0].locationId);
                  }
                }}
                style={{
                  position: 'absolute',
                  transform: [{ translateX: dx }, { translateY: dy }],
                }}
                className="items-center z-25"
              >
                <View className="w-10 h-10 rounded-full bg-emerald-700 items-center justify-center border-2 border-white shadow-xl">
                  <Text className="text-xs font-bold text-white">+{cluster.count}</Text>
                </View>
                <View className="bg-black/80 px-1.5 py-0.5 rounded mt-0.5">
                  <Text className="text-[9px] text-emerald-300 font-bold">
                    {cluster.count} {isBangla ? 'ক্লিনিক' : 'clinics'}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          }

          const c = cluster.items[0];
          if (!c) return null;
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
                  c.hasEmergency
                    ? 'bg-red-600'
                    : c.isGovernment
                      ? 'bg-blue-600'
                      : activeLayer === 'grooming'
                        ? 'bg-purple-600'
                        : activeLayer === 'boarding'
                          ? 'bg-amber-600'
                          : 'bg-green-700'
                }`}
              >
                <Text className="text-sm">
                  {c.hasEmergency
                    ? '🚨'
                    : c.isGovernment
                      ? '🏛️'
                      : activeLayer === 'grooming'
                        ? '✂️'
                        : activeLayer === 'boarding'
                          ? '🏨'
                          : '🏥'}
                </Text>
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
        {/* Drag Handle & Suggest Clinic Header (MAP-11) */}
        <View className="flex-row items-center justify-between px-4 py-2 border-b border-gray-100">
          <TouchableOpacity
            onPress={() => setBottomSheetExpanded((p) => !p)}
            className="flex-1 items-center"
          >
            <View className="w-12 h-1.5 bg-gray-300 rounded-full mb-1" />
            <Text className="text-[11px] text-gray-500 font-bold">
              {isBangla
                ? `${filteredClinics.length}টি ক্লিনিক পাওয়া গেছে (${bottomSheetExpanded ? 'সংক্ষিপ্ত করুন ▼' : 'সম্পূর্ণ তালিকা দেখুন ▲'})`
                : `${filteredClinics.length} clinics nearby (${bottomSheetExpanded ? 'Collapse ▼' : 'Expand full list ▲'})`}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/clinics/suggest' as any)}
            className="bg-emerald-100 px-2.5 py-1 rounded-full flex-row items-center gap-1 border border-emerald-300"
          >
            <Text className="text-[10px]">➕</Text>
            <Text className="text-[10px] font-bold text-emerald-800">
              {isBangla ? 'ক্লিনিক যোগ' : 'Suggest'}
            </Text>
          </TouchableOpacity>
        </View>

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
      {/* Cascading Area Picker Modal (MAP-4) */}
      <Modal
        visible={areaModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setAreaModalVisible(false)}
      >
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-white rounded-t-3xl p-4 max-h-[85%]">
            <View className="flex-row items-center justify-between pb-3 border-b border-gray-100">
              <Text className="text-base font-bold text-gray-900">
                📍 {isBangla ? 'বিভাগ, জেলা ও এলাকা নির্বাচন' : 'Select Area'}
              </Text>
              <TouchableOpacity onPress={() => setAreaModalVisible(false)}>
                <Text className="text-base text-gray-500 font-bold">✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView className="space-y-3 pt-2" showsVerticalScrollIndicator={false}>
              {/* Step 1: Divisions */}
              <View>
                <Text className="text-xs font-bold text-gray-700 mb-1">
                  ১. {isBangla ? 'বিভাগ' : 'Division'}
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-1.5">
                  {availableDivisions.map((div) => (
                    <TouchableOpacity
                      key={div.id}
                      onPress={() => {
                        setSelectedDivisionId(div.id);
                        const districts = getDistrictsByDivision(div.id);
                        const firstDistrict = districts[0];
                        if (firstDistrict) {
                          setSelectedDistrictId(firstDistrict.id);
                          const upazilas = getUpazilasByDistrict(firstDistrict.id);
                          const firstUpazila = upazilas[0];
                          if (firstUpazila) setSelectedUpazilaId(firstUpazila.id);
                        }
                      }}
                      className={`px-3 py-2 rounded-lg border ${
                        selectedDivisionId === div.id
                          ? 'bg-green-700 border-green-700'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <Text
                        className={`text-xs ${
                          selectedDivisionId === div.id ? 'text-white font-bold' : 'text-gray-700'
                        }`}
                      >
                        {isBangla ? div.nameBn : div.nameEn}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Step 2: Districts */}
              <View>
                <Text className="text-xs font-bold text-gray-700 mb-1">
                  ২. {isBangla ? 'জেলা' : 'District'}
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-1.5">
                  {availableDistricts.map((dist) => (
                    <TouchableOpacity
                      key={dist.id}
                      onPress={() => {
                        setSelectedDistrictId(dist.id);
                        const upazilas = getUpazilasByDistrict(dist.id);
                        const firstUpazila = upazilas[0];
                        if (firstUpazila) setSelectedUpazilaId(firstUpazila.id);
                      }}
                      className={`px-3 py-2 rounded-lg border ${
                        selectedDistrictId === dist.id
                          ? 'bg-blue-600 border-blue-600'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <Text
                        className={`text-xs ${
                          selectedDistrictId === dist.id ? 'text-white font-bold' : 'text-gray-700'
                        }`}
                      >
                        {isBangla ? dist.nameBn : dist.nameEn}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Step 3: Upazilas */}
              <View>
                <Text className="text-xs font-bold text-gray-700 mb-1">
                  ৩. {isBangla ? 'উপজেলা / থানা' : 'Upazila / Thana'}
                </Text>
                <View className="flex-row flex-wrap gap-1.5">
                  {availableUpazilas.map((u) => (
                    <TouchableOpacity
                      key={u.id}
                      onPress={() => setSelectedUpazilaId(u.id)}
                      className={`px-3 py-2 rounded-lg border ${
                        selectedUpazilaId === u.id
                          ? 'bg-green-100 border-green-600'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <Text
                        className={`text-xs ${
                          selectedUpazilaId === u.id
                            ? 'text-green-900 font-bold'
                            : 'text-gray-700'
                        }`}
                      >
                        {isBangla ? u.nameBn : u.nameEn}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            <View className="flex-row justify-end gap-2 pt-4 border-t border-gray-100 mt-2">
              <TouchableOpacity
                onPress={() => setAreaModalVisible(false)}
                className="px-4 py-2.5 rounded-lg bg-gray-100"
              >
                <Text className="text-xs font-bold text-gray-600">
                  {isBangla ? 'বাতিল' : 'Cancel'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleConfirmAreaPicker}
                className="px-6 py-2.5 rounded-lg bg-green-700"
              >
                <Text className="text-xs font-bold text-white">
                  ✓ {isBangla ? 'অবস্থান নিশ্চিত করুন' : 'Confirm'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
