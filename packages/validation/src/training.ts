import { z } from 'zod';

export const TrainingPackageTypeSchema = z.enum([
  'obedience',
  'puppy_socialization',
  'behavior_correction',
  'agility',
]);
export type TrainingPackageType = z.infer<typeof TrainingPackageTypeSchema>;

export const TrainingBookingModeSchema = z.enum(['single_session', 'package']);
export type TrainingBookingMode = z.infer<typeof TrainingBookingModeSchema>;

export const TrainingFormatSchema = z.enum(['home_visit', 'center']);
export type TrainingFormat = z.infer<typeof TrainingFormatSchema>;

export const TrainingPaymentMethodSchema = z.enum([
  'cash',
  'bkash',
  'nagad',
  'rocket',
  'card',
]);
export type TrainingPaymentMethod = z.infer<typeof TrainingPaymentMethodSchema>;

export const TrainingBookingStatusSchema = z.enum([
  'pending',
  'confirmed',
  'in_progress',
  'completed',
  'cancelled',
]);
export type TrainingBookingStatus = z.infer<typeof TrainingBookingStatusSchema>;

export const TrainerProfileSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid().nullable().optional(),
  full_name_bn: z.string().min(1),
  full_name_en: z.string().min(1),
  bio_bn: z.string().min(1),
  bio_en: z.string().min(1),
  certifications: z.array(z.string()),
  specialties: z.array(TrainingPackageTypeSchema),
  session_rate: z.number().int().positive(),
  package_rate: z.number().int().positive(),
  experience_years: z.number().int().nonnegative(),
  accepted_species: z.array(z.string()),
  areas: z.array(z.string()),
  district: z.string(),
  rating: z.number().min(0).max(5),
  review_count: z.number().int().nonnegative(),
  phone: z.string(),
  is_verified: z.boolean(),
  created_at: z.string().optional(),
});
export type TrainerProfile = z.infer<typeof TrainerProfileSchema>;

export const TrainingPackageSchema = z.object({
  id: z.string().uuid(),
  slug: TrainingPackageTypeSchema,
  title_bn: z.string(),
  title_en: z.string(),
  description_bn: z.string(),
  description_en: z.string(),
  sessions_count: z.number().int().positive(),
  duration_minutes: z.number().int().positive(),
  base_price: z.number().int().positive(),
  target_species: z.array(z.string()),
});
export type TrainingPackage = z.infer<typeof TrainingPackageSchema>;

export const CreateTrainingBookingSchema = z.object({
  trainer_id: z.string().uuid(),
  pet_id: z.string().uuid().nullable().optional(),
  package_type: TrainingPackageTypeSchema,
  booking_mode: TrainingBookingModeSchema.default('package'),
  training_format: TrainingFormatSchema.default('home_visit'),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD format required'),
  preferred_time: z.string().min(1, 'Preferred time is required'),
  payment_method: TrainingPaymentMethodSchema.default('cash'),
  address: z.string().min(5, 'Detailed address is required'),
  pet_behavior_notes: z.string().max(500).optional(),
});
export type CreateTrainingBookingInput = z.infer<typeof CreateTrainingBookingSchema>;

export const TrainingBookingSchema = z.object({
  id: z.string().uuid(),
  trainer_id: z.string().uuid(),
  owner_id: z.string().uuid(),
  pet_id: z.string().uuid().nullable().optional(),
  package_type: TrainingPackageTypeSchema,
  booking_mode: TrainingBookingModeSchema,
  training_format: TrainingFormatSchema,
  start_date: z.string(),
  preferred_time: z.string(),
  sessions_total: z.number().int(),
  sessions_completed: z.number().int(),
  total_price: z.number().int(),
  payment_method: TrainingPaymentMethodSchema,
  payment_status: z.enum(['pending', 'paid', 'refunded']),
  address: z.string(),
  pet_behavior_notes: z.string().nullable().optional(),
  status: TrainingBookingStatusSchema,
  created_at: z.string(),
  trainer: TrainerProfileSchema.optional(),
});
export type TrainingBooking = z.infer<typeof TrainingBookingSchema>;

export const TrainingFilterSchema = z.object({
  specialty: TrainingPackageTypeSchema.optional(),
  species: z.string().optional(),
  area: z.string().optional(),
  search: z.string().optional(),
});
export type TrainingFilter = z.infer<typeof TrainingFilterSchema>;
