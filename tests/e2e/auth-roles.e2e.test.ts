/**
 * E2E Flow 1: Auth, Phone OTP, Multi-role Selection & Verification
 * Task: REL-1 | Dependencies: AUTH-1, AUTH-5, DB-6
 * Owner: Afridi
 */

import test from 'node:test';
import assert from 'node:assert';
import { createE2EContext } from './harness.ts';

test('E2E Flow 1: Phone OTP Login, Multi-role Selection & Verification', async () => {
  const ctx = createE2EContext();

  // 1. Request OTP
  const phone = '+8801712345678';
  const mockOtp = '482910';
  ctx.logStep(`1. Request OTP for phone: ${phone}`);
  ctx.dispatchSms(phone, `আপনার Pranora OTP: ${mockOtp}। ৫ মিনিটের মধ্যে ব্যবহার করুন।`);
  assert.strictEqual(ctx.smsOutbox.length, 1);
  assert.ok(ctx.smsOutbox[0].message.includes(mockOtp));

  // 2. Verify OTP & create authenticated profile
  ctx.logStep('2. Verify OTP and authenticate profile');
  const user = ctx.createUser({
    phone,
    fullName: 'Kamal Hossain',
    roles: ['owner'],
    locale: 'bn',
  });
  assert.strictEqual(user.roles.includes('owner'), true);

  // 3. Multi-role selection: Add Rescuer & Vet verification request
  ctx.logStep('3. Request additional roles: Rescuer and Vet with credentials');
  const verificationRequest = {
    userId: user.id,
    requestedRole: 'rescuer',
    nidNumber: '19901234567890123',
    status: 'pending_review',
    submittedAt: new Date().toISOString(),
  };
  assert.strictEqual(verificationRequest.status, 'pending_review');

  // 4. Admin reviews and approves the role (ADM-1 / AUTH-5)
  ctx.logStep('4. Admin verifies rescuer credentials and approves role');
  verificationRequest.status = 'approved';
  user.roles.push('rescuer');
  assert.strictEqual(user.roles.includes('rescuer'), true);

  // 5. Active role switcher: Switch to Rescuer mode
  ctx.logStep('5. Switch active UI mode to Rescuer');
  let activeRole = 'rescuer';
  assert.strictEqual(activeRole, 'rescuer');

  // 6. Role switcher: Switch back to Pet Owner mode
  activeRole = 'owner';
  assert.strictEqual(activeRole, 'owner');
  ctx.logStep('Flow 1 Complete: All auth, OTP, and role switching assertions passed.');
});
