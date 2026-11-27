import test from 'node:test';
import assert from 'node:assert';
import {
  getHomeVisitClinics,
  submitHomeVisitRequest,
  calculateHomeVisitFee,
  validateHomeVisitRequest,
} from '../home-visit.ts';

test('SVC-HOME: calculates home visit fees and coverage radius accurately', () => {
  const baseFee = 600;
  // Within radius (4 km <= 8 km)
  const calc1 = calculateHomeVisitFee(baseFee, 4.0, 8.0);
  assert.strictEqual(calc1.isWithinRadius, true);
  // travel fee = max(150, 4.0 * 50 = 200) = 200
  assert.strictEqual(calc1.travelFee, 200);
  assert.strictEqual(calc1.totalFee, 800);

  // Outside radius (12 km > 8 km)
  const calc2 = calculateHomeVisitFee(baseFee, 12.0, 8.0);
  assert.strictEqual(calc2.isWithinRadius, false);
  assert.strictEqual(calc2.travelFee, 600); // 12 * 50 = 600
  assert.strictEqual(calc2.totalFee, 1200);
});

test('SVC-HOME: validates home visit request payload', () => {
  const validPayload = {
    clinicId: '20000000-0000-0000-0000-000000000002',
    locationId: '30000000-0000-0000-0000-000000000002',
    petName: 'Milo',
    petSpecies: 'cat' as const,
    visitDate: '2026-12-25',
    timeSlot: 'morning' as const,
    address: 'House 14, Road 7, Dhanmondi, Dhaka',
    lat: 23.7465,
    lng: 90.3752,
    symptoms: 'High fever, vomiting since yesterday evening',
    phone: '+8801711223344',
    paymentMethod: 'cash' as const,
  };

  const validation = validateHomeVisitRequest(validPayload);
  assert.strictEqual(validation.valid, true);
  assert.strictEqual(validation.errors.length, 0);

  const invalidValidation = validateHomeVisitRequest({ ...validPayload, phone: '', address: 'hi' });
  assert.strictEqual(invalidValidation.valid, false);
  assert.ok(invalidValidation.errors.length >= 2);
});

test('SVC-HOME: fetches home visit clinics near Dhanmondi and verifies slots', async () => {
  const clinics = await getHomeVisitClinics(23.7465, 90.3752);
  assert.ok(clinics.length > 0, 'Should return at least 1 clinic offering home visits');
  assert.strictEqual(clinics[0].isWithinRadius, true);
  assert.ok(clinics[0].slots.length >= 3, 'Must have morning, afternoon, evening slots');
});

test('SVC-HOME: submits a home visit request and generates booking code', async () => {
  const result = await submitHomeVisitRequest({
    clinicId: '20000000-0000-0000-0000-000000000002',
    locationId: '30000000-0000-0000-0000-000000000002',
    petName: 'Milo',
    petSpecies: 'cat',
    visitDate: '2026-12-25',
    timeSlot: 'morning',
    address: 'House 14, Road 7, Dhanmondi, Dhaka',
    lat: 23.7465,
    lng: 90.3752,
    symptoms: 'High fever, lethargic',
    phone: '+8801711223344',
    paymentMethod: 'cash',
  });

  assert.ok(result.bookingId);
  assert.ok(result.code.startsWith('PR-HV-'));
  assert.strictEqual(result.petName, 'Milo');
  assert.strictEqual(result.status, 'pending');
});
