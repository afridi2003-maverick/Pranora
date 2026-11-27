import test from 'node:test';
import assert from 'node:assert';
import {
  getLivestockHospitals,
  validateLivestockMedication,
  submitLivestockCall,
  DLS_LIVESTOCK_VACCINES,
} from '../livestock.ts';

test('LIV-1: provides DLS subsidized livestock vaccine schedule', () => {
  assert.ok(DLS_LIVESTOCK_VACCINES.length >= 5);
  const anthrax = DLS_LIVESTOCK_VACCINES.find((v) => v.id === 'anthrax');
  assert.strictEqual(anthrax?.subsidizedPrice, 15);

  const fmd = DLS_LIVESTOCK_VACCINES.find((v) => v.id === 'fmd');
  assert.strictEqual(fmd?.subsidizedPrice, 30);
});

test('LIV-1: strictly validates banned livestock medications under BVC & wildlife rules', () => {
  // Diclofenac is banned for livestock
  const dicCheck = validateLivestockMedication('Diclofenac Sodium 50mg');
  assert.strictEqual(dicCheck.isSafe, false);
  assert.ok(dicCheck.warning?.includes('ডাইক্লোফেনাক'));

  // Ketoprofen is banned
  const ketoCheck = validateLivestockMedication('Ketoprofen 10% injection');
  assert.strictEqual(ketoCheck.isSafe, false);
  assert.ok(ketoCheck.warning?.includes('কিটোপ্রোফেন'));

  // Meloxicam is safe
  const meloCheck = validateLivestockMedication('Meloxicam Bolus');
  assert.strictEqual(meloCheck.isSafe, true);
});

test('LIV-1: finds livestock veterinary hospitals and centers', async () => {
  const hospitals = await getLivestockHospitals(23.7196, 90.407);
  assert.ok(hospitals.length > 0);
  const govtHospital = hospitals.find((h) => h.isGovernment);
  assert.ok(govtHospital, 'Should include government upazila/district vet hospital');
  assert.strictEqual(govtHospital?.offersArtificialInsemination, true);
});

test('LIV-1: submits emergency calving or livestock call', async () => {
  const result = await submitLivestockCall({
    clinicId: '20000000-0000-0000-0000-000000000001',
    locationId: '30000000-0000-0000-0000-000000000001',
    farmerName: 'রহিম মিয়া',
    species: 'cow',
    animalCount: 3,
    serviceType: 'emergency_calving',
    problemDescription: 'গাভীর প্রসবকালীন জটিলতা হচ্ছে, দ্রুত ডাক্তার প্রয়োজন।',
    address: 'গ্রাম: হেমায়েতপুর, সাভার, ঢাকা',
    phone: '+8801712345678',
  });

  assert.ok(result.callId);
  assert.ok(result.code.startsWith('PR-LIV-'));
  assert.strictEqual(result.farmerName, 'রহিম মিয়া');
  assert.strictEqual(result.status, 'dispatched');
});
