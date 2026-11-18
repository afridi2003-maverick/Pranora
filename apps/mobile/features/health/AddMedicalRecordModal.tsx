import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocale } from '@pranora/i18n';
import type { AddMedicalRecordPayload } from '@pranora/api';

export interface AddMedicalRecordModalProps {
  visible: boolean;
  petId: string | null;
  onClose: () => void;
  onSubmit: (payload: AddMedicalRecordPayload) => Promise<{ error?: string }>;
}

export function AddMedicalRecordModal({
  visible,
  petId,
  onClose,
  onSubmit,
}: AddMedicalRecordModalProps) {
  const { t } = useLocale();
  const [diagnosis, setDiagnosis] = useState('');
  const [findings, setFindings] = useState('');
  const [treatment, setTreatment] = useState('');
  const [notes, setNotes] = useState('');
  const [medicine, setMedicine] = useState('');
  const [dosage, setDosage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!petId) return null;

  const handleSubmit = async () => {
    if (!diagnosis.trim()) {
      Alert.alert('Validation Error', t('health:medicalHistory.diagnosis'));
      return;
    }

    setIsSubmitting(true);
    const prescriptions = medicine.trim()
      ? [
          {
            medicine: medicine.trim(),
            dosage: dosage.trim() || null,
            frequency: null,
            duration_days: null,
            instructions: null,
          },
        ]
      : [];

    const res = await onSubmit({
      pet_id: petId,
      vet_id: 'vet-current-user',
      visit_date: new Date().toISOString().split('T')[0] ?? '',
      diagnosis: diagnosis.trim(),
      findings: findings.trim() || null,
      treatment: treatment.trim() || null,
      notes: notes.trim() || null,
      attachments: [],
      prescriptions,
    });
    setIsSubmitting(false);

    if (res.error) {
      Alert.alert('Error', res.error);
    } else {
      setDiagnosis('');
      setFindings('');
      setTreatment('');
      setNotes('');
      setMedicine('');
      setDosage('');
      onClose();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl p-5 max-h-[85%]">
          <View className="flex-row justify-between items-center pb-3 border-b border-gray-100 mb-3">
            <View>
              <Text className="text-base font-bold text-gray-900">
                🩺 {t('health:medicalHistory.addRecord')}
              </Text>
              <Text className="text-xs text-primary font-semibold">
                {t('health:medicalHistory.vetBadge')}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} className="p-1">
              <Text className="text-gray-400 font-bold text-base">✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View className="mb-3">
              <Text className="text-xs font-semibold text-gray-700 mb-1">
                {t('health:medicalHistory.diagnosis')} *
              </Text>
              <TextInput
                value={diagnosis}
                onChangeText={setDiagnosis}
                placeholder="e.g. Feline Upper Respiratory Infection"
                className="bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-sm text-gray-900"
              />
            </View>

            <View className="mb-3">
              <Text className="text-xs font-semibold text-gray-700 mb-1">
                {t('health:medicalHistory.findings')}
              </Text>
              <TextInput
                value={findings}
                onChangeText={setFindings}
                placeholder="e.g. Mild fever, nasal discharge"
                multiline
                numberOfLines={2}
                className="bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-sm text-gray-900"
              />
            </View>

            <View className="mb-3">
              <Text className="text-xs font-semibold text-gray-700 mb-1">
                {t('health:medicalHistory.treatment')}
              </Text>
              <TextInput
                value={treatment}
                onChangeText={setTreatment}
                placeholder="e.g. Nebulization and fluid therapy"
                multiline
                numberOfLines={2}
                className="bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-sm text-gray-900"
              />
            </View>

            <View className="bg-green-50/70 p-3 rounded-xl border border-green-200 mb-4">
              <Text className="text-xs font-bold text-green-900 mb-2">
                💊 {t('health:medicalHistory.prescription')}
              </Text>
              <TextInput
                value={medicine}
                onChangeText={setMedicine}
                placeholder="Medicine Name (e.g. Amoxicillin)"
                className="bg-white border border-green-200 rounded-lg px-3 py-1.5 text-xs text-gray-900 mb-2"
              />
              <TextInput
                value={dosage}
                onChangeText={setDosage}
                placeholder="Dosage & Frequency (e.g. 50mg twice daily, 7 days)"
                className="bg-white border border-green-200 rounded-lg px-3 py-1.5 text-xs text-gray-900"
              />
            </View>

            <View className="flex-row gap-2 mb-4">
              <TouchableOpacity
                onPress={onClose}
                className="flex-1 py-3 rounded-xl bg-gray-100 items-center"
              >
                <Text className="text-xs font-semibold text-gray-700">
                  {t('pets:actions.cancel')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 py-3 rounded-xl bg-primary items-center"
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
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
