import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocale, formatDate } from '@pranora/i18n';
import type { PetRow, MedicalRecordRow, PetDocumentRow, AddMedicalRecordPayload } from '@pranora/api';
import { PetPicker } from '../pets';
import { UploadDocumentModal } from './UploadDocumentModal';
import { AddMedicalRecordModal } from './AddMedicalRecordModal';

export interface MedicalHistoryScreenProps {
  pets: PetRow[];
  selectedPet: PetRow | null;
  onSelectPet: (pet: PetRow) => void;
  medicalRecords: MedicalRecordRow[];
  documents: PetDocumentRow[];
  onUploadDocument: (payload: {
    pet_id: string;
    title: string;
    file_path: string;
    document_date?: string;
  }) => Promise<{ error?: string }>;
  onDeleteDocument: (id: string) => Promise<{ error?: string }>;
  onAddMedicalRecord?: (payload: AddMedicalRecordPayload) => Promise<{ error?: string }>;
  isVet?: boolean;
  loading?: boolean;
}

export function MedicalHistoryScreen({
  pets,
  selectedPet,
  onSelectPet,
  medicalRecords,
  documents,
  onUploadDocument,
  onDeleteDocument,
  onAddMedicalRecord,
  isVet = false,
  loading = false,
}: MedicalHistoryScreenProps) {
  const { t } = useLocale();
  const [activeTab, setActiveTab] = useState<'clinical' | 'documents'>('clinical');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAddRecordModal, setShowAddRecordModal] = useState(false);

  const handleDeleteDoc = (docId: string) => {
    Alert.alert(
      t('pets:delete'),
      t('health:medicalHistory.deleteDocConfirm'),
      [
        { text: t('pets:actions.cancel'), style: 'cancel' },
        {
          text: t('pets:actions.delete'),
          style: 'destructive',
          onPress: () => onDeleteDocument(docId),
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-4 py-3 bg-white border-b border-gray-200">
        <Text className="text-xl font-bold text-gray-900 mb-1">
          📋 {t('health:medicalHistory.label')}
        </Text>
        <PetPicker
          pets={pets}
          selectedPetId={selectedPet?.id ?? null}
          onSelectPet={onSelectPet}
          placeholder={t('health:vaccines.selectPet')}
        />

        {/* Tab Toggle */}
        <View className="flex-row bg-gray-100 p-1 rounded-xl mt-3">
          <TouchableOpacity
            onPress={() => setActiveTab('clinical')}
            className={`flex-1 py-2 rounded-lg items-center ${
              activeTab === 'clinical' ? 'bg-white shadow-sm' : ''
            }`}
          >
            <Text
              className={`text-xs font-bold ${
                activeTab === 'clinical' ? 'text-primary' : 'text-gray-500'
              }`}
            >
              🩺 {t('health:medicalHistory.label')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab('documents')}
            className={`flex-1 py-2 rounded-lg items-center ${
              activeTab === 'documents' ? 'bg-white shadow-sm' : ''
            }`}
          >
            <Text
              className={`text-xs font-bold ${
                activeTab === 'documents' ? 'text-primary' : 'text-gray-500'
              }`}
            >
              📁 {t('health:medicalHistory.ownerUploads')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#2F7B53" />
        </View>
      ) : !selectedPet ? (
        <View className="flex-1 justify-center items-center px-6">
          <Text className="text-4xl mb-3">🐾</Text>
          <Text className="text-sm text-gray-500 text-center">
            {t('health:vaccines.selectPet')}
          </Text>
        </View>
      ) : activeTab === 'clinical' ? (
        <FlatList
          data={medicalRecords}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          ListHeaderComponent={
            <View className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 mb-4 flex-row items-center justify-between">
              <View className="flex-1 mr-2">
                <Text className="text-xs font-bold text-amber-900">
                  🛡️ {t('health:medicalHistory.vetWritten')}
                </Text>
                <Text className="text-[11px] text-amber-700">
                  {t('health:medicalHistory.ownerReadOnly')}
                </Text>
              </View>
              {isVet && onAddMedicalRecord && (
                <TouchableOpacity
                  onPress={() => setShowAddRecordModal(true)}
                  className="bg-primary px-3 py-1.5 rounded-lg"
                >
                  <Text className="text-xs font-bold text-white">
                    + {t('health:medicalHistory.addRecord')}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          }
          ListEmptyComponent={
            <View className="bg-white rounded-2xl p-8 border border-dashed border-gray-300 items-center">
              <Text className="text-3xl mb-2">🩺</Text>
              <Text className="text-sm font-bold text-gray-800 mb-1">
                {t('health:medicalHistory.noRecords')}
              </Text>
              <Text className="text-xs text-gray-500 text-center">
                {t('health:medicalHistory.ownerReadOnly')}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <View className="bg-white rounded-2xl p-4 mb-4 border border-gray-200 shadow-sm">
              <View className="flex-row justify-between items-start mb-2">
                <View className="flex-1 mr-2">
                  <Text className="text-base font-bold text-gray-900">
                    {item.diagnosis || 'Clinical Examination'}
                  </Text>
                  <Text className="text-xs text-gray-500">
                    📅 {formatDate(item.visit_date)}
                  </Text>
                </View>
                <View className="bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                  <Text className="text-[10px] font-bold text-green-800">
                    ✓ {t('health:medicalHistory.vetBadge')}
                  </Text>
                </View>
              </View>

              {item.findings && (
                <View className="mb-2">
                  <Text className="text-[11px] font-bold text-gray-700">
                    {t('health:medicalHistory.findings')}:
                  </Text>
                  <Text className="text-xs text-gray-600">{item.findings}</Text>
                </View>
              )}

              {item.treatment && (
                <View className="mb-2">
                  <Text className="text-[11px] font-bold text-gray-700">
                    {t('health:medicalHistory.treatment')}:
                  </Text>
                  <Text className="text-xs text-gray-600">{item.treatment}</Text>
                </View>
              )}

              {item.prescriptions && item.prescriptions.length > 0 && (
                <View className="mt-2 bg-gray-50 p-2.5 rounded-xl border border-gray-200">
                  <Text className="text-xs font-bold text-gray-800 mb-1.5">
                    💊 {t('health:medicalHistory.prescription')}
                  </Text>
                  {item.prescriptions.map((p) => (
                    <Text key={p.id} className="text-xs text-gray-700 mb-0.5">
                      • <Text className="font-semibold">{p.medicine}</Text>
                      {p.dosage ? ` (${p.dosage})` : ''}
                    </Text>
                  ))}
                </View>
              )}
            </View>
          )}
        />
      ) : (
        <FlatList
          data={documents}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          ListHeaderComponent={
            <View className="flex-row justify-between items-center mb-4 bg-white p-3.5 rounded-xl border border-gray-200">
              <View className="flex-1 mr-3">
                <Text className="text-xs font-bold text-gray-900">
                  📁 {t('health:medicalHistory.ownerUploads')}
                </Text>
                <Text className="text-[11px] text-gray-500">
                  {t('health:medicalHistory.ownerUploadsDesc')}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowUploadModal(true)}
                className="bg-primary px-3 py-2 rounded-xl"
                activeOpacity={0.8}
              >
                <Text className="text-xs font-bold text-white">
                  + {t('health:medicalHistory.uploadDoc')}
                </Text>
              </TouchableOpacity>
            </View>
          }
          ListEmptyComponent={
            <View className="bg-white rounded-2xl p-8 border border-dashed border-gray-300 items-center">
              <Text className="text-3xl mb-2">📁</Text>
              <Text className="text-sm font-bold text-gray-800 mb-1">
                {t('health:medicalHistory.noDocuments')}
              </Text>
              <TouchableOpacity
                onPress={() => setShowUploadModal(true)}
                className="bg-primary px-4 py-2 rounded-xl mt-3"
              >
                <Text className="text-xs font-bold text-white">
                  + {t('health:medicalHistory.uploadDoc')}
                </Text>
              </TouchableOpacity>
            </View>
          }
          renderItem={({ item }) => (
            <View className="bg-white rounded-xl p-4 mb-3 border border-gray-200 shadow-sm flex-row justify-between items-center">
              <View className="flex-1 mr-3">
                <View className="flex-row items-center gap-2 mb-1">
                  <Text className="text-sm font-bold text-gray-900">
                    {item.title}
                  </Text>
                  <View className="bg-gray-100 px-1.5 py-0.5 rounded">
                    <Text className="text-[9px] font-semibold text-gray-600">
                      {t('health:medicalHistory.ownerBadge')}
                    </Text>
                  </View>
                </View>
                {item.document_date && (
                  <Text className="text-xs text-gray-500">
                    📅 {formatDate(item.document_date)}
                  </Text>
                )}
                <Text className="text-[10px] text-gray-400 mt-0.5" numberOfLines={1}>
                  📎 {item.file_path}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => handleDeleteDoc(item.id)}
                className="p-2 rounded-lg bg-red-50"
              >
                <Text className="text-xs font-bold text-red-600">✕</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      {selectedPet && (
        <>
          <UploadDocumentModal
            visible={showUploadModal}
            petId={selectedPet.id}
            onClose={() => setShowUploadModal(false)}
            onUpload={onUploadDocument}
          />
          {onAddMedicalRecord && (
            <AddMedicalRecordModal
              visible={showAddRecordModal}
              petId={selectedPet.id}
              onClose={() => setShowAddRecordModal(false)}
              onSubmit={onAddMedicalRecord}
            />
          )}
        </>
      )}
    </SafeAreaView>
  );
}
