import type { Locale } from '@pranora/types';

// ─── Bengali digit conversion ────────────────────────────────────────────────

const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'] as const;

/** Convert ASCII digits in a string to Bengali script numerals. */
export function toBanglaDigits(numStr: string): string {
  return numStr.replace(/\d/g, (d) => BN_DIGITS[parseInt(d, 10)] ?? d);
}

/** Convert Bengali script numerals back to ASCII digits. */
export function toAsciiDigits(str: string): string {
  return str.replace(/[০-৯]/g, (d) => {
    const idx = BN_DIGITS.indexOf(d as (typeof BN_DIGITS)[number]);
    return idx === -1 ? d : String(idx);
  });
}

// ─── Currency ────────────────────────────────────────────────────────────────

/**
 * Format an amount in BDT (Bangladeshi Taka).
 *
 * Rules (docs/rules.md §4):
 * - bn: Bengali numerals + ৳ prefix, thousands-grouped via Intl
 * - en: Western numerals + ৳ prefix
 * - Input must be in BDT; never floats for totals — use integer poisha ÷ 100
 *   before calling this.
 */
export function formatCurrency(
  amount: number,
  locale: Locale = 'bn',
  options: { showSymbol?: boolean } = {}
): string {
  const { showSymbol = true } = options;
  const symbol = showSymbol ? '৳' : '';

  if (locale === 'bn') {
    // Intl formats in Bengali numerals automatically for 'bn-BD'
    const formatted = new Intl.NumberFormat('bn-BD', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 0,
    }).format(amount);
    return `${symbol} ${formatted}`.trimStart();
  }

  const formatted = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(amount);
  return `${symbol}${formatted}`;
}

// ─── Distance ────────────────────────────────────────────────────────────────

/**
 * Format a distance.
 * - < 1000 m  → "৫০০ মি." / "500 m"
 * - ≥ 1000 m  → "১.৫ কি.মি." / "1.5 km"
 */
export function formatDistance(meters: number, locale: Locale = 'bn'): string {
  if (meters < 1000) {
    const m = Math.round(meters).toString();
    return locale === 'bn' ? `${toBanglaDigits(m)} মি.` : `${m} m`;
  }
  const km = (meters / 1000).toFixed(1);
  return locale === 'bn' ? `${toBanglaDigits(km)} কি.মি.` : `${km} km`;
}

// ─── Numbers ─────────────────────────────────────────────────────────────────

/**
 * Format a plain number.
 * Bengali locale → Bengali script numerals with thousands grouping.
 * English locale → standard Western numerals.
 */
export function formatNumber(
  num: number,
  locale: Locale = 'bn',
  options?: Intl.NumberFormatOptions
): string {
  if (locale === 'bn') {
    return new Intl.NumberFormat('bn-BD', options).format(num);
  }
  return new Intl.NumberFormat('en-US', options).format(num);
}

// ─── Dates ───────────────────────────────────────────────────────────────────

/**
 * Format a date in medium style: "১৬ নভেম্বর ২০২৬" / "Nov 16, 2026".
 */
export function formatDate(date: Date | string, locale: Locale = 'bn'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale === 'bn' ? 'bn-BD' : 'en-US', {
    dateStyle: 'medium',
  }).format(d);
}

/**
 * Format a date in short style: "১৬/১১/২৬" / "11/16/26".
 */
export function formatShortDate(date: Date | string, locale: Locale = 'bn'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale === 'bn' ? 'bn-BD' : 'en-US', {
    dateStyle: 'short',
  }).format(d);
}

/**
 * Format a time: "বিকাল ৩:৩০" / "3:30 PM".
 */
export function formatTime(date: Date | string, locale: Locale = 'bn'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale === 'bn' ? 'bn-BD' : 'en-US', {
    timeStyle: 'short',
  }).format(d);
}

/**
 * Format a date + time together.
 */
export function formatDateTime(date: Date | string, locale: Locale = 'bn'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale === 'bn' ? 'bn-BD' : 'en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(d);
}

/**
 * Relative time: "২ মিনিট আগে" / "2 minutes ago".
 * Falls back gracefully when RelativeTimeFormat is unavailable.
 */
export function formatRelativeDate(date: Date | string, locale: Locale = 'bn'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const diffMs = Date.now() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);

  const intlLocale = locale === 'bn' ? 'bn-BD' : 'en-US';
  const rtf = new Intl.RelativeTimeFormat(intlLocale, { numeric: 'auto' });

  if (diffSec < 60) return rtf.format(-diffSec, 'second');
  if (diffSec < 3600) return rtf.format(-Math.floor(diffSec / 60), 'minute');
  if (diffSec < 86400) return rtf.format(-Math.floor(diffSec / 3600), 'hour');
  if (diffSec < 2592000) return rtf.format(-Math.floor(diffSec / 86400), 'day');
  if (diffSec < 31536000) return rtf.format(-Math.floor(diffSec / 2592000), 'month');
  return rtf.format(-Math.floor(diffSec / 31536000), 'year');
}

// ─── Phone numbers ───────────────────────────────────────────────────────────

/**
 * Format a BD phone number for display.
 * Always shows Western digits (phone numbers are identity — never converted).
 * Normalises +8801XXXXXXXXX → "+880 1XXX-XXXXXX".
 */
export function formatPhone(phone: string): string {
  // Remove all non-digits except leading +
  const stripped = phone.replace(/(?!^\+)\D/g, '');
  if (stripped.startsWith('+880') && stripped.length === 13) {
    return `+880 ${stripped.slice(4, 5)}${stripped.slice(5, 8)}-${stripped.slice(8)}`;
  }
  if (stripped.startsWith('880') && stripped.length === 12) {
    return `+880 ${stripped.slice(3, 4)}${stripped.slice(4, 7)}-${stripped.slice(7)}`;
  }
  if (stripped.startsWith('01') && stripped.length === 11) {
    return `+880 ${stripped[2]}${stripped.slice(3, 6)}-${stripped.slice(6)}`;
  }
  // Unknown format — return as-is
  return phone;
}

/**
 * Normalise a BD phone number to E.164: +8801XXXXXXXXX.
 * Returns null if the number cannot be normalised.
 */
export function normalisePhone(phone: string): string | null {
  const stripped = phone.replace(/\D/g, '');
  if (stripped.startsWith('880') && stripped.length === 12) return `+${stripped}`;
  if (stripped.startsWith('01') && stripped.length === 11) return `+880${stripped.slice(1)}`;
  if (stripped.length === 10 && stripped.startsWith('1')) return `+880${stripped}`;
  return null;
}

// ─── Duration ────────────────────────────────────────────────────────────────

/**
 * Format a duration in minutes.
 * "৩০ মিনিট", "১ ঘণ্টা ৩০ মিনিট" / "30 min", "1 h 30 min"
 */
export function formatDuration(minutes: number, locale: Locale = 'bn'): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;

  if (locale === 'bn') {
    if (h === 0) return `${toBanglaDigits(String(m))} মিনিট`;
    if (m === 0) return `${toBanglaDigits(String(h))} ঘণ্টা`;
    return `${toBanglaDigits(String(h))} ঘণ্টা ${toBanglaDigits(String(m))} মিনিট`;
  }

  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${m} min`;
}

// ─── Age ─────────────────────────────────────────────────────────────────────

/**
 * Format an animal's age from its birth date.
 * "৬ মাস", "২ বছর ৩ মাস" / "6 months", "2 years 3 months"
 */
export function formatPetAge(birthDate: Date | string, locale: Locale = 'bn'): string {
  const birth = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
  const now = new Date();
  const totalMonths =
    (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());

  if (totalMonths < 1) {
    return locale === 'bn' ? '১ মাসের কম' : 'Less than 1 month';
  }

  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;

  if (locale === 'bn') {
    if (years === 0) return `${toBanglaDigits(String(months))} মাস`;
    if (months === 0) return `${toBanglaDigits(String(years))} বছর`;
    return `${toBanglaDigits(String(years))} বছর ${toBanglaDigits(String(months))} মাস`;
  }

  if (years === 0) return `${months} month${months !== 1 ? 's' : ''}`;
  if (months === 0) return `${years} year${years !== 1 ? 's' : ''}`;
  return `${years} year${years !== 1 ? 's' : ''} ${months} month${months !== 1 ? 's' : ''}`;
}
