import { z } from 'zod';

/**
 * Booking types according to schema.md
 */
export const bookingTypeSchema = z.enum([
  'slot',
  'serial',
  'home_visit',
  'online',
  'date_range',
  'order',
  'instant',
  'listing',
]);
export type BookingType = z.infer<typeof bookingTypeSchema>;

/**
 * Booking lifecycle status
 */
export const bookingStatusSchema = z.enum([
  'pending',
  'confirmed',
  'in_progress',
  'completed',
  'cancelled_by_owner',
  'cancelled_by_provider',
  'no_show',
  'expired',
]);
export type BookingStatus = z.infer<typeof bookingStatusSchema>;

/**
 * Provider schedule mode
 */
export const scheduleModeSchema = z.enum(['slot', 'serial']);
export type ScheduleMode = z.infer<typeof scheduleModeSchema>;

/**
 * Payment method for booking
 */
export const paymentMethodSchema = z.enum([
  'cash',
  'bkash',
  'nagad',
  'rocket',
  'card',
]);
export type PaymentMethod = z.infer<typeof paymentMethodSchema>;

/**
 * Payment status for booking
 */
export const paymentStatusSchema = z.enum([
  'pending',
  'paid',
  'failed',
  'refunded',
]);
export type PaymentStatus = z.infer<typeof paymentStatusSchema>;

/**
 * Date regex in YYYY-MM-DD format
 */
export const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Query schema for fetching available slots or serials for a given day
 */
export const getAvailableSlotsSchema = z.object({
  locationId: z.string().uuid('Invalid location ID'),
  vetId: z.string().uuid('Invalid vet ID').optional(),
  date: z.string().regex(isoDateRegex, 'Date must be formatted as YYYY-MM-DD'),
});
export type GetAvailableSlotsInput = z.infer<typeof getAvailableSlotsSchema>;

/**
 * Input schema for creating a new booking (create_booking RPC)
 */
export const createBookingSchema = z.object({
  petId: z.string().uuid('Invalid pet ID').optional(),
  locationId: z.string().uuid('Invalid location ID'),
  vetId: z.string().uuid('Invalid vet ID').optional(),
  providerServiceId: z.string().uuid('Invalid provider service ID'),
  type: bookingTypeSchema,
  startsAt: z.string().datetime({ offset: true }).optional(),
  endsAt: z.string().datetime({ offset: true }).optional(),
  serialNo: z.number().int().positive().optional(),
  addressId: z.string().uuid('Invalid address ID').optional(),
  problemNote: z.string().max(1000, 'Problem note cannot exceed 1000 characters').optional(),
  attachments: z.array(z.string().url('Attachment must be a valid URL')).default([]),
  paymentMethod: paymentMethodSchema.default('cash'),
});
export type CreateBookingInput = z.infer<typeof createBookingSchema>;

/**
 * Input schema for cancelling an existing booking (cancel_booking RPC)
 */
export const cancelBookingSchema = z.object({
  bookingId: z.string().uuid('Invalid booking ID'),
  reason: z
    .string()
    .trim()
    .min(3, 'Cancel reason must be at least 3 characters')
    .max(500, 'Cancel reason cannot exceed 500 characters'),
});
export type CancelBookingInput = z.infer<typeof cancelBookingSchema>;

/**
 * Input schema for rescheduling an existing booking (reschedule_booking RPC)
 */
export const rescheduleBookingSchema = z.object({
  bookingId: z.string().uuid('Invalid booking ID'),
  startsAt: z.string().datetime({ offset: true }),
  endsAt: z.string().datetime({ offset: true }).optional(),
  serialNo: z.number().int().positive().optional(),
  reason: z.string().max(500, 'Reschedule reason cannot exceed 500 characters').optional(),
});
export type RescheduleBookingInput = z.infer<typeof rescheduleBookingSchema>;

/**
 * Valid state transitions for the booking lifecycle
 */
export const VALID_STATUS_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  pending: ['confirmed', 'cancelled_by_provider', 'cancelled_by_owner', 'expired'],
  confirmed: ['in_progress', 'completed', 'cancelled_by_provider', 'cancelled_by_owner', 'no_show'],
  in_progress: ['completed', 'cancelled_by_provider'],
  completed: [],
  cancelled_by_owner: [],
  cancelled_by_provider: [],
  no_show: [],
  expired: [],
};

/**
 * Returns true if a state transition is permitted by the lifecycle state machine
 */
export function isValidBookingStatusTransition(
  from: BookingStatus,
  to: BookingStatus
): boolean {
  if (from === to) return true;
  return VALID_STATUS_TRANSITIONS[from]?.includes(to) ?? false;
}

/**
 * Input schema for updating a booking's status (update_booking_status RPC)
 */
export const updateBookingStatusSchema = z.object({
  bookingId: z.string().uuid('Invalid booking ID'),
  status: bookingStatusSchema,
  reason: z.string().max(500, 'Reason cannot exceed 500 characters').optional(),
});
export type UpdateBookingStatusInput = z.infer<typeof updateBookingStatusSchema>;

/**
 * Integration Contract 6: Route params for entering booking flow (/book)
 * Route contract: /book?locationId=&vetId=&serviceId=
 */
export const bookingRouteParamsSchema = z.object({
  locationId: z.string().uuid('Invalid location ID').optional(),
  vetId: z.string().uuid('Invalid vet ID').optional(),
  serviceId: z.string().uuid('Invalid service ID').optional(),
  bookingType: bookingTypeSchema.optional(),
  date: z.string().regex(isoDateRegex, 'Date must be formatted as YYYY-MM-DD').optional(),
});
export type BookingRouteParams = z.infer<typeof bookingRouteParamsSchema>;

