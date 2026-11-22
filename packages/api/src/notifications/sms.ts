/**
 * HLT-6: SMS Reminders Service & Helpers
 * Owner: afridi | packages/api/src/notifications/sms.ts
 *
 * Provides formatters and dispatch client for SMS reminders:
 * - Vaccine date reminders
 * - Vet clinic appointment reminders (24h / 1h)
 */

import type { TypedSupabaseClient } from '../client';
import type { AppLocale } from '@pranora/types';

export interface VaccineSmsParams {
  petName: string;
  vaccineTitle: string;
  date: string;
  locale?: AppLocale;
}

export interface AppointmentSmsParams {
  bookingCode: string;
  dateTime: string;
  clinicName?: string;
  locale?: AppLocale;
}

export interface SendSmsPayload {
  phone: string;
  message: string;
}

/**
 * Builds a localized SMS string for upcoming vaccine reminders
 */
export function buildVaccineSmsMessage(params: VaccineSmsParams): string {
  const { petName, vaccineTitle, date, locale = 'bn' } = params;

  if (locale === 'en') {
    return `[Pranora] Reminder: ${petName}'s vaccine (${vaccineTitle}) is due on ${date}. Please visit your nearest clinic on time.`;
  }

  return `[প্রণোরা] স্মরণিকা: আপনার পোষা প্রাণী ${petName}-এর টিকা (${vaccineTitle}) ${date} তারিখে নির্ধারিত। সময়মতো ক্লিনিকে নিয়ে আসুন।`;
}

/**
 * Builds a localized SMS string for vet appointment reminders
 */
export function buildAppointmentSmsMessage(params: AppointmentSmsParams): string {
  const { bookingCode, dateTime, clinicName, locale = 'bn' } = params;
  const clinicText = clinicName ? ` (${clinicName})` : '';

  if (locale === 'en') {
    return `[Pranora] Appointment Reminder: Booking #${bookingCode}${clinicText} is scheduled for ${dateTime}. Please arrive 10m early.`;
  }

  return `[প্রণোরা] অ্যাপয়েন্টমেন্ট স্মরণিকা: বুকিং #${bookingCode}${clinicText} ${dateTime}-এ নির্ধারিত। অনুগ্রহ করে ১০ মিনিট পূর্বে উপস্থিত থাকুন।`;
}

/**
 * Dispatches an SMS reminder via Supabase send-sms Edge Function
 */
export async function sendSmsReminder(
  client: TypedSupabaseClient,
  payload: SendSmsPayload
): Promise<{ success: boolean; phone: string; message: string }> {
  const { data, error } = await client.functions.invoke('send-sms', {
    body: {
      recipient: payload.phone,
      message: payload.message,
    },
  });

  if (error) {
    throw new Error(`sendSmsReminder failed: ${error.message}`);
  }

  return data ?? { success: true, phone: payload.phone, message: payload.message };
}

/**
 * Update user's SMS reminder opt-in status in profiles table
 */
export async function setSmsOptIn(
  client: TypedSupabaseClient,
  userId: string,
  optIn: boolean
): Promise<void> {
  const { error } = await client
    .from('profiles')
    .update({ sms_opt_in: optIn })
    .eq('id', userId);

  if (error) {
    throw new Error(`setSmsOptIn failed: ${error.message}`);
  }
}
