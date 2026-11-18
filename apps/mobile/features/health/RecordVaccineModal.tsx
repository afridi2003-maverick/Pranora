import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocale } from '@pranora/i18n';
import type { VaccinationRow } from '@pranora/api';

export interface RecordVaccineModalProps {
  visible: boolean;
  vaccine: VaccinationRow | null;
  onClose: () => void;
  onRecord: (payload: {
    id: string;
    given_date: string;
    batch_no?: string;
  }) => Promise<{ error?: string }>;
}

export function RecordVaccineModal({
  visible,
  vaccine,
  onClose,
  onRecord,
}: RecordVaccineModalProps) {
  const { t } = useLocale();
  const [givenDate, setGivenDate] = useState(new Date().toISOString().split('T')[0] ?? '');
  const [batchNo, setBatchNo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!vaccine) return null;

  const handleSubmit = async () => {
    if (!givenDate || !givenDate.trim()) {
      Alert.alert('Validation Error', t('health:vaccines.givenDate'));
      return;
    }

    setIsSubmitting(true);
    const res = await onRecord({
      id: vaccine.id,
      given_date: givenDate.trim(),
      batch_no: batchNo.trim() || undefined,
    });
    setIsSubmitting(false);

    if (res.error) {
      Alert.alert('Error', res.error);
    } else {
      onClose();
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View className="flex-1 bg-black/50 justify-center p-4">
        <View className="bg-white rounded-2xl p-5">
          <View className="flex-row justify-between items-center pb-3 border-b border-gray-100">
            <View>
              <Text className="text-base font-bold text-gray-900">
                💉 {t('health:vaccines.markGiven')}
              </Text>
              <Text className="text-xs text-gray-500">{vaccine.name}</Text>
            </View>
            <TouchableOpacity onPress={onClose} className="p-1">
              <Text className="text-gray-400 font-bold text-base">✕</Text>
            </TouchableOpacity>
          </View>

          <View className="mt-4">
            <Text className="text-xs font-semibold text-gray-700 mb-1">
              {t('health:vaccines.givenDate')} (YYYY-MM-DD) *
            </Text>
            <TextInput
              value={givenDate}
              onChangeText={setGivenDate}
              placeholder="YYYY-MM-DD"
              className="bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-sm text-gray-900 mb-3"
            />

            <Text className="text-xs font-semibold text-gray-700 mb-1">
              {t('health:vaccines.batchNo')}
            </Text>
            <TextInput
              value={batchNo}
              onChangeText={setBatchNo}
              placeholder={t('health:vaccines.batchPlaceholder')}
              className="bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-sm text-gray-900 mb-5"
            />

            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={onClose}
                className="flex-1 py-2.5 rounded-xl bg-gray-100 items-center"
              >
                <Text className="text-xs font-semibold text-gray-700">
                  {t('pets:actions.cancel')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl bg-primary items-center"
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text className="text-xs font-bold text-white">
                    {t('pets:actions.save')}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}
