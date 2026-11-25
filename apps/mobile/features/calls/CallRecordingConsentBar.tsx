import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useLocale } from '@pranora/i18n';
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

  useEffect(() => {
    const supabase = createSupabaseClient(
      'https://placeholder.supabase.co',
      'placeholder'
    );
    getRecordingConsentState(supabase, callSessionId).then(setState);
  }, [callSessionId]);

  const myConsent =
    userRole === 'owner' ? state.ownerConsented : state.vetConsented;

  const handleToggleConsent = async () => {
    const supabase = createSupabaseClient(
      'https://placeholder.supabase.co',
      'placeholder'
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
  };

  const statusText =
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
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {isBangla ? 'কল রেকর্ডিং' : 'Call Recording'}
          </Text>
          <View
            style={[
              styles.badge,
              state.recordingStatus === 'recording' && styles.badgeRecording,
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                state.recordingStatus === 'recording' && styles.badgeTextRecording,
              ]}
            >
              {statusText}
            </Text>
          </View>
        </View>

        <Text style={styles.desc}>
          {isBangla
            ? 'আপনি এবং পশু চিকিৎসক উভয়ে সম্মতি দিলে তবেই রেকর্ডিং শুরু হবে।'
            : 'Recording starts only when both you and the vet consent.'}
        </Text>

        <View style={styles.consentRow}>
          <Text style={styles.consentLabel}>
            {isBangla ? 'মালিকের সম্মতি' : 'Owner Consent'}
          </Text>
          <Text style={styles.consentValue}>
            {state.ownerConsented
              ? isBangla
                ? 'সম্মত'
                : 'Consented'
              : isBangla
                ? 'অপেক্ষামান'
                : 'Waiting'}
          </Text>
        </View>

        <View style={styles.consentRow}>
          <Text style={styles.consentLabel}>
            {isBangla ? 'চিকিৎসকের সম্মতি' : 'Vet Consent'}
          </Text>
          <Text style={styles.consentValue}>
            {state.vetConsented
              ? isBangla
                ? 'সম্মত'
                : 'Consented'
              : isBangla
                ? 'অপেক্ষামান'
                : 'Waiting'}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.btn, myConsent ? styles.btnRevoke : styles.btnAllow]}
          onPress={handleToggleConsent}
        >
          <Text style={styles.btnText}>
            {myConsent
              ? isBangla
                ? 'রেকর্ডিং বন্ধ / সম্মতি প্রত্যাহার'
                : 'Stop / Revoke Consent'
              : isBangla
                ? 'রেকর্ডিংয়ের অনুমতি দিন'
                : 'Allow Recording'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 16 },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { fontSize: 18, fontWeight: '700', color: '#0f172a' },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#fef3c7',
  },
  badgeRecording: { backgroundColor: '#fee2e2' },
  badgeText: { fontSize: 11, fontWeight: '600', color: '#92400e' },
  badgeTextRecording: { color: '#b91c1c' },
  desc: { fontSize: 13, color: '#64748b' },
  consentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  consentLabel: { fontSize: 14, color: '#0f172a', fontWeight: '500' },
  consentValue: { fontSize: 13, color: '#475569', fontWeight: '600' },
  btn: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  btnAllow: { backgroundColor: '#2F7B53' },
  btnRevoke: { backgroundColor: '#dc2626' },
  btnText: { color: '#ffffff', fontSize: 14, fontWeight: '600' },
});
