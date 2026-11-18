import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useLocale } from '@pranora/i18n';
import {
  MOCK_ASSIGNMENTS,
  type AssignmentWithReport,
} from './assignmentMockData';
import { RescuerAssignmentCard } from './RescuerAssignmentCard';

interface RescuerCasesListProps {
  initialAssignments?: AssignmentWithReport[];
  onRespond?: (assignmentId: string, accept: boolean, declineReason?: string) => Promise<void>;
  onViewCase?: (caseId: string) => void;
}

export function RescuerCasesList({
  initialAssignments = MOCK_ASSIGNMENTS,
  onRespond,
  onViewCase,
}: RescuerCasesListProps) {
  const { isBangla } = useLocale();
  const [items, setItems] = useState<AssignmentWithReport[]>(initialAssignments);
  const [activeTab, setActiveTab] = useState<'offered' | 'accepted' | 'all'>('offered');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const offeredCount = items.filter((i) => i.assignment.status === 'offered').length;
  const acceptedCount = items.filter((i) => i.assignment.status === 'accepted').length;

  const handleRespond = async (assignmentId: string, accept: boolean, declineReason?: string) => {
    setIsSubmitting(true);
    try {
      if (onRespond) {
        await onRespond(assignmentId, accept, declineReason);
      }

      setItems((prev) =>
        prev.map((i) => {
          if (i.assignment.id === assignmentId) {
            return {
              ...i,
              assignment: {
                ...i.assignment,
                status: accept ? 'accepted' : 'declined',
                decline_reason: declineReason || null,
                responded_at: new Date().toISOString(),
              },
              rescueCase: {
                ...i.rescueCase,
                status: accept ? 'rescue_in_progress' : 'under_review',
              },
            };
          }
          return i;
        })
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredItems = items.filter((i) => {
    if (activeTab === 'offered') return i.assignment.status === 'offered';
    if (activeTab === 'accepted') return i.assignment.status === 'accepted';
    return true;
  });

  return (
    <ScrollView className="flex-1 bg-white p-4" showsVerticalScrollIndicator={false}>
      {/* Tabs */}
      <View className="flex-row border-b border-gray-200 mb-4 gap-2">
        <TouchableOpacity
          onPress={() => setActiveTab('offered')}
          className={`pb-2.5 px-3 border-b-2 flex-row items-center gap-1.5 ${
            activeTab === 'offered' ? 'border-primary' : 'border-transparent'
          }`}
        >
          <Text
            className={`text-xs font-semibold ${
              activeTab === 'offered' ? 'text-primary font-bold' : 'text-gray-500'
            }`}
          >
            🔔 {isBangla ? 'নতুন অফার' : 'Offered'}
          </Text>
          {offeredCount > 0 && (
            <View className="px-1.5 py-0.2 rounded-full bg-amber-500">
              <Text className="text-white text-[10px] font-bold">{offeredCount}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('accepted')}
          className={`pb-2.5 px-3 border-b-2 flex-row items-center gap-1.5 ${
            activeTab === 'accepted' ? 'border-primary' : 'border-transparent'
          }`}
        >
          <Text
            className={`text-xs font-semibold ${
              activeTab === 'accepted' ? 'text-primary font-bold' : 'text-gray-500'
            }`}
          >
            🏃 {isBangla ? 'চলমান কেস' : 'In Progress'}
          </Text>
          {acceptedCount > 0 && (
            <View className="px-1.5 py-0.2 rounded-full bg-green-600">
              <Text className="text-white text-[10px] font-bold">{acceptedCount}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('all')}
          className={`pb-2.5 px-3 border-b-2 ${
            activeTab === 'all' ? 'border-primary' : 'border-transparent'
          }`}
        >
          <Text
            className={`text-xs font-semibold ${
              activeTab === 'all' ? 'text-primary font-bold' : 'text-gray-500'
            }`}
          >
            📋 {isBangla ? 'সকল' : 'All'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Cards List */}
      {filteredItems.length > 0 ? (
        <View className="pb-8">
          {filteredItems.map((item) => (
            <RescuerAssignmentCard
              key={item.assignment.id}
              item={item}
              onRespond={handleRespond}
              onViewCase={onViewCase}
              isSubmitting={isSubmitting}
            />
          ))}
        </View>
      ) : (
        <View className="items-center justify-center p-8 border border-dashed border-gray-200 rounded-2xl bg-gray-50 my-6">
          <Text className="text-3xl mb-2">🚑</Text>
          <Text className="text-sm font-semibold text-gray-800 mb-1 text-center">
            {activeTab === 'offered'
              ? isBangla ? 'কোনো নতুন কেস অফার নেই' : 'No pending offers'
              : isBangla ? 'কোনো রেকর্ড পাওয়া যায়নি' : 'No cases in this tab'}
          </Text>
          <Text className="text-xs text-gray-500 text-center">
            {isBangla
              ? 'আপনার এলাকায় জরুরি কেস রিপোর্ট হলে সরাসরি এখানে দেখতে পাবেন।'
              : 'New dispatch offers will appear here automatically.'}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}
