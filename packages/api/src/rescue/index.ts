import type { TypedSupabaseClient } from '../client';
import type {
  Database,
  AnimalReportKind,
  SpeciesType,
  UrgencyLevel,
  RescueStatus,
  RescueOutcome,
  AssignmentStatus,
} from '@pranora/types';

// ── Types ───────────────────────────────────────────────────────────────────

export interface AnimalReportRow {
  id: string;
  reporter_id: string;
  kind: AnimalReportKind;
  pet_id: string | null;
  species: SpeciesType;
  urgency: UrgencyLevel;
  last_seen_at: string | null;
  contact_phone: string | null;
  description: string | null;
  photos: string[];
  location: unknown;
  area_text: string | null;
  upazila_id: number | null;
  district_id: number | null;
  status: RescueStatus;
  duplicate_of: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  escalated_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface UrgentRescueAlertResponse {
  success: boolean;
  report_id?: string;
  alerted_count?: number;
  recipients?: string[];
  skipped?: string;
  error?: string;
}

export interface RescueEscalationResponse {
  success: boolean;
  escalated_count: number;
  escalated_ids: string[];
  threshold_minutes: number;
}

export interface LostFoundBoardItem {
  id: string;
  kind: AnimalReportKind;
  species: SpeciesType;
  description: string | null;
  photos: string[];
  area_text: string | null;
  district_id: number | null;
  upazila_id: number | null;
  last_seen_at: string | null;
  created_at: string;
  approx_location: unknown | null;
}

export interface RescueCaseRow {
  id: string;
  report_id: string;
  status: RescueStatus;
  shelter_id: string | null;
  assigned_rescuer_id: string | null;
  pet_id: string | null;
  outcome: RescueOutcome | null;
  outcome_note: string | null;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface RescueAssignmentRow {
  id: string;
  case_id: string;
  rescuer_id: string;
  assigned_by: string;
  status: AssignmentStatus;
  decline_reason: string | null;
  responded_at: string | null;
  created_at: string;
}

export interface RescueCaseUpdateRow {
  id: string;
  case_id: string;
  author_id: string;
  status: RescueStatus | null;
  note: string | null;
  photos: string[];
  created_at: string;
}

export interface CreateReportPayload {
  kind: AnimalReportKind;
  species?: SpeciesType;
  urgency?: UrgencyLevel;
  pet_id?: string | null;
  last_seen_at?: string | null;
  contact_phone?: string | null;
  description?: string | null;
  photos?: string[];
  latitude: number;
  longitude: number;
  area_text?: string | null;
  upazila_id?: number | null;
  district_id?: number | null;
}

export interface MyReportStatusResponse {
  reportId: string;
  kind: AnimalReportKind;
  species: SpeciesType;
  status: RescueStatus;
  statusBn: string;
  statusEn: string;
  urgency: UrgencyLevel;
  areaText: string | null;
  createdAt: string;
  updatedAt: string;
}

// ── Client Methods ──────────────────────────────────────────────────────────

/** Submit an animal report (injured, lost, found, abandoned) */
export async function createAnimalReport(
  client: TypedSupabaseClient,
  reporterId: string,
  payload: CreateReportPayload
): Promise<AnimalReportRow> {
  const { data, error } = await client
    .from('animal_reports')
    .insert({
      reporter_id: reporterId,
      kind: payload.kind,
      species: payload.species ?? 'other',
      urgency: payload.urgency ?? 'medium',
      pet_id: payload.pet_id ?? null,
      last_seen_at: payload.last_seen_at ?? null,
      contact_phone: payload.contact_phone ?? null,
      description: payload.description ?? null,
      photos: payload.photos ?? [],
      location: `POINT(${payload.longitude} ${payload.latitude})`,
      area_text: payload.area_text ?? null,
      upazila_id: payload.upazila_id ?? null,
      district_id: payload.district_id ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return data as unknown as AnimalReportRow;
}

/** Fetch reports submitted by the current user */
export async function getMyReports(
  client: TypedSupabaseClient
): Promise<AnimalReportRow[]> {
  const { data, error } = await client
    .from('animal_reports')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as unknown as AnimalReportRow[];
}

/** Fetch public lost & found reports */
export async function getLostFoundBoard(
  client: TypedSupabaseClient,
  species?: SpeciesType
): Promise<LostFoundBoardItem[]> {
  let query = client
    .from('lost_found_board')
    .select('*')
    .order('created_at', { ascending: false });

  if (species) {
    query = query.eq('species', species);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as unknown as LostFoundBoardItem[];
}

/** Fetch reviewer queue for shelters and admins */
export async function getRescueQueue(
  client: TypedSupabaseClient,
  options?: { status?: RescueStatus; urgency?: UrgencyLevel }
): Promise<AnimalReportRow[]> {
  let query = client
    .from('animal_reports')
    .select('*')
    .order('created_at', { ascending: false });

  if (options?.status) {
    query = query.eq('status', options.status);
  }
  if (options?.urgency) {
    query = query.eq('urgency', options.urgency);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as unknown as AnimalReportRow[];
}

/** Fetch details of a rescue case */
export async function getRescueCaseById(
  client: TypedSupabaseClient,
  caseId: string
): Promise<RescueCaseRow | null> {
  const { data, error } = await client
    .from('rescue_cases')
    .select('*')
    .eq('id', caseId)
    .maybeSingle();

  if (error) throw error;
  return data as unknown as RescueCaseRow | null;
}

/** Fetch cases assigned to the current rescuer */
export async function getMyAssignedCases(
  client: TypedSupabaseClient,
  rescuerId: string
): Promise<RescueCaseRow[]> {
  const { data, error } = await client
    .from('rescue_cases')
    .select('*')
    .eq('assigned_rescuer_id', rescuerId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as unknown as RescueCaseRow[];
}

/** Fetch assignments offered to or responded by the current rescuer */
export async function getMyRescueAssignments(
  client: TypedSupabaseClient,
  rescuerId: string,
  status?: AssignmentStatus
): Promise<RescueAssignmentRow[]> {
  let query = client
    .from('rescue_assignments')
    .select('*')
    .eq('rescuer_id', rescuerId)
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as unknown as RescueAssignmentRow[];
}

/** Fetch case updates / timeline */
export async function getRescueCaseUpdates(
  client: TypedSupabaseClient,
  caseId: string
): Promise<RescueCaseUpdateRow[]> {
  const { data, error } = await client
    .from('rescue_case_updates')
    .select('*')
    .eq('case_id', caseId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data ?? []) as unknown as RescueCaseUpdateRow[];
}

/** Add a timeline note or photo update to a case */
export async function addRescueCaseUpdate(
  client: TypedSupabaseClient,
  authorId: string,
  payload: {
    case_id: string;
    status?: RescueStatus | null;
    note?: string | null;
    photos?: string[];
  }
): Promise<RescueCaseUpdateRow> {
  const { data, error } = await client
    .from('rescue_case_updates')
    .insert({
      case_id: payload.case_id,
      author_id: authorId,
      status: payload.status ?? null,
      note: payload.note ?? null,
      photos: payload.photos ?? [],
    })
    .select()
    .single();

  if (error) throw error;
  return data as unknown as RescueCaseUpdateRow;
}

// ── RPC Invocations ─────────────────────────────────────────────────────────

/** Review an animal report (shelter/admin only) */
export async function reviewAnimalReport(
  client: TypedSupabaseClient,
  reportId: string,
  accept: boolean,
  shelterId?: string | null
): Promise<string | null> {
  const { data, error } = await client.rpc('review_animal_report', {
    p_report_id: reportId,
    p_accept: accept,
    p_shelter_id: shelterId ?? null,
  });

  if (error) throw error;
  return data;
}

/** Assign a rescuer to a case (shelter/admin only) */
export async function assignRescuer(
  client: TypedSupabaseClient,
  caseId: string,
  rescuerId: string
): Promise<string> {
  const { data, error } = await client.rpc('assign_rescuer', {
    p_case_id: caseId,
    p_rescuer_id: rescuerId,
  });

  if (error) throw error;
  return data;
}

/** Accept or decline an offered assignment */
export async function respondToAssignment(
  client: TypedSupabaseClient,
  assignmentId: string,
  accept: boolean,
  declineReason?: string | null
): Promise<boolean> {
  const { data, error } = await client.rpc('respond_to_assignment', {
    p_assignment_id: assignmentId,
    p_accept: accept,
    p_decline_reason: declineReason ?? null,
  });

  if (error) throw error;
  return Boolean(data);
}

/** Conclude and close a rescue case with outcome */
export async function closeRescueCase(
  client: TypedSupabaseClient,
  caseId: string,
  outcome: RescueOutcome,
  note?: string | null,
  petId?: string | null
): Promise<boolean> {
  const { data, error } = await client.rpc('close_rescue_case', {
    p_case_id: caseId,
    p_outcome: outcome,
    p_note: note ?? null,
    p_pet_id: petId ?? null,
  });

  if (error) throw error;
  return Boolean(data);
}

/** Get reporter-facing simplified status */
export async function getMyReportStatus(
  client: TypedSupabaseClient,
  reportId: string
): Promise<MyReportStatusResponse> {
  const { data, error } = await client.rpc('my_report_status', {
    p_report_id: reportId,
  });

  if (error) throw error;
  return data as unknown as MyReportStatusResponse;
}

// ── Urgent Alerts & Escalation (RSC-6) ──────────────────────────────────────

/** Manually or programmatically trigger urgent alert for a report */
export async function triggerUrgentRescueAlert(
  client: TypedSupabaseClient,
  reportId: string
): Promise<UrgentRescueAlertResponse> {
  const { data, error } = await client.rpc('notify_urgent_rescue_report', {
    p_report_id: reportId,
  });

  if (error) throw error;
  return (data as unknown as UrgentRescueAlertResponse) ?? { success: true };
}

/** Trigger 15-minute escalation routine for overdue unreviewed urgent reports */
export async function escalateUnreviewedRescueReports(
  client: TypedSupabaseClient
): Promise<RescueEscalationResponse> {
  const { data, error } = await client.rpc('escalate_unreviewed_rescue_reports');

  if (error) throw error;
  return (data as unknown as RescueEscalationResponse) ?? {
    success: true,
    escalated_count: 0,
    escalated_ids: [],
    threshold_minutes: 15,
  };
}

/** List all submitted unreviewed urgent reports, optionally scoped to a district */
export async function listUnreviewedUrgentReports(
  client: TypedSupabaseClient,
  districtId?: number | null
): Promise<AnimalReportRow[]> {
  let query = client
    .from('animal_reports')
    .select('*')
    .eq('status', 'submitted')
    .in('urgency', ['critical', 'high'])
    .order('urgency', { ascending: false })
    .order('created_at', { ascending: true });

  if (districtId) {
    query = query.eq('district_id', districtId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as unknown as AnimalReportRow[];
}

/** Check escalation countdown status for a report */
export function calculateEscalationCountdown(
  createdAtIso: string,
  thresholdMinutes = 15,
  escalatedAtIso?: string | null
): {
  isOverdue: boolean;
  minutesElapsed: number;
  minutesRemaining: number;
  formattedRemaining: string;
} {
  const createdTime = new Date(createdAtIso).getTime();
  const now = Date.now();
  const elapsedMs = Math.max(0, now - createdTime);
  const elapsedMinutes = Math.floor(elapsedMs / (60 * 1000));
  const remainingMinutes = Math.max(0, thresholdMinutes - elapsedMinutes);
  const isOverdue = Boolean(escalatedAtIso) || elapsedMinutes >= thresholdMinutes;

  return {
    isOverdue,
    minutesElapsed: elapsedMinutes,
    minutesRemaining: remainingMinutes,
    formattedRemaining: isOverdue ? '0m' : `${remainingMinutes}m`,
  };
}

export interface PotentialDuplicateReport {
  id: string;
  reporter_id: string;
  kind: AnimalReportKind;
  species: SpeciesType;
  urgency: UrgencyLevel;
  description: string | null;
  photos: string[];
  area_text: string | null;
  status: RescueStatus;
  distance_meters: number;
  created_at: string;
}

/** Find potential duplicate reports matching species, time, and spatial proximity */
export async function findPotentialDuplicateReports(
  client: TypedSupabaseClient,
  reportId: string,
  radiusMeters = 1500
): Promise<PotentialDuplicateReport[]> {
  const { data, error } = await client.rpc('find_potential_duplicate_reports', {
    p_report_id: reportId,
    p_radius_meters: radiusMeters,
  });

  if (error) throw error;
  return (data as unknown as PotentialDuplicateReport[]) ?? [];
}

/** Merge a duplicate animal report into an existing canonical report */
export async function mergeAnimalReports(
  client: TypedSupabaseClient,
  duplicateId: string,
  targetId: string
): Promise<boolean> {
  const { data, error } = await client.rpc('merge_animal_reports', {
    p_duplicate_id: duplicateId,
    p_target_id: targetId,
  });

  if (error) throw error;
  return Boolean(data);
}

export type RescuerProfileRow = Database['public']['Tables']['rescuer_profiles']['Row'];

export interface NearbyRescuer {
  rescuer_id: string;
  distance_meters: number;
  radius_km: number;
  is_available: boolean;
  species: SpeciesType[];
  display_name: string | null;
  avatar_url: string | null;
  active_cases_count: number;
}

export interface FindNearbyRescuersParams {
  lat: number;
  lng: number;
  radius_m?: number;
  species?: SpeciesType;
}

export interface UpsertRescuerProfileParams {
  userId: string;
  lat?: number;
  lng?: number;
  districtId?: number;
  radiusKm?: number;
  species?: SpeciesType[];
  isAvailable?: boolean;
}

/** Search nearby available verified rescuers within coverage radius (RSC-9) */
export async function findNearbyRescuers(
  client: TypedSupabaseClient,
  params: FindNearbyRescuersParams
): Promise<NearbyRescuer[]> {
  const { data, error } = await client.rpc('nearby_rescuers', {
    p_lat: params.lat,
    p_lng: params.lng,
    p_radius_m: params.radius_m ?? null,
    p_species: params.species ?? null,
  });

  if (error) throw error;
  return (data as unknown as NearbyRescuer[]) ?? [];
}

/** Fetch a rescuer's profile and availability details */
export async function getRescuerProfile(
  client: TypedSupabaseClient,
  userId: string
): Promise<RescuerProfileRow | null> {
  const { data, error } = await client
    .from('rescuer_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  return data as unknown as RescuerProfileRow | null;
}

/** Update or create a rescuer coverage profile */
export async function upsertRescuerProfile(
  client: TypedSupabaseClient,
  params: UpsertRescuerProfileParams
): Promise<RescuerProfileRow> {
  const { data, error } = await client.rpc('upsert_rescuer_profile', {
    p_user_id: params.userId,
    p_lat: params.lat ?? null,
    p_lng: params.lng ?? null,
    p_district_id: params.districtId ?? null,
    p_radius_km: params.radiusKm ?? null,
    p_species: params.species ?? null,
    p_is_available: params.isAvailable ?? null,
  });

  if (error) throw error;
  return data as unknown as RescuerProfileRow;
}

/** Quick toggle for rescuer availability status */
export async function setRescuerAvailability(
  client: TypedSupabaseClient,
  userId: string,
  isAvailable: boolean
): Promise<boolean> {
  const { error } = await client
    .from('rescuer_profiles')
    .update({ is_available: isAvailable, updated_at: new Date().toISOString() })
    .eq('user_id', userId);

  if (error) throw error;
  return true;
}

