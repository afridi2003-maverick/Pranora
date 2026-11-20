import { z } from 'zod';

// ── HLT-6: SMS Reminder Validation Schemas ───────────────────────────────────

export const SmsReminderTypeSchema = z.enum(['vaccine', 'appointment']);
export type SmsReminderType = z.infer<typeof SmsReminderTypeSchema>;

export const SendSmsReminderSchema = z.object({
  phone: z.string().min(10, 'notifications:validation.invalid_phone'),
  type: SmsReminderTypeSchema,
  message: z.string().min(1).max(500).optional(),
  title: z.string().optional(),
  petName: z.string().optional(),
  bookingCode: z.string().optional(),
  clinicName: z.string().optional(),
  dateTime: z.string().optional(),
  locale: z.enum(['bn', 'en']).default('bn'),
});
export type SendSmsReminderInput = z.infer<typeof SendSmsReminderSchema>;

export const SmsOptInSchema = z.object({
  sms_opt_in: z.boolean(),
});
export type SmsOptInInput = z.infer<typeof SmsOptInSchema>;
