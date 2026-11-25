import React from 'react';
import { CallRecordingConsentBar } from '@/features/calls';

export default function CallRecordingPage() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-foreground pb-12">
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        <CallRecordingConsentBar />
      </main>
    </div>
  );
}
