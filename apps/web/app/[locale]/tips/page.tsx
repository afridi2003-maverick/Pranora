'use client';

import React from 'react';
import { TipsList } from '../../../features/tips';

export default function TipsPage() {
  return (
    <div className="min-h-screen bg-app-bg">
      <main className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
        <TipsList />
      </main>
    </div>
  );
}
