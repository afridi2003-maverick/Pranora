// packages/validation/src/reviews.ts
// Owner: Afridi | Task: REV-2 (Shared report flow – reviews, wrong clinic info)

import { z } from 'zod';

export const reviewReportReasonSchema = z.enum([
  'fake',
  'spam',
  'abusive',
  'scam',
  'inaccurate_info',
  'animal_cruelty',
  'duplicate',
  'other',
]);

export const reviewReportTargetSchema = z.enum([
  'review',
  'provider',
  'adoption_listing',
  'animal_report',
  'user',
]);

export const submitReviewReportSchema = z.object({
  targetType: reviewReportTargetSchema,
  targetId: z.string().uuid({ message: 'Target ID must be a valid UUID' }),
  reason: reviewReportReasonSchema,
  details: z
    .string()
    .trim()
    .max(1000, { message: 'Details must be under 1000 characters' })
    .optional(),
  evidenceUrls: z.array(z.string().url()).max(5).default([]),
});

export type SubmitReviewReportInput = z.infer<typeof submitReviewReportSchema>;
export type ReviewReportReason = z.infer<typeof reviewReportReasonSchema>;
export type ReviewReportTarget = z.infer<typeof reviewReportTargetSchema>;
