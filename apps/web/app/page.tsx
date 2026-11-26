'use client';

import React from 'react';
import { LocaleProvider } from '@pranora/i18n';
import { AppShell } from '../components/AppShell';
import { HomeDashboard } from '../components/HomeDashboard';

export default function HomePage() {
  return (
    <LocaleProvider>
      <AppShell>
        <HomeDashboard />
      </AppShell>
    </LocaleProvider>
  );
}
