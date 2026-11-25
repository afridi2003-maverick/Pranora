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

interface VideoCallRoomProps {
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

export function VideoCallRoom({
  bookingId = '550e8400-e29b-41d4-a716-446655440002',
  vetName = 'ডাঃ মাহবুব রহমান (Dr. Mahbub Rahman)',
  clinicName = 'PranoraCare Veterinary Clinic, Gulshan',
  petName = 'টমি (Tommy)',
}: VideoCallRoomProps) {
  const { locale } = useLocale();
  const isBangla = locale === 'bn';

  const [session, setSession] = useState<CallSession | null>(null);
  const [callState, setCallState] = useState<'idle' | 'calling' | 'active' | 'ended'>('idle');
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
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
        call_type: 'video',
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
        // Ignore teardown errors
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
            ? 'ভিডিও কলে আছেন'
            : 'In Video Call'
          : isBangla
            ? 'ভিডিও কল শেষ হয়েছে'
            : 'Video Call Ended';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {isBangla ? 'ভিডিও কল' : 'Video Call'}
          </h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            {isBangla
              ? 'আপনার পশু চিকিৎসকের সাথে মুখোমুখি পরামর্শ'
              : 'Face-to-face consultation with your vet'}
          </p>
        </div>
        <Chip
          variant="status"
          statusType={
            callState === 'active'
              ? 'confirmed'
              : callState === 'calling'
                ? 'pending'
                : 'neutral'
          }
          label={statusLabel}
        />
      </div>

      {errorMessage && (
        <Card className="p-4 border-red-300 bg-red-50 dark:bg-red-950/30">
          <p className="text-sm text-red-700 dark:text-red-300">{errorMessage}</p>
        </Card>
      )}

      <Card className="overflow-hidden">
        {/* Remote + Local Video Stage */}
        <div className="relative bg-neutral-900 text-white aspect-video flex flex-col items-center justify-center p-6">
          <div className="text-center space-y-2">
            <div className="w-20 h-20 mx-auto rounded-full bg-emerald-800/70 flex items-center justify-center text-3xl">
              🩺
            </div>
            <h2 className="text-lg font-semibold">{vetName}</h2>
            <p className="text-xs text-neutral-300">{clinicName}</p>
            <p className="text-xs text-neutral-400">
              {isBangla ? `পোষ্য: ${petName}` : `Pet: ${petName}`}
            </p>
            <div className="text-2xl font-mono font-semibold pt-2">
              {formatDuration(elapsedSeconds)}
            </div>
            {session && (
              <p className="text-xs text-neutral-400">
                {isBangla ? `রুম: ${session.roomName}` : `Room: ${session.roomName}`}
              </p>
            )}
          </div>

          {/* Picture-in-Picture Local Camera Preview */}
          <div className="absolute bottom-4 right-4 w-32 h-24 rounded-lg bg-neutral-800 border border-neutral-700 flex flex-col items-center justify-center text-xs text-neutral-300 p-2">
            {isCameraOff ? (
              <span>{isBangla ? 'ক্যামেরা বন্ধ' : 'Camera Off'}</span>
            ) : (
              <>
                <span className="text-lg">📷</span>
                <span className="mt-1">
                  {facingMode === 'user'
                    ? isBangla
                      ? 'সামনের ক্যামেরা'
                      : 'Front Cam'
                    : isBangla
                      ? 'পেছনের ক্যামেরা'
                      : 'Back Cam'}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Call Controls */}
        <div className="p-5 flex flex-wrap items-center justify-center gap-3 bg-white dark:bg-neutral-950">
          {callState === 'idle' || callState === 'ended' ? (
            <Button variant="primary" onClick={handleStartCall}>
              {isBangla ? 'ভিডিও কল শুরু করুন' : 'Start Video Call'}
            </Button>
          ) : (
            <>
              <Button
                variant={isAudioMuted ? 'secondary' : 'ghost'}
                onClick={() => setIsAudioMuted((m) => !m)}
              >
                {isAudioMuted
                  ? isBangla
                    ? 'অডিও আনমিউট'
                    : 'Unmute Audio'
                  : isBangla
                    ? 'অডিও মিউট'
                    : 'Mute Audio'}
              </Button>
              <Button
                variant={isCameraOff ? 'secondary' : 'ghost'}
                onClick={() => setIsCameraOff((c) => !c)}
              >
                {isCameraOff
                  ? isBangla
                    ? 'ক্যামেরা চালু'
                    : 'Turn On Camera'
                  : isBangla
                    ? 'ক্যামেরা বন্ধ'
                    : 'Turn Off Camera'}
              </Button>
              <Button
                variant="ghost"
                onClick={() =>
                  setFacingMode((f) => (f === 'user' ? 'environment' : 'user'))
                }
              >
                {isBangla ? 'ক্যামেরা ফ্লিপ' : 'Flip Camera'}
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
