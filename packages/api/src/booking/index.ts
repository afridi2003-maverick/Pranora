export {
  checkCancellationCutoff,
  CANCELLATION_REASONS,
} from '@pranora/validation';
export type {
  BookingType,
  BookingStatus,
  ScheduleMode,
  PaymentMethod,
  PaymentStatus,
  GetAvailableSlotsInput,
  CreateBookingInput,
  CancelBookingInput,
  RescheduleBookingInput,
  UpdateBookingStatusInput,
  RecordCashPaymentInput,
  ScheduleRule,
  AvailabilityException,
  SaveScheduleInput,
  AddExceptionInput,
  ReminderWindow,
  BookingReminderStatus,
  ReminderChannel,
  ScheduleBookingRemindersInput,
} from '@pranora/validation';
import type {
  BookingType,
  BookingStatus,
  ScheduleMode,
  PaymentMethod,
  PaymentStatus,
  GetAvailableSlotsInput,
  CreateBookingInput,
  CancelBookingInput,
  RescheduleBookingInput,
  UpdateBookingStatusInput,
  RecordCashPaymentInput,
  ScheduleRule,
  AvailabilityException,
  SaveScheduleInput,
  AddExceptionInput,
  ReminderWindow,
  BookingReminderStatus,
  ReminderChannel,
  ScheduleBookingRemindersInput,
} from '@pranora/validation';
import type { TypedSupabaseClient } from '../client';

export interface AvailableSlot {
  startsAt: string;
  endsAt: string;
  isAvailable: boolean;
  capacity: number;
  remainingCapacity: number;
}

export interface AvailableSerial {
  serialNo: number;
  sessionStart: string;
  sessionEnd: string;
  isAvailable: boolean;
}

export interface AvailableSlotsResponse {
  mode: ScheduleMode;
  date: string;
  locationId: string;
  vetId?: string | null;
  slots?: AvailableSlot[];
  serials?: AvailableSerial[];
  nextAvailableSerial?: number | null;
}

export interface BookingDetails {
  id: string;
  code: string;
  ownerId: string;
  petId?: string | null;
  locationId: string;
  vetId?: string | null;
  providerServiceId: string;
  type: BookingType;
  status: BookingStatus;
  startsAt?: string | null;
  endsAt?: string | null;
  serialNo?: number | null;
  addressId?: string | null;
  problemNote?: string | null;
  attachments: string[];
  price?: number | null;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  cancelReason?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookingResult {
  bookingId: string;
  code: string;
  status: BookingStatus;
  serialNo?: number | null;
  startsAt?: string | null;
}

export interface BookingActionResponse {
  success: boolean;
  message?: string;
}

/**
 * Integration Contract 7: Booking RPC Client
 * Fetches available time slots or serial numbers for a given location, vet, and date.
 */
export async function getAvailableSlots(
  client: TypedSupabaseClient,
  params: GetAvailableSlotsInput
): Promise<AvailableSlotsResponse> {
  const { data, error } = await (client.rpc as unknown as (
    fn: string,
    args: Record<string, unknown>
  ) => Promise<{ data: unknown; error: { message: string } | null }>)(
    'available_slots',
    {
      p_location_id: params.locationId,
      p_vet_id: params.vetId ?? null,
      p_date: params.date,
    }
  );

  if (error) {
    throw new Error(`Failed to fetch available slots: ${error.message}`);
  }

  return data as AvailableSlotsResponse;
}

/**
 * Integration Contract 7: Create booking RPC
 * Validates slot or assigns next serial atomically, inserts booking with code.
 */
export async function createBooking(
  client: TypedSupabaseClient,
  input: CreateBookingInput
): Promise<CreateBookingResult> {
  const { data, error } = await (client.rpc as unknown as (
    fn: string,
    args: Record<string, unknown>
  ) => Promise<{ data: unknown; error: { message: string } | null }>)(
    'create_booking',
    {
      p_pet_id: input.petId ?? null,
      p_location_id: input.locationId,
      p_vet_id: input.vetId ?? null,
      p_provider_service_id: input.providerServiceId,
      p_type: input.type,
      p_starts_at: input.startsAt ?? null,
      p_ends_at: input.endsAt ?? null,
      p_serial_no: input.serialNo ?? null,
      p_address_id: input.addressId ?? null,
      p_problem_note: input.problemNote ?? null,
      p_attachments: input.attachments ?? [],
      p_payment_method: input.paymentMethod,
    }
  );

  if (error) {
    throw new Error(`Failed to create booking: ${error.message}`);
  }

  return data as CreateBookingResult;
}

/**
 * Integration Contract 7: Cancel booking RPC
 * Cancels booking if within provider_locations.cancel_cutoff_hours.
 */
export async function cancelBooking(
  client: TypedSupabaseClient,
  input: CancelBookingInput
): Promise<BookingActionResponse> {
  const { data, error } = await (client.rpc as unknown as (
    fn: string,
    args: Record<string, unknown>
  ) => Promise<{ data: unknown; error: { message: string } | null }>)(
    'cancel_booking',
    {
      p_booking_id: input.bookingId,
      p_reason: input.reason,
    }
  );

  if (error) {
    throw new Error(`Failed to cancel booking: ${error.message}`);
  }

  return (data as BookingActionResponse) ?? { success: true };
}

/**
 * Integration Contract 7: Reschedule booking RPC
 * Reschedules booking if within cutoff window and target slot/serial is available.
 */
export async function rescheduleBooking(
  client: TypedSupabaseClient,
  input: RescheduleBookingInput
): Promise<BookingActionResponse> {
  const { data, error } = await (client.rpc as unknown as (
    fn: string,
    args: Record<string, unknown>
  ) => Promise<{ data: unknown; error: { message: string } | null }>)(
    'reschedule_booking',
    {
      p_booking_id: input.bookingId,
      p_starts_at: input.startsAt,
      p_ends_at: input.endsAt ?? null,
      p_serial_no: input.serialNo ?? null,
      p_reason: input.reason ?? null,
    }
  );

  if (error) {
    throw new Error(`Failed to reschedule booking: ${error.message}`);
  }

  return (data as BookingActionResponse) ?? { success: true };
}

/**
 * Fetches a single booking by ID
 */
export async function getBookingById(
  client: TypedSupabaseClient,
  bookingId: string
): Promise<BookingDetails | null> {
  const { data, error } = await client
    .from('bookings')
    .select('*')
    .eq('id', bookingId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(`Failed to fetch booking: ${error.message}`);
  }

  return data as unknown as BookingDetails;
}

/**
 * Lists bookings for the currently authenticated owner
 */
export async function listUserBookings(
  client: TypedSupabaseClient,
  params?: {
    status?: BookingStatus;
    limit?: number;
    offset?: number;
  }
): Promise<BookingDetails[]> {
  let query = client
    .from('bookings')
    .select('*')
    .order('starts_at', { ascending: false });

  if (params?.status) {
    query = query.eq('status', params.status);
  }

  if (params?.limit) {
    query = query.limit(params.limit);
  }

  if (params?.offset) {
    query = query.range(params.offset, params.offset + (params.limit ?? 20) - 1);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to list bookings: ${error.message}`);
  }

  return (data ?? []) as unknown as BookingDetails[];
}

/**
 * APT-2: Update booking status via update_booking_status RPC
 * Validates lifecycle state machine transition.
 */
export async function updateBookingStatus(
  client: TypedSupabaseClient,
  input: UpdateBookingStatusInput
): Promise<BookingActionResponse> {
  const { data, error } = await (client.rpc as unknown as (
    fn: string,
    args: Record<string, unknown>
  ) => Promise<{ data: unknown; error: { message: string } | null }>)(
    'update_booking_status',
    {
      p_booking_id: input.bookingId,
      p_status: input.status,
      p_reason: input.reason ?? null,
    }
  );

  if (error) {
    throw new Error(`Failed to update booking status: ${error.message}`);
  }

  return (data as BookingActionResponse) ?? { success: true };
}

/**
 * APT-2: Provider confirms a pending booking
 */
export async function confirmBooking(
  client: TypedSupabaseClient,
  bookingId: string
): Promise<BookingActionResponse> {
  return updateBookingStatus(client, {
    bookingId,
    status: 'confirmed',
  });
}

/**
 * APT-2: Provider declines/rejects a pending booking with a reason
 */
export async function rejectBooking(
  client: TypedSupabaseClient,
  bookingId: string,
  reason: string
): Promise<BookingActionResponse> {
  return updateBookingStatus(client, {
    bookingId,
    status: 'cancelled_by_provider',
    reason,
  });
}

/**
 * APT-2: Provider/vet marks pet owner checked in / consultation in progress
 */
export async function startConsultation(
  client: TypedSupabaseClient,
  bookingId: string
): Promise<BookingActionResponse> {
  return updateBookingStatus(client, {
    bookingId,
    status: 'in_progress',
  });
}

/**
 * APT-2: Provider/vet marks appointment completed
 */
export async function completeBooking(
  client: TypedSupabaseClient,
  bookingId: string
): Promise<BookingActionResponse> {
  return updateBookingStatus(client, {
    bookingId,
    status: 'completed',
  });
}

/**
 * APT-2: Provider/vet marks pet owner as no-show
 */
export async function markNoShow(
  client: TypedSupabaseClient,
  bookingId: string
): Promise<BookingActionResponse> {
  return updateBookingStatus(client, {
    bookingId,
    status: 'no_show',
  });
}

/**
 * Lists bookings for a provider location (for clinic/vet staff)
 */
export async function listProviderBookings(
  client: TypedSupabaseClient,
  locationId: string,
  params?: {
    status?: BookingStatus;
    date?: string;
    limit?: number;
    offset?: number;
  }
): Promise<BookingDetails[]> {
  let query = client
    .from('bookings')
    .select('*')
    .eq('location_id', locationId)
    .order('starts_at', { ascending: true });

  if (params?.status) {
    query = query.eq('status', params.status);
  }

  if (params?.date) {
    const dayStart = `${params.date}T00:00:00.000Z`;
    const dayEnd = `${params.date}T23:59:59.999Z`;
    query = query.gte('starts_at', dayStart).lte('starts_at', dayEnd);
  }

  if (params?.limit) {
    query = query.limit(params.limit);
  }

  if (params?.offset) {
    query = query.range(params.offset, params.offset + (params.limit ?? 50) - 1);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to list provider bookings: ${error.message}`);
  }

  return (data ?? []) as unknown as BookingDetails[];
}

/**
 * PAY-1: Record cash payment at clinic reception via record_cash_payment RPC
 */
export async function recordCashPayment(
  client: TypedSupabaseClient,
  input: RecordCashPaymentInput
): Promise<BookingActionResponse> {
  const { data, error } = await (client.rpc as unknown as (
    fn: string,
    args: Record<string, unknown>
  ) => Promise<{ data: unknown; error: { message: string } | null }>)(
    'record_cash_payment',
    {
      p_booking_id: input.bookingId,
      p_amount: input.amount ?? null,
    }
  );

  if (error) {
    throw new Error(`Failed to record cash payment: ${error.message}`);
  }

  return (data as BookingActionResponse) ?? { success: true };
}

/**
 * PAY-1: Mark a booking as paid in cash at clinic reception
 */
export async function markBookingPaid(
  client: TypedSupabaseClient,
  bookingId: string,
  amount?: number
): Promise<BookingActionResponse> {
  return recordCashPayment(client, {
    bookingId,
    amount,
  });
}

/**
 * APT-6: Get vet schedule (weekly rules + upcoming holiday exceptions)
 */
export async function getVetSchedule(
  client: TypedSupabaseClient,
  locationId: string,
  vetId?: string | null
): Promise<{ rules: ScheduleRule[]; exceptions: AvailabilityException[] }> {
  const { data, error } = await (client.rpc as unknown as (
    fn: string,
    args: Record<string, unknown>
  ) => Promise<{ data: any; error: { message: string } | null }>)(
    'get_vet_schedule',
    {
      p_location_id: locationId,
      p_vet_id: vetId ?? null,
    }
  );

  if (error) {
    throw new Error(`Failed to get vet schedule: ${error.message}`);
  }

  return (
    data ?? {
      rules: [],
      exceptions: [],
    }
  );
}

/**
 * APT-6: Save/replace weekly schedule rules
 */
export async function saveScheduleRules(
  client: TypedSupabaseClient,
  input: SaveScheduleInput
): Promise<{ success: boolean; rulesSaved: number }> {
  const { data, error } = await (client.rpc as unknown as (
    fn: string,
    args: Record<string, unknown>
  ) => Promise<{ data: any; error: { message: string } | null }>)(
    'save_schedule_rules',
    {
      p_location_id: input.locationId,
      p_vet_id: input.vetId ?? null,
      p_rules: input.rules,
    }
  );

  if (error) {
    throw new Error(`Failed to save schedule rules: ${error.message}`);
  }

  return data ?? { success: true, rulesSaved: input.rules.length };
}

/**
 * APT-6: Add an availability exception (holiday or day-off)
 */
export async function addAvailabilityException(
  client: TypedSupabaseClient,
  input: AddExceptionInput
): Promise<{ success: boolean; id: string; date: string; isClosed: boolean; note?: string }> {
  const { data, error } = await (client.rpc as unknown as (
    fn: string,
    args: Record<string, unknown>
  ) => Promise<{ data: any; error: { message: string } | null }>)(
    'add_availability_exception',
    {
      p_location_id: input.locationId,
      p_vet_id: input.vetId ?? null,
      p_date: input.date,
      p_is_closed: input.isClosed ?? true,
      p_note: input.note ?? null,
    }
  );

  if (error) {
    throw new Error(`Failed to add availability exception: ${error.message}`);
  }

  return data ?? { success: true, id: 'mock-exc-id', date: input.date, isClosed: true };
}

/**
 * APT-6: Delete an availability exception
 */
export async function deleteAvailabilityException(
  client: TypedSupabaseClient,
  exceptionId: string
): Promise<{ success: boolean; deletedId: string }> {
  const { data, error } = await (client.rpc as unknown as (
    fn: string,
    args: Record<string, unknown>
  ) => Promise<{ data: any; error: { message: string } | null }>)(
    'delete_availability_exception',
    {
      p_exception_id: exceptionId,
    }
  );

  if (error) {
    throw new Error(`Failed to delete availability exception: ${error.message}`);
  }

  return data ?? { success: true, deletedId: exceptionId };
}

/**
 * APT-4: Booking Reminder (24h / 1h)
 */
export interface BookingReminderItem {
  id: string;
  bookingId: string;
  reminderWindow: ReminderWindow;
  remindAt: string;
  sentAt?: string;
  status: BookingReminderStatus;
  channel: ReminderChannel;
  clinicName?: string;
  petName?: string;
  appointmentAt?: string;
}

export async function getBookingReminders(
  _client: TypedSupabaseClient,
  bookingId?: string
): Promise<BookingReminderItem[]> {
  const tomorrow = new Date(Date.now() + 26 * 3600 * 1000).toISOString();
  const sample: BookingReminderItem[] = [
    {
      id: 'br-001',
      bookingId: bookingId ?? '550e8400-e29b-41d4-a716-446655440001',
      reminderWindow: '24h',
      remindAt: new Date(Date.now() + 2 * 3600 * 1000).toISOString(),
      status: 'pending',
      channel: 'both',
      clinicName: 'PranoraCare Veterinary Clinic, Dhanmondi',
      petName: 'মতি (Moti)',
      appointmentAt: tomorrow,
    },
    {
      id: 'br-002',
      bookingId: bookingId ?? '550e8400-e29b-41d4-a716-446655440001',
      reminderWindow: '1h',
      remindAt: new Date(Date.now() + 25 * 3600 * 1000).toISOString(),
      status: 'pending',
      channel: 'both',
      clinicName: 'PranoraCare Veterinary Clinic, Dhanmondi',
      petName: 'মতি (Moti)',
      appointmentAt: tomorrow,
    },
  ];
  return bookingId ? sample.filter((r) => r.bookingId === bookingId) : sample;
}

export async function scheduleBookingReminders(
  _client: TypedSupabaseClient,
  input: ScheduleBookingRemindersInput
): Promise<BookingReminderItem[]> {
  const scheduled = new Date(input.scheduledAt).getTime();
  const result: BookingReminderItem[] = [];

  if (input.enable24h) {
    result.push({
      id: `br-24h-${Date.now()}`,
      bookingId: input.bookingId,
      reminderWindow: '24h',
      remindAt: new Date(scheduled - 24 * 3600 * 1000).toISOString(),
      status: 'pending',
      channel: input.channel,
      appointmentAt: input.scheduledAt,
    });
  }

  if (input.enable1h) {
    result.push({
      id: `br-1h-${Date.now()}`,
      bookingId: input.bookingId,
      reminderWindow: '1h',
      remindAt: new Date(scheduled - 1 * 3600 * 1000).toISOString(),
      status: 'pending',
      channel: input.channel,
      appointmentAt: input.scheduledAt,
    });
  }

  return result;
}

export async function cancelBookingReminders(
  _client: TypedSupabaseClient,
  bookingId: string
): Promise<{ success: boolean; bookingId: string }> {
  return { success: true, bookingId };
}


