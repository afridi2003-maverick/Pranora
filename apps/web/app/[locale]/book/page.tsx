'use client';

import React, { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useLocale } from '@pranora/i18n';
import { Button } from '@pranora/ui';
import { BookingFlow } from '@/features/booking';

function BookingPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isBangla } = useLocale();

  const locationId = searchParams.get('locationId') || undefined;
  const vetId = searchParams.get('vetId') || undefined;
  const serviceId = searchParams.get('serviceId') || undefined;
  const bookingTypeParam = searchParams.get('bookingType');
  const bookingType = bookingTypeParam === 'serial' ? 'serial' : bookingTypeParam === 'slot' ? 'slot' : undefined;
  const date = searchParams.get('date') || undefined;

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-foreground pb-12">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        <div className="mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="text-xs text-content-secondary"
          >
            ← {isBangla ? 'পেছনে যান' : 'Back'}
          </Button>
        </div>

        <BookingFlow
          initialLocationId={locationId}
          initialVetId={vetId}
          initialServiceId={serviceId}
          initialBookingType={bookingType}
          initialDate={date}
        />
      </main>
    </div>
  );
}

export default function BookPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      }
    >
      <BookingPageContent />
    </Suspense>
  );
}
