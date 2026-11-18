import React, { useState } from 'react';
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
  onAssign: (caseId: string, rescuerId: string) => Promise<{ success: boolean; error?: string }>;
  rescuers?: RescuerProfileBrief[];
}

export function AssignRescuerModal({
  visible,
  onClose,
  caseId,
  reportSpecies,
  reportArea,
  onAssign,
  rescuers = MOCK_VERIFIED_RESCUERS,
}: AssignRescuerModalProps) {
  const { isBangla } = useLocale();
  const [search, setSearch] = useState('');
  const [isSubmittingId, setIsSubmittingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filteredRescuers = rescuers.filter((r) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      r.name.toLowerCase().includes(q) ||
      r.name_bn.includes(q) ||
      r.district_name_en.toLowerCase().includes(q) ||
      r.district_name_bn.includes(q)
    );
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

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View className="flex-1 bg-white">
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <Text className="text-base font-bold text-gray-900">
            {isBangla ? 'উদ্ধারকারী নিয়োগ করুন' : 'Assign Rescuer'}
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
            {reportSpecies && (
              <Text className="text-xs font-bold text-gray-900 capitalize">
                🐾 {reportSpecies}
              </Text>
            )}
            {reportArea && (
              <Text className="text-xs text-gray-600 mt-0.5">
                📍 {reportArea}
              </Text>
            )}
          </View>

          {error && (
            <View className="p-2.5 rounded-lg bg-red-50 border border-red-200 mb-3">
              <Text className="text-xs text-red-700">{error}</Text>
            </View>
          )}

          {/* Search */}
          <TextInput
            placeholder={
              isBangla
                ? 'উদ্ধারকারীর নাম বা এলাকা...'
                : 'Search rescuer by name or area...'
            }
            value={search}
            onChangeText={setSearch}
            className="border border-gray-300 rounded-xl px-3 py-2 text-sm text-gray-900 bg-gray-50 mb-4"
          />

          {/* List */}
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            {filteredRescuers.map((rescuer) => {
              const isThisSubmitting = isSubmittingId === rescuer.id;

              return (
                <View
                  key={rescuer.id}
                  className="p-3 rounded-xl border border-gray-200 mb-3 flex-row items-center justify-between"
                >
                  <View className="flex-1 mr-2">
                    <View className="flex-row items-center gap-1">
                      <Text className="font-bold text-sm text-gray-900">
                        {isBangla ? rescuer.name_bn : rescuer.name}
                      </Text>
                      <Text className="text-xs">☑️</Text>
                    </View>

                    <Text className="text-xs text-gray-500 mt-0.5">
                      📍 {isBangla ? rescuer.district_name_bn : rescuer.district_name_en}
                    </Text>

                    <View className="flex-row items-center gap-2 mt-1">
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
                        {isBangla ? 'নিয়োগ' : 'Assign'}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
