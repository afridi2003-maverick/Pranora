import test from 'node:test';
import assert from 'node:assert';
import {
  submitClinicSuggestion,
  getMyClinicSuggestions,
} from '../suggest.ts';

test('MAP-11: validates and submits community clinic suggestion', async () => {
  // Test invalid input rejection
  await assert.rejects(
    async () => {
      await submitClinicSuggestion({
        name: 'A', // too short
        address: 'Dhaka',
        phone: '123',
      });
    },
    /Clinic name must be at least 2 characters/
  );

  // Test valid submission
  const suggestion = await submitClinicSuggestion({
    name: 'মিরপুর ভেটেরিনারি কেয়ার',
    nameEn: 'Mirpur Veterinary Care',
    divisionId: 3,
    districtId: 18,
    address: 'প্লট ১২, ব্লক বি, সেকশন ৬, মিরপুর, ঢাকা',
    phone: '+880 1711223344',
    is24h: true,
    hasEmergency: true,
    offersHomeVisit: true,
    services: ['general_checkup', 'surgery', 'vaccination'],
    notes: 'মিরপুর ইনডোর স্টেডিয়ামের বিপরীতে।',
    suggestedBy: 'user-zimia-test',
  });

  assert.ok(suggestion.id);
  assert.strictEqual(suggestion.name, 'মিরপুর ভেটেরিনারি কেয়ার');
  assert.strictEqual(suggestion.status, 'submitted');

  const mySuggestions = await getMyClinicSuggestions('user-zimia-test');
  assert.ok(mySuggestions.length > 0);
  assert.strictEqual(mySuggestions[0].id, suggestion.id);
});
