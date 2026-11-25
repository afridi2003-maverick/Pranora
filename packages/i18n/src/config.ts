/**
 * i18next / next-intl compatible configuration helper for @pranora/i18n.
 *
 * Framework consumers import this and pass it to their i18n initialiser.
 * The raw locale JSON files live in `locales/{bn,en}/<namespace>.json`.
 *
 * Usage — Next.js (next-intl):
 *   import { NAMESPACES, DEFAULT_LOCALE, LOCALES } from '@pranora/i18n/config';
 *
 * Usage — React Native (i18next):
 *   import { buildI18nResources } from '@pranora/i18n/config';
 *   i18next.init({ resources: buildI18nResources(), ... });
 */

import type { Locale } from '@pranora/types';
import { DEFAULT_LOCALE, FALLBACK_LOCALE, LOCALES } from './locale';

// Re-export so consumers only need one import
export { DEFAULT_LOCALE, FALLBACK_LOCALE, LOCALES };
export type { Locale };

/** All registered i18n namespaces (must match locale JSON file names). */
export const NAMESPACES = [
  'common',
  'pets',
  'health',
  'rescue',
  'adoption',
  'map',
  'booking',
  'auth',
  'services',
  'notifications',
  'ai',
  'tips',
  'sitting',
  'shelter',
  'provider',
  'calls',
] as const;

export type Namespace = (typeof NAMESPACES)[number];

/** Default namespace used when none is specified. */
export const DEFAULT_NAMESPACE: Namespace = 'common';

/**
 * Shared i18next options (works with i18next-react and i18next-expo).
 * Pass your backend/resource plugin separately.
 */
export const I18N_OPTIONS = {
  defaultNS: DEFAULT_NAMESPACE,
  ns: NAMESPACES,
  fallbackLng: FALLBACK_LOCALE,
  lng: DEFAULT_LOCALE,
  interpolation: {
    escapeValue: false, // React already escapes
  },
  returnNull: false,
  returnEmptyString: false,
} as const;

/**
 * Build a fully-typed i18next resources object from pre-imported JSON.
 * This is intended for bundler environments (Expo / Vite) where dynamic
 * `require()` is not available, so callers supply the JSON themselves.
 *
 * Example:
 * ```ts
 * import bnCommon from '@pranora/i18n/locales/bn/common.json';
 * import enCommon from '@pranora/i18n/locales/en/common.json';
 * // ...
 * i18next.init({ resources: buildI18nResources({ bn: { common: bnCommon }, en: { common: enCommon } }) });
 * ```
 */
export function buildI18nResources(
  overrides: Partial<Record<Locale, Partial<Record<Namespace, Record<string, unknown>>>>>
): Record<Locale, Partial<Record<Namespace, Record<string, unknown>>>> {
  return {
    bn: overrides.bn ?? {},
    en: overrides.en ?? {},
  };
}
