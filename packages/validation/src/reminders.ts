import { z } from 'zod';

// ── HLT-2: Reminder Validation Schemas ───────────────────────────────────────

export const ReminderTypeSchema = z.enum([
  'vaccine',
  'deworming',
  'flea_tick',
  'medicine',
  'grooming',
  'checkup',
  'custom',
]);
export type ReminderTypeValue = z.infer<typeof ReminderTypeSchema>;

export const CreateReminderSchema = z.object({
  pet_id:         z.string().uuid('health:validation.invalid_pet'),
  type:           ReminderTypeSchema,
  title:          z.string().min(1, 'health:validation.title_required').max(200),
  remind_at:      z.string().datetime({ message: 'health:validation.invalid_datetime' }),
  repeat_days:    z.number().int().positive().max(365).optional().nullable(),
  vaccination_id: z.string().uuid().optional().nullable(),
});
export type CreateReminderInput = z.infer<typeof CreateReminderSchema>;

export const UpdateReminderSchema = z.object({
  title:       z.string().min(1).max(200).optional(),
  remind_at:   z.string().datetime().optional(),
  repeat_days: z.number().int().positive().max(365).nullable().optional(),
  type:        ReminderTypeSchema.optional(),
});
export type UpdateReminderInput = z.infer<typeof UpdateReminderSchema>;
