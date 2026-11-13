import { z } from 'zod';

/**
 * Google Maps API environment configuration schema (SET-3)
 */
export const googleMapsConfigSchema = z.object({
  nextPublicGoogleMapsApiKey: z
    .string()
    .trim()
    .min(1, 'NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is required for web maps')
    .optional(),
  expoPublicGoogleMapsApiKey: z
    .string()
    .trim()
    .min(1, 'EXPO_PUBLIC_GOOGLE_MAPS_API_KEY is required for mobile maps')
    .optional(),
});
export type GoogleMapsConfig = z.infer<typeof googleMapsConfigSchema>;

/**
 * Provider type enum according to schema.md §4.4
 */
export const providerTypeSchema = z.enum([
  'vet_clinic',
  'pet_hospital',
  'govt_vet_hospital',
  'freelance_vet',
  'groomer',
  'pet_shop',
  'boarding',
  'shelter',
]);
export type ProviderType = z.infer<typeof providerTypeSchema>;

/**
 * Default provider types considered as veterinary clinics/hospitals
 */
export const VET_PROVIDER_TYPES: ProviderType[] = [
  'vet_clinic',
  'pet_hospital',
  'govt_vet_hospital',
  'freelance_vet',
];

/**
 * Species type enum according to schema.md
 */
export const speciesTypeSchema = z.enum([
  'dog',
  'cat',
  'bird',
  'rabbit',
  'other',
]);
export type SpeciesType = z.infer<typeof speciesTypeSchema>;

/**
 * Map coordinate schema (WGS84)
 */
export const mapCoordinateSchema = z.object({
  lat: z.number().min(-90).max(90, 'Latitude must be between -90 and 90'),
  lng: z.number().min(-180).max(180, 'Longitude must be between -180 and 180'),
});
export type MapCoordinate = z.infer<typeof mapCoordinateSchema>;

/**
 * Map bounding box / viewport schema
 */
export const mapViewportSchema = z.object({
  north: z.number().min(-90).max(90),
  south: z.number().min(-90).max(90),
  east: z.number().min(-180).max(180),
  west: z.number().min(-180).max(180),
});
export type MapViewport = z.infer<typeof mapViewportSchema>;

/**
 * Integration Contract 5.2 / MAP-1: Query schema for nearby_clinics RPC
 * schema.md §5.2
 */
export const nearbyClinicsQuerySchema = z.object({
  lat: z.number().min(-90).max(90, 'Valid latitude required'),
  lng: z.number().min(-180).max(180, 'Valid longitude required'),
  radiusM: z
    .number()
    .int()
    .positive('Radius must be positive')
    .default(5000),
  openNow: z.boolean().default(false),
  emergency: z.boolean().default(false),
  homeVisit: z.boolean().default(false),
  species: speciesTypeSchema.optional(),
  service: z.string().trim().min(1).optional(),
  maxFee: z.number().positive().optional(),
  types: z.array(providerTypeSchema).default(VET_PROVIDER_TYPES),
  limit: z.number().int().min(1).max(100).default(50),
});
export type NearbyClinicsQueryInput = z.infer<typeof nearbyClinicsQuerySchema>;

/**
 * Integration Contract 5.2 / MAP-1: Result row returned by nearby_clinics RPC
 * schema.md §5.2
 */
export const nearbyClinicResultSchema = z.object({
  locationId: z.string().uuid('Invalid location ID'),
  providerId: z.string().uuid('Invalid provider ID'),
  nameBn: z.string().nullable(),
  nameEn: z.string().nullable(),
  addressBn: z.string().nullable(),
  addressEn: z.string().nullable(),
  phone: z.string().nullable(),
  type: providerTypeSchema,
  isGovernment: z.boolean(),
  is24h: z.boolean(),
  hasEmergency: z.boolean(),
  offersHomeVisit: z.boolean(),
  isOpenNow: z.boolean(),
  ratingAvg: z.number().min(0).max(5),
  ratingCount: z.number().int().min(0),
  feeFrom: z.number().nullable(),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  distanceM: z.number().min(0),
});
export type NearbyClinicResult = z.infer<typeof nearbyClinicResultSchema>;

/**
 * UI filter state for Nearest Vet Map (MAP-3, MAP-7)
 */
export const mapFilterSchema = z.object({
  openNow: z.boolean().default(false),
  is24h: z.boolean().default(false),
  emergencyOnly: z.boolean().default(false),
  offersHomeVisit: z.boolean().default(false),
  isGovernment: z.boolean().nullable().default(null),
  species: speciesTypeSchema.nullable().default(null),
  serviceSlug: z.string().nullable().default(null),
  maxFee: z.number().positive().nullable().default(null),
  radiusM: z.number().int().positive().default(5000),
});
export type MapFilter = z.infer<typeof mapFilterSchema>;

/**
 * Administrative area search schema (MAP-4)
 */
export const areaSearchQuerySchema = z.object({
  query: z.string().trim().min(1, 'Query must be at least 1 character').max(100),
  divisionId: z.number().int().positive().optional(),
  districtId: z.number().int().positive().optional(),
  upazilaId: z.number().int().positive().optional(),
});
export type AreaSearchQuery = z.infer<typeof areaSearchQuerySchema>;

/**
 * Integration Contract 6 & 17: Route params for entering map screen/page
 * Route: /map?lat=&lng=&locationId=&emergency=&service=
 */
export const mapRouteParamsSchema = z.object({
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  locationId: z.string().uuid().optional(),
  emergency: z
    .enum(['true', 'false'])
    .transform((val) => val === 'true')
    .optional(),
  service: z.string().trim().optional(),
  species: speciesTypeSchema.optional(),
});
export type MapRouteParams = z.infer<typeof mapRouteParamsSchema>;

/**
 * Integration Contract 17: Emergency mode route params
 * Deep link: /emergency or /map?emergency=true
 */
export const emergencyRouteParamsSchema = z.object({
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  directCall: z
    .enum(['true', 'false'])
    .transform((val) => val === 'true')
    .optional(),
});
export type EmergencyRouteParams = z.infer<typeof emergencyRouteParamsSchema>;
