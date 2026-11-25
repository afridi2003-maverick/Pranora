import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useLocale } from '@pranora/i18n';
import {
  initiateCall,
  endCall,
  createSupabaseClient,
  type CallSession,
} from '@pranora/api';

interface VideoCallScreenProps {
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

export function VideoCallScreen({
  bookingId = '550e8400-e29b-41d4-a716-446655440002',
  vetName = 'ডাঃ মাহবুব রহমান (Dr. Mahbub Rahman)',
  clinicName = 'PranoraCare Veterinary Clinic, Gulshan',
  petName = 'টমি (Tommy)',
}: VideoCallScreenProps) {
  const { locale } = useLocale();
  const isBangla = locale === 'bn';

  const [session, setSession] = useState<CallSession | null>(null);
  const [callState, setCallState] = useState<'idle' | 'calling' | 'active' | 'ended'>('idle');
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
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
        call_type: 'video',
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
            ? 'ভিডিও কলে আছেন'
            : 'In Video Call'
          : isBangla
            ? 'ভিডিও কল শেষ হয়েছে'
            : 'Video Call Ended';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{isBangla ? 'ভিডিও কল' : 'Video Call'}</Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{statusText}</Text>
        </View>
      </View>

      {/* Remote Video Stage */}
      <View style={styles.stage}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>🩺</Text>
        </View>
        <Text style={styles.vetName}>{vetName}</Text>
        <Text style={styles.clinicName}>{clinicName}</Text>
        <Text style={styles.petName}>
          {isBangla ? `পোষ্য: ${petName}` : `Pet: ${petName}`}
        </Text>
        <Text style={styles.timer}>{formatDuration(elapsedSeconds)}</Text>
        {session && (
          <Text style={styles.roomText}>
            {isBangla ? `রুম: ${session.roomName}` : `Room: ${session.roomName}`}
          </Text>
        )}

        {/* PiP Local Preview */}
        <View style={styles.pipPreview}>
          <Text style={styles.pipText}>
            {isCameraOff
              ? isBangla
                ? 'ক্যামেরা বন্ধ'
                : 'Cam Off'
              : facingMode === 'user'
                ? isBangla
                  ? '📷 সামনের'
                  : '📷 Front'
                : isBangla
                  ? '📷 পেছনের'
                  : '📷 Back'}
          </Text>
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        {callState === 'idle' || callState === 'ended' ? (
          <TouchableOpacity style={styles.startButton} onPress={handleStartCall}>
            <Text style={styles.startButtonText}>
              {isBangla ? 'ভিডিও কল শুরু করুন' : 'Start Video Call'}
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.activeControls}>
            <TouchableOpacity
              style={[styles.controlButton, isAudioMuted && styles.controlButtonActive]}
              onPress={() => setIsAudioMuted((m) => !m)}
            >
              <Text style={styles.controlText}>
                {isAudioMuted ? (isBangla ? 'আনমিউট' : 'Unmute') : isBangla ? 'মিউট' : 'Mute'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.controlButton, isCameraOff && styles.controlButtonActive]}
              onPress={() => setIsCameraOff((c) => !c)}
            >
              <Text style={styles.controlText}>
                {isCameraOff ? (isBangla ? 'ক্যাম অন' : 'Cam On') : isBangla ? 'ক্যাম অফ' : 'Cam Off'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.controlButton}
              onPress={() =>
                setFacingMode((f) => (f === 'user' ? 'environment' : 'user'))
              }
            >
              <Text style={styles.controlText}>{isBangla ? 'ফ্লিপ' : 'Flip'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.endButton} onPress={handleEndCall}>
              <Text style={styles.endButtonText}>{isBangla ? 'শেষ' : 'End'}</Text>
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
    backgroundColor: '#0f172a',
    padding: 16,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#065f46',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#d1fae5',
  },
  stage: {
    flex: 1,
    marginVertical: 16,
    borderRadius: 16,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    position: 'relative',
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#064e3b',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  avatarText: {
    fontSize: 34,
  },
  vetName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
  },
  clinicName: {
    fontSize: 13,
    color: '#cbd5e1',
    marginTop: 4,
    textAlign: 'center',
  },
  petName: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
  },
  timer: {
    fontSize: 30,
    fontWeight: '700',
    color: '#ffffff',
    marginTop: 14,
  },
  roomText: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 6,
  },
  pipPreview: {
    position: 'absolute',
    bottom: 14,
    right: 14,
    width: 96,
    height: 72,
    borderRadius: 10,
    backgroundColor: '#334155',
    borderWidth: 1,
    borderColor: '#475569',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pipText: {
    fontSize: 11,
    color: '#e2e8f0',
    fontWeight: '500',
  },
  controls: {
    paddingBottom: 16,
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
    gap: 8,
  },
  controlButton: {
    flex: 1,
    backgroundColor: '#334155',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  controlButtonActive: {
    backgroundColor: '#475569',
  },
  controlText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 13,
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
    fontSize: 13,
  },
});
