import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useLocale } from '@pranora/i18n';
import type { RescueStatus, RescueOutcome } from '@pranora/types';
import type { RescueCaseFullDetails } from './caseDetailMockData';
import { CaseUpdateTimeline } from './CaseUpdateTimeline';
import { AddCaseUpdateForm } from './AddCaseUpdateForm';
import { CloseCaseOutcomeModal } from './CloseCaseOutcomeModal';

interface RescueCaseDetailsProps {
  initialDetails: RescueCaseFullDetails;
  onAddUpdate?: (payload: {
    case_id: string;
    note?: string | null;
    status?: RescueStatus | null;
    photos?: string[];
  }) => Promise<{ error?: string }>;
  onCloseCase?: (payload: {
    case_id: string;
    outcome: RescueOutcome;
    note?: string | null;
    pet_id?: string | null;
  }) => Promise<{ error?: string }>;
  onCloseCaseClick?: () => void;
}

export function RescueCaseDetails({
  initialDetails,
  onAddUpdate,
  onCloseCase,
  onCloseCaseClick,
}: RescueCaseDetailsProps) {
  const { isBangla } = useLocale();
  const [details, setDetails] = useState<RescueCaseFullDetails>(initialDetails);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);

  const { rescueCase, report, updates } = details;

  const handlePostUpdate = async (payload: {
    case_id: string;
    note?: string | null;
    status?: RescueStatus | null;
    photos?: string[];
  }): Promise<{ error?: string }> => {
    setIsSubmitting(true);
    try {
      if (onAddUpdate) {
        const res = await onAddUpdate(payload);
        if (res.error) return res;
      }

      const newUpdate = {
        id: `upd-${Date.now().toString(36)}`,
        case_id: payload.case_id,
        author_id: 'rescuer-current',
        author_name: isBangla ? 'বর্তমান উদ্ধারকারী' : 'Current Rescuer',
        author_role: 'rescuer',
        status: payload.status ?? null,
        note: payload.note ?? null,
        photos: payload.photos ?? [],
        created_at: new Date().toISOString(),
      };

      setDetails((prev) => ({
        ...prev,
        rescueCase: {
          ...prev.rescueCase,
          status: payload.status || prev.rescueCase.status,
        },
        updates: [...prev.updates, newUpdate],
      }));

      return {};
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExecuteClose = async (payload: {
    case_id: string;
    outcome: RescueOutcome;
    note?: string | null;
    pet_id?: string | null;
  }): Promise<{ error?: string; success?: boolean }> => {
    setIsSubmitting(true);
    try {
      if (onCloseCase) {
        const res = await onCloseCase(payload);
        if (res.error) return res;
      }

      const closedTimestamp = new Date().toISOString();
      const closeAuditUpdate = {
        id: `upd-close-${Date.now().toString(36)}`,
        case_id: payload.case_id,
        author_id: 'rescuer-current',
        author_name: isBangla ? 'উদ্ধারকারী দল' : 'Rescue Team',
        author_role: 'rescuer',
        status: 'closed' as RescueStatus,
        note: `[Case Closed] Outcome: ${payload.outcome}. ${payload.note || ''}`,
        photos: [],
        created_at: closedTimestamp,
      };

      setDetails((prev) => ({
        ...prev,
        rescueCase: {
          ...prev.rescueCase,
          status: 'closed',
          outcome: payload.outcome,
          outcome_note: payload.note || null,
          closed_at: closedTimestamp,
          pet_id: payload.pet_id || prev.rescueCase.pet_id,
        },
        updates: [...prev.updates, closeAuditUpdate],
      }));

      return { success: true };
    } finally {
      setIsSubmitting(false);
    }
  };

  const isCritical = report.urgency === 'critical';
  const isClosed = rescueCase.status === 'closed';

  return (
    <ScrollView className="flex-1 bg-white p-4" showsVerticalScrollIndicator={false}>
      {/* 1. Header Card */}
      <View className="bg-white rounded-2xl border border-gray-200 p-4 mb-4 shadow-sm">
        <View className="flex-row items-center justify-between pb-3 border-b border-gray-100 mb-3">
          <View className="flex-row items-center gap-2">
            <Text className="text-3xl">
              {report.kind === 'injured'
                ? '🚑'
                : report.kind === 'lost'
                ? '🔍'
                : report.kind === 'found'
                ? '🐾'
                : '📦'}
            </Text>
            <View>
              <Text className="text-base font-bold text-gray-900 capitalize">
                {report.species} · {report.kind}
              </Text>
              <Text className="text-[11px] font-mono text-gray-400">
                Case #{rescueCase.id.slice(0, 8)}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center gap-1.5">
            <View
              className={`px-2.5 py-0.5 rounded-full ${
                isCritical
                  ? 'bg-red-600'
                  : report.urgency === 'high'
                  ? 'bg-amber-600'
                  : 'bg-green-700'
              }`}
            >
              <Text className="text-white text-[10px] font-bold uppercase">
                {report.urgency}
              </Text>
            </View>

            <View
              className={`px-2.5 py-0.5 rounded-full ${
                isClosed ? 'bg-gray-200' : 'bg-green-50 border border-green-200'
              }`}
            >
              <Text
                className={`text-[10px] font-semibold capitalize ${
                  isClosed ? 'text-gray-800' : 'text-green-800'
                }`}
              >
                {rescueCase.status.replace('_', ' ')}
              </Text>
            </View>
          </View>
        </View>

        {/* Closed Outcome Banner */}
        {isClosed && rescueCase.outcome && (
          <View className="p-3 rounded-xl bg-green-50 border border-green-300 mb-3">
            <View className="flex-row items-center justify-between mb-1">
              <View className="flex-row items-center gap-1.5">
                <Text className="text-base">🏆</Text>
                <Text className="text-xs font-bold text-green-900">
                  {isBangla ? 'কেস সম্পন্ন (ফলাফল)' : 'Case Closed (Outcome)'}
                </Text>
              </View>
              <View className="px-2 py-0.5 rounded-full bg-green-200">
                <Text className="text-[10px] font-bold text-green-900 uppercase">
                  {rescueCase.outcome}
                </Text>
              </View>
            </View>
            {rescueCase.outcome_note && (
              <Text className="text-xs text-green-800 italic">
                "{rescueCase.outcome_note}"
              </Text>
            )}
          </View>
        )}

        {/* Photos */}
        {report.photos && report.photos.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2 mb-3">
            {report.photos.map((src, idx) => (
              <Image
                key={idx}
                source={{ uri: src }}
                className="w-28 h-28 rounded-xl bg-gray-100"
                resizeMode="cover"
              />
            ))}
          </ScrollView>
        )}

        {/* Location & Details */}
        <View className="mb-3">
          <Text className="text-xs font-bold text-gray-900 mb-1">
            📍 {report.area_text || (isBangla ? 'এলাকা নির্ধারিত নয়' : 'Location unspecified')}
          </Text>
          {report.description && (
            <Text className="text-xs text-gray-600 leading-4 p-2.5 bg-gray-50 rounded-xl border border-gray-100">
              {report.description}
            </Text>
          )}
        </View>

        {/* Confidential Call Hotline */}
        {report.contact_phone && (
          <View className="p-2.5 rounded-xl bg-green-50 border border-green-200 flex-row items-center justify-between mb-2">
            <View>
              <Text className="text-[10px] text-green-900 font-semibold">
                📞 {isBangla ? 'রিপোর্টার হটলাইন (গোপনীয়)' : 'Reporter (Confidential)'}
              </Text>
              <Text className="text-xs font-mono font-bold text-green-800">
                {report.contact_phone}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => Linking.openURL(`tel:${report.contact_phone}`)}
              className="px-3 py-1 rounded-lg bg-green-700"
            >
              <Text className="text-white text-xs font-bold">
                {isBangla ? 'কল' : 'Call'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Close Case action trigger */}
        {!isClosed && (
          <TouchableOpacity
            onPress={() => {
              if (onCloseCaseClick) onCloseCaseClick();
              else setIsCloseModalOpen(true);
            }}
            className="w-full py-2.5 rounded-xl bg-red-50 border border-red-200 items-center mt-2"
          >
            <Text className="text-red-700 font-bold text-xs">
              🔒 {isBangla ? 'কেস সমাপ্ত করুন (RSC-7)' : 'Close Case (RSC-7)'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 2. Add Update Form */}
      {!isClosed && (
        <AddCaseUpdateForm
          caseId={rescueCase.id}
          currentStatus={rescueCase.status}
          onSubmit={handlePostUpdate}
          isSubmitting={isSubmitting}
        />
      )}

      {/* 3. Timeline */}
      <CaseUpdateTimeline updates={updates} />

      {/* 4. Close Case Modal */}
      <CloseCaseOutcomeModal
        visible={isCloseModalOpen}
        onClose={() => setIsCloseModalOpen(false)}
        caseId={rescueCase.id}
        animalSpecies={report.species}
        isLostReport={report.kind === 'lost' || report.kind === 'found'}
        onSubmit={handleExecuteClose}
        isSubmitting={isSubmitting}
      />
    </ScrollView>
  );
}
