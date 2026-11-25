'use client';

import React, { useEffect, useState } from 'react';
import { useLocale } from '@pranora/i18n';
import { Button, Card, Chip } from '@pranora/ui';
import {
  initiateCall,
  endCall,
  createSupabaseClient,
  type CallSession,
} from '@pranora/api';

interface AudioCallRoomProps {
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

export function AudioCallRoom({
  bookingId = '550e8400-e29b-41d4-a716-446655440001',
  vetName = 'ডাঃ সুমাইয়া আক্তার (Dr. Sumaiya Akter)',
  clinicName = 'PranoraCare Veterinary Clinic, Dhanmondi',
  petName = 'মতি (Moti)',
}: AudioCallRoomProps) {
  const { locale } = useLocale();
  const isBangla = locale === 'bn';

  const [session, setSession] = useState<CallSession | null>(null);
  const [callState, setCallState] = useState<'idle' | 'calling' | 'active' | 'ended'>('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (callState !== 'active') return;
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [callState]);

  const handleStartCall = async () => {
    setErrorMessage(null);
    setCallState('calling');
    setElapsedSeconds(0);
    try {
      const supabase = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder'
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
      setErrorMessage(
        isBangla
          ? 'সংযোগ করা যায়নি। আবার চেষ্টা করুন।'
          : 'Could not connect. Please try again.'
      );
      setCallState('idle');
    }
  };

  const handleEndCall = async () => {
    if (session) {
      try {
        const supabase = createSupabaseClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co',
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder'
        );
        await endCall(supabase, {
          call_session_id: session.id,
          duration_seconds: elapsedSeconds,
        });
      } catch {
        // Ignore network errors on teardown
      }
    }
    setCallState('ended');
  };

  const statusLabel =
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
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {isBangla ? 'অডিও কল' : 'Audio Call'}
          </h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            {isBangla
              ? 'আপনার পশু চিকিৎসকের সাথে ভয়েস পরামর্শ'
              : 'Voice consultation with your vet'}
          </p>
        </div>
        <Chip
          variant="status"
          statusType={callState === 'active' ? 'confirmed' : callState === 'calling' ? 'pending' : 'neutral'}
          label={statusLabel}
        />
      </div>

      {errorMessage && (
        <Card className="p-4 border-red-300 bg-red-50 dark:bg-red-950/30">
          <p className="text-sm text-red-700 dark:text-red-300">{errorMessage}</p>
        </Card>
      )}

      <Card className="p-6 sm:p-8 flex flex-col items-center text-center space-y-6">
        <div className="w-24 h-24 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-3xl font-bold text-emerald-700 dark:text-emerald-300">
          🩺
        </div>

        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-foreground">{vetName}</h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">{clinicName}</p>
          <p className="text-xs text-neutral-500">
            {isBangla ? `পোষ্য: ${petName}` : `Pet: ${petName}`}
          </p>
        </div>

        <div className="text-3xl font-mono font-semibold tracking-wider text-foreground">
          {formatDuration(elapsedSeconds)}
        </div>

        {session && (
          <p className="text-xs text-neutral-500">
            {isBangla ? `রুম: ${session.roomName}` : `Room: ${session.roomName}`}
          </p>
        )}

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {callState === 'idle' || callState === 'ended' ? (
            <Button variant="primary" onClick={handleStartCall}>
              {isBangla ? 'অডিও কল শুরু করুন' : 'Start Audio Call'}
            </Button>
          ) : (
            <>
              <Button
                variant={isMuted ? 'secondary' : 'ghost'}
                onClick={() => setIsMuted((m) => !m)}
              >
                {isMuted
                  ? isBangla
                    ? 'আনমিউট'
                    : 'Unmute'
                  : isBangla
                    ? 'মিউট'
                    : 'Mute'}
              </Button>
              <Button
                variant={isSpeakerOn ? 'secondary' : 'ghost'}
                onClick={() => setIsSpeakerOn((s) => !s)}
              >
                {isSpeakerOn
                  ? isBangla
                    ? 'স্পিকার'
                    : 'Speaker'
                  : isBangla
                    ? 'ইয়ারপিস'
                    : 'Earpiece'}
              </Button>
              <Button variant="danger" onClick={handleEndCall}>
                {isBangla ? 'কল শেষ করুন' : 'End Call'}
              </Button>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
