/**
 * HLT-2: Reminders API client
 * Owner: afridi | packages/api/src/notifications/reminders.ts
 */

import type { Database } from '@pranora/types';
import type { TypedSupabaseClient } from '../client';

// ── Types ─────────────────────────────────────────────────────────────────────

export type ReminderType =
  | 'vaccine'
  | 'deworming'
  | 'flea_tick'
  | 'medicine'
  | 'grooming'
  | 'checkup'
  | 'custom';

export interface ReminderItem {
  id: string;
  petId: string;
  ownerId: string;
  type: ReminderType;
  title: string;
  remindAt: string;        // ISO 8601
  repeatDays: number | null;
  vaccinationId: string | null;
  isDone: boolean;
  lastSentAt: string | null;
  createdAt: string;
}

export interface CreateReminderParams {
  petId: string;
  type: ReminderType;
  title: string;
  remindAt: string;        // ISO 8601
  repeatDays?: number | null;
  vaccinationId?: string | null;
}

export interface UpdateReminderParams {
  title?: string;
  remindAt?: string;
  repeatDays?: number | null;
  type?: ReminderType;
}

export interface ListRemindersOptions {
  petId?: string;
  ownerId?: string;
  includesDone?: boolean;
  limit?: number;
}

// ── Mapper ────────────────────────────────────────────────────────────────────

function mapRow(row: {
  id: string;
  pet_id: string;
  owner_id: string;
  type: string;
  title: string;
  remind_at: string;
  repeat_days: number | null;
  vaccination_id: string | null;
  is_done: boolean;
  last_sent_at: string | null;
  created_at: string;
}): ReminderItem {
  return {
    id:            row.id,
    petId:         row.pet_id,
    ownerId:       row.owner_id,
    type:          row.type as ReminderType,
    title:         row.title,
    remindAt:      row.remind_at,
    repeatDays:    row.repeat_days,
    vaccinationId: row.vaccination_id,
    isDone:        row.is_done,
    lastSentAt:    row.last_sent_at,
    createdAt:     row.created_at,
  };
}

// ── API Functions ─────────────────────────────────────────────────────────────

/**
 * List reminders for the current owner, optionally filtered by pet.
 */
export async function listReminders(
  client: TypedSupabaseClient,
  options: ListRemindersOptions = {},
): Promise<ReminderItem[]> {
  const { petId, ownerId, includesDone = false, limit = 50 } = options;

  let query = client
    .from('reminders')
    .select('id, pet_id, owner_id, type, title, remind_at, repeat_days, vaccination_id, is_done, last_sent_at, created_at')
    .order('remind_at', { ascending: true })
    .limit(limit);

  if (petId)    query = query.eq('pet_id', petId);
  if (ownerId)  query = query.eq('owner_id', ownerId);
  if (!includesDone) query = query.eq('is_done', false);

  const { data, error } = await query;
  if (error) throw new Error(`listReminders: ${error.message}`);
  return (data ?? []).map(mapRow);
}

/**
 * Create a new reminder.
 */
export async function createReminder(
  client: TypedSupabaseClient,
  params: CreateReminderParams,
): Promise<ReminderItem> {
  const { data, error } = await client
    .from('reminders')
    .insert({
      pet_id:        params.petId,
      type:          params.type,
      title:         params.title,
      remind_at:     params.remindAt,
      repeat_days:   params.repeatDays ?? null,
      vaccination_id: params.vaccinationId ?? null,
    })
    .select('id, pet_id, owner_id, type, title, remind_at, repeat_days, vaccination_id, is_done, last_sent_at, created_at')
    .single();

  if (error) throw new Error(`createReminder: ${error.message}`);
  return mapRow(data);
}

/**
 * Update an existing reminder's metadata.
 */
export async function updateReminder(
  client: TypedSupabaseClient,
  id: string,
  patch: UpdateReminderParams,
): Promise<ReminderItem> {
  const updatePayload: Database['public']['Tables']['reminders']['Update'] = {};
  if (patch.title      !== undefined) updatePayload.title       = patch.title;
  if (patch.remindAt   !== undefined) updatePayload.remind_at   = patch.remindAt;
  if (patch.repeatDays !== undefined) updatePayload.repeat_days = patch.repeatDays;
  if (patch.type       !== undefined) updatePayload.type        = patch.type;

  const { data, error } = await client
    .from('reminders')
    .update(updatePayload)
    .eq('id', id)
    .select('id, pet_id, owner_id, type, title, remind_at, repeat_days, vaccination_id, is_done, last_sent_at, created_at')
    .single();

  if (error) throw new Error(`updateReminder: ${error.message}`);
  return mapRow(data);
}

/**
 * Delete a reminder permanently.
 */
export async function deleteReminder(
  client: TypedSupabaseClient,
  id: string,
): Promise<void> {
  const { error } = await client
    .from('reminders')
    .delete()
    .eq('id', id);

  if (error) throw new Error(`deleteReminder: ${error.message}`);
}

/**
 * Mark a one-shot reminder as done immediately (user dismisses).
 */
export async function markReminderDone(
  client: TypedSupabaseClient,
  id: string,
): Promise<void> {
  const { error } = await client
    .from('reminders')
    .update({ is_done: true })
    .eq('id', id);

  if (error) throw new Error(`markReminderDone: ${error.message}`);
}
