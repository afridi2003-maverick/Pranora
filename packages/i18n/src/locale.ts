import type { Locale } from '@pranora/types';

// ─── pickLocale ───────────────────────────────────────────────────────────────

/**
 * Read a bilingual DB field from a row object.
 *
 * Usage: `pickLocale(row, 'name', locale)`
 * Looks for `row.name_bn` (or `row.name_en`), falls back to the other language.
 * Never assumes `name_en` exists (docs/rules.md §3).
 */
export function pickLocale<T extends Record<string, unknown>, K extends string>(
  row: T,
  field: K,
  locale: Locale = 'bn'
): string {
  const primaryKey = `${field}_${locale}`;
  const fallbackKey = locale === 'bn' ? `${field}_en` : `${field}_bn`;

  const primaryValue = row[primaryKey];
  if (typeof primaryValue === 'string' && primaryValue.trim() !== '') {
    return primaryValue;
  }

  const fallbackValue = row[fallbackKey];
  if (typeof fallbackValue === 'string' && fallbackValue.trim() !== '') {
    return fallbackValue;
  }

  return '';
}

// ─── Locale helpers ───────────────────────────────────────────────────────────

/** All supported locales. */
export const LOCALES = ['bn', 'en'] as const;

/** Default locale (Bangla-first). */
export const DEFAULT_LOCALE: Locale = 'bn';

/** Fallback locale when a key is missing. */
export const FALLBACK_LOCALE: Locale = 'en';

/** Map locale to its Intl BCP-47 tag. */
export const INTL_LOCALE: Record<Locale, string> = {
  bn: 'bn-BD',
  en: 'en-US',
};

/** Human-readable locale label for UI display. */
export const LOCALE_LABEL: Record<Locale, string> = {
  bn: 'বাংলা',
  en: 'English',
};

/** Check whether a string is a valid supported locale. */
export function isValidLocale(value: unknown): value is Locale {
  return value === 'bn' || value === 'en';
}

/** Coerce an arbitrary string to a valid locale, defaulting to bn. */
export function coerceLocale(value: unknown): Locale {
  return isValidLocale(value) ? value : DEFAULT_LOCALE;
}
