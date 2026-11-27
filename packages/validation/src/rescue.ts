import { z } from 'zod';
import { bdPhoneRegex } from './common';
import { SpeciesSchema } from './pets';

// ── Enums ───────────────────────────────────────────────────────────────────

export const AnimalReportKindSchema = z.enum([
  'injured',
  'lost',
  'found',
  'abandoned',
]);
export type AnimalReportKind = z.infer<typeof AnimalReportKindSchema>;

export const UrgencyLevelSchema = z.enum([
  'low',
  'medium',
  'high',
  'critical',
]);
export type UrgencyLevel = z.infer<typeof UrgencyLevelSchema>;

export const RescueStatusSchema = z.enum([
  'submitted',
  'under_review',
  'assigned',
  'rescue_in_progress',
  'closed',
  'rejected',
  'duplicate',
]);
export type RescueStatus = z.infer<typeof RescueStatusSchema>;

export const AssignmentStatusSchema = z.enum([
  'offered',
  'accepted',
  'declined',
  'withdrawn',
]);
export type AssignmentStatus = z.infer<typeof AssignmentStatusSchema>;

export const RescueOutcomeSchema = z.enum([
  'treated',
  'sent_to_shelter',
  'adopted',
  'returned_to_owner',
  'released',
  'died',
  'not_found',
  'other',
]);
export type RescueOutcome = z.infer<typeof RescueOutcomeSchema>;

// ── Schemas ─────────────────────────────────────────────────────────────────

export const CreateAnimalReportSchema = z.object({
  kind: AnimalReportKindSchema,
  pet_id: z.string().uuid().nullable().optional(),
  species: SpeciesSchema.default('other'),
  urgency: UrgencyLevelSchema.default('medium'),
  last_seen_at: z.string().datetime().nullable().optional(),
  contact_phone: z
    .string()
    .regex(bdPhoneRegex, 'rescue:validation.invalid_phone')
    .nullable()
    .optional(),
  description: z.string().max(1000).nullable().optional(),
  photos: z.array(z.string().url()).max(6).default([]),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  area_text: z.string().max(200).nullable().optional(),
  upazila_id: z.number().int().positive().nullable().optional(),
  district_id: z.number().int().positive().nullable().optional(),
});
export type CreateAnimalReportInput = z.infer<typeof CreateAnimalReportSchema>;

export const ReviewAnimalReportSchema = z.object({
  report_id: z.string().uuid(),
  accept: z.boolean(),
  shelter_id: z.string().uuid().nullable().optional(),
});
export type ReviewAnimalReportInput = z.infer<typeof ReviewAnimalReportSchema>;

export const AssignRescuerSchema = z.object({
  case_id: z.string().uuid(),
  rescuer_id: z.string().uuid(),
});
export type AssignRescuerInput = z.infer<typeof AssignRescuerSchema>;

export const RespondToAssignmentSchema = z.object({
  assignment_id: z.string().uuid(),
  accept: z.boolean(),
  decline_reason: z.string().max(500).nullable().optional(),
});
export type RespondToAssignmentInput = z.infer<typeof RespondToAssignmentSchema>;

export const CloseRescueCaseSchema = z.object({
  case_id: z.string().uuid(),
  outcome: RescueOutcomeSchema,
  note: z.string().max(1000).nullable().optional(),
  pet_id: z.string().uuid().nullable().optional(),
});
export type CloseRescueCaseInput = z.infer<typeof CloseRescueCaseSchema>;

export const MergeAnimalReportsSchema = z.object({
  duplicate_id: z.string().uuid(),
  target_id: z.string().uuid(),
});
export type MergeAnimalReportsInput = z.infer<typeof MergeAnimalReportsSchema>;

export const FindDuplicateReportsSchema = z.object({
  report_id: z.string().uuid(),
  radius_meters: z.number().int().min(100).max(10000).default(1500),
});
export type FindDuplicateReportsInput = z.infer<typeof FindDuplicateReportsSchema>;

export const AddCaseUpdateSchema = z.object({
  case_id: z.string().uuid(),
  status: RescueStatusSchema.nullable().optional(),
  note: z.string().max(1000).nullable().optional(),
  photos: z.array(z.string().url()).max(6).default([]),
});
export type AddCaseUpdateInput = z.infer<typeof AddCaseUpdateSchema>;

export const FindNearbyRescuersSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  radius_m: z.number().int().min(100).max(100000).optional(),
  species: SpeciesSchema.optional(),
});
export type FindNearbyRescuersInput = z.infer<typeof FindNearbyRescuersSchema>;

export const NearbyRescuerItemSchema = z.object({
  rescuer_id: z.string().uuid(),
  distance_meters: z.number(),
  radius_km: z.number(),
  is_available: z.boolean(),
  species: z.array(SpeciesSchema),
  display_name: z.string().nullable().optional(),
  avatar_url: z.string().nullable().optional(),
  active_cases_count: z.number().int(),
});
export type NearbyRescuerItem = z.infer<typeof NearbyRescuerItemSchema>;

export const UpsertRescuerProfileSchema = z.object({
  user_id: z.string().uuid(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  district_id: z.number().int().positive().optional(),
  radius_km: z.number().min(0.5).max(100).default(5),
  species: z.array(SpeciesSchema).min(1).default(['dog', 'cat']),
  is_available: z.boolean().default(true),
});
export type UpsertRescuerProfileInput = z.infer<typeof UpsertRescuerProfileSchema>;
