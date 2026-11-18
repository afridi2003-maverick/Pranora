import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  TextInput,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { useLocale } from '@pranora/i18n';
import type { AssignmentWithReport } from './assignmentMockData';

interface RescuerAssignmentCardProps {
  item: AssignmentWithReport;
  onRespond: (assignmentId: string, accept: boolean, declineReason?: string) => Promise<void>;
  onViewCase?: (caseId: string) => void;
  isSubmitting?: boolean;
}

const DECLINE_REASONS = [
  { id: 'area_far', bn: 'আমার কভারেজ এলাকার বাইরে', en: 'Outside my coverage area' },
  { id: 'busy_other', bn: 'অন্য রেসকিউ কাজে ব্যস্ত আছি', en: 'Busy with another active rescue' },
  { id: 'no_transport', bn: 'পরিবহন বা সরঞ্জাম নেই', en: 'No transport or critical equipment' },
  { id: 'unavailable', bn: 'ব্যক্তিগত কারণে অনুপলব্ধ', en: 'Temporarily unavailable' },
  { id: 'other', bn: 'অন্যান্য কারণ', en: 'Other' },
];

export function RescuerAssignmentCard({
  item,
  onRespond,
  onViewCase,
  isSubmitting = false,
}: RescuerAssignmentCardProps) {
  const { isBangla } = useLocale();
  const { assignment, rescueCase, report } = item;

  const [isDeclineModalOpen, setIsDeclineModalOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState(DECLINE_REASONS[0]?.id || 'area_far');
  const [customReason, setCustomReason] = useState('');

  const handleConfirmDecline = async () => {
    const chosen = DECLINE_REASONS.find((r) => r.id === selectedReason);
    const reasonText =
      selectedReason === 'other'
        ? customReason.trim() || 'Other'
        : chosen
        ? isBangla ? chosen.bn : chosen.en
        : 'Declined by rescuer';

    await onRespond(assignment.id, false, reasonText);
    setIsDeclineModalOpen(false);
  };

  const isCritical = report.urgency === 'critical';
  const isOffered = assignment.status === 'offered';
  const isAccepted = assignment.status === 'accepted';

  return (
    <View className="bg-white rounded-2xl border border-gray-200 p-4 mb-4 shadow-sm">
      {/* Top Header */}
      <View className="flex-row items-center justify-between pb-3 border-b border-gray-100 mb-3">
        <View className="flex-row items-center gap-2">
          <Text className="text-2xl">
            {report.kind === 'injured'
              ? '🚑'
              : report.kind === 'lost'
              ? '🔍'
              : report.kind === 'found'
              ? '🐾'
              : '📦'}
          </Text>
          <View>
            <Text className="text-base font-bold text-gray-900 capitalize">
              {report.species} · {report.kind}
            </Text>
            <Text className="text-[11px] font-mono text-gray-400">
              Case #{rescueCase.id.slice(0, 8)}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center gap-1.5">
          <View
            className={`px-2.5 py-0.5 rounded-full ${
              isCritical
                ? 'bg-red-600'
                : report.urgency === 'high'
                ? 'bg-amber-600'
                : 'bg-green-700'
            }`}
          >
            <Text className="text-white text-[10px] font-bold">
              {report.urgency.toUpperCase()}
            </Text>
          </View>

          {isOffered && (
            <View className="px-2 py-0.5 rounded-full bg-amber-50 border border-amber-300">
              <Text className="text-amber-800 text-[10px] font-semibold">
                🔔 {isBangla ? 'নতুন' : 'Offer'}
              </Text>
            </View>
          )}

          {isAccepted && (
            <View className="px-2 py-0.5 rounded-full bg-green-50 border border-green-300">
              <Text className="text-green-800 text-[10px] font-semibold">
                ✓ {isBangla ? 'গৃহীত' : 'Accepted'}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Photo & Description */}
      <View className="flex-row gap-3 mb-3">
        {report.photos && report.photos.length > 0 && (
          <Image
            source={{ uri: report.photos[0] }}
            className="w-20 h-20 rounded-xl bg-gray-100"
            resizeMode="cover"
          />
        )}
        <View className="flex-1">
          {report.area_text && (
            <Text className="text-xs font-semibold text-gray-900 mb-1" numberOfLines={2}>
              📍 {report.area_text}
            </Text>
          )}
          {report.description && (
            <Text className="text-xs text-gray-600 leading-4" numberOfLines={3}>
              {report.description}
            </Text>
          )}
        </View>
      </View>

      {/* Confidential Contact for Assigned Rescuer */}
      {report.contact_phone && (
        <View className="p-2.5 rounded-xl bg-green-50 border border-green-200 flex-row items-center justify-between mb-3">
          <View>
            <Text className="text-[10px] text-green-900 font-semibold">
              📞 {isBangla ? 'রিপোর্টার হটলাইন (গোপনীয়)' : 'Reporter (Confidential)'}
            </Text>
            <Text className="text-xs font-mono font-bold text-green-800">
              {report.contact_phone}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => Linking.openURL(`tel:${report.contact_phone}`)}
            className="px-3 py-1 rounded-lg bg-green-700"
          >
            <Text className="text-white text-xs font-bold">
              {isBangla ? 'কল' : 'Call'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Action Buttons */}
      <View className="flex-row justify-end gap-2 pt-2 border-t border-gray-100">
        {isOffered && (
          <>
            <TouchableOpacity
              onPress={() => setIsDeclineModalOpen(true)}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-gray-100 border border-gray-300"
            >
              <Text className="text-gray-700 text-xs font-semibold">
                ✕ {isBangla ? 'প্রত্যাখ্যান' : 'Decline'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => onRespond(assignment.id, true)}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-primary"
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text className="text-white text-xs font-bold">
                  ✓ {isBangla ? 'দায়িত্ব নিন' : 'Accept Case'}
                </Text>
              )}
            </TouchableOpacity>
          </>
        )}

        {isAccepted && onViewCase && (
          <TouchableOpacity
            onPress={() => onViewCase(rescueCase.id)}
            className="px-4 py-2 rounded-xl bg-primary"
          >
            <Text className="text-white text-xs font-bold">
              📋 {isBangla ? 'কেস পেজে যান' : 'Go to Case Page'}
            </Text>
          </TouchableOpacity>
        )}

        {assignment.status === 'declined' && (
          <Text className="text-xs text-gray-400 italic">
            {isBangla ? 'প্রত্যাখ্যাত: ' : 'Declined: '}
            {assignment.decline_reason || 'N/A'}
          </Text>
        )}
      </View>

      {/* Decline Reason Modal */}
      <Modal visible={isDeclineModalOpen} transparent animationType="fade">
        <View className="flex-1 bg-black/50 justify-center p-4">
          <View className="bg-white rounded-2xl p-5">
            <Text className="text-base font-bold text-gray-900 mb-1">
              {isBangla ? 'কেস প্রত্যাখ্যানের কারণ' : 'Reason for Declining'}
            </Text>
            <Text className="text-xs text-gray-500 mb-3">
              {isBangla
                ? 'কেসটি দ্রুত অন্য উদ্ধারকারীকে অ্যাসাইন করতে কারণ নির্বাচন করুন।'
                : 'Select reason to help coordinators reassign immediately.'}
            </Text>

            {DECLINE_REASONS.map((r) => {
              const isSelected = selectedReason === r.id;
              return (
                <TouchableOpacity
                  key={r.id}
                  onPress={() => setSelectedReason(r.id)}
                  className={`p-2.5 rounded-xl border mb-2 flex-row items-center gap-2 ${
                    isSelected ? 'border-primary bg-green-50' : 'border-gray-200'
                  }`}
                >
                  <View
                    className={`w-4 h-4 rounded-full border items-center justify-center ${
                      isSelected ? 'border-primary bg-primary' : 'border-gray-400'
                    }`}
                  >
                    {isSelected && <View className="w-2 h-2 rounded-full bg-white" />}
                  </View>
                  <Text className={`text-xs ${isSelected ? 'font-bold text-green-900' : 'text-gray-700'}`}>
                    {isBangla ? r.bn : r.en}
                  </Text>
                </TouchableOpacity>
              );
            })}

            {selectedReason === 'other' && (
              <TextInput
                placeholder={isBangla ? 'কারণ লিখুন...' : 'Enter reason...'}
                value={customReason}
                onChangeText={setCustomReason}
                className="border border-gray-300 rounded-lg p-2 text-xs text-gray-900 bg-gray-50 mb-3"
              />
            )}

            <View className="flex-row justify-end gap-2 mt-2">
              <TouchableOpacity
                onPress={() => setIsDeclineModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-gray-100"
              >
                <Text className="text-xs font-semibold text-gray-700">
                  {isBangla ? 'বাতিল' : 'Cancel'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleConfirmDecline}
                className="px-4 py-2 rounded-lg bg-red-600"
              >
                <Text className="text-xs font-bold text-white">
                  {isBangla ? 'প্রত্যাখ্যান নিশ্চিত' : 'Confirm'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
