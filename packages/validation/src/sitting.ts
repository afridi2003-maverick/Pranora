import { z } from 'zod';

export const SittingServiceTypeSchema = z.enum([
  'sitting_hourly',
  'dog_walking',
  'day_sitting',
  'overnight',
]);
export type SittingServiceType = z.infer<typeof SittingServiceTypeSchema>;

export const SittingPaymentMethodSchema = z.enum(['cash', 'bkash', 'nagad', 'card']);
export type SittingPaymentMethod = z.infer<typeof SittingPaymentMethodSchema>;

export const SittingBookingStatusSchema = z.enum([
  'pending',
  'confirmed',
  'in_progress',
  'completed',
  'cancelled',
]);
export type SittingBookingStatus = z.infer<typeof SittingBookingStatusSchema>;

export const SitterProfileSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid().nullable().optional(),
  full_name_bn: z.string().min(1),
  full_name_en: z.string().min(1),
  bio_bn: z.string().min(1),
  bio_en: z.string().min(1),
  hourly_rate: z.number().int().positive(),
  daily_rate: z.number().int().positive(),
  experience_years: z.number().int().nonnegative(),
  service_types: z.array(SittingServiceTypeSchema),
  accepted_species: z.array(z.string()),
  areas: z.array(z.string()),
  district: z.string(),
  rating: z.number().min(0).max(5),
  review_count: z.number().int().nonnegative(),
  phone: z.string(),
  is_verified: z.boolean(),
  created_at: z.string().optional(),
});
export type SitterProfile = z.infer<typeof SitterProfileSchema>;

export const CreateSittingBookingSchema = z.object({
  sitter_id: z.string().uuid(),
  pet_id: z.string().uuid().nullable().optional(),
  service_type: SittingServiceTypeSchema,
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD format required'),
  start_time: z.string().min(1, 'Start time is required'),
  duration_hours: z.number().int().min(1).max(72).default(2),
  payment_method: SittingPaymentMethodSchema.default('cash'),
  address: z.string().min(5, 'Detailed address is required'),
  notes: z.string().max(500).optional(),
});
export type CreateSittingBookingInput = z.infer<typeof CreateSittingBookingSchema>;

export const SittingBookingSchema = z.object({
  id: z.string().uuid(),
  sitter_id: z.string().uuid(),
  owner_id: z.string().uuid(),
  pet_id: z.string().uuid().nullable().optional(),
  service_type: SittingServiceTypeSchema,
  start_date: z.string(),
  start_time: z.string(),
  duration_hours: z.number().int(),
  total_price: z.number().int(),
  payment_method: SittingPaymentMethodSchema,
  payment_status: z.enum(['pending', 'paid', 'refunded']),
  address: z.string(),
  notes: z.string().nullable().optional(),
  status: SittingBookingStatusSchema,
  created_at: z.string(),
  sitter: SitterProfileSchema.optional(),
});
export type SittingBooking = z.infer<typeof SittingBookingSchema>;

export const SittingFilterSchema = z.object({
  service_type: SittingServiceTypeSchema.optional(),
  species: z.string().optional(),
  area: z.string().optional(),
  search: z.string().optional(),
});
export type SittingFilter = z.infer<typeof SittingFilterSchema>;
