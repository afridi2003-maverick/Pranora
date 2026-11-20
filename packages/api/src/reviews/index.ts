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
