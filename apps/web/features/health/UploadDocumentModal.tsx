'use client';

import React, { useState } from 'react';
import { useLocale } from '@pranora/i18n';
import { Modal, Button, Input } from '@pranora/ui';

export interface UploadDocumentModalProps {
  isOpen: boolean;
  petId: string | null;
  onClose: () => void;
  onUpload: (payload: {
    pet_id: string;
    title: string;
    file_path: string;
    document_date?: string;
  }) => Promise<{ error?: string }>;
}

export function UploadDocumentModal({
  isOpen,
  petId,
  onClose,
  onUpload,
}: UploadDocumentModalProps) {
  const { t } = useLocale();
  const [title, setTitle] = useState('');
  const [filePath, setFilePath] = useState('');
  const [documentDate, setDocumentDate] = useState(
    new Date().toISOString().split('T')[0] ?? ''
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!petId) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg(t('health:medicalHistory.docTitle'));
      return;
    }
    if (!filePath.trim()) {
      setErrorMsg(t('health:medicalHistory.fileUrl'));
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    const res = await onUpload({
      pet_id: petId,
      title: title.trim(),
      file_path: filePath.trim(),
      document_date: documentDate.trim() || undefined,
    });
    setIsSubmitting(false);

    if (res.error) {
      setErrorMsg(res.error);
    } else {
      setTitle('');
      setFilePath('');
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`📄 ${t('health:medicalHistory.uploadDoc')}`}
      description={t('health:medicalHistory.ownerBadge')}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
            {errorMsg}
          </div>
        )}

        <Input
          label={`${t('health:medicalHistory.docTitle')} *`}
          placeholder={t('health:medicalHistory.docTitlePlaceholder')}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <Input
          label={`${t('health:medicalHistory.fileUrl')} *`}
          placeholder={t('health:medicalHistory.fileUrlPlaceholder')}
          value={filePath}
          onChange={(e) => setFilePath(e.target.value)}
          required
        />

        <Input
          type="date"
          label={t('health:medicalHistory.docDate')}
          value={documentDate}
          onChange={(e) => setDocumentDate(e.target.value)}
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
