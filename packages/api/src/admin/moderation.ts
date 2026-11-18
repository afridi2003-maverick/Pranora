// packages/api/src/admin/moderation.ts
// Owner: Afridi | Task: ADM-2 (Moderation of fake listings/reports & abuse prevention)

import type { TypedSupabaseClient } from '../client';
import type { ModerationStatus, ReportTarget } from '@pranora/types';

export type ModerationAction =
  | 'none'
  | 'removed'
  | 'hidden'
  | 'user_blocked'
  | 'clinic_updated'
  | 'warning_issued'
  | 'dismissed';

export interface ContentReportItem {
  id: string;
  reporter_id: string;
  target_type: ReportTarget;
  target_id: string;
  reason: string;
  details: string | null;
  evidence_urls: string[];
  status: ModerationStatus;
  moderator_id: string | null;
  moderator_notes: string | null;
  action_taken: string;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
  reporter_name?: string | null;
  reporter_phone?: string | null;
  target_title?: string | null;
}

export interface ListModerationOptions {
  status?: ModerationStatus | 'all';
  targetType?: ReportTarget | 'all';
  limit?: number;
  offset?: number;
}

export interface ModerateContentParams {
  reportId: string;
  action: ModerationAction;
  notes?: string;
  blockUser?: boolean;
}

export interface SubmitContentReportParams {
  targetType: ReportTarget;
  targetId: string;
  reason: string;
  details?: string;
  evidenceUrls?: string[];
}

/**
 * List content reports with optional status and target filtering
 */
export async function listContentReports(
  client: TypedSupabaseClient,
  options: ListModerationOptions = {}
): Promise<{ reports: ContentReportItem[]; count: number }> {
  const { status = 'all', targetType = 'all', limit = 20, offset = 0 } = options;

  let query = (client as any)
    .from('content_reports')
    .select(
      `
      id,
      reporter_id,
      target_type,
      target_id,
      reason,
      details,
      evidence_urls,
      status,
      moderator_id,
      moderator_notes,
      action_taken,
      resolved_at,
      created_at,
      updated_at,
      reporter:profiles!content_reports_reporter_id_fkey (
        full_name,
        phone
      )
    `,
      { count: 'exact' }
    )
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (status !== 'all') {
    query = query.eq('status', status);
  }
  if (targetType !== 'all') {
    query = query.eq('target_type', targetType);
  }

  const { data, count, error } = await query;
  if (error) {
    throw new Error(`Failed to list content reports: ${error.message}`);
  }

  const reports: ContentReportItem[] = ((data as any[]) || []).map((row) => ({
    id: row.id,
    reporter_id: row.reporter_id,
    target_type: row.target_type,
    target_id: row.target_id,
    reason: row.reason,
    details: row.details,
    evidence_urls: row.evidence_urls || [],
    status: row.status,
    moderator_id: row.moderator_id,
    moderator_notes: row.moderator_notes,
    action_taken: row.action_taken,
    resolved_at: row.resolved_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
    reporter_name: row.reporter?.full_name ?? null,
    reporter_phone: row.reporter?.phone ?? null,
  }));

  return { reports, count: count ?? 0 };
}

/**
 * Get count summary for moderation queue
 */
export async function getModerationQueueCount(
  client: TypedSupabaseClient
): Promise<{ open: number; actioned: number; dismissed: number; total: number }> {
  const { data, error } = await (client as any)
    .from('content_reports')
    .select('status');

  if (error) {
    return { open: 0, actioned: 0, dismissed: 0, total: 0 };
  }

  let open = 0;
  let actioned = 0;
  let dismissed = 0;

  for (const row of (data as any[]) || []) {
    if (row.status === 'open') open++;
    else if (row.status === 'actioned') actioned++;
    else if (row.status === 'dismissed') dismissed++;
  }

  return { open, actioned, dismissed, total: open + actioned + dismissed };
}

/**
 * Execute moderation action (remove content, block abusive user, update clinic, or dismiss)
 */
export async function moderateContent(
  client: TypedSupabaseClient,
  params: ModerateContentParams
): Promise<{ success: boolean; report_id: string; status: string; action_taken: string }> {
  const { reportId, action, notes, blockUser = false } = params;

  const { data, error } = await (client as any).rpc('moderate_content', {
    p_report_id: reportId,
    p_action: action,
    p_notes: notes || null,
    p_block_user: blockUser,
  });

  if (error) {
    throw new Error(`Failed to moderate content: ${error.message}`);
  }

  return data as any;
}

/**
 * Submit a content report (user or admin)
 */
export async function submitContentReport(
  client: TypedSupabaseClient,
  params: SubmitContentReportParams
): Promise<string> {
  const { targetType, targetId, reason, details, evidenceUrls = [] } = params;

  const { data, error } = await (client as any).rpc('submit_content_report', {
    p_target_type: targetType,
    p_target_id: targetId,
    p_reason: reason,
    p_details: details || null,
    p_evidence_urls: evidenceUrls,
  });

  if (error) {
    throw new Error(`Failed to submit content report: ${error.message}`);
  }

  return data as string;
}
