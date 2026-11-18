import React, { useState, useEffect, useCallback } from 'react';
import { View, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useLocale } from '@pranora/i18n';
import { ReportStatusTracker } from '../../features/rescue';
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
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
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
};

export default function RescueStatusScreen() {
  const { isBangla } = useLocale();
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const initialId = params.id;

  const [initialReport, setInitialReport] = useState<MyReportStatusResponse | null>(null);

  const fetchReport = useCallback(async (reportId: string): Promise<MyReportStatusResponse | null> => {
    await new Promise((resolve) => setTimeout(resolve, 350));

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
    <View className="flex-1 bg-white">
      {/* Title Header */}
      <View className="p-4 border-b border-gray-100 bg-gray-50">
        <Text className="text-xl font-bold text-gray-900">
          🔍 {isBangla ? 'রিপোর্ট ট্র্যাকার' : 'Rescue Report Tracker'}
        </Text>
        <Text className="text-xs text-gray-500 mt-0.5">
          {isBangla
            ? '৪-ধাপের অগ্রগতির মাধ্যমে আপনার প্রাণীর বর্তমান অবস্থা জানুন।'
            : 'Track real-time 4-stage rescue and responder updates.'}
        </Text>
      </View>

      <ReportStatusTracker
        initialReport={initialReport}
        onSearch={fetchReport}
        onNewReport={() => router.push('/rescue/report')}
      />
    </View>
  );
}
