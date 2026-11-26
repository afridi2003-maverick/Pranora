import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useLocale } from '@pranora/i18n';
import {
  initiateCall,
  endCall,
  createSupabaseClient,
  type CallSession,
} from '@pranora/api';

interface AudioCallScreenProps {
  bookingId?: string;
  vetName?: string;
  clinicName?: string;
  petName?: string;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function AudioCallScreen({
  bookingId = '550e8400-e29b-41d4-a716-446655440001',
  vetName = 'ডাঃ সুমাইয়া আক্তার (Dr. Sumaiya Akter)',
  clinicName = 'PranoraCare Veterinary Clinic, Dhanmondi',
  petName = 'মতি (Moti)',
}: AudioCallScreenProps) {
  const { locale } = useLocale();
  const isBangla = locale === 'bn';

  const [session, setSession] = useState<CallSession | null>(null);
  const [callState, setCallState] = useState<'idle' | 'calling' | 'active' | 'ended'>('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (callState !== 'active') return;
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [callState]);

  const handleStartCall = async () => {
    setCallState('calling');
    setElapsedSeconds(0);
    try {
      const supabase = createSupabaseClient(
        'https://placeholder.supabase.co',
        'placeholder'
      );
      const created = await initiateCall(supabase, {
        booking_id: bookingId,
        call_type: 'audio',
      });
      setSession(created);
      setTimeout(() => {
        setCallState((current) => (current === 'calling' ? 'active' : current));
      }, 1200);
    } catch {
      setCallState('idle');
    }
  };

  const handleEndCall = async () => {
    if (session) {
      try {
        const supabase = createSupabaseClient(
          'https://placeholder.supabase.co',
          'placeholder'
        );
        await endCall(supabase, {
          call_session_id: session.id,
          duration_seconds: elapsedSeconds,
        });
      } catch {
        // Ignore teardown errors
      }
    }
    setCallState('ended');
  };

  const statusText =
    callState === 'idle'
      ? isBangla
        ? 'প্রস্তুত'
        : 'Ready'
      : callState === 'calling'
        ? isBangla
          ? 'কল করা হচ্ছে...'
          : 'Calling...'
        : callState === 'active'
          ? isBangla
            ? 'কলে আছেন'
            : 'In Call'
          : isBangla
            ? 'কল শেষ হয়েছে'
            : 'Call Ended';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{isBangla ? 'অডিও কল' : 'Audio Call'}</Text>
        <Text style={styles.subtitle}>
          {isBangla
            ? 'আপনার পশু চিকিৎসকের সাথে ভয়েস পরামর্শ'
            : 'Voice consultation with your vet'}
        </Text>
      </View>

      <View style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>🩺</Text>
        </View>
        <Text style={styles.vetName}>{vetName}</Text>
        <Text style={styles.clinicName}>{clinicName}</Text>
        <Text style={styles.petName}>
          {isBangla ? `পোষ্য: ${petName}` : `Pet: ${petName}`}
        </Text>

        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{statusText}</Text>
        </View>

        <Text style={styles.timer}>{formatDuration(elapsedSeconds)}</Text>

        {session && (
          <Text style={styles.roomText}>
            {isBangla ? `রুম: ${session.roomName}` : `Room: ${session.roomName}`}
          </Text>
        )}
      </View>

      <View style={styles.controls}>
        {callState === 'idle' || callState === 'ended' ? (
          <TouchableOpacity style={styles.startButton} onPress={handleStartCall}>
            <Text style={styles.startButtonText}>
              {isBangla ? 'অডিও কল শুরু করুন' : 'Start Audio Call'}
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.activeControls}>
            <TouchableOpacity
              style={[styles.controlButton, isMuted && styles.controlButtonActive]}
              onPress={() => setIsMuted((m) => !m)}
            >
              <Text style={styles.controlText}>
                {isMuted ? (isBangla ? 'আনমিউট' : 'Unmute') : isBangla ? 'মিউট' : 'Mute'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.controlButton, isSpeakerOn && styles.controlButtonActive]}
              onPress={() => setIsSpeakerOn((s) => !s)}
            >
              <Text style={styles.controlText}>
                {isSpeakerOn
                  ? isBangla
                    ? 'স্পিকার'
                    : 'Speaker'
                  : isBangla
                    ? 'ইয়ারপিস'
                    : 'Earpiece'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.endButton} onPress={handleEndCall}>
              <Text style={styles.endButtonText}>
                {isBangla ? 'কল শেষ করুন' : 'End Call'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 20,
    justifyContent: 'space-between',
  },
  header: {
    paddingTop: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 14,
    color: '#475569',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#d1fae5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 36,
  },
  vetName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
    textAlign: 'center',
  },
  clinicName: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
    textAlign: 'center',
  },
  petName: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
  },
  statusBadge: {
    marginTop: 14,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#ecfdf5',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#047857',
  },
  timer: {
    fontSize: 34,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 16,
  },
  roomText: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 8,
  },
  controls: {
    paddingBottom: 20,
  },
  startButton: {
    backgroundColor: '#2F7B53',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  activeControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  controlButton: {
    flex: 1,
    backgroundColor: '#e2e8f0',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  controlButtonActive: {
    backgroundColor: '#cbd5e1',
  },
  controlText: {
    color: '#0f172a',
    fontWeight: '600',
    fontSize: 14,
  },
  endButton: {
    flex: 1,
    backgroundColor: '#dc2626',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  endButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
});
