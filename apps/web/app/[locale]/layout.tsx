import React from 'react';
import { LocaleProvider, isValidLocale, DEFAULT_LOCALE } from '@pranora/i18n';
import { AppShell } from '../../components/AppShell';

export default function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const activeLocale = isValidLocale(params.locale) ? params.locale : DEFAULT_LOCALE;

  return (
    <LocaleProvider initialLocale={activeLocale}>
      <AppShell>{children}</AppShell>
    </LocaleProvider>
  );
}
