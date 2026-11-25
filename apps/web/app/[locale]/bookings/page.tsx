import React from 'react';
import { MyBookings } from '@/features/booking';

export default function BookingsPage() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-foreground pb-12">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        <MyBookings />
      </main>
    </div>
  );
}
