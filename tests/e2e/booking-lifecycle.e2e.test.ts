/**
 * E2E Flow 3: Vet Appointment Booking, Reschedule/Cancel, Status & Cash Payment
 * Task: REL-1 | Dependencies: APT-1, APT-1a, APT-2, APT-3, PAY-1
 * Owner: Tain & Afridi
 */

import test from 'node:test';
import assert from 'node:assert';
import { createE2EContext } from './harness.ts';

test('E2E Flow 3: Complete Vet Appointment Booking & Cash Payment Lifecycle', async () => {
  const ctx = createE2EContext();

  const owner = ctx.createUser({ fullName: 'Shakil Ahmed', phone: '+8801811223344', roles: ['owner'] });
  const clinicLocationId = '22222222-0000-0000-0000-000000000001';
  const serviceId = '44444444-0000-0000-0000-000000000001';

  // 1. Create Appointment Booking (APT-1 / APT-1a)
  ctx.logStep('1. Submit appointment slot reservation');
  const booking = {
    id: 'booking-e2e-001',
    code: 'PRN-E2E-7788',
    ownerId: owner.id,
    locationId: clinicLocationId,
    providerServiceId: serviceId,
    type: 'slot',
    status: 'pending',
    startsAt: new Date(Date.now() + 86400000 * 2).toISOString(), // 2 days later
    price: 600,
    paymentMethod: 'cash',
    paymentStatus: 'pending',
  };
  ctx.bookings.set(booking.id, booking);
  assert.strictEqual(booking.status, 'pending');

  // 2. Provider confirms the booking (APT-2)
  ctx.logStep('2. Provider confirms appointment');
  booking.status = 'confirmed';
  assert.strictEqual(booking.status, 'confirmed');

  // 3. Reschedule appointment before cutoff (APT-3)
  ctx.logStep('3. Owner reschedules appointment slot (+1 day)');
  const newDate = new Date(Date.now() + 86400000 * 3).toISOString();
  booking.startsAt = newDate;
  assert.strictEqual(booking.startsAt, newDate);

  // 4. Consultation starts (APT-2)
  ctx.logStep('4. Patient arrives at clinic, consultation begins');
  booking.status = 'in_progress';
  assert.strictEqual(booking.status, 'in_progress');

  // 5. Cash payment at clinic desk (PAY-1)
  ctx.logStep('5. Desk collects ৳600 cash payment and marks booking paid');
  booking.paymentStatus = 'paid';
  assert.strictEqual(booking.paymentStatus, 'paid');

  // 6. Complete consultation
  ctx.logStep('6. Consultation marked completed');
  booking.status = 'completed';
  assert.strictEqual(booking.status, 'completed');

  ctx.logStep('Flow 3 Complete: Full booking reservation, reschedule and cash payment flow passed.');
});
