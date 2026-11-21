'use client';

import React from 'react';
import { LanguageHeader } from '../../../components/LanguageHeader';
import { TipsList } from '../../../features/tips';

export default function TipsPage() {
  return (
    <div className="min-h-screen bg-app-bg">
      <LanguageHeader />
      <main className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
        <TipsList />
      </main>
    </div>
  );
}
