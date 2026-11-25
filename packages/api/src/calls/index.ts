export type {
  CallType,
  CallStatus,
  InitiateCallInput,
  EndCallInput,
  CallHistoryFilter,
  RecordingConsentInput,
  RecordingStatus,
} from '@pranora/validation';
export { CallTypeSchema, CallStatusSchema, RecordingStatusSchema } from '@pranora/validation';

import type {
  CallType,
  CallStatus,
  InitiateCallInput,
  EndCallInput,
  CallHistoryFilter,
  RecordingConsentInput,
  RecordingStatus,
} from '@pranora/validation';
import type { TypedSupabaseClient } from '../client';

// ─── Shapes ───────────────────────────────────────────────────────────────────

export interface CallParticipant {
  userId: string;
  displayName: string;
  avatarUrl?: string;
  role: 'owner' | 'vet';
}

export interface CallSession {
  id: string;
  bookingId: string;
  callType: CallType;
  status: CallStatus;
  roomName: string;
  token: string; // short-lived join token (from RPC)
  initiatedByUserId: string;
  participants: CallParticipant[];
  startedAt?: string;
  endedAt?: string;
  durationSeconds?: number;
  createdAt: string;
}

export interface CallHistoryItem {
  id: string;
  bookingId: string;
  callType: CallType;
  status: CallStatus;
  roomName: string;
  otherParticipantName: string;
  otherParticipantAvatarUrl?: string;
  durationSeconds?: number;
  startedAt?: string;
  createdAt: string;
}

// ─── Mock helper ──────────────────────────────────────────────────────────────

function makeRoomName(bookingId: string, callType: CallType): string {
  return `pranora-${callType}-${bookingId.slice(0, 8)}`;
}

// ─── Initiate Call ────────────────────────────────────────────────────────────

export async function initiateCall(
  _client: TypedSupabaseClient,
  input: InitiateCallInput
): Promise<CallSession> {
  // In production this would call an RPC that creates a call_sessions row
  // and returns a WebRTC / Daily.co / ZEGOCLOUD room token.
  return {
    id: `cs-${Date.now()}`,
    bookingId: input.booking_id,
    callType: input.call_type,
    status: 'pending',
    roomName: makeRoomName(input.booking_id, input.call_type),
    token: `tok-${Date.now()}`,
    initiatedByUserId: 'current-user',
    participants: [],
    createdAt: new Date().toISOString(),
  };
}

// ─── End Call ─────────────────────────────────────────────────────────────────

export async function endCall(
  _client: TypedSupabaseClient,
  input: EndCallInput
): Promise<void> {
  // RPC: end_call_session(call_session_id, duration_seconds)
  void input;
}

// ─── Get Call Session ─────────────────────────────────────────────────────────

export async function getCallSession(
  _client: TypedSupabaseClient,
  callSessionId: string
): Promise<CallSession> {
  return {
    id: callSessionId,
    bookingId: 'booking-123',
    callType: 'audio',
    status: 'active',
    roomName: 'pranora-audio-booking1',
    token: 'tok-mock',
    initiatedByUserId: 'owner-user',
    participants: [
      {
        userId: 'owner-user',
        displayName: 'Pet Owner',
        role: 'owner',
      },
      {
        userId: 'vet-user',
        displayName: 'Dr. Sumaiya',
        role: 'vet',
      },
    ],
    startedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };
}

// ─── Get Call History ─────────────────────────────────────────────────────────

export async function getCallHistory(
  _client: TypedSupabaseClient,
  filter: CallHistoryFilter
): Promise<CallHistoryItem[]> {
  const items: CallHistoryItem[] = [
    {
      id: 'ch-001',
      bookingId: 'booking-001',
      callType: 'audio',
      status: 'ended',
      roomName: 'pranora-audio-booking001',
      otherParticipantName: 'Dr. Sumaiya Akter',
      durationSeconds: 480,
      startedAt: new Date(Date.now() - 86400000).toISOString(),
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 'ch-002',
      bookingId: 'booking-002',
      callType: 'video',
      status: 'ended',
      roomName: 'pranora-video-booking002',
      otherParticipantName: 'Dr. Mahbub Rahman',
      durationSeconds: 1200,
      startedAt: new Date(Date.now() - 172800000).toISOString(),
      createdAt: new Date(Date.now() - 172800000).toISOString(),
    },
    {
      id: 'ch-003',
      bookingId: 'booking-003',
      callType: 'audio',
      status: 'missed',
      roomName: 'pranora-audio-booking003',
      otherParticipantName: 'Dr. Nasrin Sultana',
      createdAt: new Date(Date.now() - 259200000).toISOString(),
    },
  ];

  return items.filter((item) => {
    if (filter.call_type && item.callType !== filter.call_type) return false;
    if (filter.status && item.status !== filter.status) return false;
    return true;
  });
}

// ─── Call Recording Mutual Consent (CALL-4) ───────────────────────────────────

export interface RecordingConsentState {
  callSessionId: string;
  ownerConsented: boolean;
  vetConsented: boolean;
  recordingStatus: RecordingStatus;
  recordingUrl?: string;
}

export async function getRecordingConsentState(
  _client: TypedSupabaseClient,
  callSessionId: string
): Promise<RecordingConsentState> {
  return {
    callSessionId,
    ownerConsented: false,
    vetConsented: true,
    recordingStatus: 'pending_consent',
  };
}

export async function setRecordingConsent(
  _client: TypedSupabaseClient,
  input: RecordingConsentInput,
  currentState?: { ownerConsented: boolean; vetConsented: boolean }
): Promise<RecordingConsentState> {
  const role = input.role ?? 'owner';
  const ownerConsented =
    role === 'owner' ? input.consented : (currentState?.ownerConsented ?? false);
  const vetConsented =
    role === 'vet' ? input.consented : (currentState?.vetConsented ?? true);

  let recordingStatus: RecordingStatus = 'off';
  if (ownerConsented && vetConsented) {
    recordingStatus = 'recording';
  } else if (ownerConsented || vetConsented) {
    recordingStatus = 'pending_consent';
  }

  return {
    callSessionId: input.call_session_id,
    ownerConsented,
    vetConsented,
    recordingStatus,
  };
}
