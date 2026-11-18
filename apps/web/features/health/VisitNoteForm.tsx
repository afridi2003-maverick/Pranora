'use client';

import React, { useState } from 'react';
import { useLocale } from '@pranora/i18n';
import { Button, Input, Textarea, Card } from '@pranora/ui';
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
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!diagnosis.trim()) {
      setErrorMsg(t('health:medicalHistory.diagnosis'));
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

    setErrorMsg(null);
    const res = await onSubmit(payload);
    if (res.error) {
      setErrorMsg(res.error);
    }
  };

  return (
    <Card className="p-6 bg-white shadow-sm border border-stroke-subtle">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="border-b border-stroke-subtle pb-4">
          <h3 className="text-lg font-bold text-content-primary">
            🩺 {t('health:vetNotes.label')}
          </h3>
          {bookingId && (
            <p className="text-xs text-primary font-medium mt-1">
              📅 {t('health:vetNotes.linkedBooking', { id: bookingId })}
            </p>
          )}
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
            {errorMsg}
          </div>
        )}

        {/* Diagnosis */}
        <Input
          label={`${t('health:medicalHistory.diagnosis')} *`}
          placeholder="e.g. Acute Gastroenteritis, Fracture"
          value={diagnosis}
          onChange={(e) => setDiagnosis(e.target.value)}
          required
        />

        {/* Clinical Findings */}
        <Textarea
          label={t('health:vetNotes.findings')}
          placeholder="Clinical examination findings (temperature, pulse, auscultation)..."
          value={findings}
          onChange={(e) => setFindings(e.target.value)}
          rows={3}
        />

        {/* Treatment Given */}
        <Textarea
          label={t('health:vetNotes.treatment')}
          placeholder="Treatment administered during visit (injections, fluids, wound care)..."
          value={treatment}
          onChange={(e) => setTreatment(e.target.value)}
          rows={3}
        />

        {/* Follow-up Advice */}
        <Textarea
          label={t('health:vetNotes.followUp')}
          placeholder="Advice for owner, dietary restrictions, revisit date..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
        />

        {/* Prescriptions */}
        <div className="bg-surface-secondary/30 p-4 rounded-xl border border-stroke-subtle space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-sm font-bold text-content-primary">
              💊 {t('health:medicalHistory.prescription')}
            </label>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleAddMedicine}
            >
              {t('health:vetNotes.addPrescription')}
            </Button>
          </div>

          {prescriptions.map((p, idx) => (
            <div
              key={idx}
              className="bg-app-card p-3 rounded-lg border border-stroke-subtle space-y-2"
            >
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-content-primary">
                  #{idx + 1} {t('health:vetNotes.medicineName')}
                </span>
                {prescriptions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveMedicine(idx)}
                    className="text-xs text-red-500 hover:text-red-700 cursor-pointer font-bold"
                  >
                    ✕
                  </button>
                )}
              </div>

              <Input
                placeholder="Medicine Name (e.g. Meloxicam)"
                value={p.medicine}
                onChange={(e) => handleUpdateMedicine(idx, 'medicine', e.target.value)}
              />

              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Dosage (e.g. 1 tab)"
                  value={p.dosage ?? ''}
                  onChange={(e) => handleUpdateMedicine(idx, 'dosage', e.target.value)}
                />
                <Input
                  placeholder="Frequency (e.g. 2x daily)"
                  value={p.frequency ?? ''}
                  onChange={(e) => handleUpdateMedicine(idx, 'frequency', e.target.value)}
                />
              </div>

              <Input
                placeholder="Instructions (e.g. after food for 5 days)"
                value={p.instructions ?? ''}
                onChange={(e) => handleUpdateMedicine(idx, 'instructions', e.target.value)}
              />
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          {onCancel && (
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              className="flex-1"
            >
              {t('pets:actions.cancel')}
            </Button>
          )}
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            className="flex-1"
          >
            {t('health:vetNotes.submitNote')}
          </Button>
        </div>
      </form>
    </Card>
  );
}
