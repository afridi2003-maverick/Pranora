import test from 'node:test';
import assert from 'node:assert';
import {
  autoExpandRadius,
  clusterMarkers,
  RADIUS_TIERS_KM,
} from '../clustering.ts';

test('MAP-8: autoExpandRadius expands tier when 0 clinics found', () => {
  // If 0 clinics found in 1 km -> expands to 3 km
  const r1 = autoExpandRadius(1, 0);
  assert.strictEqual(r1.didExpand, true);
  assert.strictEqual(r1.nextRadiusKm, 3);

  // If 0 clinics found in 3 km -> expands to 5 km
  const r2 = autoExpandRadius(3, 0);
  assert.strictEqual(r2.didExpand, true);
  assert.strictEqual(r2.nextRadiusKm, 5);

  // If 0 clinics found in 20 km -> expands to 50 km
  const r3 = autoExpandRadius(20, 0);
  assert.strictEqual(r3.didExpand, true);
  assert.strictEqual(r3.nextRadiusKm, 50);

  // If 0 clinics found at 50 km (max) -> stays at 50 km
  const r4 = autoExpandRadius(50, 0);
  assert.strictEqual(r4.didExpand, false);
  assert.strictEqual(r4.nextRadiusKm, 50);

  // If clinics found (> 0) -> does NOT expand
  const r5 = autoExpandRadius(5, 3);
  assert.strictEqual(r5.didExpand, false);
  assert.strictEqual(r5.nextRadiusKm, 5);
});

test('MAP-9: clusterMarkers clusters proximate points and leaves distant points separate', () => {
  // Two clinics close to each other in Dhanmondi
  const clinic1 = { id: 'c1', locationId: 'loc-1', lat: 23.7465, lng: 90.3752, name: 'Dhanmondi Care' };
  const clinic2 = { id: 'c2', locationId: 'loc-2', lat: 23.7470, lng: 90.3758, name: 'Dhanmondi Pet Clinic' };

  // Clinic far away in Gulshan
  const clinic3 = { id: 'c3', locationId: 'loc-3', lat: 23.7925, lng: 90.4078, name: 'Gulshan Animal Hospital' };

  const markers = [clinic1, clinic2, clinic3];

  // At zoom 11 (Dhaka city view)
  const clusters = clusterMarkers(markers, 11, 60);

  // Expect 2 items: 1 cluster of 2 items (Dhanmondi clinics) and 1 standalone marker (Gulshan)
  assert.strictEqual(clusters.length, 2);

  const clusterItem = clusters.find((c) => c.isCluster);
  assert.ok(clusterItem, 'Should produce a cluster item for Dhanmondi clinics');
  assert.strictEqual(clusterItem?.count, 2);
  assert.strictEqual(clusterItem?.items.length, 2);

  const singleItem = clusters.find((c) => !c.isCluster);
  assert.ok(singleItem, 'Should produce a single item for Gulshan clinic');
  assert.strictEqual(singleItem?.count, 1);
  assert.strictEqual(singleItem?.items[0].id, 'c3');

  // At zoom 17 (close street view): all markers should be unclustered
  const closeView = clusterMarkers(markers, 17);
  assert.strictEqual(closeView.length, 3);
  assert.strictEqual(closeView.every((c) => !c.isCluster), true);
});
