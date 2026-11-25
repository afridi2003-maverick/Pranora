'use client';

import React from 'react';
import { ServiceGrid } from '../../../features/services';

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-app-bg">
      <main className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
        <ServiceGrid />
      </main>
    </div>
  );
}
