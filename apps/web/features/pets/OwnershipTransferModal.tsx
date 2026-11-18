'use client';

import React, { useState } from 'react';
import { useLocale, formatDate } from '@pranora/i18n';
import { Modal, Button, Input, Textarea, Chip } from '@pranora/ui';
import type { PetRow, PetOwnershipHistoryRow, OwnershipReason } from '@pranora/api';

export interface OwnershipTransferModalProps {
  isOpen: boolean;
  pet: PetRow | null;
  history: PetOwnershipHistoryRow[];
  onClose: () => void;
  onTransfer: (payload: {
    pet_id: string;
    to_user_id: string;
    reason: OwnershipReason;
    note?: string;
  }) => Promise<{ error?: string }>;
  loadingHistory?: boolean;
}

const REASONS: OwnershipReason[] = [
  'adoption',
  'rescue_intake',
  'admin_transfer',
  'registered',
];

export function OwnershipTransferModal({
  isOpen,
  pet,
  history,
  onClose,
  onTransfer,
  loadingHistory = false,
}: OwnershipTransferModalProps) {
  const { t } = useLocale();
  const [toUserId, setToUserId] = useState('');
  const [reason, setReason] = useState<OwnershipReason>('adoption');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!pet) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!toUserId.trim()) {
      setErrorMsg(t('pets:ownership.recipientUserId'));
      return;
    }

    if (!confirm(t('pets:ownership.transferConfirm'))) {
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    const res = await onTransfer({
      pet_id: pet.id,
      to_user_id: toUserId.trim(),
      reason,
      note: note.trim() || undefined,
    });
    setIsSubmitting(false);

    if (res.error) {
      setErrorMsg(res.error);
    } else {
      setToUserId('');
      setNote('');
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`🔄 ${t('pets:ownership.transferTitle')} — ${pet.name}`}
      description={t('pets:ownership.oneProfileForLife')}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Lifelong Profile Banner */}
        <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-xl p-3.5 text-xs text-green-800 dark:text-green-300">
          <p className="font-medium">🛡️ {t('pets:ownership.transferDesc')}</p>
          {pet.rescue_case_id && (
            <div className="mt-2 inline-flex">
              <Chip
                variant="status"
                statusType="completed"
                label={`🛟 ${t('pets:ownership.rescuedBadge')}`}
              />
            </div>
          )}
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
            {errorMsg}
          </div>
        )}

        {/* Recipient User ID */}
        <Input
          label={`${t('pets:ownership.recipientUserId')} *`}
          placeholder={t('pets:ownership.recipientPlaceholder')}
          value={toUserId}
          onChange={(e) => setToUserId(e.target.value)}
          required
        />

        {/* Transfer Reason */}
        <div>
          <label className="block text-sm font-medium text-content-primary mb-2">
            {t('pets:ownership.reason')}
          </label>
          <div className="flex flex-wrap gap-2">
            {REASONS.map((r) => (
              <button
                type="button"
                key={r}
                onClick={() => setReason(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                  reason === r
                    ? 'bg-primary text-white border-primary shadow-sm'
                    : 'bg-app-card text-content-primary border-stroke-subtle hover:border-stroke-medium'
                }`}
              >
                {t(`pets:ownership.reasons.${r}` as never)}
              </button>
            ))}
          </div>
        </div>

        {/* Note */}
        <Textarea
          label={t('pets:ownership.note')}
          placeholder={t('pets:ownership.notePlaceholder')}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
        />

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
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
            {t('pets:ownership.transferButton')}
          </Button>
        </div>

        {/* Ownership History Section */}
        <div className="border-t border-stroke-subtle pt-4 mt-6">
          <h4 className="text-sm font-bold text-content-primary mb-3">
            📜 {t('pets:ownership.history')}
          </h4>

          {loadingHistory ? (
            <div className="h-16 bg-surface-secondary/40 rounded-xl animate-pulse" />
          ) : history.length === 0 ? (
            <p className="text-xs text-content-secondary italic">
              {t('pets:ownership.noHistory')}
            </p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="bg-surface-secondary/30 rounded-lg p-2.5 border border-stroke-subtle text-xs"
                >
                  <div className="flex justify-between font-semibold text-content-primary">
                    <span>{t(`pets:ownership.reasons.${item.reason}` as never)}</span>
                    <span className="text-content-secondary text-[11px]">
                      {formatDate(item.created_at)}
                    </span>
                  </div>
                  {item.note && (
                    <p className="text-content-secondary italic mt-1">"{item.note}"</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </form>
    </Modal>
  );
}
