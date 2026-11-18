import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocale } from '@pranora/i18n';
import type { AddMedicalRecordPayload, PrescriptionItemInput } from '@pranora/api';

export interface VisitNoteFormProps {
  petId: string;
  bookingId?: string | null;
  rescueCaseId?: string | null;
  vetId?: string;
  initialValues?: Partial<AddMedicalRecordPayload>;
  onSubmit: (payload: AddMedicalRecordPayload) => Promise<{ error?: string }>;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

export function VisitNoteForm({
  petId,
  bookingId,
  rescueCaseId,
  vetId = 'vet-current-user',
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: VisitNoteFormProps) {
  const { t } = useLocale();
  const [diagnosis, setDiagnosis] = useState(initialValues?.diagnosis ?? '');
  const [findings, setFindings] = useState(initialValues?.findings ?? '');
  const [treatment, setTreatment] = useState(initialValues?.treatment ?? '');
  const [notes, setNotes] = useState(initialValues?.notes ?? '');
  const [prescriptions, setPrescriptions] = useState<PrescriptionItemInput[]>(
    (initialValues?.prescriptions as PrescriptionItemInput[]) || [
      { medicine: '', dosage: '', frequency: '', duration_days: null, instructions: '' },
    ]
  );

  const handleAddMedicine = () => {
    setPrescriptions([
      ...prescriptions,
      { medicine: '', dosage: '', frequency: '', duration_days: null, instructions: '' },
    ]);
  };

  const handleRemoveMedicine = (index: number) => {
    setPrescriptions(prescriptions.filter((_, i) => i !== index));
  };

  const handleUpdateMedicine = (index: number, field: keyof PrescriptionItemInput, value: string) => {
    const next = [...prescriptions];
    if (field === 'duration_days') {
      const parsed = parseInt(value, 10);
      next[index] = { ...next[index]!, duration_days: isNaN(parsed) ? null : parsed };
    } else {
      next[index] = { ...next[index]!, [field]: value };
    }
    setPrescriptions(next);
  };

  const handleSubmit = async () => {
    if (!diagnosis.trim()) {
      Alert.alert('Validation Error', t('health:medicalHistory.diagnosis'));
      return;
    }

    const validPrescriptions = prescriptions.filter((p) => p.medicine.trim().length > 0);

    const payload: AddMedicalRecordPayload = {
      pet_id: petId,
      vet_id: vetId,
      booking_id: bookingId ?? null,
      rescue_case_id: rescueCaseId ?? null,
      visit_date: new Date().toISOString().split('T')[0] ?? '',
      diagnosis: diagnosis.trim(),
      findings: findings.trim() || null,
      treatment: treatment.trim() || null,
      notes: notes.trim() || null,
      attachments: [],
      prescriptions: validPrescriptions,
    };

    const res = await onSubmit(payload);
    if (res.error) {
      Alert.alert('Error', res.error);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false}>
      {bookingId && (
        <View className="bg-green-50 p-3 rounded-xl border border-green-200 mb-4">
          <Text className="text-xs font-bold text-green-800">
            📅 {t('health:vetNotes.linkedBooking', { id: bookingId })}
          </Text>
        </View>
      )}

      {/* Diagnosis */}
      <View className="mb-4">
        <Text className="text-xs font-bold text-gray-700 mb-1">
          {t('health:medicalHistory.diagnosis')} *
        </Text>
        <TextInput
          value={diagnosis}
          onChangeText={setDiagnosis}
          placeholder="e.g. Acute Gastroenteritis, Fracture"
          className="bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm text-gray-900"
        />
      </View>

      {/* Findings */}
      <View className="mb-4">
        <Text className="text-xs font-bold text-gray-700 mb-1">
          {t('health:vetNotes.findings')}
        </Text>
        <TextInput
          value={findings}
          onChangeText={setFindings}
          placeholder="Clinical examination findings (temperature, pulse, auscultation)..."
          multiline
          numberOfLines={3}
          className="bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm text-gray-900"
        />
      </View>

      {/* Treatment Administered */}
      <View className="mb-4">
        <Text className="text-xs font-bold text-gray-700 mb-1">
          {t('health:vetNotes.treatment')}
        </Text>
        <TextInput
          value={treatment}
          onChangeText={setTreatment}
          placeholder="Treatment administered during visit (injections, fluids, wound care)..."
          multiline
          numberOfLines={3}
          className="bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm text-gray-900"
        />
      </View>

      {/* Follow-up / Notes */}
      <View className="mb-5">
        <Text className="text-xs font-bold text-gray-700 mb-1">
          {t('health:vetNotes.followUp')}
        </Text>
        <TextInput
          value={notes}
          onChangeText={setNotes}
          placeholder="Advice for owner, dietary restrictions, revisit date..."
          multiline
          numberOfLines={2}
          className="bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm text-gray-900"
        />
      </View>

      {/* Prescriptions Section */}
      <View className="bg-gray-50 p-4 rounded-2xl border border-gray-200 mb-6">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-sm font-bold text-gray-900">
            💊 {t('health:medicalHistory.prescription')}
          </Text>
          <TouchableOpacity
            onPress={handleAddMedicine}
            className="bg-primary/10 px-2.5 py-1 rounded-lg border border-primary/20"
          >
            <Text className="text-xs font-bold text-primary">
              {t('health:vetNotes.addPrescription')}
            </Text>
          </TouchableOpacity>
        </View>

        {prescriptions.map((p, idx) => (
          <View key={idx} className="bg-white p-3 rounded-xl border border-gray-200 mb-3 shadow-xs">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-xs font-bold text-gray-700">
                #{idx + 1} {t('health:vetNotes.medicineName')}
              </Text>
              {prescriptions.length > 1 && (
                <TouchableOpacity onPress={() => handleRemoveMedicine(idx)}>
                  <Text className="text-xs text-red-500 font-bold">✕</Text>
                </TouchableOpacity>
              )}
            </View>

            <TextInput
              value={p.medicine}
              onChangeText={(val) => handleUpdateMedicine(idx, 'medicine', val)}
              placeholder="Medicine Name (e.g. Meloxicam)"
              className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-900 mb-2"
            />

            <View className="flex-row gap-2 mb-2">
              <TextInput
                value={p.dosage ?? ''}
                onChangeText={(val) => handleUpdateMedicine(idx, 'dosage', val)}
                placeholder="Dosage (e.g. 1 tab)"
                className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-900"
              />
              <TextInput
                value={p.frequency ?? ''}
                onChangeText={(val) => handleUpdateMedicine(idx, 'frequency', val)}
                placeholder="Frequency (e.g. 2x daily)"
                className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-900"
              />
            </View>

            <TextInput
              value={p.instructions ?? ''}
              onChangeText={(val) => handleUpdateMedicine(idx, 'instructions', val)}
              placeholder="Instructions (e.g. after food)"
              className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-900"
            />
          </View>
        ))}
      </View>

      {/* Action Buttons */}
      <View className="flex-row gap-3">
        {onCancel && (
          <TouchableOpacity
            onPress={onCancel}
            className="flex-1 py-3 rounded-xl bg-gray-100 items-center"
          >
            <Text className="text-sm font-semibold text-gray-700">
              {t('pets:actions.cancel')}
            </Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={isSubmitting}
          className="flex-1 py-3 rounded-xl bg-primary items-center"
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text className="text-sm font-bold text-white">
              {t('health:vetNotes.submitNote')}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
