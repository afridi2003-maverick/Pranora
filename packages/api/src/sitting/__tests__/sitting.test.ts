import {
  listSitters,
  getSitterById,
  createSittingBooking,
  listMySittingBookings,
  cancelSittingBooking,
} from '../index';

describe('SVC-SIT: Pet Sitting & Dog Walking Service', () => {
  it('lists verified sitters with fallback', async () => {
    const sitters = await listSitters();
    expect(sitters.length).toBeGreaterThanOrEqual(4);
    expect(sitters.every((s) => s.is_verified)).toBe(true);
  });

  it('filters sitters by service type (e.g. dog_walking)', async () => {
    const walkers = await listSitters(null, { service_type: 'dog_walking' });
    expect(walkers.length).toBeGreaterThan(0);
    expect(walkers.every((w) => w.service_types.includes('dog_walking'))).toBe(true);
  });

  it('filters sitters by area (e.g. ধানমন্ডি)', async () => {
    const dhanmondiSitters = await listSitters(null, { area: 'ধানমন্ডি' });
    expect(dhanmondiSitters.length).toBeGreaterThan(0);
    expect(dhanmondiSitters.some((s) => s.areas.some((a) => a.includes('ধানমন্ডি')))).toBe(true);
  });

  it('retrieves sitter by ID', async () => {
    const sitter = await getSitterById(null, 'e1111111-1111-1111-1111-111111111111');
    expect(sitter).not.toBeNull();
    expect(sitter?.full_name_en).toBe('Tanvir Ahmed');
  });

  it('creates and cancels a sitting booking', async () => {
    const res = await createSittingBooking(
      null,
      {
        sitter_id: 'e1111111-1111-1111-1111-111111111111',
        service_type: 'sitting_hourly',
        start_date: '2026-11-25',
        start_time: '10:00 AM',
        duration_hours: 3,
        payment_method: 'cash',
        address: 'House 12, Road 4, Dhanmondi',
      },
      'test-owner-id'
    );

    expect(res.data).not.toBeNull();
    expect(res.data?.duration_hours).toBe(3);
    expect(res.data?.total_price).toBe(3 * 350); // 3 * 350 hourly rate
    expect(res.data?.status).toBe('pending');

    const bookingId = res.data!.id;
    const myBookings = await listMySittingBookings(null, 'test-owner-id');
    expect(myBookings.some((b) => b.id === bookingId)).toBe(true);

    const cancelRes = await cancelSittingBooking(null, bookingId, 'test-owner-id');
    expect(cancelRes.success).toBe(true);
  });
});
