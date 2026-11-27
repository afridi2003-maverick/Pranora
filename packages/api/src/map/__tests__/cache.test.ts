import test from 'node:test';
import assert from 'node:assert';
import {
  saveNearbyCache,
  getNearbyCache,
  clearNearbyCache,
} from '../cache.ts';

test('MAP-12: caches nearby clinics and retrieves them offline', () => {
  clearNearbyCache();

  const mockClinics: any[] = [
    { locationId: 'c1', nameBn: 'ধানমন্ডি ক্লিনিক', nameEn: 'Dhanmondi Clinic', lat: 23.7465, lng: 90.3752, distanceM: 500 },
    { locationId: 'c2', nameBn: 'মিরপুর ক্লিনিক', nameEn: 'Mirpur Clinic', lat: 23.805, lng: 90.368, distanceM: 4000 },
  ];

  const coords = { lat: 23.7465, lng: 90.3752 };
  saveNearbyCache(mockClinics, coords, 10000, 'openNow=true');

  // Retrieval with same or close coordinates
  const cached = getNearbyCache(coords);
  assert.ok(cached, 'Cache should be available');
  assert.strictEqual(cached?.clinics.length, 2);
  assert.strictEqual(cached?.clinics[0].nameEn, 'Dhanmondi Clinic');
  assert.strictEqual(cached?.filterSignature, 'openNow=true');

  // Retrieval with coordinates too far away (> 20 km, e.g. Chittagong)
  const farCoords = { lat: 22.3569, lng: 91.7832 };
  const farCached = getNearbyCache(farCoords, 20000);
  assert.strictEqual(farCached, null, 'Cache should be invalid if far away from cached center');

  // Clear cache
  clearNearbyCache();
  assert.strictEqual(getNearbyCache(coords), null);
});
