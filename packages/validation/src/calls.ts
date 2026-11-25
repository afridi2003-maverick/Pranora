import { z } from 'zod';

// ─── Enums ────────────────────────────────────────────────────────────────────

export const CallTypeSchema = z.enum(['audio', 'video']);
export type CallType = z.infer<typeof CallTypeSchema>;

export const CallStatusSchema = z.enum([
  'pending',
  'active',
  'ended',
  'missed',
  'declined',
]);
export type CallStatus = z.infer<typeof CallStatusSchema>;

// ─── Initiate Call ────────────────────────────────────────────────────────────

export const initiateCallSchema = z.object({
  booking_id: z.string().uuid('Valid booking ID required'),
  call_type: CallTypeSchema,
});
export type InitiateCallInput = z.infer<typeof initiateCallSchema>;

// ─── End Call ─────────────────────────────────────────────────────────────────

export const endCallSchema = z.object({
  call_session_id: z.string().uuid('Valid call session ID required'),
  duration_seconds: z.number().int().min(0).optional(),
});
export type EndCallInput = z.infer<typeof endCallSchema>;

// ─── Call History Filter ───────────────────────────────────────────────────────

export const callHistoryFilterSchema = z.object({
  call_type: CallTypeSchema.optional(),
  status: CallStatusSchema.optional(),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
});
export type CallHistoryFilter = z.infer<typeof callHistoryFilterSchema>;

// ─── Call Recording Consent ───────────────────────────────────────────────────

export const RecordingStatusSchema = z.enum([
  'off',
  'pending_consent',
  'recording',
  'stopped',
]);
export type RecordingStatus = z.infer<typeof RecordingStatusSchema>;

export const recordingConsentSchema = z.object({
  call_session_id: z.string().uuid(),
  consented: z.boolean(),
  role: z.enum(['owner', 'vet']).optional(),
});
export type RecordingConsentInput = z.infer<typeof recordingConsentSchema>;
