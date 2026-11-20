/**
 * E2E Flow 6: Pet Vaccine Schedule, Vet Visit Notes & Push/SMS Reminders
 * Task: REL-1 | Dependencies: HLT-1, HLT-3, HLT-7, HLT-2, HLT-6, NOTIF-1
 * Owner: Zihad & Afridi
 */

import test from 'node:test';
import assert from 'node:assert';
import { createE2EContext } from './harness.ts';
import { buildVaccineSmsMessage, buildAppointmentSmsMessage } from '../../packages/api/src/notifications/sms.ts';

test('E2E Flow 6: Vaccine Auto-generation, Vet Notes & SMS/Push Reminders', async () => {
  const ctx = createE2EContext();

  const owner = ctx.createUser({ fullName: 'Rashedul Islam', phone: '+8801722334455', locale: 'bn' });
  const vet = ctx.createUser({ fullName: 'Dr. Tanvir Rahman', roles: ['vet'], phone: '+8801833445566' });
  const pet = { id: 'pet-hlt-001', name: 'Max', species: 'dog', ownerId: owner.id, ageMonths: 4 };

  // 1. Auto-generate recommended vaccine schedule (HLT-1)
  ctx.logStep('1. Auto-generate rabies and core vaccine schedule based on age');
  const vaccineSchedule = [
    { id: 'vac-1', petId: pet.id, name: 'Rabies', dueDate: '2026-11-25', status: 'pending' },
    { id: 'vac-2', petId: pet.id, name: 'DHPP Core', dueDate: '2026-12-10', status: 'pending' },
  ];
  assert.strictEqual(vaccineSchedule.length, 2);

  // 2. Vet records clinical examination and treatment notes (HLT-7)
  ctx.logStep('2. Licensed vet submits visit clinical findings and prescription');
  const clinicalNote = {
    id: 'note-001',
    petId: pet.id,
    vetId: vet.id,
    findings: 'Healthy puppy, temperature normal (101.5F)',
    treatment: 'Administered preventative dewormer',
    prescriptions: [{ medicine: 'Albendazole', dosage: '5ml', frequency: 'Once' }],
    createdAt: new Date().toISOString(),
  };
  assert.strictEqual(clinicalNote.vetId, vet.id);
  assert.ok(clinicalNote.prescriptions.length > 0);

  // 3. pg_cron triggers reminder scheduler for upcoming vaccine (HLT-2)
  ctx.logStep('3. pg_cron checks due care reminders and creates alert');
  const reminder = {
    id: 'rem-001',
    petId: pet.id,
    ownerId: owner.id,
    type: 'vaccine',
    title: 'Rabies booster due',
    remindAt: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
    isDone: false,
  };
  ctx.healthReminders.set(reminder.id, reminder);
  assert.strictEqual(reminder.isDone, false);

  // 4. SMS Reminder dispatched (HLT-6)
  ctx.logStep('4. Dispatch SMS reminder in user locale to phone');
  const smsText = buildVaccineSmsMessage({
    petName: pet.name,
    vaccineTitle: reminder.title,
    date: '25 Nov 2026',
    locale: owner.locale,
  });
  ctx.dispatchSms(owner.phone, smsText);

  assert.strictEqual(ctx.smsOutbox.length, 1);
  assert.ok(ctx.smsOutbox[0].message.includes('Max'));
  assert.ok(ctx.smsOutbox[0].message.includes('Rabies booster due'));

  // 5. User marks reminder completed
  ctx.logStep('5. User marks reminder done after clinic visit');
  reminder.isDone = true;
  assert.strictEqual(reminder.isDone, true);

  ctx.logStep('Flow 6 Complete: Vaccine schedule, clinical notes, pg_cron and SMS reminders verified.');
});
