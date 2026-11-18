'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useLocale } from '@pranora/i18n';
import { LanguageHeader } from '../../../../components/LanguageHeader';
import { ReportStatusTracker } from '../../../../features/rescue';
import type { MyReportStatusResponse } from '@pranora/api';

const MOCK_REPORTS: Record<string, MyReportStatusResponse> = {
  'rep-demo-1': {
    reportId: 'rep-demo-1',
    kind: 'injured',
    species: 'dog',
    status: 'under_review',
    statusBn: 'দেখা হচ্ছে',
    statusEn: 'Under Review',
    urgency: 'critical',
    areaText: 'Mirpur 10, Near Roundabout, Dhaka',
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 mins ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  'rep-demo-2': {
    reportId: 'rep-demo-2',
    kind: 'lost',
    species: 'cat',
    status: 'rescue_in_progress',
    statusBn: 'উদ্ধার চলছে',
    statusEn: 'Rescue in Progress',
    urgency: 'high',
    areaText: 'Dhanmondi 27, Dhaka',
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  'rep-demo-3': {
    reportId: 'rep-demo-3',
    kind: 'found',
    species: 'cat',
    status: 'closed',
    statusBn: 'শেষ',
    statusEn: 'Closed',
    urgency: 'medium',
    areaText: 'Uttara Sector 7, Dhaka',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
};

export default function RescueStatusPage() {
  const { isBangla } = useLocale();
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialId = searchParams.get('id');

  const [initialReport, setInitialReport] = useState<MyReportStatusResponse | null>(null);

  const fetchReport = useCallback(async (reportId: string): Promise<MyReportStatusResponse | null> => {
    // 400ms network simulation
    await new Promise((resolve) => setTimeout(resolve, 400));

    // Return matching mock report or generate dynamic report for any newly submitted ID
    if (MOCK_REPORTS[reportId]) {
      return MOCK_REPORTS[reportId];
    }

    if (reportId.startsWith('rep-') || reportId.length > 5) {
      return {
        reportId,
        kind: 'injured',
        species: 'dog',
        status: 'submitted',
        statusBn: 'জমা',
        statusEn: 'Submitted',
        urgency: 'high',
        areaText: 'Dhaka Metropolitan Area',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    return null;
  }, []);

  useEffect(() => {
    if (initialId) {
      fetchReport(initialId).then((data) => {
        if (data) setInitialReport(data);
      });
    }
  }, [initialId, fetchReport]);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-foreground">
      <LanguageHeader />

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            🔍 {isBangla ? 'রিপোর্ট ট্র্যাকার' : 'Rescue Report Tracker'}
          </h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1 max-w-lg mx-auto">
            {isBangla
              ? 'রিপোর্ট দাখিলের পর এর অগ্রগতি ও উদ্ধার কার্যক্রম সরাসরি পর্যবেক্ষণ করুন।'
              : 'Track real-time progress and verification stages for your animal rescue reports.'}
          </p>
        </div>

        <ReportStatusTracker
          initialReport={initialReport}
          onSearch={fetchReport}
          onNewReport={() => router.push('/rescue/report')}
        />
      </main>
    </div>
  );
}
