import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  Modal,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useLocale } from '@pranora/i18n';
import {
  getServiceBySlug,
  getProvidersByServiceSlug,
  type ProviderServiceOffering,
  buildBookingUrl,
  buildDirectionsUrl,
  buildTelUrl,
  getDivisions,
  getDistrictsByDivision,
  getUpazilasByDistrict,
  getUpazilaById,
} from '@pranora/api';

const DEFAULT_DHAKA_COORDS = { lat: 23.7465, lng: 90.3752 };

export default function ServiceProvidersScreen() {
  const router = useRouter();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { isBangla } = useLocale();

  const serviceSlug = slug || 'clinic_visit';
  const service = useMemo(() => getServiceBySlug(serviceSlug), [serviceSlug]);

  // State
  const [userCoords, setUserCoords] = useState(DEFAULT_DHAKA_COORDS);
  const [locationName, setLocationName] = useState('ধানমন্ডি, ঢাকা');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [filterGovt, setFilterGovt] = useState<'all' | 'govt' | 'private'>('all');
  const [filterOpenNow, setFilterOpenNow] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);

  // Area Picker Modal State
  const [areaModalVisible, setAreaModalVisible] = useState(false);
  const [selectedDivisionId, setSelectedDivisionId] = useState(3);
  const [selectedDistrictId, setSelectedDistrictId] = useState(18);
  const [selectedUpazilaId, setSelectedUpazilaId] = useState(1801);

  const availableDivisions = useMemo(() => getDivisions(), []);
  const availableDistricts = useMemo(() => getDistrictsByDivision(selectedDivisionId), [selectedDivisionId]);
  const availableUpazilas = useMemo(() => getUpazilasByDistrict(selectedDistrictId), [selectedDistrictId]);

  const handleConfirmArea = () => {
    const upazila = getUpazilaById(selectedUpazilaId) || availableUpazilas[0];
    if (upazila) {
      setUserCoords({ lat: upazila.lat, lng: upazila.lng });
      setLocationName(isBangla ? upazila.nameBn : upazila.nameEn);
    }
    setAreaModalVisible(false);
  };

  const providers = useMemo(() => {
    return getProvidersByServiceSlug(serviceSlug, {
      lat: userCoords.lat,
      lng: userCoords.lng,
      openNow: filterOpenNow,
      govt: filterGovt,
    });
  }, [serviceSlug, userCoords, filterOpenNow, filterGovt]);

  const selectedProvider = useMemo(() => {
    return providers.find((p) => p.locationId === selectedLocationId) || providers[0];
  }, [providers, selectedLocationId]);

  const handleCall = (phone: string) => {
    Linking.openURL(buildTelUrl(phone)).catch(() => {
      Alert.alert(isBangla ? 'ভুল' : 'Error', isBangla ? 'কল করা সম্ভব হচ্ছে না' : 'Cannot place call');
    });
  };

  const handleDirections = (lat: number, lng: number) => {
    Linking.openURL(buildDirectionsUrl(lat, lng)).catch(() => {
      Alert.alert(isBangla ? 'ভুল' : 'Error', isBangla ? 'ম্যাপ খোলা যাচ্ছে না' : 'Cannot open maps');
    });
  };

  const handleBook = (p: ProviderServiceOffering) => {
    const url = buildBookingUrl({
      locationId: p.locationId,
      serviceId: p.serviceId,
      bookingType: 'slot',
    });
    router.push(url as any);
  };

  return (
    <View className="flex-1 bg-gray-100">
      {/* Header Bar */}
      <View className="bg-white p-4 border-b border-gray-200">
        <View className="flex-row items-center justify-between mb-3">
          <TouchableOpacity onPress={() => router.back()} className="flex-row items-center gap-1">
            <Text className="text-sm font-bold text-green-800">← {isBangla ? 'পেছনে' : 'Back'}</Text>
          </TouchableOpacity>

          {/* List / Map Switcher */}
          <View className="flex-row bg-gray-100 p-1 rounded-xl">
            <TouchableOpacity
              onPress={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg ${viewMode === 'list' ? 'bg-white shadow-xs' : ''}`}
            >
              <Text className={`text-xs font-bold ${viewMode === 'list' ? 'text-green-800' : 'text-gray-500'}`}>
                📋 {isBangla ? 'তালিকা' : 'List'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setViewMode('map')}
              className={`px-3 py-1.5 rounded-lg ${viewMode === 'map' ? 'bg-white shadow-xs' : ''}`}
            >
              <Text className={`text-xs font-bold ${viewMode === 'map' ? 'text-green-800' : 'text-gray-500'}`}>
                🗺️ {isBangla ? 'ম্যাপ' : 'Map'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Service Title */}
        <View className="flex-row items-center gap-3">
          <Text className="text-3xl p-2 bg-green-50 rounded-xl">{service?.icon || '🩺'}</Text>
          <View className="flex-1">
            <Text className="text-base font-bold text-gray-900">
              {isBangla ? service?.nameBn : service?.nameEn}
            </Text>
            <Text className="text-xs text-green-700 font-bold">
              {isBangla ? service?.priceRangeBn : service?.priceRangeEn}
            </Text>
          </View>
        </View>

        {/* Location & Quick Filters */}
        <View className="flex-row items-center justify-between pt-3 mt-3 border-t border-gray-100">
          <TouchableOpacity
            onPress={() => setAreaModalVisible(true)}
            className="flex-row items-center gap-1 bg-green-50 px-2.5 py-1 rounded-full border border-green-200"
          >
            <Text className="text-xs">📍</Text>
            <Text className="text-xs text-green-900 font-bold">{locationName}</Text>
          </TouchableOpacity>

          <View className="flex-row gap-1">
            <TouchableOpacity
              onPress={() => setFilterOpenNow((p) => !p)}
              className={`px-2 py-1 rounded-full border ${
                filterOpenNow ? 'bg-green-700 border-green-700' : 'bg-gray-50 border-gray-200'
              }`}
            >
              <Text className={`text-[10px] ${filterOpenNow ? 'text-white font-bold' : 'text-gray-700'}`}>
                {isBangla ? 'খোলা' : 'Open'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setFilterGovt((p) => (p === 'govt' ? 'all' : 'govt'))}
              className={`px-2 py-1 rounded-full border ${
                filterGovt === 'govt' ? 'bg-blue-600 border-blue-600' : 'bg-gray-50 border-gray-200'
              }`}
            >
              <Text className={`text-[10px] ${filterGovt === 'govt' ? 'text-white font-bold' : 'text-gray-700'}`}>
                🏛️ {isBangla ? 'সরকারি' : 'Govt'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Main Content */}
      {viewMode === 'list' ? (
        /* List View */
        <ScrollView className="flex-1 p-3 space-y-3">
          {providers.length === 0 ? (
            <View className="p-8 items-center justify-center">
              <Text className="text-sm text-gray-500 text-center">
                {isBangla ? 'কোনো ক্লিনিক পাওয়া যায়নি' : 'No clinics found'}
              </Text>
            </View>
          ) : (
            providers.map((p) => {
              const distanceKm = (p.distanceM / 1000).toFixed(1);
              return (
                <View
                  key={p.locationId}
                  className="bg-white p-4 rounded-2xl mb-3 shadow-xs border border-gray-200"
                >
                  <View className="flex-row justify-between items-start mb-1">
                    <View className="flex-1 pr-2">
                      <View className="flex-row items-center gap-1.5 flex-wrap">
                        <Text className="text-sm font-bold text-gray-900">
                          {isBangla ? p.clinicNameBn : p.clinicNameEn}
                        </Text>
                        {p.isGovernment ? (
                          <Text className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-bold">
                            🏛️ {isBangla ? 'সরকারি' : 'Govt'}
                          </Text>
                        ) : (
                          <Text className="text-[10px] bg-green-100 text-green-800 px-1.5 py-0.5 rounded font-bold">
                            ✓ {isBangla ? 'যাচাইকৃত' : 'Verified'}
                          </Text>
                        )}
                      </View>
                      <Text className="text-[11px] text-gray-500 mt-0.5">
                        📍 {isBangla ? p.addressBn : p.addressEn}
                      </Text>
                    </View>

                    <View className="items-end">
                      <Text className="text-base font-bold text-green-800">৳{p.price}</Text>
                      <Text className="text-[10px] font-bold text-green-700">
                        {distanceKm} {isBangla ? 'কিমি' : 'km'}
                      </Text>
                    </View>
                  </View>

                  {/* Actions Bar */}
                  <View className="flex-row items-center gap-2 pt-3 mt-3 border-t border-gray-100">
                    <TouchableOpacity
                      onPress={() => handleBook(p)}
                      className="flex-1 bg-green-700 py-2 rounded-xl items-center"
                    >
                      <Text className="text-xs font-bold text-white">
                        📅 {isBangla ? 'বুক করুন' : 'Book'}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDirections(p.lat, p.lng)}
                      className="p-2 border border-gray-300 rounded-xl"
                    >
                      <Text className="text-xs">🗺️</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleCall(p.phone)}
                      className="p-2 border border-gray-300 rounded-xl"
                    >
                      <Text className="text-xs">📞</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      ) : (
        /* Map View */
        <View className="flex-1 bg-slate-900 relative items-center justify-center overflow-hidden">
          {/* Radar Circles */}
          <View className="absolute w-72 h-72 rounded-full border border-green-500/20" />
          <View className="absolute w-96 h-96 rounded-full border border-green-500/10" />

          {/* User Center Pin */}
          <View className="items-center z-10">
            <View className="w-5 h-5 rounded-full bg-blue-500 border-2 border-white" />
            <Text className="text-[10px] text-blue-200 bg-black/60 px-1.5 py-0.5 rounded mt-1 font-bold">
              {isBangla ? 'আপনার অবস্থান' : 'You'}
            </Text>
          </View>

          {/* Provider Pins */}
          {providers.map((p) => {
            const dx = (p.lng - userCoords.lng) * 2500;
            const dy = (userCoords.lat - p.lat) * 2500;
            const isSelected = p.locationId === selectedProvider?.locationId;

            return (
              <TouchableOpacity
                key={p.locationId}
                onPress={() => setSelectedLocationId(p.locationId)}
                style={{
                  position: 'absolute',
                  transform: [{ translateX: dx }, { translateY: dy }],
                }}
                className={`items-center z-20 ${isSelected ? 'scale-125 z-30' : ''}`}
              >
                <View
                  className={`px-2 py-0.5 rounded-full border border-white ${
                    p.isGovernment ? 'bg-blue-600' : 'bg-green-700'
                  }`}
                >
                  <Text className="text-[10px] font-bold text-white">৳{p.price}</Text>
                </View>
              </TouchableOpacity>
            );
          })}

          {/* Floating Selected Provider Card */}
          {selectedProvider && (
            <View className="absolute bottom-4 left-4 right-4 bg-white p-4 rounded-2xl shadow-xl border border-gray-100 z-40">
              <View className="flex-row justify-between items-start mb-2">
                <View className="flex-1 pr-2">
                  <Text className="text-xs font-bold text-gray-900">
                    {isBangla ? selectedProvider.clinicNameBn : selectedProvider.clinicNameEn}
                  </Text>
                  <Text className="text-[10px] text-gray-500">
                    📍 {isBangla ? selectedProvider.addressBn : selectedProvider.addressEn}
                  </Text>
                </View>
                <Text className="text-sm font-bold text-green-800">৳{selectedProvider.price}</Text>
              </View>

              <TouchableOpacity
                onPress={() => handleBook(selectedProvider)}
                className="w-full bg-green-700 py-2 rounded-xl items-center"
              >
                <Text className="text-xs font-bold text-white">
                  📅 {isBangla ? 'বুক করুন' : 'Book Now'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* Area Picker Modal */}
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
                📍 {isBangla ? 'এলাকা নির্বাচন' : 'Select Location'}
              </Text>
              <TouchableOpacity onPress={() => setAreaModalVisible(false)}>
                <Text className="text-base text-gray-500 font-bold">✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView className="space-y-3 pt-2">
              <View>
                <Text className="text-xs font-bold text-gray-700 mb-1">১. বিভাগ</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-1.5">
                  {availableDivisions.map((div) => (
                    <TouchableOpacity
                      key={div.id}
                      onPress={() => {
                        setSelectedDivisionId(div.id);
                        const districts = getDistrictsByDivision(div.id);
                        if (districts.length > 0) {
                          setSelectedDistrictId(districts[0].id);
                          const upazilas = getUpazilasByDistrict(districts[0].id);
                          if (upazilas.length > 0) setSelectedUpazilaId(upazilas[0].id);
                        }
                      }}
                      className={`px-3 py-1.5 rounded-lg border ${
                        selectedDivisionId === div.id ? 'bg-green-700 border-green-700' : 'bg-gray-50'
                      }`}
                    >
                      <Text className={`text-xs ${selectedDivisionId === div.id ? 'text-white font-bold' : 'text-gray-700'}`}>
                        {isBangla ? div.nameBn : div.nameEn}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View>
                <Text className="text-xs font-bold text-gray-700 mb-1">২. জেলা</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-1.5">
                  {availableDistricts.map((dist) => (
                    <TouchableOpacity
                      key={dist.id}
                      onPress={() => {
                        setSelectedDistrictId(dist.id);
                        const upazilas = getUpazilasByDistrict(dist.id);
                        if (upazilas.length > 0) setSelectedUpazilaId(upazilas[0].id);
                      }}
                      className={`px-3 py-1.5 rounded-lg border ${
                        selectedDistrictId === dist.id ? 'bg-blue-600 border-blue-600' : 'bg-gray-50'
                      }`}
                    >
                      <Text className={`text-xs ${selectedDistrictId === dist.id ? 'text-white font-bold' : 'text-gray-700'}`}>
                        {isBangla ? dist.nameBn : dist.nameEn}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View>
                <Text className="text-xs font-bold text-gray-700 mb-1">৩. থানা/উপজেলা</Text>
                <View className="flex-row flex-wrap gap-1.5">
                  {availableUpazilas.map((u) => (
                    <TouchableOpacity
                      key={u.id}
                      onPress={() => setSelectedUpazilaId(u.id)}
                      className={`px-2.5 py-1.5 rounded-lg border ${
                        selectedUpazilaId === u.id ? 'bg-green-100 border-green-600' : 'bg-gray-50'
                      }`}
                    >
                      <Text className={`text-xs ${selectedUpazilaId === u.id ? 'text-green-900 font-bold' : 'text-gray-700'}`}>
                        {isBangla ? u.nameBn : u.nameEn}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            <View className="flex-row justify-end gap-2 pt-3 border-t border-gray-100 mt-2">
              <TouchableOpacity onPress={() => setAreaModalVisible(false)} className="px-4 py-2 bg-gray-100 rounded-lg">
                <Text className="text-xs font-bold text-gray-600">{isBangla ? 'বাতিল' : 'Cancel'}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleConfirmArea} className="px-5 py-2 bg-green-700 rounded-lg">
                <Text className="text-xs font-bold text-white">✓ {isBangla ? 'নিশ্চিত' : 'Confirm'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
