import React from 'react';
import { LanguageHeader } from '@/components/LanguageHeader';
import { ProviderOnboarding } from '@/features/provider';

export default function ProviderOnboardingPage() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-foreground pb-12">
      <LanguageHeader />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        <ProviderOnboarding />
      </main>
    </div>
  );
}
