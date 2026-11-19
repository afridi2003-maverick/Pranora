import { z } from 'zod';
import { bdPhoneRegex } from './common';
import { speciesTypeSchema } from './map';

/**
 * PRV-3: Shelter onboarding registration input schema
 */
export const shelterOnboardingSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, 'Shelter name must be at least 3 characters')
    .max(100, 'Shelter name cannot exceed 100 characters'),
  nameBn: z.string().trim().max(100).optional(),
  phone: z.string().regex(bdPhoneRegex, 'Must be a valid Bangladeshi phone number (+8801XXXXXXXXX)'),
  email: z.string().email('Invalid email address').optional(),
  divisionId: z.number().int().positive().optional(),
  districtId: z.number().int().positive().optional(),
  upazilaId: z.number().int().positive().optional(),
  address: z
    .string()
    .trim()
    .min(5, 'Address must be at least 5 characters')
    .max(300, 'Address cannot exceed 300 characters'),
  addressBn: z.string().trim().max(300).optional(),
  capacity: z
    .number()
    .int('Capacity must be an integer')
    .positive('Capacity must be greater than zero')
    .default(50),
  supportedSpecies: z.array(speciesTypeSchema).min(1, 'Select at least one species supported'),
  emergencyIntake: z.boolean().default(true),
  documents: z.array(z.string().url('Document must be a valid URL')).default([]),
});
export type ShelterOnboardingInput = z.infer<typeof shelterOnboardingSchema>;

/**
 * Shelter admission schema (moving a reported/rescued animal into shelter care)
 */
export const shelterAnimalAdmitSchema = z.object({
  reportId: z.string().uuid('Invalid report ID'),
  shelterId: z.string().uuid('Invalid shelter ID'),
  initialNotes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
});
export type ShelterAnimalAdmitInput = z.infer<typeof shelterAnimalAdmitSchema>;

/**
 * Shelter Dashboard metrics schema
 */
export const shelterDashboardStatsSchema = z.object({
  totalCapacity: z.number().int().nonnegative(),
  currentOccupancy: z.number().int().nonnegative(),
  pendingQueueCount: z.number().int().nonnegative(),
  activeCasesCount: z.number().int().nonnegative(),
  availableListingsCount: z.number().int().nonnegative(),
  pendingApplicationsCount: z.number().int().nonnegative(),
});
export type ShelterDashboardStats = z.infer<typeof shelterDashboardStatsSchema>;
