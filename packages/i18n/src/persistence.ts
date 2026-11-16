import type { Locale } from '@pranora/types';
import { DEFAULT_LOCALE, isValidLocale } from './locale';

export const STORAGE_KEY = 'pranora_locale';
export const COOKIE_NAME = 'NEXT_LOCALE';

/**
 * Universal storage adapter interface for language preference persistence.
 * Implementations exist for browser cookies, localStorage, mobile AsyncStorage,
 * in-memory fallback, and Supabase profile sync.
 */
export interface LocaleStorageAdapter {
  getLocale(): Promise<Locale | null> | Locale | null;
  setLocale(locale: Locale): Promise<void> | void;
}

/**
 * In-memory storage adapter.
 * Useful for SSR, unit tests, and fallback when storage is unavailable.
 */
export class MemoryStorageAdapter implements LocaleStorageAdapter {
  private current: Locale;

  constructor(initial: Locale = DEFAULT_LOCALE) {
    this.current = initial;
  }

  getLocale(): Locale {
    return this.current;
  }

  setLocale(locale: Locale): void {
    this.current = locale;
  }
}

/**
 * Web localStorage adapter.
 * Persists language choice across client browser tabs and sessions.
 */
export class LocalStorageAdapter implements LocaleStorageAdapter {
  constructor(private key: string = STORAGE_KEY) {}

  getLocale(): Locale | null {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    try {
      const val = window.localStorage.getItem(this.key);
      return isValidLocale(val) ? val : null;
    } catch {
      return null;
    }
  }

  setLocale(locale: Locale): void {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      window.localStorage.setItem(this.key, locale);
    } catch {
      // Ignore quota or restricted storage errors
    }
  }
}

/**
 * Cookie storage adapter for Next.js and web browsers.
 * Sets NEXT_LOCALE cookie so Next.js server-side layout and middleware
 * read the user's preferred language before rendering.
 */
export class CookieStorageAdapter implements LocaleStorageAdapter {
  constructor(
    private cookieName: string = COOKIE_NAME,
    private days: number = 365,
    private path: string = '/'
  ) {}

  getLocale(): Locale | null {
    if (typeof document === 'undefined') return null;
    try {
      const match = document.cookie.match(
        new RegExp(`(?:^|;\\s*)${this.cookieName}=([^;]*)`)
      );
      const val = match?.[1];
      return isValidLocale(val) ? val : null;
    } catch {
      return null;
    }
  }

  setLocale(locale: Locale): void {
    if (typeof document === 'undefined') return;
    try {
      const maxAge = this.days * 24 * 60 * 60;
      document.cookie = `${this.cookieName}=${locale};path=${this.path};max-age=${maxAge};SameSite=Lax`;
    } catch {
      // Ignore document cookie write errors
    }
  }
}

/**
 * Combined Web storage adapter.
 * Reads and writes to both Cookies (for SSR / Next.js) and localStorage (for client persistence).
 */
export class WebStorageAdapter implements LocaleStorageAdapter {
  private cookie: CookieStorageAdapter;
  private local: LocalStorageAdapter;

  constructor(cookieName: string = COOKIE_NAME, localKey: string = STORAGE_KEY) {
    this.cookie = new CookieStorageAdapter(cookieName);
    this.local = new LocalStorageAdapter(localKey);
  }

  getLocale(): Locale | null {
    return this.cookie.getLocale() ?? this.local.getLocale();
  }

  setLocale(locale: Locale): void {
    this.cookie.setLocale(locale);
    this.local.setLocale(locale);
  }
}

/**
 * Key-value store abstraction matching AsyncStorage or similar mobile stores.
 */
export interface KeyValueStore {
  getItem(key: string): Promise<string | null> | string | null;
  setItem(key: string, value: string): Promise<void> | void;
}

/**
 * Mobile storage adapter for React Native / Expo AsyncStorage or SecureStore.
 */
export class KeyValueStorageAdapter implements LocaleStorageAdapter {
  constructor(
    private store: KeyValueStore,
    private key: string = STORAGE_KEY
  ) {}

  async getLocale(): Promise<Locale | null> {
    try {
      const val = await this.store.getItem(this.key);
      return isValidLocale(val) ? val : null;
    } catch {
      return null;
    }
  }

  async setLocale(locale: Locale): Promise<void> {
    try {
      await this.store.setItem(this.key, locale);
    } catch {
      // Ignore mobile store write errors
    }
  }
}

/**
 * Supabase profile locale persistence helper (DB-1 / profiles.locale).
 * When a user logs in or switches language, synchronizes their locale
 * back to their database profile row.
 */
export async function syncLocaleToProfile(
  supabaseClient: {
    from: (table: string) => {
      update: (values: Record<string, unknown>) => {
        eq: (column: string, value: string) => Promise<{ error: unknown | null }>;
      };
    };
  },
  userId: string,
  locale: Locale
): Promise<boolean> {
  try {
    const { error } = await supabaseClient
      .from('profiles')
      .update({ locale, updated_at: new Date().toISOString() })
      .eq('id', userId);
    return !error;
  } catch {
    return false;
  }
}

/**
 * Resolves the initial active locale from an adapter or falls back to default 'bn'.
 */
export async function resolveInitialLocale(
  adapter?: LocaleStorageAdapter,
  fallback: Locale = DEFAULT_LOCALE
): Promise<Locale> {
  if (!adapter) return fallback;
  try {
    const stored = await adapter.getLocale();
    return stored ?? fallback;
  } catch {
    return fallback;
  }
}
