import type { Locale } from '@pranora/types';

const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

export function toBanglaDigits(numStr: string): string {
  return numStr.replace(/\d/g, (digit) => bnDigits[parseInt(digit, 10)] ?? digit);
}

export function formatCurrency(amount: number, locale: Locale = 'bn'): string {
  if (locale === 'bn') {
    const formatted = new Intl.NumberFormat('bn-BD', {
      maximumFractionDigits: 2,
    }).format(amount);
    return `৳ ${formatted}`;
  }
  return `৳${amount.toLocaleString('en-US')}`;
}

export function formatDistance(meters: number, locale: Locale = 'bn'): string {
  const km = (meters / 1000).toFixed(1);
  if (locale === 'bn') {
    return `${toBanglaDigits(km)} কি.মি.`;
  }
  return `${km} km`;
}

export function formatNumber(num: number, locale: Locale = 'bn'): string {
  if (locale === 'bn') {
    return toBanglaDigits(num.toString());
  }
  return num.toLocaleString('en-US');
}

export function formatDate(date: Date | string, locale: Locale = 'bn'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale === 'bn' ? 'bn-BD' : 'en-US', {
    dateStyle: 'medium',
  }).format(d);
}

