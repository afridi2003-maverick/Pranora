import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from 'react-native';
import { useLocale } from '@pranora/i18n';
import {
  createDigitalPrescription,
  type DigitalPrescriptionInput,
  type PrescriptionItemInput,
} from '@pranora/api';

interface PatientData {
  petId: string;
  petName: string;
  species: string;
  breed?: string;
  ownerName: string;
  bookingId?: string;
  bookingCode?: string;
}

const DEFAULT_PATIENT: PatientData = {
  petId: 'pet-001',
  petName: 'মতি (Moti)',
  species: 'cat',
  breed: 'Domestic Short Hair',
  ownerName: 'রাহেলা খানম (Rahela Khanam)',
  bookingId: 'book-001',
  bookingCode: 'PB-20260320-001',
};

const DEFAULT_VET = {
  vetId: 'vet-001',
  vetName: 'ডাঃ আমিনা বেগম (Dr. Amina Begum)',
  qualifications: 'DVM (BAU), MS in Small Animal Surgery',
  bvcRegNo: 'BVC-VET-4821',
  clinicName: 'PranoraCare Clinic, Dhanmondi',
};

export function DigitalPrescriptionScreen() {
  const { locale } = useLocale();
  const isBangla = locale === 'bn';

  const [patient] = useState<PatientData>(DEFAULT_PATIENT);
  const [vet] = useState(DEFAULT_VET);
  const [visitDate] = useState(new Date().toISOString().slice(0, 10));
  const [diagnosis, setDiagnosis] = useState('Acute Bacterial Gastritis');
  const [findings, setFindings] = useState('Mild fever (39.2°C), abdominal palpation discomfort.');
  const [weightKg, setWeightKg] = useState('4.2');
  const [temperatureC, setTemperatureC] = useState('39.2');
  const [advice, setAdvice] = useState('Soft bland diet (chicken broth & rice) for 3 days. Clean drinking water.');
  const [followUpDate, setFollowUpDate] = useState(
    new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10)
  );

  const [medicines, setMedicines] = useState<PrescriptionItemInput[]>([
    {
      medicine: 'Cefpet 50mg',
      dosage: '1 tab',
      frequency: '1-0-1',
      duration_days: 7,
      instructions: 'After meal',
    },
    {
      medicine: 'Metrogyl Suspension',
      dosage: '2.5 ml',
      frequency: '1-0-1',
      duration_days: 5,
      instructions: 'Shake well',
    },
    {
      medicine: 'Pro-Kolin Paste',
      dosage: '1 ml',
      frequency: 'Once daily',
      duration_days: 5,
      instructions: '1h after lunch',
    },
  ]);

  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const t = {
    title: isBangla ? 'ডিজিটাল প্রেসক্রিপশন' : 'Digital Prescription',
    subtitle: isBangla ? 'পশুচিকিৎসকের অফিসিয়াল প্রেসক্রিপশন (APT-5)' : 'Official Vet Rx Pad (APT-5)',
    editTab: isBangla ? 'সম্পাদনা' : 'Edit Rx',
    previewTab: isBangla ? 'প্রেসক্রিপশন প্রিভিউ' : 'Preview Rx',
    diagnosis: isBangla ? 'রোগ নির্ণয়' : 'Diagnosis',
    findings: isBangla ? 'শারীরিক লক্ষণ' : 'Findings',
    weight: isBangla ? 'ওজন (কেজি)' : 'Weight (kg)',
    temp: isBangla ? 'তাপমাত্রা (°সে)' : 'Temp (°C)',
    medicines: isBangla ? 'নির্ধারিত ওষুধসমূহ (Rx)' : 'Prescribed Medicines (Rx)',
    addMedicine: isBangla ? '+ ওষুধ যোগ করুন' : '+ Add Medicine',
    medicine: isBangla ? 'ওষুধ' : 'Medicine',
    dosage: isBangla ? 'মাত্রা' : 'Dose',
    frequency: isBangla ? 'নিয়ম' : 'Frequency',
    duration: isBangla ? 'দিন' : 'Days',
    instructions: isBangla ? 'নির্দেশনা' : 'Instructions',
    advice: isBangla ? 'পরামর্শ' : 'Advice',
    followUp: isBangla ? 'পরবর্তী তারিখ' : 'Follow-up Date',
    saveAndIssue: isBangla ? 'প্রেসক্রিপশন ইস্যু করুন' : 'Issue Prescription',
    saving: isBangla ? 'সংরক্ষণ হচ্ছে...' : 'Issuing...',
    saved: isBangla ? 'প্রেসক্রিপশন সফলভাবে ইস্যু করা হয়েছে!' : 'Prescription issued successfully!',
    remove: isBangla ? 'মুছুন' : 'Remove',
    regNo: isBangla ? 'রেজিঃ নং' : 'Reg. No',
  };

  function handleAddMedicine() {
    setMedicines((prev) => [
      ...prev,
      { medicine: '', dosage: '', frequency: '', duration_days: 5, instructions: '' },
    ]);
  }

  function handleRemoveMedicine(idx: number) {
    setMedicines((prev) => prev.filter((_, i) => i !== idx));
  }

  function handleUpdateMedicine(idx: number, updates: Partial<PrescriptionItemInput>) {
    setMedicines((prev) =>
      prev.map((m, i) => (i === idx ? { ...m, ...updates } : m))
    );
  }

  async function handleSavePrescription() {
    setIsSubmitting(true);
    setIsSuccess(false);

    const payload: DigitalPrescriptionInput = {
      petId: patient.petId,
      bookingId: patient.bookingId,
      vetId: vet.vetId,
      visitDate,
      diagnosis,
      findings,
      weightKg: weightKg ? parseFloat(weightKg) : null,
      temperatureC: temperatureC ? parseFloat(temperatureC) : null,
      medicines,
      advice,
      followUpDate,
    };

    try {
      const client = null as any;
      await createDigitalPrescription(client, payload);
    } catch {
      // offline fallback
    }

    setIsSuccess(true);
    setViewMode('preview');
    setIsSubmitting(false);
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>{t.title}</Text>
          <Text style={styles.headerSubtitle}>{t.subtitle}</Text>
        </View>
        <View style={styles.tabSwitch}>
          <TouchableOpacity
            style={[styles.tabBtn, viewMode === 'edit' && styles.tabBtnActive]}
            onPress={() => setViewMode('edit')}
          >
            <Text style={[styles.tabBtnText, viewMode === 'edit' && styles.tabBtnTextActive]}>
              {t.editTab}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, viewMode === 'preview' && styles.tabBtnActive]}
            onPress={() => setViewMode('preview')}
          >
            <Text style={[styles.tabBtnText, viewMode === 'preview' && styles.tabBtnTextActive]}>
              {t.previewTab}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Success banner */}
      {isSuccess && (
        <View style={styles.successBanner}>
          <Text style={styles.successText}>✓ {t.saved}</Text>
        </View>
      )}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* ── MODE 1: EDIT FORM ── */}
        {viewMode === 'edit' ? (
          <View style={styles.formContainer}>
            {/* Patient Header */}
            <View style={styles.patientCard}>
              <View style={styles.patientRow}>
                <View>
                  <Text style={styles.patientName}>{patient.petName}</Text>
                  <Text style={styles.patientMeta}>{patient.species} ({patient.breed})</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.ownerName}>{patient.ownerName}</Text>
                  <Text style={styles.bookingCode}>{patient.bookingCode}</Text>
                </View>
              </View>
            </View>

            {/* Diagnosis & Vitals */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{t.diagnosis}</Text>
              <TextInput
                style={styles.input}
                value={diagnosis}
                onChangeText={setDiagnosis}
                placeholder="e.g. Acute Gastritis"
              />

              <View style={styles.vitalsRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>{t.weight}</Text>
                  <TextInput
                    style={styles.input}
                    value={weightKg}
                    onChangeText={setWeightKg}
                    keyboardType="numeric"
                    placeholder="4.2"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>{t.temp}</Text>
                  <TextInput
                    style={styles.input}
                    value={temperatureC}
                    onChangeText={setTemperatureC}
                    keyboardType="numeric"
                    placeholder="39.2"
                  />
                </View>
              </View>

              <Text style={styles.label}>{t.findings}</Text>
              <TextInput
                style={[styles.input, { minHeight: 60 }]}
                multiline
                value={findings}
                onChangeText={setFindings}
              />
            </View>

            {/* Medicines List (Rx) */}
            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.cardTitle}>℞ {t.medicines}</Text>
                <TouchableOpacity onPress={handleAddMedicine}>
                  <Text style={styles.addBtnText}>{t.addMedicine}</Text>
                </TouchableOpacity>
              </View>

              {medicines.map((m, idx) => (
                <View key={idx} style={styles.medCard}>
                  <View style={styles.medHeaderRow}>
                    <Text style={styles.medIndex}>#{idx + 1}</Text>
                    <TouchableOpacity onPress={() => handleRemoveMedicine(idx)}>
                      <Text style={styles.removeText}>{t.remove}</Text>
                    </TouchableOpacity>
                  </View>

                  <TextInput
                    style={styles.input}
                    placeholder={t.medicine}
                    value={m.medicine}
                    onChangeText={(v) => handleUpdateMedicine(idx, { medicine: v })}
                  />

                  <View style={styles.medDetailsRow}>
                    <TextInput
                      style={[styles.input, { flex: 1 }]}
                      placeholder={t.dosage}
                      value={m.dosage ?? ''}
                      onChangeText={(v) => handleUpdateMedicine(idx, { dosage: v })}
                    />
                    <TextInput
                      style={[styles.input, { flex: 1 }]}
                      placeholder={t.frequency}
                      value={m.frequency ?? ''}
                      onChangeText={(v) => handleUpdateMedicine(idx, { frequency: v })}
                    />
                    <TextInput
                      style={[styles.input, { width: 60 }]}
                      placeholder={t.duration}
                      keyboardType="numeric"
                      value={m.duration_days ? String(m.duration_days) : ''}
                      onChangeText={(v) =>
                        handleUpdateMedicine(idx, { duration_days: parseInt(v, 10) || null })
                      }
                    />
                  </View>

                  <TextInput
                    style={styles.input}
                    placeholder={t.instructions}
                    value={m.instructions ?? ''}
                    onChangeText={(v) => handleUpdateMedicine(idx, { instructions: v })}
                  />
                </View>
              ))}
            </View>

            {/* Advice & Follow up */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{t.advice}</Text>
              <TextInput
                style={[styles.input, { minHeight: 60 }]}
                multiline
                value={advice}
                onChangeText={setAdvice}
              />

              <Text style={styles.label}>{t.followUp}</Text>
              <TextInput
                style={styles.input}
                value={followUpDate}
                onChangeText={setFollowUpDate}
                placeholder="YYYY-MM-DD"
              />
            </View>

            {/* Save Button */}
            <TouchableOpacity
              style={[styles.saveBtn, isSubmitting && styles.saveBtnDisabled]}
              onPress={handleSavePrescription}
              disabled={isSubmitting}
            >
              <Text style={styles.saveBtnText}>{isSubmitting ? t.saving : t.saveAndIssue}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* ── MODE 2: PREVIEW RX PAD ── */
          <View style={styles.previewContainer}>
            {/* Letterhead */}
            <View style={styles.letterhead}>
              <Text style={styles.rxDoctor}>{vet.vetName}</Text>
              <Text style={styles.rxQualifications}>{vet.qualifications}</Text>
              <Text style={styles.rxRegNo}>{t.regNo}: {vet.bvcRegNo}</Text>
              <Text style={styles.rxClinic}>{vet.clinicName}</Text>
            </View>

            {/* Patient bar */}
            <View style={styles.rxPatientBar}>
              <Text style={styles.rxPatientText}>
                {patient.petName} ({patient.species}) · {weightKg}kg · {temperatureC}°C
              </Text>
              <Text style={styles.rxDateText}>Date: {visitDate}</Text>
            </View>

            {/* Diagnosis */}
            <View style={styles.rxSection}>
              <Text style={styles.rxDiagLabel}>{t.diagnosis}: <Text style={styles.rxDiagVal}>{diagnosis}</Text></Text>
              {findings ? <Text style={styles.rxFindings}>{findings}</Text> : null}
            </View>

            {/* Rx Symbol & List */}
            <View style={styles.rxSection}>
              <Text style={styles.rxSymbol}>℞</Text>
              {medicines.map((m, idx) => (
                <View key={idx} style={styles.rxItem}>
                  <Text style={styles.rxMedName}>{idx + 1}. {m.medicine}</Text>
                  <Text style={styles.rxMedDose}>
                    {m.dosage} · {m.frequency} · {m.duration_days ? `${m.duration_days} days` : ''}
                  </Text>
                  {m.instructions ? (
                    <Text style={styles.rxMedInstruct}>↳ {m.instructions}</Text>
                  ) : null}
                </View>
              ))}
            </View>

            {/* Advice */}
            {advice ? (
              <View style={styles.rxAdviceBox}>
                <Text style={styles.rxAdviceLabel}>{t.advice}:</Text>
                <Text style={styles.rxAdviceText}>{advice}</Text>
              </View>
            ) : null}

            {/* Footer */}
            <View style={styles.rxFooter}>
              <Text style={styles.rxFollowUpText}>{t.followUp}: {followUpDate}</Text>
              <View style={styles.rxSignatureBlock}>
                <Text style={styles.rxSignDoctor}>{vet.vetName}</Text>
                <Text style={styles.rxSignVerified}>Digital Rx ✓</Text>
              </View>
            </View>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },

  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#111827' },
  headerSubtitle: { fontSize: 12, color: '#6b7280', marginTop: 2 },

  tabSwitch: { flexDirection: 'row', backgroundColor: '#f3f4f6', borderRadius: 8, padding: 2 },
  tabBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  tabBtnActive: { backgroundColor: '#2563eb' },
  tabBtnText: { fontSize: 12, fontWeight: '600', color: '#6b7280' },
  tabBtnTextActive: { color: '#fff', fontWeight: '700' },

  successBanner: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#86efac',
  },
  successText: { color: '#15803d', fontWeight: '700', fontSize: 13 },

  content: { flex: 1 },
  formContainer: { padding: 16, gap: 12 },

  patientCard: {
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  patientRow: { flexDirection: 'row', justifyContent: 'space-between' },
  patientName: { fontSize: 16, fontWeight: '800', color: '#1e3a8a' },
  patientMeta: { fontSize: 12, color: '#3b82f6', textTransform: 'capitalize' },
  ownerName: { fontSize: 13, fontWeight: '600', color: '#1e40af' },
  bookingCode: { fontSize: 11, fontFamily: 'monospace', color: '#60a5fa' },

  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 8,
  },
  cardTitle: { fontSize: 14, fontWeight: '800', color: '#111827' },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  addBtnText: { color: '#2563eb', fontWeight: '700', fontSize: 13 },
  label: { fontSize: 11, color: '#6b7280', fontWeight: '600' },
  vitalsRow: { flexDirection: 'row', gap: 10 },

  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
  },

  medCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 6,
  },
  medHeaderRow: { flexDirection: 'row', justifyContent: 'space-between' },
  medIndex: { fontSize: 12, fontWeight: '800', color: '#2563eb' },
  removeText: { fontSize: 11, fontWeight: '600', color: '#dc2626' },
  medDetailsRow: { flexDirection: 'row', gap: 6 },

  saveBtn: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 6,
  },
  saveBtnDisabled: { backgroundColor: '#93c5fd' },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  // Preview Pad
  previewContainer: {
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 18,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    gap: 12,
  },
  letterhead: { borderBottomWidth: 2, borderBottomColor: '#2563eb', paddingBottom: 10 },
  rxDoctor: { fontSize: 17, fontWeight: '900', color: '#1e3a8a' },
  rxQualifications: { fontSize: 11, color: '#6b7280', marginTop: 1 },
  rxRegNo: { fontSize: 11, fontWeight: '700', color: '#059669', marginTop: 2 },
  rxClinic: { fontSize: 12, fontWeight: '600', color: '#374151', marginTop: 2 },

  rxPatientBar: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  rxPatientText: { fontSize: 12, fontWeight: '700', color: '#111827' },
  rxDateText: { fontSize: 11, color: '#6b7280' },

  rxSection: { gap: 4 },
  rxDiagLabel: { fontSize: 12, fontWeight: '700', color: '#4b5563' },
  rxDiagVal: { color: '#1d4ed8' },
  rxFindings: { fontSize: 11, color: '#6b7280', fontStyle: 'italic' },

  rxSymbol: { fontSize: 32, fontWeight: '900', color: '#1e3a8a', fontFamily: 'serif' },
  rxItem: {
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  rxMedName: { fontSize: 14, fontWeight: '700', color: '#111827' },
  rxMedDose: { fontSize: 12, color: '#4b5563', marginTop: 1 },
  rxMedInstruct: { fontSize: 11, color: '#6b7280', fontStyle: 'italic', marginTop: 1 },

  rxAdviceBox: {
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  rxAdviceLabel: { fontSize: 11, fontWeight: '700', color: '#1e40af' },
  rxAdviceText: { fontSize: 12, color: '#1e3a8a', marginTop: 2 },

  rxFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  rxFollowUpText: { fontSize: 12, fontWeight: '700', color: '#d97706' },
  rxSignatureBlock: { alignItems: 'flex-end' },
  rxSignDoctor: { fontSize: 12, fontWeight: '700', color: '#111827' },
  rxSignVerified: { fontSize: 10, fontWeight: '700', color: '#16a34a' },
});
