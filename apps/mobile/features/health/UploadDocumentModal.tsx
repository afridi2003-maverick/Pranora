import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocale } from '@pranora/i18n';

export interface UploadDocumentModalProps {
  visible: boolean;
  petId: string | null;
  onClose: () => void;
  onUpload: (payload: {
    pet_id: string;
    title: string;
    file_path: string;
    document_date?: string;
  }) => Promise<{ error?: string }>;
}

export function UploadDocumentModal({
  visible,
  petId,
  onClose,
  onUpload,
}: UploadDocumentModalProps) {
  const { t } = useLocale();
  const [title, setTitle] = useState('');
  const [filePath, setFilePath] = useState('');
  const [documentDate, setDocumentDate] = useState(
    new Date().toISOString().split('T')[0] ?? ''
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!petId) return null;

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Validation Error', t('health:medicalHistory.docTitle'));
      return;
    }
    if (!filePath.trim()) {
      Alert.alert('Validation Error', t('health:medicalHistory.fileUrl'));
      return;
    }

    setIsSubmitting(true);
    const res = await onUpload({
      pet_id: petId,
      title: title.trim(),
      file_path: filePath.trim(),
      document_date: documentDate.trim() || undefined,
    });
    setIsSubmitting(false);

    if (res.error) {
      Alert.alert('Error', res.error);
    } else {
      setTitle('');
      setFilePath('');
      onClose();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl p-5">
          <View className="flex-row justify-between items-center pb-3 border-b border-gray-100 mb-4">
            <View>
              <Text className="text-base font-bold text-gray-900">
                📄 {t('health:medicalHistory.uploadDoc')}
              </Text>
              <Text className="text-xs text-gray-500">
                {t('health:medicalHistory.ownerBadge')}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} className="p-1">
              <Text className="text-gray-400 font-bold text-base">✕</Text>
            </TouchableOpacity>
          </View>

          <View className="mb-3">
            <Text className="text-xs font-semibold text-gray-700 mb-1">
              {t('health:medicalHistory.docTitle')} *
            </Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder={t('health:medicalHistory.docTitlePlaceholder')}
              className="bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-sm text-gray-900"
            />
          </View>

          <View className="mb-3">
            <Text className="text-xs font-semibold text-gray-700 mb-1">
              {t('health:medicalHistory.fileUrl')} *
            </Text>
            <TextInput
              value={filePath}
              onChangeText={setFilePath}
              placeholder={t('health:medicalHistory.fileUrlPlaceholder')}
              className="bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-sm text-gray-900"
              autoCapitalize="none"
            />
          </View>

          <View className="mb-5">
            <Text className="text-xs font-semibold text-gray-700 mb-1">
              {t('health:medicalHistory.docDate')} (YYYY-MM-DD)
            </Text>
            <TextInput
              value={documentDate}
              onChangeText={setDocumentDate}
              placeholder="YYYY-MM-DD"
              className="bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-sm text-gray-900"
            />
          </View>

          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={onClose}
              className="flex-1 py-3 rounded-xl bg-gray-100 items-center"
            >
              <Text className="text-xs font-semibold text-gray-700">
                {t('pets:actions.cancel')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 py-3 rounded-xl bg-primary items-center"
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text className="text-xs font-bold text-white">
                  {t('pets:actions.save')}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
