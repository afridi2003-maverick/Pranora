'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { Locale } from '@pranora/types';
import { DEFAULT_LOCALE, isValidLocale } from './locale';
import {
  type LocaleStorageAdapter,
  WebStorageAdapter,
  MemoryStorageAdapter,
} from './persistence';

// Import common translations directly for zero-config fallback interpolation
import bnCommon from '../locales/bn/common.json';
import enCommon from '../locales/en/common.json';

export interface LocaleContextType {
  locale: Locale;
  setLocale: (newLocale: Locale) => Promise<void>;
  toggleLocale: () => Promise<void>;
  isBangla: boolean;
  isEnglish: boolean;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const LocaleContext = createContext<LocaleContextType | null>(null);

export interface LocaleProviderProps {
  initialLocale?: Locale;
  storageAdapter?: LocaleStorageAdapter;
  onLocaleChange?: (newLocale: Locale) => void;
  messages?: Partial<Record<Locale, Record<string, unknown>>>;
  children: React.ReactNode;
}

const defaultDict: Record<Locale, Record<string, unknown>> = {
  bn: bnCommon as unknown as Record<string, unknown>,
  en: enCommon as unknown as Record<string, unknown>,
};

/**
 * LocaleProvider for Web and App.
 * Manages active language state, persists selections to cookies/localStorage/AsyncStorage,
 * and updates DOM lang attribute when running in browser environments.
 */
export const LocaleProvider: React.FC<LocaleProviderProps> = ({
  initialLocale,
  storageAdapter,
  onLocaleChange,
  messages,
  children,
}) => {
  // Use WebStorageAdapter in browser, MemoryStorageAdapter elsewhere
  const activeAdapter = useMemo<LocaleStorageAdapter>(() => {
    if (storageAdapter) return storageAdapter;
    if (typeof window !== 'undefined') return new WebStorageAdapter();
    return new MemoryStorageAdapter(initialLocale ?? DEFAULT_LOCALE);
  }, [storageAdapter, initialLocale]);

  const [locale, setLocaleState] = useState<Locale>(() => {
    if (initialLocale && isValidLocale(initialLocale)) return initialLocale;
    const stored = activeAdapter.getLocale();
    if (stored && typeof (stored as Promise<Locale | null>).then !== 'function') {
      return (stored as Locale) ?? DEFAULT_LOCALE;
    }
    return DEFAULT_LOCALE;
  });

  // Async adapter resolution (e.g. AsyncStorage on mobile)
  useEffect(() => {
    if (initialLocale) return;
    const res = activeAdapter.getLocale();
    if (res && typeof (res as Promise<Locale | null>).then === 'function') {
      (res as Promise<Locale | null>).then((val) => {
        if (val && isValidLocale(val)) {
          setLocaleState(val);
        }
      });
    }
  }, [activeAdapter, initialLocale]);

  // Synchronize document HTML lang attribute on web
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  const setLocale = useCallback(
    async (newLocale: Locale) => {
      if (!isValidLocale(newLocale)) return;
      setLocaleState(newLocale);
      try {
        await activeAdapter.setLocale(newLocale);
      } catch {
        // storage write failure should not break UI
      }
      onLocaleChange?.(newLocale);
    },
    [activeAdapter, onLocaleChange]
  );

  const toggleLocale = useCallback(async () => {
    const nextLocale: Locale = locale === 'bn' ? 'en' : 'bn';
    await setLocale(nextLocale);
  }, [locale, setLocale]);

  // Deep dot-notation key lookup with interpolation: {{param}}
  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      // Remove namespace prefix if present, e.g. "common:actions.confirm" -> "actions.confirm"
      const cleanKey = key.includes(':') ? (key.split(':')[1] ?? key) : key;
      const dict = messages?.[locale] ?? defaultDict[locale];

      let value: unknown = dict;
      for (const segment of cleanKey.split('.')) {
        if (value && typeof value === 'object' && segment in value) {
          value = (value as Record<string, unknown>)[segment];
        } else {
          value = undefined;
          break;
        }
      }

      if (typeof value !== 'string') {
        return cleanKey;
      }

      if (!params) return value;

      return value.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, match) => {
        const paramVal = params[match];
        return paramVal !== undefined ? String(paramVal) : `{{${match}}}`;
      });
    },
    [locale, messages]
  );

  const contextValue = useMemo<LocaleContextType>(
    () => ({
      locale,
      setLocale,
      toggleLocale,
      isBangla: locale === 'bn',
      isEnglish: locale === 'en',
      t,
    }),
    [locale, setLocale, toggleLocale, t]
  );

  return <LocaleContext.Provider value={contextValue}>{children}</LocaleContext.Provider>;
};

/**
 * Hook to access current locale and switch language.
 */
export function useLocale(): LocaleContextType {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
}

/**
 * Hook for translations with namespace support.
 */
export function useTranslation(_namespace?: string) {
  const { locale, setLocale, toggleLocale, t } = useLocale();
  return {
    locale,
    setLocale,
    toggleLocale,
    t,
  };
}
