import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useLocale } from '@pranora/i18n';
import type { RescueOutcome } from '@pranora/types';

interface CloseCaseOutcomeModalProps {
  visible: boolean;
  onClose: () => void;
  caseId: string;
  animalSpecies?: string;
  isLostReport?: boolean;
  onSubmit: (payload: {
    case_id: string;
    outcome: RescueOutcome;
    note?: string | null;
    pet_id?: string | null;
  }) => Promise<{ error?: string; success?: boolean }>;
  isSubmitting?: boolean;
}

export const RESCUE_OUTCOME_OPTIONS: {
  id: RescueOutcome;
  bn: string;
  en: string;
  icon: string;
}[] = [
  { id: 'treated', bn: 'চিকিৎসাপ্রাপ্ত ও সুস্থ', en: 'Treated & Recovered', icon: '🩺' },
  { id: 'sent_to_shelter', bn: 'শেল্টারে স্থানান্তর', en: 'Sent to Shelter', icon: '🏛️' },
  { id: 'returned_to_owner', bn: 'মালিকের কাছে হস্তান্তর (পুনর্মিলন)', en: 'Returned to Owner', icon: '🤝' },
  { id: 'adopted', bn: 'সরাসরি দত্তক সম্পন্ন', en: 'Adopted on Site', icon: '🏠' },
  { id: 'released', bn: 'প্রাকৃতিক পরিবেশে অবমুক্ত', en: 'Released to Habitat', icon: '🌿' },
  { id: 'died', bn: 'চিকিৎসাধীন অবস্থায় মৃত', en: 'Deceased', icon: '🕊️' },
  { id: 'not_found', bn: 'ঘটনাস্থলে পাওয়া যায়নি', en: 'Not Found', icon: '❓' },
  { id: 'other', bn: 'অন্যান্য ফলাফল', en: 'Other Outcome', icon: '📝' },
];

export function CloseCaseOutcomeModal({
  visible,
  onClose,
  caseId,
  animalSpecies,
  isLostReport = false,
  onSubmit,
  isSubmitting = false,
}: CloseCaseOutcomeModalProps) {
  const { isBangla } = useLocale();

  const [selectedOutcome, setSelectedOutcome] = useState<RescueOutcome>(
    isLostReport ? 'returned_to_owner' : 'treated'
  );
  const [note, setNote] = useState('');
  const [petId, setPetId] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async () => {
    setErrorMessage(null);

    const payload = {
      case_id: caseId,
      outcome: selectedOutcome,
      note: note.trim() || null,
      pet_id: petId.trim() || null,
    };

    const res = await onSubmit(payload);
    if (res.error) {
      setErrorMessage(res.error);
    } else {
      onClose();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1 bg-black/60 justify-end">
        <View className="bg-white rounded-t-3xl p-5 max-h-[85vh]">
          {/* Header */}
          <View className="flex-row items-center justify-between pb-3 border-b border-gray-100 mb-3">
            <View>
              <Text className="text-base font-bold text-gray-900">
                🔒 {isBangla ? 'কেস সমাপ্তি ও ফলাফল' : 'Record Outcome & Close Case'}
              </Text>
              <Text className="text-[11px] font-mono text-gray-500">
                Case #{caseId.slice(0, 8)} {animalSpecies && `· ${animalSpecies}`}
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              className="w-7 h-7 rounded-full bg-gray-200 items-center justify-center"
            >
              <Text className="text-gray-700 font-bold text-xs">✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {errorMessage && (
              <View className="p-2.5 rounded-lg bg-red-50 border border-red-200 mb-3">
                <Text className="text-xs text-red-700">{errorMessage}</Text>
              </View>
            )}

            {/* Outcome List */}
            <Text className="text-xs font-semibold text-gray-800 mb-2">
              {isBangla ? 'চূড়ান্ত ফলাফল নির্বাচন করুন *' : 'Select Final Outcome *'}
            </Text>

            <View className="space-y-1.5 mb-4">
              {RESCUE_OUTCOME_OPTIONS.map((opt) => {
                const isSelected = selectedOutcome === opt.id;
                return (
                  <TouchableOpacity
                    key={opt.id}
                    onPress={() => setSelectedOutcome(opt.id)}
                    className={`p-2.5 rounded-xl border flex-row items-center gap-2.5 ${
                      isSelected
                        ? 'border-primary bg-green-50'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <Text className="text-lg">{opt.icon}</Text>
                    <Text
                      className={`text-xs flex-1 ${
                        isSelected ? 'font-bold text-green-900' : 'text-gray-700'
                      }`}
                    >
                      {isBangla ? opt.bn : opt.en}
                    </Text>
                    {isSelected && (
                      <View className="w-4 h-4 rounded-full bg-primary items-center justify-center">
                        <Text className="text-white text-[10px] font-bold">✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Note Input */}
            <Text className="text-xs font-semibold text-gray-800 mb-1">
              {isBangla ? 'চিকিৎসা বা সমাপ্তি বিবরণ নোট' : 'Closing Notes / Medical Summary'}
            </Text>
            <TextInput
              multiline
              numberOfLines={3}
              placeholder={
                isBangla
                  ? 'চিকিৎসা, প্রেসক্রিপশন বা আশ্রয়দাতার তথ্য লিখুন...'
                  : 'Treatment details, shelter notes, or owner handover...'
              }
              value={note}
              onChangeText={setNote}
              textAlignVertical="top"
              className="border border-gray-300 rounded-xl p-2.5 text-xs text-gray-900 bg-gray-50 h-20 mb-3"
            />

            {/* Optional Pet ID */}
            <Text className="text-xs font-semibold text-gray-800 mb-1">
              {isBangla ? 'পোষা প্রাণীর প্রোফাইল আইডি (ঐচ্ছিক)' : 'Linked Pet ID (Optional)'}
            </Text>
            <TextInput
              placeholder="e.g. pet-uuid"
              value={petId}
              onChangeText={setPetId}
              className="border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900 bg-gray-50 mb-4"
            />

            {/* Action Buttons */}
            <View className="flex-row gap-2 pb-6">
              <TouchableOpacity
                onPress={onClose}
                disabled={isSubmitting}
                className="flex-1 py-3 rounded-xl bg-gray-100 items-center justify-center"
              >
                <Text className="text-gray-700 font-semibold text-xs">
                  {isBangla ? 'বাতিল' : 'Cancel'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 py-3 rounded-xl bg-red-600 items-center justify-center"
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text className="text-white font-bold text-xs">
                    {isBangla ? 'কেস সম্পন্ন করুন' : 'Confirm Close'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
