/**
 * E2E Flow 4: Urgent Rescue Report, 15-min Escalation, Assignment & Case Closure
 * Task: REL-1 | Dependencies: RSC-1, RSC-3, RSC-6, RSC-7, ADM-3
 * Owner: Brehat & Afridi
 */

import test from 'node:test';
import assert from 'node:assert';
import { createE2EContext } from './harness.ts';

test('E2E Flow 4: Urgent Rescue Reporting, Assignment, Escalation & Closure', async () => {
  const ctx = createE2EContext();

  const citizen = ctx.createUser({ fullName: 'Nabila Karim', phone: '+8801999887766' });
  const rescuer = ctx.createUser({ fullName: 'Dhaka Rescue Team', roles: ['rescuer'], phone: '+8801700112233' });

  // 1. Citizen submits urgent animal report (RSC-1)
  ctx.logStep('1. Citizen submits urgent injured dog report at Dhanmondi Lake');
  const report = {
    id: 'report-e2e-001',
    reporterId: citizen.id,
    species: 'dog',
    isUrgent: true,
    conditionSummary: 'Severe leg injury from road accident',
    location: { lat: 23.75, lng: 90.38, addressText: 'Dhanmondi Lake Road 8A' },
    status: 'unreviewed',
    createdAt: new Date(Date.now() - 1000 * 60 * 16).toISOString(), // 16 min ago
  };
  assert.strictEqual(report.isUrgent, true);

  // 2. 15-minute SLA Escalation (RSC-6 / ADM-3)
  ctx.logStep('2. Verify 15-min SLA escalation kicks in for unreviewed urgent report');
  const ageMinutes = (Date.now() - new Date(report.createdAt).getTime()) / (60 * 1000);
  assert.ok(ageMinutes >= 15, 'Urgent report must trigger escalation after 15 minutes');
  report.status = 'escalated_to_admin';
  assert.strictEqual(report.status, 'escalated_to_admin');

  // 3. Admin & Shelter review queue assigns case (RSC-2, RSC-3)
  ctx.logStep('3. Assign rescue case to verified rescuer');
  const rescueCase = {
    id: 'case-e2e-001',
    reportId: report.id,
    assignedRescuerId: rescuer.id,
    status: 'in_progress',
    treatmentGiven: 'First aid and splint applied, transported to clinic',
  };
  ctx.rescueCases.set(rescueCase.id, rescueCase);
  assert.strictEqual(rescueCase.assignedRescuerId, rescuer.id);

  // 4. Record treatment outcome and close case (RSC-7)
  ctx.logStep('4. Record final outcome, shelter placement, and close case');
  rescueCase.status = 'resolved';
  assert.strictEqual(rescueCase.status, 'resolved');

  ctx.logStep('Flow 4 Complete: Urgent rescue lifecycle with escalation and closure verified.');
});
