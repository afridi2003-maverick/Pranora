import type { TypedSupabaseClient } from '../client';
import type {
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
  created_at: string;
  updated_at: string;
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
