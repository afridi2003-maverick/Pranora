import { z } from 'zod';

export const ServiceSlugSchema = z.enum([
  // MVP slugs
  'clinic_visit',
  'vaccine_clinic',
  'emergency_care',
  'rescue_report',
  'shelter_intake',
  'adopt_pet',
  'list_for_adoption',
  // P1 slugs
  'grooming_session',
  'boarding_stay',
  'home_vet_visit',
  'online_consult',
  // P3 slugs
  'pet_shop',
  'training_class',
  'pet_sitting',
  'pet_taxi',
]);

export type ServiceSlug = z.infer<typeof ServiceSlugSchema>;

export const CategorySlugSchema = z.enum([
  'vet',
  'vaccination',
  'emergency',
  'rescue',
  'adoption',
  'grooming',
  'boarding',
  'home_visit',
  'online_consult',
  'pet_shop',
  'training',
  'sitting',
  'taxi',
]);

export type CategorySlug = z.infer<typeof CategorySlugSchema>;
