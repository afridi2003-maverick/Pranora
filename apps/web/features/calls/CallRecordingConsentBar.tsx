'use client';

import React, { useEffect, useState } from 'react';
import { useLocale } from '@pranora/i18n';
import { Button, Card, Chip } from '@pranora/ui';
import {
  getRecordingConsentState,
  setRecordingConsent,
  createSupabaseClient,
  type RecordingConsentState,
} from '@pranora/api';

interface CallRecordingConsentBarProps {
  callSessionId?: string;
  userRole?: 'owner' | 'vet';
}

export function CallRecordingConsentBar({
  callSessionId = '550e8400-e29b-41d4-a716-446655440010',
  userRole = 'owner',
}: CallRecordingConsentBarProps) {
  const { locale } = useLocale();
  const isBangla = locale === 'bn';

  const [state, setState] = useState<RecordingConsentState>({
    callSessionId,
    ownerConsented: false,
    vetConsented: true,
    recordingStatus: 'pending_consent',
  });
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder'
    );
    getRecordingConsentState(supabase, callSessionId).then(setState);
  }, [callSessionId]);

  const myConsent =
    userRole === 'owner' ? state.ownerConsented : state.vetConsented;

  const handleToggleConsent = async () => {
    setIsUpdating(true);
    try {
      const supabase = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder'
      );
      const next = await setRecordingConsent(
        supabase,
        {
          call_session_id: callSessionId,
          consented: !myConsent,
          role: userRole,
        },
        {
          ownerConsented: state.ownerConsented,
          vetConsented: state.vetConsented,
        }
      );
      setState(next);
    } finally {
      setIsUpdating(false);
    }
  };

  const statusChipType =
    state.recordingStatus === 'recording'
      ? 'emergency'
      : state.recordingStatus === 'pending_consent'
        ? 'pending'
        : 'neutral';

  const statusLabel =
    state.recordingStatus === 'recording'
      ? isBangla
        ? '● রেকর্ডিং চলছে'
        : '● Recording Active'
      : state.recordingStatus === 'pending_consent'
        ? isBangla
          ? 'উভয় পক্ষের সম্মতির অপেক্ষায়'
          : 'Waiting for both parties'
        : isBangla
          ? 'রেকর্ডিং বন্ধ'
          : 'Not Recording';

  return (
    <Card className="p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            {isBangla ? 'কল রেকর্ডিং (উভয়ের সম্মতি)' : 'Call Recording (Mutual Consent)'}
          </h2>
          <p className="text-xs text-neutral-500">
            {isBangla
              ? 'আপনি এবং পশু চিকিৎসক উভয়ে সম্মতি দিলে তবেই রেকর্ডিং শুরু হবে।'
              : 'Recording starts only when both you and the vet consent.'}
          </p>
        </div>
        <Chip variant="status" statusType={statusChipType} label={statusLabel} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">
            {isBangla ? 'মালিকের সম্মতি' : 'Owner Consent'}
          </span>
          <Chip
            variant="status"
            statusType={state.ownerConsented ? 'confirmed' : 'neutral'}
            label={
              state.ownerConsented
                ? isBangla
                  ? 'সম্মত'
                  : 'Consented'
                : isBangla
                  ? 'অপেক্ষামান'
                  : 'Waiting'
            }
          />
        </div>

        <div className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">
            {isBangla ? 'চিকিৎসকের সম্মতি' : 'Vet Consent'}
          </span>
          <Chip
            variant="status"
            statusType={state.vetConsented ? 'confirmed' : 'neutral'}
            label={
              state.vetConsented
                ? isBangla
                  ? 'সম্মত'
                  : 'Consented'
                : isBangla
                  ? 'অপেক্ষামান'
                  : 'Waiting'
            }
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          variant={myConsent ? 'danger' : 'primary'}
          onClick={handleToggleConsent}
          disabled={isUpdating}
        >
          {myConsent
            ? isBangla
              ? 'রেকর্ডিং বন্ধ / সম্মতি প্রত্যাহার'
              : 'Stop / Revoke Consent'
            : isBangla
              ? 'রেকর্ডিংয়ের অনুমতি দিন'
              : 'Allow Recording'}
        </Button>
      </div>
    </Card>
  );
}
