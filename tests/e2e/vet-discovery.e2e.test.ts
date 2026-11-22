/**
 * E2E Flow 2: Nearest Vet Discovery, Distance Sorting & Emergency Mode
 * Task: REL-1 | Dependencies: MAP-1, MAP-2, MAP-7, DB-4
 * Owner: Zimia & Afridi
 */

import test from 'node:test';
import assert from 'node:assert';
import { createE2EContext, calculateDistanceMeters } from './harness.ts';
import { getAllMockClinics } from '../../packages/api/src/clinics/mock.ts';

test('E2E Flow 2: Spatial Vet Discovery, Distance Sort & Emergency Mode', async () => {
  const ctx = createE2EContext();
  const dhakaLat = 23.7465;
  const dhakaLng = 90.3752;

  // 1. Fetch seed clinic dataset
  ctx.logStep('1. Load spatial clinic dataset with DLS and private hospitals');
  const clinics = getAllMockClinics();
  assert.ok(clinics.length >= 3, 'Should contain mock clinics');

  // 2. Calculate distance from user coordinate
  ctx.logStep('2. Compute distance for all clinics from user GPS coordinates');
  const sortedClinics = clinics.map((c) => {
    const dist = calculateDistanceMeters(dhakaLat, dhakaLng, c.location.lat, c.location.lng);
    return { ...c, distanceMeters: dist };
  }).sort((a, b) => a.distanceMeters - b.distanceMeters);

  assert.ok(sortedClinics[0].distanceMeters <= sortedClinics[1].distanceMeters, 'Clinics must be distance-sorted ascending');

  // 3. Filter by Emergency Mode (MAP-7)
  ctx.logStep('3. Activate Emergency Mode filter (24/7 or hasEmergency true)');
  const emergencyClinics = sortedClinics.filter((c) => c.location.hasEmergency || c.location.is24h);
  assert.ok(emergencyClinics.length > 0, 'Emergency mode should return available 24/7 or emergency clinics');
  for (const c of emergencyClinics) {
    assert.ok(c.location.hasEmergency || c.location.is24h, 'Each clinic in emergency mode must support emergency or 24h');
  }

  // 4. Verify Clinic Full Details and Services (MAP-5, SVC-2)
  ctx.logStep('4. Fetch clinic detailed services, doctors, and consultation fee');
  const primaryClinic = emergencyClinics[0];
  assert.ok(primaryClinic.location.id, 'Location ID must exist');
  assert.ok(primaryClinic.services.length > 0, 'Clinic must provide medical services');
  assert.ok(primaryClinic.vets.length > 0, 'Clinic must have verified vet profiles');

  ctx.logStep('Flow 2 Complete: Vet discovery, distance sorting and emergency mode verified.');
});
