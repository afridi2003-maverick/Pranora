import { describe, it, expect, vi } from 'vitest';
import {
  getAvailableSlots,
  createBooking,
  cancelBooking,
  rescheduleBooking,
} from '../index';
import type { TypedSupabaseClient } from '../../client';

describe('APT-1a: Booking RPC Client and Validation Contract', () => {
  const mockRpc = vi.fn();
  const mockClient = {
    rpc: mockRpc,
  } as unknown as TypedSupabaseClient;

  it('calls available_slots RPC with correct arguments', async () => {
    mockRpc.mockResolvedValueOnce({
      data: {
        mode: 'slot',
        date: '2026-11-20',
        locationId: '22222222-0000-0000-0000-000000000001',
        vetId: '33333333-0000-0000-0000-000000000001',
        slots: [
          {
            startsAt: '2026-11-20T03:00:00Z',
            endsAt: '2026-11-20T03:20:00Z',
            isAvailable: true,
            capacity: 1,
            remainingCapacity: 1,
          },
        ],
      },
      error: null,
    });

    const result = await getAvailableSlots(mockClient, {
      locationId: '22222222-0000-0000-0000-000000000001',
      vetId: '33333333-0000-0000-0000-000000000001',
      date: '2026-11-20',
    });

    expect(mockRpc).toHaveBeenCalledWith('available_slots', {
      p_location_id: '22222222-0000-0000-0000-000000000001',
      p_vet_id: '33333333-0000-0000-0000-000000000001',
      p_date: '2026-11-20',
    });
    expect(result.mode).toBe('slot');
    expect(result.slots?.[0].isAvailable).toBe(true);
  });

  it('calls create_booking RPC with correct arguments and handles result', async () => {
    mockRpc.mockResolvedValueOnce({
      data: {
        bookingId: '55555555-0000-0000-0000-000000000001',
        code: 'PRN-ABC123',
        status: 'pending',
        serialNo: null,
        startsAt: '2026-11-20T03:00:00Z',
      },
      error: null,
    });

    const result = await createBooking(mockClient, {
      locationId: '22222222-0000-0000-0000-000000000001',
      vetId: '33333333-0000-0000-0000-000000000001',
      providerServiceId: '44444444-0000-0000-0000-000000000001',
      type: 'slot',
      startsAt: '2026-11-20T03:00:00Z',
      attachments: [],
      paymentMethod: 'cash',
    });

    expect(mockRpc).toHaveBeenCalledWith('create_booking', {
      p_pet_id: null,
      p_location_id: '22222222-0000-0000-0000-000000000001',
      p_vet_id: '33333333-0000-0000-0000-000000000001',
      p_provider_service_id: '44444444-0000-0000-0000-000000000001',
      p_type: 'slot',
      p_starts_at: '2026-11-20T03:00:00Z',
      p_ends_at: null,
      p_serial_no: null,
      p_address_id: null,
      p_problem_note: null,
      p_attachments: [],
      p_payment_method: 'cash',
    });
    expect(result.code).toBe('PRN-ABC123');
    expect(result.status).toBe('pending');
  });

  it('calls cancel_booking RPC with correct arguments', async () => {
    mockRpc.mockResolvedValueOnce({
      data: { success: true, message: 'Booking cancelled successfully' },
      error: null,
    });

    const result = await cancelBooking(mockClient, {
      bookingId: '55555555-0000-0000-0000-000000000001',
      reason: 'Pet is feeling better',
    });

    expect(mockRpc).toHaveBeenCalledWith('cancel_booking', {
      p_booking_id: '55555555-0000-0000-0000-000000000001',
      p_reason: 'Pet is feeling better',
    });
    expect(result.success).toBe(true);
  });

  it('calls reschedule_booking RPC with correct arguments', async () => {
    mockRpc.mockResolvedValueOnce({
      data: { success: true, message: 'Booking rescheduled successfully' },
      error: null,
    });

    const result = await rescheduleBooking(mockClient, {
      bookingId: '55555555-0000-0000-0000-000000000001',
      startsAt: '2026-11-21T03:00:00Z',
      reason: 'Schedule conflict',
    });

    expect(mockRpc).toHaveBeenCalledWith('reschedule_booking', {
      p_booking_id: '55555555-0000-0000-0000-000000000001',
      p_starts_at: '2026-11-21T03:00:00Z',
      p_ends_at: null,
      p_serial_no: null,
      p_reason: 'Schedule conflict',
    });
    expect(result.success).toBe(true);
  });

  it('throws an error when RPC returns an error', async () => {
    mockRpc.mockResolvedValueOnce({
      data: null,
      error: { message: 'Selected slot is no longer available' },
    });

    await expect(
      createBooking(mockClient, {
        locationId: '22222222-0000-0000-0000-000000000001',
        providerServiceId: '44444444-0000-0000-0000-000000000001',
        type: 'slot',
        startsAt: '2026-11-20T03:00:00Z',
        attachments: [],
        paymentMethod: 'cash',
      })
    ).rejects.toThrow('Failed to create booking: Selected slot is no longer available');
  });
});
