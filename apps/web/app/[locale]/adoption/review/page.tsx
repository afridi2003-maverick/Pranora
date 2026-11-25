import React from 'react';
import { AdoptionReviewQueue } from '@/features/adoption';

export default function AdoptionReviewPage() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-foreground pb-12">
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <AdoptionReviewQueue />
      </main>
    </div>
  );
}
