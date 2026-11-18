'use client';

import React, { useState } from 'react';
import { useLocale } from '@pranora/i18n';
import { Modal, Button, Input, Textarea } from '@pranora/ui';
import type { AddMedicalRecordPayload } from '@pranora/api';

export interface AddMedicalRecordModalProps {
  isOpen: boolean;
  petId: string | null;
  onClose: () => void;
  onSubmit: (payload: AddMedicalRecordPayload) => Promise<{ error?: string }>;
}

export function AddMedicalRecordModal({
  isOpen,
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
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!petId) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!diagnosis.trim()) {
      setErrorMsg(t('health:medicalHistory.diagnosis'));
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
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
      setErrorMsg(res.error);
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`🩺 ${t('health:medicalHistory.addRecord')}`}
      description={t('health:medicalHistory.vetBadge')}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
            {errorMsg}
          </div>
        )}

        <Input
          label={`${t('health:medicalHistory.diagnosis')} *`}
          placeholder="e.g. Feline Upper Respiratory Infection"
          value={diagnosis}
          onChange={(e) => setDiagnosis(e.target.value)}
          required
        />

        <Textarea
          label={t('health:medicalHistory.findings')}
          placeholder="e.g. Mild fever, nasal discharge"
          value={findings}
          onChange={(e) => setFindings(e.target.value)}
          rows={2}
        />

        <Textarea
          label={t('health:medicalHistory.treatment')}
          placeholder="e.g. Nebulization and fluid therapy"
          value={treatment}
          onChange={(e) => setTreatment(e.target.value)}
          rows={2}
        />

        <div className="bg-green-50/70 p-3.5 rounded-xl border border-green-200 space-y-2">
          <label className="block text-xs font-bold text-green-900">
            💊 {t('health:medicalHistory.prescription')}
          </label>
          <Input
            placeholder="Medicine Name (e.g. Amoxicillin)"
            value={medicine}
            onChange={(e) => setMedicine(e.target.value)}
          />
          <Input
            placeholder="Dosage & Frequency (e.g. 50mg twice daily, 7 days)"
            value={dosage}
            onChange={(e) => setDosage(e.target.value)}
          />
        </div>

        <div className="flex gap-3 pt-3">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="flex-1"
          >
            {t('pets:actions.cancel')}
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            className="flex-1"
          >
            {t('pets:actions.save')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
