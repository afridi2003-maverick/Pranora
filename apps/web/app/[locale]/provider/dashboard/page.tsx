import React from 'react';
import { LanguageHeader } from '@/components/LanguageHeader';
import { ProviderDashboard } from '@/features/provider';

export default function ProviderDashboardPage() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-foreground pb-12">
      <LanguageHeader />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <ProviderDashboard />
      </main>
    </div>
  );
}
