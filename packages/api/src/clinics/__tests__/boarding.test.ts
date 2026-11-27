import test from 'node:test';
import assert from 'node:assert';
import {
  calculateBoardingCost,
  getBoardingHostels,
  submitBoardingBooking,
  BOARDING_ROOM_TYPES,
} from '../boarding.ts';

test('SVC-BRD: calculates boarding costs accurately across date ranges and room tiers', () => {
  // 3 nights in Standard Kennel (600 BDT/night)
  // Subtotal = 3 * 600 = 1800 BDT
  // Food & care = 3 * 150 = 450 BDT
  // Total = 2250 BDT
  const calc1 = calculateBoardingCost('2026-12-01', '2026-12-04', 'standard_kennel');
  assert.strictEqual(calc1.nights, 3);
  assert.strictEqual(calc1.subtotal, 1800);
  assert.strictEqual(calc1.foodAndCareFee, 450);
  assert.strictEqual(calc1.totalAmount, 2250);

  // 5 nights in VIP Suite (1500 BDT/night)
  // Subtotal = 5 * 1500 = 7500 BDT
  // Food & care = 5 * 150 = 750 BDT
  // Total = 8250 BDT
  const calc2 = calculateBoardingCost('2026-12-10', '2026-12-15', 'vip_suite');
  assert.strictEqual(calc2.nights, 5);
  assert.strictEqual(calc2.subtotal, 7500);
  assert.strictEqual(calc2.foodAndCareFee, 750);
  assert.strictEqual(calc2.totalAmount, 8250);
});

test('SVC-BRD: retrieves boarding hostels and room types', async () => {
  assert.strictEqual(BOARDING_ROOM_TYPES.length, 3);

  const hostels = await getBoardingHostels(23.7465, 90.3752);
  assert.ok(hostels.length > 0, 'Should return boarding hostels');
  assert.ok(hostels[0].roomTypes.length >= 3, 'Must support 3 room types');
});

test('SVC-BRD: validates vaccination requirement and submits boarding reservation', async () => {
  // Must reject unvaccinated pet
  await assert.rejects(
    async () => {
      await submitBoardingBooking({
        clinicId: '20000000-0000-0000-0000-000000000002',
        locationId: '30000000-0000-0000-0000-000000000002',
        petName: 'Rocky',
        petSpecies: 'dog',
        checkInDate: '2026-12-20',
        checkOutDate: '2026-12-23',
        roomType: 'deluxe_ac',
        vaccinationUpToDate: false, // Not vaccinated!
        emergencyContact: '+8801700000000',
        phone: '+8801711223344',
      });
    },
    /Pets must be vaccinated/
  );

  // Valid submission with vaccinated pet
  const result = await submitBoardingBooking({
    clinicId: '20000000-0000-0000-0000-000000000002',
    locationId: '30000000-0000-0000-0000-000000000002',
    petName: 'Rocky',
    petSpecies: 'dog',
    checkInDate: '2026-12-20',
    checkOutDate: '2026-12-23',
    roomType: 'deluxe_ac',
    vaccinationUpToDate: true,
    emergencyContact: '+8801700000000',
    phone: '+8801711223344',
  });

  assert.ok(result.bookingId);
  assert.ok(result.code.startsWith('PR-BRD-'));
  assert.strictEqual(result.nights, 3);
  // Deluxe AC = 3 * 1000 + 3 * 150 = 3450 BDT
  assert.strictEqual(result.totalAmount, 3450);
  assert.strictEqual(result.status, 'pending');
});
