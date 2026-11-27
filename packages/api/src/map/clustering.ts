/**
 * Spatial clustering and radius auto-expansion for maps (MAP-8/9)
 * Sprint: S7 | Owner: Zimia
 */

export interface MapClusterItem<T> {
  id: string;
  isCluster: boolean;
  count: number;
  lat: number;
  lng: number;
  items: T[];
}

export const RADIUS_TIERS_KM = [1, 3, 5, 10, 20, 50] as const;
export type RadiusTierKm = typeof RADIUS_TIERS_KM[number];

/**
 * Auto-expands the search radius to the next tier if no clinics are found (MAP-8)
 * Stops at 50 km (maximum allowed radius in MAP-8).
 */
export function autoExpandRadius(
  currentRadiusKm: number,
  foundCount: number
): { nextRadiusKm: number; didExpand: boolean } {
  if (foundCount > 0) {
    return { nextRadiusKm: currentRadiusKm, didExpand: false };
  }

  const currentIndex = RADIUS_TIERS_KM.indexOf(currentRadiusKm as RadiusTierKm);
  if (currentIndex >= 0 && currentIndex < RADIUS_TIERS_KM.length - 1) {
    return { nextRadiusKm: RADIUS_TIERS_KM[currentIndex + 1], didExpand: true };
  }

  // If custom radius or at max, check next higher
  const nextTier = RADIUS_TIERS_KM.find((t) => t > currentRadiusKm);
  if (nextTier) {
    return { nextRadiusKm: nextTier, didExpand: true };
  }

  return { nextRadiusKm: currentRadiusKm, didExpand: false };
}

/**
 * Grid/Distance-based spatial clustering (MAP-9)
 * Converts coordinates to screen space projection and groups points within clusterRadiusPixels.
 */
export function clusterMarkers<T extends { lat: number; lng: number; locationId?: string; id?: string }>(
  items: T[],
  zoom: number = 12,
  clusterRadiusPixels: number = 50
): MapClusterItem<T>[] {
  if (items.length === 0) return [];
  if (zoom >= 16) {
    // Zoomed in very close: show individual pins
    return items.map((item, idx) => ({
      id: item.locationId || item.id || `marker-${idx}`,
      isCluster: false,
      count: 1,
      lat: item.lat,
      lng: item.lng,
      items: [item],
    }));
  }

  const project = (lat: number, lng: number) => {
    const siny = Math.sin((lat * Math.PI) / 180);
    const clampedSiny = Math.min(Math.max(siny, -0.9999), 0.9999);
    const scale = 256 * Math.pow(2, zoom);
    const x = scale * (0.5 + lng / 360);
    const y = scale * (0.5 - Math.log((1 + clampedSiny) / (1 - clampedSiny)) / (4 * Math.PI));
    return { x, y };
  };

  const clusters: Array<{
    centerLat: number;
    centerLng: number;
    pixelX: number;
    pixelY: number;
    items: T[];
  }> = [];

  for (const item of items) {
    const { x, y } = project(item.lat, item.lng);
    let assigned = false;

    for (const cluster of clusters) {
      const dx = cluster.pixelX - x;
      const dy = cluster.pixelY - y;
      const distPixels = Math.sqrt(dx * dx + dy * dy);

      if (distPixels <= clusterRadiusPixels) {
        cluster.items.push(item);
        const count = cluster.items.length;
        cluster.pixelX = (cluster.pixelX * (count - 1) + x) / count;
        cluster.pixelY = (cluster.pixelY * (count - 1) + y) / count;
        cluster.centerLat = (cluster.centerLat * (count - 1) + item.lat) / count;
        cluster.centerLng = (cluster.centerLng * (count - 1) + item.lng) / count;
        assigned = true;
        break;
      }
    }

    if (!assigned) {
      clusters.push({
        centerLat: item.lat,
        centerLng: item.lng,
        pixelX: x,
        pixelY: y,
        items: [item],
      });
    }
  }

  return clusters.map((c, idx) => {
    const isCluster = c.items.length > 1;
    const firstItem = c.items[0];
    const id = isCluster
      ? `cluster-${idx}-${c.items.length}`
      : firstItem.locationId || firstItem.id || `marker-${idx}`;

    return {
      id,
      isCluster,
      count: c.items.length,
      lat: c.centerLat,
      lng: c.centerLng,
      items: c.items,
    };
  });
}
