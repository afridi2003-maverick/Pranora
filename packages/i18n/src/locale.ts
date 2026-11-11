import type { Locale } from '@pranora/types';

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

