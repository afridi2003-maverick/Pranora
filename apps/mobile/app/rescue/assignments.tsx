import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useLocale } from '@pranora/i18n';
import {
  RescuerCasesList,
  AssignRescuerModal,
  MOCK_ASSIGNMENTS,
} from '../../features/rescue';

export default function RescuerAssignmentsScreen() {
  const router = useRouter();
  const { isBangla } = useLocale();

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  const handleRespond = async (
    assignmentId: string,
    accept: boolean,
    declineReason?: string
  ): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    console.log('Mobile respond assignment:', { assignmentId, accept, declineReason });
  };

  const handleAssign = async (
    caseId: string,
    rescuerId: string
  ): Promise<{ success: boolean; error?: string }> => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    console.log('Mobile assigned rescuer:', { caseId, rescuerId });
    return { success: true };
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header Bar */}
      <View className="p-4 border-b border-gray-100 bg-gray-50 flex-row items-center justify-between">
        <View>
          <Text className="text-lg font-bold text-gray-900">
            🚑 {isBangla ? 'উদ্ধারকারী কেস তালিকা' : 'Rescuer Assignments'}
          </Text>
          <Text className="text-xs text-gray-500 mt-0.5">
            {isBangla ? 'প্রস্তাবিত ও দায়িত্বপ্রাপ্ত জরুরি কেস' : 'Dispatched emergency cases'}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => setIsAssignModalOpen(true)}
          className="px-3 py-1.5 rounded-lg bg-gray-200"
        >
          <Text className="text-xs font-semibold text-gray-800">
            ➕ {isBangla ? 'নিয়োগ' : 'Assign'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Main List */}
      <RescuerCasesList
        initialAssignments={MOCK_ASSIGNMENTS}
        onRespond={handleRespond}
        onViewCase={(caseId) => router.push(`/rescue/cases/${caseId}`)}
      />

      {/* Coordinator Assign Modal */}
      <AssignRescuerModal
        visible={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        caseId="case-201"
        reportSpecies="dog (কুকুর)"
        reportArea="Mirpur 10, Dhaka"
        onAssign={handleAssign}
      />
    </View>
  );
}
