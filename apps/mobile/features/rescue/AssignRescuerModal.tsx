import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useLocale } from '@pranora/i18n';
import {
  MOCK_VERIFIED_RESCUERS,
  type RescuerProfileBrief,
} from './assignmentMockData';

interface AssignRescuerModalProps {
  visible: boolean;
  onClose: () => void;
  caseId: string;
  reportSpecies?: string;
  reportArea?: string;
  lat?: number;
  lng?: number;
  onAssign: (caseId: string, rescuerId: string) => Promise<{ success: boolean; error?: string }>;
  onFindNearby?: (params: { lat: number; lng: number; radius_m?: number }) => Promise<RescuerProfileBrief[]>;
  rescuers?: RescuerProfileBrief[];
}

export function AssignRescuerModal({
  visible,
  onClose,
  caseId,
  reportSpecies,
  reportArea,
  lat,
  lng,
  onAssign,
  onFindNearby,
  rescuers = MOCK_VERIFIED_RESCUERS,
}: AssignRescuerModalProps) {
  const { isBangla } = useLocale();
  const [search, setSearch] = useState('');
  const [radiusFilterKm, setRadiusFilterKm] = useState<number | 'all'>('all');
  const [activeList, setActiveList] = useState<RescuerProfileBrief[]>(rescuers);
  const [isSubmittingId, setIsSubmittingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    if (lat != null && lng != null && onFindNearby) {
      const radiusM = radiusFilterKm === 'all' ? undefined : radiusFilterKm * 1000;
      onFindNearby({ lat, lng, radius_m: radiusM })
        .then((items) => {
          if (active && items.length > 0) setActiveList(items);
        })
        .catch(() => {});
    } else {
      setActiveList(rescuers);
    }
    return () => {
      active = false;
    };
  }, [lat, lng, onFindNearby, radiusFilterKm, rescuers]);

  const filteredRescuers = activeList
    .filter((r) => {
      if (radiusFilterKm !== 'all' && r.distance_meters != null) {
        if (r.distance_meters > radiusFilterKm * 1000) return false;
      }
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        r.name.toLowerCase().includes(q) ||
        r.name_bn.includes(q) ||
        r.district_name_en.toLowerCase().includes(q) ||
        r.district_name_bn.includes(q)
      );
    })
    .sort((a, b) => {
      if (a.distance_meters != null && b.distance_meters != null) {
        return a.distance_meters - b.distance_meters;
      }
      return 0;
    });

  const handleAssignClick = async (rescuerId: string) => {
    setIsSubmittingId(rescuerId);
    setError(null);
    try {
      const res = await onAssign(caseId, rescuerId);
      if (res.success) {
        onClose();
      } else if (res.error) {
        setError(res.error);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to assign rescuer';
      setError(msg);
    } finally {
      setIsSubmittingId(null);
    }
  };

  const RADIUS_PILLS: (number | 'all')[] = ['all', 5, 10, 25];

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View className="flex-1 bg-white">
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <Text className="text-base font-bold text-gray-900">
            {isBangla ? 'উদ্ধারকারী নিয়োগ (RSC-9)' : 'Assign Rescuer (RSC-9)'}
          </Text>
          <TouchableOpacity
            onPress={onClose}
            className="w-8 h-8 rounded-full bg-gray-200 items-center justify-center"
          >
            <Text className="text-gray-700 font-bold text-sm">✕</Text>
          </TouchableOpacity>
        </View>

        <View className="p-4 flex-1">
          {/* Case Info */}
          <View className="p-3 rounded-xl bg-gray-50 border border-gray-200 mb-3">
            <Text className="text-xs font-mono text-gray-600 mb-1">
              Case ID: {caseId}
            </Text>
            <View className="flex-row items-center gap-2 flex-wrap">
              {reportSpecies && (
                <Text className="text-xs font-bold text-gray-900 capitalize">
                  🐾 {reportSpecies}
                </Text>
              )}
              {reportArea && (
                <Text className="text-xs text-gray-600">
                  📍 {reportArea}
                </Text>
              )}
              {lat != null && lng != null && (
                <Text className="text-[11px] text-green-700 font-semibold">
                  🎯 GPS
                </Text>
              )}
            </View>
          </View>

          {error && (
            <View className="p-2.5 rounded-lg bg-red-50 border border-red-200 mb-3">
              <Text className="text-xs text-red-700">{error}</Text>
            </View>
          )}

          {/* Radius Filter */}
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-xs font-semibold text-gray-700">
              {isBangla ? 'দূরত্ব:' : 'Radius:'}
            </Text>
            <View className="flex-row gap-1.5">
              {RADIUS_PILLS.map((p) => (
                <TouchableOpacity
                  key={String(p)}
                  onPress={() => setRadiusFilterKm(p)}
                  className={`px-2.5 py-1 rounded-lg border ${
                    radiusFilterKm === p
                      ? 'bg-primary border-primary'
                      : 'bg-gray-100 border-gray-200'
                  }`}
                >
                  <Text
                    className={`text-[11px] font-bold ${
                      radiusFilterKm === p ? 'text-white' : 'text-gray-700'
                    }`}
                  >
                    {p === 'all'
                      ? isBangla ? 'সকল' : 'All'
                      : `${p} ${isBangla ? 'কিমি' : 'km'}`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Search */}
          <TextInput
            placeholder={
              isBangla
                ? 'উদ্ধারকারীর নাম বা এলাকা...'
                : 'Search rescuer by name or area...'
            }
            value={search}
            onChangeText={setSearch}
            className="border border-gray-300 rounded-xl px-3 py-2 text-sm text-gray-900 bg-gray-50 mb-3"
          />

          {/* List */}
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            {filteredRescuers.map((rescuer) => {
              const isBusy = rescuer.active_cases_count >= 2 || !rescuer.is_available;
              const isThisSubmitting = isSubmittingId === rescuer.id;
              const coversSpecies =
                reportSpecies &&
                rescuer.species?.some((s) => reportSpecies.toLowerCase().includes(s.toLowerCase()));

              return (
                <View
                  key={rescuer.id}
                  className="p-3 rounded-xl border border-gray-200 mb-3 flex-row items-center justify-between"
                >
                  <View className="flex-1 mr-2">
                    <View className="flex-row items-center gap-1 flex-wrap">
                      <Text className="font-bold text-sm text-gray-900">
                        {isBangla ? rescuer.name_bn : rescuer.name}
                      </Text>
                      <Text className="text-xs">☑️</Text>

                      {rescuer.distance_meters != null && (
                        <View className="px-1.5 py-0.5 rounded-full bg-blue-50 border border-blue-200">
                          <Text className="text-[10px] font-bold text-blue-800">
                            🚗 {(rescuer.distance_meters / 1000).toFixed(1)} {isBangla ? 'কিমি' : 'km'}
                          </Text>
                        </View>
                      )}

                      {rescuer.radius_km != null && (
                        <View className="px-1.5 py-0.5 rounded-full bg-gray-100">
                          <Text className="text-[10px] text-gray-600">
                            🎯 {rescuer.radius_km}km
                          </Text>
                        </View>
                      )}
                    </View>

                    <Text className="text-xs text-gray-500 mt-0.5">
                      📍 {isBangla ? rescuer.district_name_bn : rescuer.district_name_en}
                    </Text>

                    <View className="flex-row items-center gap-1.5 mt-1 flex-wrap">
                      <View
                        className={`px-2 py-0.5 rounded-full ${
                          rescuer.active_cases_count === 0 ? 'bg-green-100' : 'bg-amber-100'
                        }`}
                      >
                        <Text
                          className={`text-[10px] font-bold ${
                            rescuer.active_cases_count === 0 ? 'text-green-800' : 'text-amber-800'
                          }`}
                        >
                          {isBangla
                            ? `${rescuer.active_cases_count}টি সক্রিয় কেস`
                            : `${rescuer.active_cases_count} active cases`}
                        </Text>
                      </View>

                      {!rescuer.is_available && (
                        <Text className="text-[10px] text-gray-400 italic">
                          ({isBangla ? 'অনুপলব্ধ' : 'Unavailable'})
                        </Text>
                      )}

                      {coversSpecies && (
                        <View className="px-1.5 py-0.5 rounded bg-green-50">
                          <Text className="text-[10px] text-green-700 font-bold">
                            ⭐ {isBangla ? 'উপযুক্ত প্রজাতি' : 'Match'}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>

                  <TouchableOpacity
                    onPress={() => handleAssignClick(rescuer.id)}
                    disabled={isThisSubmitting || Boolean(isSubmittingId)}
                    className="px-3.5 py-2 rounded-xl bg-primary items-center justify-center"
                  >
                    {isThisSubmitting ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <Text className="text-white text-xs font-bold">
                        {isBusy
                          ? isBangla ? 'তবুও নিয়োগ' : 'Assign'
                          : isBangla ? 'নিয়োগ' : 'Assign'}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              );
            })}

            {filteredRescuers.length === 0 && (
              <Text className="text-xs text-gray-400 text-center py-6">
                {isBangla
                  ? 'কোনো উদ্ধারকারী খুঁজে পাওয়া যায়নি।'
                  : 'No rescuers found within selected radius.'}
              </Text>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

