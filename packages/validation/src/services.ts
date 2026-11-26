import { z } from 'zod';

export const ServiceSlugSchema = z.enum([
  // MVP slugs
  'clinic_visit',
  'vaccine_clinic',
  'emergency_care',
  'rescue_report',
  'shelter_intake',
  'adopt_pet',
  'list_for_adoption',
  // P1 slugs
  'grooming_session',
  'boarding_stay',
  'home_vet_visit',
  'online_consult',
  // P3 slugs
  'pet_shop',
  'training_class',
  'pet_sitting',
  'pet_taxi',
]);

export type ServiceSlug = z.infer<typeof ServiceSlugSchema>;

export const CategorySlugSchema = z.enum([
  'vet',
  'vaccination',
  'emergency',
  'rescue',
  'adoption',
  'grooming',
  'boarding',
  'home_visit',
  'online_consult',
  'pet_shop',
  'training',
  'sitting',
  'taxi',
]);

export type CategorySlug = z.infer<typeof CategorySlugSchema>;

// ─── SVC-ONL: Online Consultation ─────────────────────────────────────────────

export const OnlineConsultModeSchema = z.enum(['audio', 'video']);
export type OnlineConsultMode = z.infer<typeof OnlineConsultModeSchema>;

export const OnlineConsultStatusSchema = z.enum([
  'pending_payment',
  'confirmed',
  'in_call',
  'completed',
  'cancelled',
]);
export type OnlineConsultStatus = z.infer<typeof OnlineConsultStatusSchema>;

export const createOnlineConsultSchema = z.object({
  vetId: z.string().uuid('Valid vet ID required'),
  petId: z.string().uuid('Valid pet ID required'),
  callMode: OnlineConsultModeSchema.default('video'),
  chiefComplaint: z.string().min(5, 'Please describe the pet symptoms').max(1000),
  scheduledAt: z.string().datetime(),
  feeBdt: z.number().int().min(0),
});
export type CreateOnlineConsultInput = z.infer<typeof createOnlineConsultSchema>;
