import test from 'node:test';
import assert from 'node:assert';
import {
  calculateGroomingPrice,
  getGroomingSalons,
  submitGroomingBooking,
  GROOMING_PACKAGES,
} from '../grooming.ts';

test('SVC-GRM: calculates grooming prices with size surcharge and addons accurately', () => {
  // Small dog with basic bath & brush (no addons)
  const calc1 = calculateGroomingPrice('bath_brush', 'small', []);
  assert.strictEqual(calc1.basePrice, 500);
  assert.strictEqual(calc1.sizeSurcharge, 0);
  assert.strictEqual(calc1.addonsTotal, 0);
  assert.strictEqual(calc1.totalAmount, 500);

  // Large dog (+400 BDT) with full groom (1200 BDT) + fur deshedding (250 BDT) + teeth (200 BDT)
  // Total = 1200 + 400 + 450 = 2050 BDT
  const calc2 = calculateGroomingPrice('full_groom', 'large', ['fur_deshedding', 'teeth_cleaning']);
  assert.strictEqual(calc2.basePrice, 1200);
  assert.strictEqual(calc2.sizeSurcharge, 400);
  assert.strictEqual(calc2.addonsTotal, 450);
  assert.strictEqual(calc2.totalAmount, 2050);
});

test('SVC-GRM: retrieves grooming packages and available salons', async () => {
  assert.strictEqual(GROOMING_PACKAGES.length, 4);

  const salons = await getGroomingSalons(23.7465, 90.3752);
  assert.ok(salons.length > 0, 'Should return salons');
  assert.ok(salons[0].availableSlots.length >= 3, 'Must have available slots');
});

test('SVC-GRM: submits grooming booking and returns confirmation code', async () => {
  const result = await submitGroomingBooking({
    clinicId: '20000000-0000-0000-0000-000000000002',
    locationId: '30000000-0000-0000-0000-000000000002',
    petName: 'Tommy',
    petSpecies: 'dog',
    petSize: 'medium',
    packageType: 'full_groom',
    appointmentDate: '2026-12-28',
    appointmentTime: '11:30',
    phone: '+8801811223344',
    specialInstructions: 'Nail trim gently',
    addons: ['teeth_cleaning'],
  });

  assert.ok(result.bookingId);
  assert.ok(result.code.startsWith('PR-GRM-'));
  assert.strictEqual(result.petName, 'Tommy');
  // 1200 + 200 (medium) + 200 (teeth) = 1600 BDT
  assert.strictEqual(result.totalAmount, 1600);
  assert.strictEqual(result.status, 'pending');
});
