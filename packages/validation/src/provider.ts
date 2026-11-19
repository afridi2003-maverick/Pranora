import { z } from 'zod';
import { bdPhoneRegex } from './common';
import { providerTypeSchema, speciesTypeSchema } from './map';

/**
 * Weekly operating hour slot schema
 */
export const locationHourSchema = z.object({
  weekday: z.number().int().min(0).max(6),
  openTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/, 'Format HH:MM or HH:MM:SS'),
  closeTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/, 'Format HH:MM or HH:MM:SS'),
  isClosed: z.boolean().optional().default(false),
});
export type LocationHourInput = z.infer<typeof locationHourSchema>;

/**
 * Provider initial service item schema
 */
export const providerServiceItemSchema = z.object({
  serviceName: z.string().min(2, 'Service name must be at least 2 characters'),
  price: z.number().nonnegative('Price must be non-negative'),
  durationMinutes: z.number().int().positive().default(30),
  species: z.array(speciesTypeSchema).optional(),
});
export type ProviderServiceItemInput = z.infer<typeof providerServiceItemSchema>;

/**
 * PRV-1: Provider onboarding registration input schema
 */
export const providerOnboardingSchema = z.object({
  type: providerTypeSchema.default('vet_clinic'),
  name: z
    .string()
    .trim()
    .min(3, 'Provider name must be at least 3 characters')
    .max(100, 'Provider name cannot exceed 100 characters'),
  nameBn: z.string().trim().max(100).optional(),
  phone: z.string().regex(bdPhoneRegex, 'Must be a valid Bangladeshi phone number (+8801XXXXXXXXX)'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  tradeLicenseNo: z.string().trim().max(100).optional().or(z.literal('')),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  address: z
    .string()
    .trim()
    .min(5, 'Address must be at least 5 characters')
    .max(300, 'Address cannot exceed 300 characters'),
  addressBn: z.string().trim().max(300).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  upazilaId: z.number().int().positive().optional(),
  districtId: z.number().int().positive().optional(),
  is24h: z.boolean().default(false),
  hasEmergency: z.boolean().default(false),
  offersHomeVisit: z.boolean().default(false),
  cancelCutoffHours: z.number().int().min(0).max(48).default(2),
  speciesTreated: z.array(speciesTypeSchema).min(1, 'Select at least one treated species'),
  hours: z.array(locationHourSchema).default([]),
  services: z.array(providerServiceItemSchema).default([]),
  documents: z.array(z.string().url('Document URL must be valid')).default([]),
});
export type ProviderOnboardingInput = z.infer<typeof providerOnboardingSchema>;
