// packages/api/src/admin/index.ts
// Owner: Afridi | Tasks: ADM-1, ADM-4, ADM-3, ADM-2
// Admin verification, audit logs, urgent rescue queue, and content moderation

export * from './moderation';

import type { TypedSupabaseClient } from '../client';
import type {
  AnimalReportKind,
  Json,
  RescueStatus,
  SpeciesType,
  UrgencyLevel,
  UserRole,
  VerificationStatus,
} from '@pranora/types';
import { notify } from '../notifications';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface UrgentRescueReportItem {
  id: string;
  reporter_id: string;
  kind: AnimalReportKind;
  species: SpeciesType;
  urgency: UrgencyLevel;
  last_seen_at: string | null;
  contact_phone: string | null;
  description: string | null;
  photos: string[];
  area_text: string | null;
  district_id: number | null;
  upazila_id: number | null;
  status: RescueStatus;
  created_at: string;
  reporter_name?: string | null;
  reporter_phone?: string | null;
}

export interface ListUrgentRescueOptions {
  urgency?: UrgencyLevel | 'all';
  status?: RescueStatus | 'all';
  limit?: number;
  offset?: number;
}

export interface ReviewRescueReportParams {
  reportId: string;
  accept: boolean;
  shelterId?: string | null;
  note?: string;
}

export interface AuditLogEntry {
  id: number;
  actor_id: string | null;
  action: string;
  table_name: string;
  record_id: string | null;
  old_data: Json | null;
  new_data: Json | null;
  ip_address: string | null;
  created_at: string;
  // joined from profiles
  actor_name?: string | null;
  actor_phone?: string | null;
}

export interface ListAuditLogsOptions {
  tableName?: string;
  action?: string;
  recordId?: string;
  actorId?: string;
  limit?: number;
  offset?: number;
}

export type VerifiableRole = Extract<
  UserRole,
  'rescuer' | 'shelter' | 'vet' | 'provider' | 'adoption_lister'
>;

export interface PendingRoleRequest {
  user_id: string;
  role: VerifiableRole;
  status: VerificationStatus;
  created_at: string;
  verified_at: string | null;
  verified_by: string | null;
  // joined from profiles
  full_name: string | null;
  full_name_bn: string | null;
  phone: string | null;
  avatar_url: string | null;
}

export interface ProviderPendingDoc {
  id: string;
  provider_id: string | null;
  vet_id: string | null;
  doc_type: string;
  file_path: string;
  status: VerificationStatus;
  reviewed_by: string | null;
  review_note: string | null;
  created_at: string;
  // joined
  provider_name_en: string | null;
  provider_name_bn: string | null;
  provider_verification: VerificationStatus | null;
}

export interface VerifyRoleParams {
  userId: string;
  role: VerifiableRole;
  action: 'approve' | 'reject';
  adminId: string;
  note?: string;
}

export interface VerifyProviderParams {
  providerId: string;
  action: 'approve' | 'reject';
  adminId: string;
  note?: string;
}

export interface VerifyDocumentParams {
  documentId: string;
  action: 'approve' | 'reject';
  adminId: string;
  note?: string;
}

// ─────────────────────────────────────────────
// Queries
// ─────────────────────────────────────────────

/**
 * List all pending role verification requests (admin only).
 * Optionally filter by role.
 */
export async function listPendingRoleRequests(
  client: TypedSupabaseClient,
  roleFilter?: VerifiableRole
): Promise<PendingRoleRequest[]> {
  let query = client
    .from('user_roles')
    .select(
      `user_id, role, status, created_at, verified_at, verified_by,
       profiles!user_roles_user_id_fkey (
         full_name, full_name_bn, phone, avatar_url
       )`
    )
    .eq('status', 'pending')
    .neq('role', 'owner')
    .neq('role', 'admin')
    .order('created_at', { ascending: true });

  if (roleFilter) {
    query = query.eq('role', roleFilter);
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? []).map((row: any) => ({
    user_id: row.user_id,
    role: row.role as VerifiableRole,
    status: row.status,
    created_at: row.created_at,
    verified_at: row.verified_at,
    verified_by: row.verified_by,
    full_name: row.profiles?.full_name ?? null,
    full_name_bn: row.profiles?.full_name_bn ?? null,
    phone: row.profiles?.phone ?? null,
    avatar_url: row.profiles?.avatar_url ?? null,
  }));
}

/**
 * List pending provider document submissions awaiting review (admin only).
 */
export async function listPendingProviders(
  client: TypedSupabaseClient
): Promise<ProviderPendingDoc[]> {
  const { data, error } = await client
    .from('provider_documents')
    .select(
      `id, provider_id, vet_id, doc_type, file_path, status,
       reviewed_by, review_note, created_at,
       providers!provider_documents_provider_id_fkey (
         name_en, name_bn, verification
       )`
    )
    .in('status', ['pending', 'draft'])
    .order('created_at', { ascending: true });

  if (error) throw error;

  return (data ?? []).map((row: any) => ({
    id: row.id,
    provider_id: row.provider_id,
    vet_id: row.vet_id,
    doc_type: row.doc_type,
    file_path: row.file_path,
    status: row.status,
    reviewed_by: row.reviewed_by,
    review_note: row.review_note,
    created_at: row.created_at,
    provider_name_en: row.providers?.name_en ?? null,
    provider_name_bn: row.providers?.name_bn ?? null,
    provider_verification: row.providers?.verification ?? null,
  }));
}

/**
 * Combined count of pending verifications for the admin dashboard badge.
 */
export async function getPendingVerificationCount(
  client: TypedSupabaseClient
): Promise<number> {
  const [rolesRes, docsRes] = await Promise.all([
    client
      .from('user_roles')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')
      .neq('role', 'owner')
      .neq('role', 'admin'),
    client
      .from('provider_documents')
      .select('*', { count: 'exact', head: true })
      .in('status', ['pending', 'draft']),
  ]);
  return (rolesRes.count ?? 0) + (docsRes.count ?? 0);
}

// ─────────────────────────────────────────────
// Mutations
// ─────────────────────────────────────────────

const ROLE_LABEL_BN: Record<VerifiableRole, string> = {
  rescuer: 'উদ্ধারকারী',
  shelter: 'আশ্রয়কেন্দ্র পরিচালক',
  vet: 'পশু চিকিৎসক',
  provider: 'সেবাদাতা',
  adoption_lister: 'দত্তক তালিকাকারী',
};

const ROLE_LABEL_EN: Record<VerifiableRole, string> = {
  rescuer: 'Rescuer',
  shelter: 'Shelter Manager',
  vet: 'Veterinarian',
  provider: 'Service Provider',
  adoption_lister: 'Adoption Lister',
};

/**
 * Approve or reject a role verification request (admin only).
 * Sends an in-app notification to the user.
 */
export async function verifyRoleRequest(
  client: TypedSupabaseClient,
  params: VerifyRoleParams
): Promise<void> {
  const { userId, role, action, adminId } = params;
  const newStatus: VerificationStatus = action === 'approve' ? 'verified' : 'rejected';

  const { error } = await client
    .from('user_roles')
    .update({
      status: newStatus,
      verified_by: adminId,
      verified_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .eq('role', role);

  if (error) throw error;

  const isApproved = action === 'approve';
  const roleBn = ROLE_LABEL_BN[role];
  const roleEn = ROLE_LABEL_EN[role];

  // Fire-and-forget notification — do not block on failure
  notify(client, {
    userId,
    templateKey: 'role_verified',
    data: {
      role,
      status: newStatus,
      title_bn: isApproved
        ? `✅ ${roleBn} ভেরিফিকেশন অনুমোদিত`
        : `❌ ${roleBn} ভেরিফিকেশন প্রত্যাখ্যাত`,
      title_en: isApproved
        ? `✅ ${roleEn} Verification Approved`
        : `❌ ${roleEn} Verification Rejected`,
      body_bn: isApproved
        ? `অভিনন্দন! আপনার ${roleBn} ভূমিকা প্রশাসক কর্তৃক যাচাই করা হয়েছে।`
        : `আপনার ${roleBn} ভেরিফিকেশন অনুরোধ প্রত্যাখ্যাত হয়েছে। আরও তথ্যের জন্য যোগাযোগ করুন।`,
      body_en: isApproved
        ? `Congratulations! Your ${roleEn} role has been verified by an admin.`
        : `Your ${roleEn} verification request was rejected. Please contact support for more info.`,
    },
    channels: ['in_app'],
  }).catch(() => {});
}

/**
 * Approve or reject a provider's overall verification status (admin only).
 */
export async function verifyProvider(
  client: TypedSupabaseClient,
  params: VerifyProviderParams
): Promise<void> {
  const { providerId, action, adminId } = params;
  const newStatus: VerificationStatus = action === 'approve' ? 'verified' : 'rejected';

  const { data: provider, error } = await client
    .from('providers')
    .update({
      verification: newStatus,
      verified_at: action === 'approve' ? new Date().toISOString() : null,
    })
    .eq('id', providerId)
    .select('owner_user_id, name_en, name_bn')
    .single();

  if (error) throw error;

  // Bulk-update all documents for this provider
  await client
    .from('provider_documents')
    .update({ status: newStatus, reviewed_by: adminId })
    .eq('provider_id', providerId)
    .in('status', ['pending', 'draft']);

  if (provider?.owner_user_id) {
    const nameEn = provider.name_en ?? provider.name_bn ?? 'Provider';
    const nameBn = provider.name_bn ?? provider.name_en ?? 'প্রোভাইডার';
    notify(client, {
      userId: provider.owner_user_id,
      templateKey: 'role_verified',
      data: {
        title_bn: action === 'approve'
          ? `✅ ${nameBn} যাচাই সম্পন্ন`
          : `❌ ${nameBn} যাচাই প্রত্যাখ্যাত`,
        title_en: action === 'approve'
          ? `✅ ${nameEn} Verified`
          : `❌ ${nameEn} Verification Rejected`,
        body_bn: action === 'approve'
          ? 'আপনার প্রতিষ্ঠান Pranora-তে যাচাইকৃত হিসেবে তালিকাভুক্ত হয়েছে।'
          : 'আপনার প্রতিষ্ঠানের যাচাই অনুরোধ প্রত্যাখ্যাত হয়েছে।',
        body_en: action === 'approve'
          ? 'Your institution is now listed as verified on Pranora.'
          : 'Your institution verification request was rejected. Contact support for details.',
      },
      channels: ['in_app'],
    }).catch(() => {});
  }
}

/**
 * Update status of a single provider document (admin only).
 */
export async function verifyProviderDocument(
  client: TypedSupabaseClient,
  params: VerifyDocumentParams
): Promise<void> {
  const { documentId, action, adminId, note } = params;
  const newStatus: VerificationStatus = action === 'approve' ? 'verified' : 'rejected';

  const { error } = await client
    .from('provider_documents')
    .update({
      status: newStatus,
      reviewed_by: adminId,
      review_note: note ?? null,
    })
    .eq('id', documentId);

  if (error) throw error;
}

// ─────────────────────────────────────────────
// ADM-4: Audit Log Queries
// ─────────────────────────────────────────────

/**
 * List audit logs with pagination and filters (admin only).
 */
export async function listAuditLogs(
  client: TypedSupabaseClient,
  options: ListAuditLogsOptions = {}
): Promise<AuditLogEntry[]> {
  const { tableName, action, recordId, actorId, limit = 50, offset = 0 } = options;

  let query = client
    .from('audit_logs')
    .select(
      `id, actor_id, action, table_name, record_id, old_data, new_data, ip_address, created_at,
       profiles:actor_id (
         full_name, phone
       )`
    )
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (tableName) {
    query = query.eq('table_name', tableName);
  }
  if (action) {
    query = query.eq('action', action);
  }
  if (recordId) {
    query = query.eq('record_id', recordId);
  }
  if (actorId) {
    query = query.eq('actor_id', actorId);
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? []).map((row: any) => ({
    id: row.id,
    actor_id: row.actor_id,
    action: row.action,
    table_name: row.table_name,
    record_id: row.record_id,
    old_data: row.old_data,
    new_data: row.new_data,
    ip_address: row.ip_address,
    created_at: row.created_at,
    actor_name: row.profiles?.full_name ?? null,
    actor_phone: row.profiles?.phone ?? null,
  }));
}

/**
 * Get total audit log count (admin only).
 */
export async function getAuditLogCount(
  client: TypedSupabaseClient,
  options: Pick<ListAuditLogsOptions, 'tableName' | 'action'> = {}
): Promise<number> {
  let query = client.from('audit_logs').select('*', { count: 'exact', head: true });

  if (options.tableName) {
    query = query.eq('table_name', options.tableName);
  }
  if (options.action) {
    query = query.eq('action', options.action);
  }

  const { count, error } = await query;
  if (error) throw error;
  return count ?? 0;
}

// ─────────────────────────────────────────────
// ADM-3: Urgent Rescue Report Queue
// ─────────────────────────────────────────────

/**
 * List urgent animal reports for the admin review queue.
 * Prioritizes high and critical urgency reports.
 */
export async function listUrgentRescueReports(
  client: TypedSupabaseClient,
  options: ListUrgentRescueOptions = {}
): Promise<UrgentRescueReportItem[]> {
  const { urgency = 'all', status = 'all', limit = 50, offset = 0 } = options;

  let query = client
    .from('animal_reports')
    .select(
      `id, reporter_id, kind, species, urgency, last_seen_at, contact_phone,
       description, photos, area_text, district_id, upazila_id, status, created_at,
       profiles:reporter_id (
         full_name, phone
       )`
    )
    .range(offset, offset + limit - 1);

  if (urgency !== 'all') {
    query = query.eq('urgency', urgency);
  }
  if (status !== 'all') {
    query = query.eq('status', status);
  }

  // Order: submitted first, then by urgency descending, then by creation
  query = query
    .order('status', { ascending: true })
    .order('created_at', { ascending: false });

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? []).map((row: any) => ({
    id: row.id,
    reporter_id: row.reporter_id,
    kind: row.kind,
    species: row.species,
    urgency: row.urgency,
    last_seen_at: row.last_seen_at,
    contact_phone: row.contact_phone,
    description: row.description,
    photos: row.photos ?? [],
    area_text: row.area_text,
    district_id: row.district_id,
    upazila_id: row.upazila_id,
    status: row.status,
    created_at: row.created_at,
    reporter_name: row.profiles?.full_name ?? null,
    reporter_phone: row.profiles?.phone ?? null,
  }));
}

/**
 * Review an urgent rescue report (admin or shelter).
 * Calls Brehat's review_animal_report RPC.
 */
export async function reviewRescueReport(
  client: TypedSupabaseClient,
  params: ReviewRescueReportParams
): Promise<string | null> {
  const { reportId, accept, shelterId = null } = params;

  const { data, error } = await client.rpc('review_animal_report', {
    p_report_id: reportId,
    p_accept: accept,
    p_shelter_id: shelterId,
  });

  if (error) throw error;
  return data;
}

/**
 * Get count of unreviewed urgent reports (critical/high status submitted).
 */
export async function getUrgentRescueQueueCount(
  client: TypedSupabaseClient
): Promise<number> {
  const { count, error } = await client
    .from('animal_reports')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'submitted')
    .in('urgency', ['critical', 'high']);

  if (error) throw error;
  return count ?? 0;
}
