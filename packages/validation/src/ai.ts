import { z } from 'zod';

// ── AI Assistant Validation Schemas (§4.13) ──────────────────────────────────

export const AIMessageRoleSchema = z.enum(['user', 'assistant', 'tool']);
export type AIMessageRole = z.infer<typeof AIMessageRoleSchema>;

export const ProposedBookingSchema = z.object({
  clinic_id: z.string().uuid().optional().nullable(),
  clinic_name: z.string().optional().nullable(),
  service_id: z.string().uuid().optional().nullable(),
  service_name: z.string().optional().nullable(),
  suggested_date: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});
export type ProposedBooking = z.infer<typeof ProposedBookingSchema>;

export const AIConversationSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  pet_id: z.string().uuid().optional().nullable(),
  share_pet_context: z.boolean().default(false),
  locale: z.enum(['bn', 'en']).default('bn'),
  created_at: z.string().optional(),
});
export type AIConversation = z.infer<typeof AIConversationSchema>;

export const CreateAIConversationSchema = z.object({
  pet_id: z.string().uuid().optional().nullable(),
  share_pet_context: z.boolean().default(false),
  locale: z.enum(['bn', 'en']).default('bn'),
});
export type CreateAIConversationInput = z.infer<typeof CreateAIConversationSchema>;

export const AIMessageSchema = z.object({
  id: z.string().uuid(),
  conversation_id: z.string().uuid(),
  role: AIMessageRoleSchema,
  content: z.string().min(1),
  is_voice: z.boolean().default(false),
  emergency_flag: z.boolean().default(false),
  handoff_flag: z.boolean().default(false),
  proposed_booking: ProposedBookingSchema.optional().nullable(),
  created_at: z.string().optional(),
});
export type AIMessage = z.infer<typeof AIMessageSchema>;

export const SendAIMessageSchema = z.object({
  conversation_id: z.string().uuid(),
  content: z.string().min(1, 'ai:placeholder'),
  is_voice: z.boolean().default(false),
});
export type SendAIMessageInput = z.infer<typeof SendAIMessageSchema>;

// Guardrail results
export const GuardrailActionSchema = z.enum(['allow', 'emergency', 'block_diagnosis_medicine', 'handoff']);
export type GuardrailAction = z.infer<typeof GuardrailActionSchema>;

export const GuardrailCheckResultSchema = z.object({
  action: GuardrailActionSchema,
  emergency: z.boolean(),
  handoff: z.boolean(),
  reason: z.string().optional(),
  safeResponse: z.string().optional(),
});
export type GuardrailCheckResult = z.infer<typeof GuardrailCheckResultSchema>;
