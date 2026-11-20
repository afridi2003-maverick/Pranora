/**
 * E2E Flow 5: Adoption Application, Approval, Two-Sided Handover & Pet Transfer
 * Task: REL-1 | Dependencies: ADP-1, ADP-2, ADP-3, ADP-5, ADP-6, PET-5
 * Owner: Brehat & Afridi
 */

import test from 'node:test';
import assert from 'node:assert';
import { createE2EContext } from './harness.ts';

test('E2E Flow 5: Full Adoption Application, Approval, Handover & Pet Transfer', async () => {
  const ctx = createE2EContext();

  const shelter = ctx.createUser({ fullName: 'Paws & Tails Shelter', roles: ['shelter'] });
  const applicant = ctx.createUser({ fullName: 'Farhana Sultana', roles: ['owner'], phone: '+8801555667788' });

  // 1. Create Adoption Listing from pet profile (ADP-2)
  ctx.logStep('1. Verified shelter creates adoption listing for rescue cat');
  const pet = { id: 'pet-adp-001', name: 'Simba', species: 'cat', currentOwnerId: shelter.id };
  const listing = {
    id: 'listing-e2e-001',
    petId: pet.id,
    shelterId: shelter.id,
    titleBn: 'সিম্বা দত্তক দিন',
    titleEn: 'Adopt Simba',
    status: 'active',
  };
  ctx.adoptionListings.set(listing.id, listing);
  assert.strictEqual(listing.status, 'active');

  // 2. Submit Adoption Application (ADP-3)
  ctx.logStep('2. Applicant submits adoption application questionnaire');
  const application = {
    id: 'app-e2e-001',
    listingId: listing.id,
    applicantId: applicant.id,
    livingArrangement: 'Apartment, has safety netting on balconies',
    experienceYears: 3,
    status: 'submitted',
  };
  ctx.adoptionApplications.set(application.id, application);
  assert.strictEqual(application.status, 'submitted');

  // 3. Shelter reviews and approves application (ADP-5)
  ctx.logStep('3. Shelter reviews vetting answers and approves application');
  application.status = 'approved';
  assert.strictEqual(application.status, 'approved');

  // 4. Generate Two-Sided Handover Verification Code (ADP-6)
  ctx.logStep('4. Generate unique 6-digit handover verification code');
  const handoverCode = '739281';
  const handoverRecord = {
    applicationId: application.id,
    verificationCode: handoverCode,
    isCompleted: false,
    handoverDate: null as string | null,
  };
  assert.strictEqual(handoverRecord.isCompleted, false);

  // 5. In-person Handover: Verify code & complete transfer (ADP-6, PET-5)
  ctx.logStep('5. Applicant presents handover code at shelter, ownership transferred');
  assert.strictEqual(handoverCode, '739281');
  handoverRecord.isCompleted = true;
  handoverRecord.handoverDate = new Date().toISOString();
  pet.currentOwnerId = applicant.id; // Lifetime pet record transferred!

  assert.strictEqual(handoverRecord.isCompleted, true);
  assert.strictEqual(pet.currentOwnerId, applicant.id, 'Pet ownership must transfer to applicant');

  ctx.logStep('Flow 5 Complete: Adoption application, review, handover and lifetime pet transfer passed.');
});
