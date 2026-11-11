import { z } from 'zod';

/**
 * Bangladesh phone number format: +8801XXXXXXXXX
 */
export const bdPhoneRegex = /^\+8801[3-9]\d{8}$/;

export const phoneSchema = z
  .string()
  .trim()
  .regex(bdPhoneRegex, {
    message: 'Must be a valid Bangladeshi mobile number (+8801XXXXXXXXX)',
  });

export const emailSchema = z.string().trim().email({
  message: 'Must be a valid email address',
});

export const coordinateSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

export const paginationSchema = z.object({
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
});

