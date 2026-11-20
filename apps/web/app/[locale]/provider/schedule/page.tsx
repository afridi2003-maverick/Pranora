import React from 'react';
import { LanguageHeader } from '@/components/LanguageHeader';
import { VetScheduleManager } from '@/features/provider';

export default function VetSchedulePage() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-foreground pb-12">
      <LanguageHeader />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <VetScheduleManager />
      </main>
    </div>
  );
}
