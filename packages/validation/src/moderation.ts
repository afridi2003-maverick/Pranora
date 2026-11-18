import { z } from 'zod';

export const reportTargetSchema = z.enum([
  'adoption_listing',
  'animal_report',
  'review',
  'provider',
  'user',
]);

export const moderationReasonSchema = z.enum([
  'fake',
  'spam',
  'abusive',
  'scam',
  'animal_cruelty',
  'inaccurate_info',
  'duplicate',
  'other',
]);

export const moderationStatusSchema = z.enum(['open', 'actioned', 'dismissed']);

export const moderationActionSchema = z.enum([
  'none',
  'removed',
  'hidden',
  'user_blocked',
  'clinic_updated',
  'warning_issued',
  'dismissed',
]);

export const submitContentReportSchema = z.object({
  targetType: reportTargetSchema,
  targetId: z.string().uuid({ message: 'Target ID must be a valid UUID' }),
  reason: moderationReasonSchema,
  details: z.string().trim().max(1000).optional(),
  evidenceUrls: z.array(z.string().url()).max(5).default([]),
});

export const moderateContentSchema = z.object({
  reportId: z.string().uuid({ message: 'Report ID must be a valid UUID' }),
  action: moderationActionSchema,
  notes: z.string().trim().max(1000).optional(),
  blockUser: z.boolean().default(false),
});

export type SubmitContentReportInput = z.infer<typeof submitContentReportSchema>;
export type ModerateContentInput = z.infer<typeof moderateContentSchema>;
