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

// ============================================================
// REV-1: Reviews & Ratings Validation Schemas (Zimia)
// ============================================================

export const createReviewSchema = z.object({
  bookingId: z.string().uuid({ message: 'Valid booking ID is required' }),
  providerId: z.string().uuid({ message: 'Valid provider ID is required' }),
  vetId: z.string().uuid().optional().nullable(),
  rating: z.number().int().min(1, 'Rating must be at least 1 star').max(5, 'Rating cannot exceed 5 stars'),
  comment: z
    .string()
    .trim()
    .min(3, 'Review comment must be at least 3 characters')
    .max(1000, 'Review comment cannot exceed 1000 characters')
    .optional(),
});
export type CreateReviewInput = z.infer<typeof createReviewSchema>;

export const reviewItemSchema = z.object({
  id: z.string().uuid(),
  bookingId: z.string().uuid(),
  authorId: z.string().uuid(),
  authorName: z.string(),
  authorAvatar: z.string().url().nullable().optional(),
  providerId: z.string().uuid(),
  vetId: z.string().uuid().nullable().optional(),
  vetName: z.string().nullable().optional(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().nullable().optional(),
  isVerifiedVisit: z.boolean().default(true),
  createdAt: z.string(),
});
export type ReviewItem = z.infer<typeof reviewItemSchema>;

export const reviewSummarySchema = z.object({
  ratingAvg: z.number().min(0).max(5),
  ratingCount: z.number().int().min(0),
  breakdown: z.object({
    5: z.number().int().min(0),
    4: z.number().int().min(0),
    3: z.number().int().min(0),
    2: z.number().int().min(0),
    1: z.number().int().min(0),
  }),
});
export type ReviewSummary = z.infer<typeof reviewSummarySchema>;

