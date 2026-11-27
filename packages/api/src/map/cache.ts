import type { NearbyClinicResult } from './index.ts';

export interface NearbyCacheEntry {
  timestamp: number; // Date.now()
  coords: { lat: number; lng: number };
  radiusM: number;
  filterSignature: string;
  clinics: NearbyClinicResult[];
}

export const NEARBY_CACHE_STORAGE_KEY = 'pranora_nearby_clinics_cache_v1';
export const DEFAULT_MAX_CACHE_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

// In-memory fallback cache when window.localStorage is not available (e.g. Node, SSR, tests)
let memoryCacheStore: NearbyCacheEntry | null = null;

function calculateDistanceApprox(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Saves fetched nearby clinics to offline persistent cache (MAP-12)
 */
export function saveNearbyCache(
  clinics: NearbyClinicResult[],
  coords: { lat: number; lng: number },
  radiusM: number = 25000,
  filterSignature: string = 'default'
): NearbyCacheEntry {
  const entry: NearbyCacheEntry = {
    timestamp: Date.now(),
    coords,
    radiusM,
    filterSignature,
    clinics,
  };

  memoryCacheStore = entry;

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(NEARBY_CACHE_STORAGE_KEY, JSON.stringify(entry));
    } catch {
      // Quota exceeded or storage unavailable
    }
  }

  return entry;
}

/**
 * Retrieves cached nearby clinics for offline fallback (MAP-12)
 * Validates distance from cache center and cache freshness
 */
export function getNearbyCache(
  currentCoords?: { lat: number; lng: number },
  maxDistanceM: number = 20000,
  maxAgeMs: number = DEFAULT_MAX_CACHE_AGE_MS
): NearbyCacheEntry | null {
  let entry: NearbyCacheEntry | null = memoryCacheStore;

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const raw = window.localStorage.getItem(NEARBY_CACHE_STORAGE_KEY);
      if (raw) {
        entry = JSON.parse(raw);
      }
    } catch {
      // Fall through to memoryCacheStore
    }
  }

  if (!entry) return null;

  // Check expiration
  const isFresh = Date.now() - entry.timestamp <= maxAgeMs;
  if (!isFresh) return null;

  // If coordinates provided, check if user is within reasonable distance of cached center
  if (currentCoords) {
    const dist = calculateDistanceApprox(
      currentCoords.lat,
      currentCoords.lng,
      entry.coords.lat,
      entry.coords.lng
    );
    if (dist > maxDistanceM) {
      return null; // Cache too far from current position
    }
  }

  return entry;
}

/**
 * Clears the offline nearby cache
 */
export function clearNearbyCache(): void {
  memoryCacheStore = null;
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.removeItem(NEARBY_CACHE_STORAGE_KEY);
    } catch {}
  }
}
