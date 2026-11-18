import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useLocale } from '@pranora/i18n';
import type { MyReportStatusResponse } from '@pranora/api';
import type { RescueStatus } from '@pranora/types';

interface ReportStatusTrackerProps {
  initialReport?: MyReportStatusResponse | null;
  onSearch?: (reportId: string) => Promise<MyReportStatusResponse | null>;
  onNewReport?: () => void;
}

interface StepDefinition {
  key: string;
  bnTitle: string;
  enTitle: string;
  bnDesc: string;
  enDesc: string;
}

const STEPS: StepDefinition[] = [
  {
    key: 'submitted',
    bnTitle: 'জমা',
    enTitle: 'Submitted',
    bnDesc: 'রিপোর্টটি সফলভাবে ডাটাবেজে সংরক্ষিত হয়েছে।',
    enDesc: 'Report registered in system.',
  },
  {
    key: 'under_review',
    bnTitle: 'দেখা হচ্ছে',
    enTitle: 'Under Review',
    bnDesc: 'সমন্বয়কারী দল জরুরি অবস্থা ও বিবরণ যাচাই করছেন।',
    enDesc: 'Reviewers are evaluating priority and dispatching.',
  },
  {
    key: 'rescue_in_progress',
    bnTitle: 'উদ্ধার চলছে',
    enTitle: 'Rescue in Progress',
    bnDesc: 'উদ্ধারকারী দল মাঠে নিয়োজিত এবং উদ্ধার কাজ পরিচালিত হচ্ছে।',
    enDesc: 'Rescuer is active on site.',
  },
  {
    key: 'closed',
    bnTitle: 'শেষ',
    enTitle: 'Closed',
    bnDesc: 'প্রাথমিক চিকিৎসা, আশ্রয় বা হস্তান্তর প্রক্রিয়া সম্পন্ন।',
    enDesc: 'Case safely concluded.',
  },
];

function getActiveStepIndex(status: RescueStatus): number {
  switch (status) {
    case 'submitted':
      return 0;
    case 'under_review':
      return 1;
    case 'assigned':
    case 'rescue_in_progress':
      return 2;
    case 'closed':
      return 3;
    case 'rejected':
    case 'duplicate':
      return -1;
    default:
      return 0;
  }
}

const URGENCY_COLORS: Record<string, { bn: string; en: string; bg: string; text: string }> = {
  critical: { bn: 'খুব জরুরি', en: 'Critical', bg: 'bg-red-600', text: 'text-white' },
  high: { bn: 'উচ্চ', en: 'High', bg: 'bg-amber-600', text: 'text-white' },
  medium: { bn: 'মাঝারি', en: 'Medium', bg: 'bg-green-700', text: 'text-white' },
  low: { bn: 'কম', en: 'Low', bg: 'bg-gray-200', text: 'text-gray-800' },
};

export function ReportStatusTracker({
  initialReport = null,
  onSearch,
  onNewReport,
}: ReportStatusTrackerProps) {
  const { isBangla } = useLocale();
  const [reportIdInput, setReportIdInput] = useState('');
  const [report, setReport] = useState<MyReportStatusResponse | null>(initialReport);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const handleSearch = async () => {
    const query = reportIdInput.trim();
    if (!query) return;

    setIsSearching(true);
    setSearchError(null);

    try {
      if (onSearch) {
        const found = await onSearch(query);
        if (found) {
          setReport(found);
        } else {
          setReport(null);
          setSearchError(
            isBangla
              ? 'এই আইডির কোনো রিপোর্ট পাওয়া যায়নি।'
              : 'No report found with this ID.'
          );
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Search failed';
      setSearchError(msg);
    } finally {
      setIsSearching(false);
    }
  };

  const activeIndex = report ? getActiveStepIndex(report.status) : 0;
  const isTerminalOther = report && (report.status === 'rejected' || report.status === 'duplicate');

  return (
    <ScrollView className="flex-1 p-4 bg-white" showsVerticalScrollIndicator={false}>
      {/* Search Input Box */}
      <View className="p-4 rounded-xl border border-gray-200 bg-gray-50 mb-5">
        <Text className="text-sm font-semibold text-gray-800 mb-2">
          {isBangla ? 'রিপোর্ট ট্র্যাকিং আইডি লিখুন' : 'Enter Report Tracking ID'}
        </Text>
        <View className="flex-row gap-2">
          <TextInput
            placeholder={isBangla ? 'যেমন: rep-123xyz বা UUID' : 'e.g. rep-123xyz or UUID'}
            value={reportIdInput}
            onChangeText={setReportIdInput}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white"
          />
          <TouchableOpacity
            onPress={handleSearch}
            disabled={isSearching || !reportIdInput.trim()}
            className="px-4 py-2 rounded-lg bg-primary items-center justify-center"
            activeOpacity={0.8}
          >
            {isSearching ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text className="text-white font-bold text-xs">
                {isBangla ? 'খুঁজুন' : 'Track'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {searchError && (
          <Text className="text-xs text-red-600 mt-2">{searchError}</Text>
        )}
      </View>

      {/* Report Status Card */}
      {report ? (
        <View className="p-4 rounded-2xl border border-gray-200 bg-white mb-6">
          {/* Header Summary */}
          <View className="flex-row items-center justify-between pb-3 border-b border-gray-200 mb-3">
            <View className="flex-row items-center gap-2">
              <Text className="text-2xl">
                {report.kind === 'injured'
                  ? '🚑'
                  : report.kind === 'lost'
                  ? '🔍'
                  : report.kind === 'found'
                  ? '🐾'
                  : '📦'}
              </Text>
              <View>
                <Text className="text-base font-bold text-gray-900">
                  {isBangla ? report.statusBn : report.statusEn}
                </Text>
                <Text className="text-xs font-mono text-gray-500">
                  ID: {report.reportId}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center gap-1.5">
              <View
                className={`px-2 py-0.5 rounded-full ${
                  URGENCY_COLORS[report.urgency]?.bg ?? 'bg-gray-200'
                }`}
              >
                <Text
                  className={`text-[11px] font-bold ${
                    URGENCY_COLORS[report.urgency]?.text ?? 'text-gray-800'
                  }`}
                >
                  {isBangla
                    ? URGENCY_COLORS[report.urgency]?.bn
                    : URGENCY_COLORS[report.urgency]?.en}
                </Text>
              </View>
              <View className="px-2 py-0.5 rounded-full bg-green-50 border border-green-200">
                <Text className="text-[11px] font-semibold text-green-800 capitalize">
                  {report.species}
                </Text>
              </View>
            </View>
          </View>

          {/* Area & Submission Time */}
          <View className="mb-4">
            {report.areaText && (
              <Text className="text-xs text-gray-600 mb-1">
                📍 <Text className="font-semibold text-gray-800">{isBangla ? 'এলাকা: ' : 'Area: '}</Text>
                {report.areaText}
              </Text>
            )}
            <Text className="text-xs text-gray-500">
              🕒 <Text className="font-semibold text-gray-800">{isBangla ? 'দাখিল: ' : 'Reported: '}</Text>
              {new Date(report.createdAt).toLocaleString(isBangla ? 'bn-BD' : 'en-US')}
            </Text>
          </View>

          {/* Stepper Timeline */}
          {isTerminalOther ? (
            <View className="p-3 rounded-xl bg-gray-100 border border-gray-300 mb-4 items-center">
              <Text className="text-xs font-bold text-gray-800 text-center">
                {report.status === 'rejected'
                  ? isBangla
                    ? 'রিপোর্টটি বাতিল বা নিষ্ক্রিয় করা হয়েছে।'
                    : 'Report was cancelled.'
                  : isBangla
                  ? 'এই রিপোর্টটি কাছাকাছি অপর একটি রিপোর্টের সাথে মার্জ করা হয়েছে।'
                  : 'Report was merged with another duplicate report.'}
              </Text>
            </View>
          ) : (
            <View className="mb-5">
              <Text className="text-sm font-semibold text-gray-800 mb-3">
                {isBangla ? 'উদ্ধার অগ্রগতি' : 'Rescue Progress'}
              </Text>

              <View className="pl-2 space-y-4">
                {STEPS.map((step, idx) => {
                  const isCompleted = activeIndex > idx || activeIndex === 3;
                  const isCurrent = activeIndex === idx && activeIndex !== 3;

                  return (
                    <View key={step.key} className="flex-row items-start gap-3">
                      {/* Step Circle Badge */}
                      <View
                        className={`w-6 h-6 rounded-full items-center justify-center ${
                          isCompleted
                            ? 'bg-green-600'
                            : isCurrent
                            ? 'bg-primary'
                            : 'bg-gray-200'
                        }`}
                      >
                        <Text className="text-white text-xs font-bold">
                          {isCompleted ? '✓' : idx + 1}
                        </Text>
                      </View>

                      {/* Step Text */}
                      <View className="flex-1">
                        <Text
                          className={`text-xs font-bold ${
                            isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-400'
                          }`}
                        >
                          {isBangla ? step.bnTitle : step.enTitle}
                        </Text>
                        <Text className="text-[11px] text-gray-500 mt-0.5 leading-4">
                          {isBangla ? step.bnDesc : step.enDesc}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {/* Privacy Budget Notice */}
          <View className="p-3 rounded-xl bg-gray-50 border border-gray-200 mb-4 flex-row items-start gap-2">
            <Text className="text-sm">🔒</Text>
            <Text className="text-[11px] text-gray-600 flex-1 leading-4">
              {isBangla
                ? 'গোপনীয়তা ও নিরাপত্তার স্বার্থে উদ্ধারকারীর ব্যক্তিগত ফোন নম্বর বা অভ্যন্তরীণ কেস নোট এখানে প্রকাশ করা হয় না।'
                : 'Rescuer personal contacts and internal coordinator notes are strictly protected.'}
            </Text>
          </View>

          {/* Action Button */}
          <TouchableOpacity
            onPress={handleSearch}
            className="w-full py-2.5 rounded-lg bg-gray-100 border border-gray-300 items-center"
            activeOpacity={0.7}
          >
            <Text className="text-xs font-semibold text-gray-800">
              🔄 {isBangla ? 'রিফ্রেশ করুন' : 'Refresh Status'}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        /* Empty State */
        <View className="items-center justify-center p-8 border border-dashed border-gray-200 rounded-2xl bg-gray-50 mb-6">
          <Text className="text-4xl mb-2">📋</Text>
          <Text className="text-sm font-semibold text-gray-800 mb-1 text-center">
            {isBangla ? 'রিপোর্টের বর্তমান অবস্থা জানুন' : 'Track Rescue Progress'}
          </Text>
          <Text className="text-xs text-gray-500 text-center leading-4 max-w-xs mb-3">
            {isBangla
              ? 'রিপোর্ট করার সময় পাওয়া ট্র্যাকিং আইডি উপরে লিখুন।'
              : 'Enter the tracking ID from your submission to see the 4-step progress.'}
          </Text>
          {onNewReport && (
            <TouchableOpacity
              onPress={onNewReport}
              className="px-4 py-2 rounded-lg bg-green-50 border border-green-300"
              activeOpacity={0.7}
            >
              <Text className="text-xs font-semibold text-green-800">
                {isBangla ? 'নতুন প্রাণী রিপোর্ট করতে চান?' : 'Need to report an animal?'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </ScrollView>
  );
}
