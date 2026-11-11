import { z } from 'zod';
import { phoneSchema, emailSchema } from './common';

export const sendPhoneOtpSchema = z.object({
  phone: phoneSchema,
});

export const verifyPhoneOtpSchema = z.object({
  phone: phoneSchema,
  token: z.string().length(6, { message: 'OTP must be 6 digits' }),
});

export const sendEmailOtpSchema = z.object({
  email: emailSchema,
});

export const verifyEmailOtpSchema = z.object({
  email: emailSchema,
  token: z.string().length(6, { message: 'OTP must be 6 digits' }),
});

export const userRoleEnum = z.enum([
  'owner',
  'rescuer',
  'shelter',
  'adoption_lister',
  'vet',
  'provider',
  'admin',
]);

export const requestRoleSchema = z.object({
  role: userRoleEnum.refine((r) => r !== 'owner' && r !== 'admin', {
    message: 'Cannot request owner or admin role directly',
  }),
  document_urls: z.array(z.string().url()).optional(),
  notes: z.string().max(500).optional(),
});

