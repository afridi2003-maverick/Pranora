'use client';

import React, { useState } from 'react';
import { useLocale } from '@pranora/i18n';
import { Modal, Button, Input } from '@pranora/ui';
import type { VaccinationRow } from '@pranora/api';

export interface RecordVaccineModalProps {
  isOpen: boolean;
  vaccine: VaccinationRow | null;
  onClose: () => void;
  onRecord: (payload: {
    id: string;
    given_date: string;
    batch_no?: string;
  }) => Promise<{ error?: string }>;
}

export function RecordVaccineModal({
  isOpen,
  vaccine,
  onClose,
  onRecord,
}: RecordVaccineModalProps) {
  const { t } = useLocale();
  const [givenDate, setGivenDate] = useState(new Date().toISOString().split('T')[0] ?? '');
  const [batchNo, setBatchNo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!vaccine) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!givenDate || !givenDate.trim()) {
      setErrorMsg(t('health:vaccines.givenDate'));
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    const res = await onRecord({
      id: vaccine.id,
      given_date: givenDate.trim(),
      batch_no: batchNo.trim() || undefined,
    });
    setIsSubmitting(false);

    if (res.error) {
      setErrorMsg(res.error);
    } else {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`💉 ${t('health:vaccines.markGiven')} — ${vaccine.name}`}
      description={t('health:vaccines.schedule')}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
            {errorMsg}
          </div>
        )}

        <Input
          type="date"
          label={`${t('health:vaccines.givenDate')} *`}
          value={givenDate}
          onChange={(e) => setGivenDate(e.target.value)}
          required
        />

        <Input
          label={t('health:vaccines.batchNo')}
          placeholder={t('health:vaccines.batchPlaceholder')}
          value={batchNo}
          onChange={(e) => setBatchNo(e.target.value)}
        />

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
