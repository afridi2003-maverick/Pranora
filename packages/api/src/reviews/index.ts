// packages/api/src/reviews/index.ts
// Owner: Afridi | Task: REV-2 (Shared report flow – reviews, wrong clinic info)
// Sprint: S6 | Depends on: ADM-2 ✅

import type { TypedSupabaseClient } from '../client';
import type { ReportTarget } from '@pranora/types';

export type ReviewReportReason =
  | 'fake'
  | 'spam'
  | 'abusive'
  | 'scam'
  | 'inaccurate_info'
  | 'animal_cruelty'
  | 'duplicate'
  | 'other';

export interface SubmitReviewReportParams {
  targetType: ReportTarget;
  targetId: string;
  reason: ReviewReportReason;
  details?: string;
  evidenceUrls?: string[];
}

export interface ReviewReportResult {
  reportId: string;
  targetType: ReportTarget;
  status: 'submitted';
}

/**
 * Submit a user report for a review (inappropriate content) or
 * a clinic/provider (wrong information, closed, moved, etc.)
 *
 * Maps to the existing `submit_content_report` RPC (ADM-2 migration).
 * Returns the new report UUID so callers can show a confirmation.
 */
export async function submitReport(
  client: TypedSupabaseClient,
  params: SubmitReviewReportParams
): Promise<ReviewReportResult> {
  const { targetType, targetId, reason, details, evidenceUrls = [] } = params;

  const { data, error } = await (client as any).rpc('submit_content_report', {
    p_target_type: targetType,
    p_target_id: targetId,
    p_reason: reason,
    p_details: details ?? null,
    p_evidence_urls: evidenceUrls,
  });

  if (error) {
    throw new Error(`Failed to submit report: ${error.message}`);
  }

  return {
    reportId: data as string,
    targetType,
    status: 'submitted',
  };
}

/**
 * Check if the authenticated user has already reported a given target.
 * Prevents duplicate submissions from the same user.
 */
export async function hasUserReported(
  client: TypedSupabaseClient,
  targetType: ReportTarget,
  targetId: string
): Promise<boolean> {
  const { data, error } = await (client as any)
    .from('content_reports')
    .select('id')
    .eq('target_type', targetType)
    .eq('target_id', targetId)
    .limit(1);

  if (error) return false;
  return Array.isArray(data) && data.length > 0;
}

/**
 * List the authenticated user's own submitted reports (self-service view).
 */
export interface MyReport {
  id: string;
  target_type: ReportTarget;
  target_id: string;
  reason: string;
  status: string;
  created_at: string;
}

export async function listMyReports(
  client: TypedSupabaseClient,
  limit = 20
): Promise<MyReport[]> {
  const { data, error } = await (client as any)
    .from('content_reports')
    .select('id, target_type, target_id, reason, status, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw new Error(`Failed to list reports: ${error.message}`);
  return (data ?? []) as MyReport[];
}


// ============================================================
// REV-1: Reviews & Ratings Core APIs (Owner: Zimia | Sprint: S6)
// ============================================================

import type { ReviewItem, ReviewSummary, CreateReviewInput } from '@pranora/validation';
export type { ReviewItem, ReviewSummary, CreateReviewInput };

export const MOCK_REVIEWS: Record<string, ReviewItem[]> = {
  // Care Pet Clinic & Hospital (Dhanmondi - Provider ID 20000000-0000-0000-0000-000000000002)
  '20000000-0000-0000-0000-000000000002': [
    {
      id: 'rev-001',
      bookingId: 'b-001',
      authorId: 'user-001',
      authorName: 'তানভীর আহমেদ',
      authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
      providerId: '20000000-0000-0000-0000-000000000002',
      vetId: '40000000-0000-0000-0000-000000000001',
      vetName: 'ডাঃ মোস্তাফিজুর রহমান',
      rating: 5,
      comment: 'আমার পার্সিয়ান বিড়ালের জটিল সার্জারি অত্যন্ত দক্ষতার সাথে সম্পন্ন করেছেন। ডাক্তার সাহেব খুবই যত্নশীল এবং ক্লিনিক পরিষ্কার-পরিচ্ছন্ন।',
      isVerifiedVisit: true,
      createdAt: '2026-11-15T10:30:00Z',
    },
    {
      id: 'rev-002',
      bookingId: 'b-002',
      authorId: 'user-002',
      authorName: 'সাদিয়া জাহান',
      authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
      providerId: '20000000-0000-0000-0000-000000000002',
      vetId: '40000000-0000-0000-0000-000000000002',
      vetName: 'ডাঃ ফারহানা ইসলাম',
      rating: 5,
      comment: 'টিকা দেওয়ার পর কোনো সমস্যা হয়নি। অ্যাপের ডিজিটাল কার্ড দেখে খুব সহজে বুস্টার ট্র্যাক করা যায়।',
      isVerifiedVisit: true,
      createdAt: '2026-11-18T14:15:00Z',
    },
    {
      id: 'rev-003',
      bookingId: 'b-003',
      authorId: 'user-003',
      authorName: 'Rafiqul Hasan',
      authorAvatar: null,
      providerId: '20000000-0000-0000-0000-000000000002',
      vetId: '40000000-0000-0000-0000-000000000001',
      vetName: 'ডাঃ মোস্তাফিজুর রহমান',
      rating: 4,
      comment: 'খুব ভালো সার্ভিস। শুধু ছুটির দিনে একটু বেশি ভিড় থাকে, তাই সিরিয়াল নিয়ে যাওয়া ভালো।',
      isVerifiedVisit: true,
      createdAt: '2026-11-20T16:00:00Z',
    },
  ],

  // Central Veterinary Hospital (CVH) Dhaka (Govt - Provider ID 20000000-0000-0000-0000-000000000001)
  '20000000-0000-0000-0000-000000000001': [
    {
      id: 'rev-101',
      bookingId: 'b-101',
      authorId: 'user-004',
      authorName: 'মেহেদী হাসান',
      authorAvatar: null,
      providerId: '20000000-0000-0000-0000-000000000001',
      vetId: null,
      vetName: 'উপজেলা প্রাণিসম্পদ কর্মকর্তা (সার্জন)',
      rating: 5,
      comment: 'সরকারি হাসপাতালে মাত্র ৫০ টাকায় অভিজ্ঞ ডাক্তার দেখিয়ে ঔষধ পেলাম। চিকিৎসা চমৎকার!',
      isVerifiedVisit: true,
      createdAt: '2026-11-10T11:00:00Z',
    },
  ],
};

/**
 * Calculates rating summary and breakdown from an array of reviews
 */
export function calculateReviewSummary(reviews: ReviewItem[]): ReviewSummary {
  if (reviews.length === 0) {
    return {
      ratingAvg: 0,
      ratingCount: 0,
      breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    };
  }

  const breakdown: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  let sum = 0;

  for (const r of reviews) {
    const star = Math.min(Math.max(Math.round(r.rating), 1), 5);
    breakdown[star] = (breakdown[star] ?? 0) + 1;
    sum += r.rating;
  }

  const ratingAvg = Math.round((sum / reviews.length) * 10) / 10;
  return {
    ratingAvg,
    ratingCount: reviews.length,
    breakdown: {
      5: breakdown[5] ?? 0,
      4: breakdown[4] ?? 0,
      3: breakdown[3] ?? 0,
      2: breakdown[2] ?? 0,
      1: breakdown[1] ?? 0,
    },
  };
}

/**
 * Fetches all reviews for a provider (DB with mock fallback)
 */
export async function getProviderReviews(
  providerId: string,
  client?: TypedSupabaseClient | null
): Promise<ReviewItem[]> {
  if (client) {
    try {
      const { data, error } = await (client as any)
        .from('reviews')
        .select('*, profiles(full_name, avatar_url), vets(full_name_bn, full_name_en)')
        .eq('provider_id', providerId)
        .eq('is_hidden', false)
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data) && data.length > 0) {
        return data.map((r: any) => ({
          id: r.id,
          bookingId: r.booking_id,
          authorId: r.author_id,
          authorName: r.profiles?.full_name || 'Pet Parent',
          authorAvatar: r.profiles?.avatar_url || null,
          providerId: r.provider_id,
          vetId: r.vet_id,
          vetName: r.vets?.full_name_bn || r.vets?.full_name_en || null,
          rating: Number(r.rating),
          comment: r.comment,
          isVerifiedVisit: true,
          createdAt: r.created_at,
        }));
      }
    } catch {
      // Fall through to mock
    }
  }

  return MOCK_REVIEWS[providerId] ?? [
    {
      id: `rev-gen-${providerId.slice(0, 4)}`,
      bookingId: 'b-default',
      authorId: 'u-default',
      authorName: 'Verified Pet Parent',
      authorAvatar: null,
      providerId,
      vetId: null,
      vetName: null,
      rating: 5,
      comment: 'খুব ভালো চিকিৎসা ও সঠিক পরামর্শ পেয়েছি। সময়মতো সেবা পেয়েছি।',
      isVerifiedVisit: true,
      createdAt: new Date().toISOString(),
    },
  ];
}

/**
 * Submits a new review (DB with in-memory fallback)
 */
export async function submitProviderReview(
  input: CreateReviewInput,
  authorProfile: { id: string; name: string; avatarUrl?: string | null },
  client?: TypedSupabaseClient | null
): Promise<ReviewItem> {
  const newReview: ReviewItem = {
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `rev-${Date.now()}`,
    bookingId: input.bookingId,
    authorId: authorProfile.id,
    authorName: authorProfile.name,
    authorAvatar: authorProfile.avatarUrl ?? null,
    providerId: input.providerId,
    vetId: input.vetId ?? null,
    vetName: null,
    rating: input.rating,
    comment: input.comment ?? '',
    isVerifiedVisit: true,
    createdAt: new Date().toISOString(),
  };

  if (client) {
    try {
      const { data, error } = await (client as any).from('reviews').insert({
        booking_id: input.bookingId,
        author_id: authorProfile.id,
        provider_id: input.providerId,
        vet_id: input.vetId ?? null,
        rating: input.rating,
        comment: input.comment ?? null,
      }).select().single();

      if (!error && data) {
        newReview.id = data.id;
        newReview.createdAt = data.created_at;
      }
    } catch {
      // Fall through to client mock state
    }
  }

  // Update in-memory mock record
  if (!MOCK_REVIEWS[input.providerId]) {
    MOCK_REVIEWS[input.providerId] = [];
  }
  MOCK_REVIEWS[input.providerId].unshift(newReview);

  return newReview;
}
