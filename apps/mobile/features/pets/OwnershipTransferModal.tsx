import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocale, formatDate } from '@pranora/i18n';
import type { PetRow, PetOwnershipHistoryRow, OwnershipReason } from '@pranora/api';

export interface OwnershipTransferModalProps {
  visible: boolean;
  pet: PetRow | null;
  history: PetOwnershipHistoryRow[];
  onClose: () => void;
  onTransfer: (payload: {
    pet_id: string;
    to_user_id: string;
    reason: OwnershipReason;
    note?: string;
  }) => Promise<{ error?: string }>;
  loadingHistory?: boolean;
}

const REASONS: OwnershipReason[] = [
  'adoption',
  'rescue_intake',
  'admin_transfer',
  'registered',
];

export function OwnershipTransferModal({
  visible,
  pet,
  history,
  onClose,
  onTransfer,
  loadingHistory = false,
}: OwnershipTransferModalProps) {
  const { t } = useLocale();
  const [toUserId, setToUserId] = useState('');
  const [reason, setReason] = useState<OwnershipReason>('adoption');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!pet) return null;

  const handleTransfer = async () => {
    if (!toUserId.trim()) {
      Alert.alert('Validation Error', t('pets:ownership.recipientUserId'));
      return;
    }

    Alert.alert(
      t('pets:ownership.transferTitle'),
      t('pets:ownership.transferConfirm'),
      [
        { text: t('pets:actions.cancel'), style: 'cancel' },
        {
          text: t('pets:ownership.transferButton'),
          style: 'destructive',
          onPress: async () => {
            setIsSubmitting(true);
            const res = await onTransfer({
              pet_id: pet.id,
              to_user_id: toUserId.trim(),
              reason,
              note: note.trim() || undefined,
            });
            setIsSubmitting(false);

            if (res.error) {
              Alert.alert('Error', res.error);
            } else {
              Alert.alert('Success', t('pets:ownership.transferSuccess'));
              setToUserId('');
              setNote('');
              onClose();
            }
          },
        },
      ]
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl p-5 max-h-[85%]">
          {/* Header */}
          <View className="flex-row justify-between items-center pb-3 border-b border-gray-200">
            <View>
              <Text className="text-lg font-bold text-gray-900">
                🔄 {t('pets:ownership.transferTitle')}
              </Text>
              <Text className="text-xs text-gray-500">
                {pet.name} • {t('pets:ownership.oneProfileForLife')}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} className="p-2">
              <Text className="text-gray-500 font-bold text-base">✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} className="mt-4">
            {/* Lifelong Profile Notice */}
            <View className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4">
              <Text className="text-xs text-green-800 font-medium">
                🛡️ {t('pets:ownership.transferDesc')}
              </Text>
              {pet.rescue_case_id && (
                <View className="mt-2 bg-white/80 rounded-lg px-2 py-1 self-start">
                  <Text className="text-xs font-bold text-green-900">
                    🛟 {t('pets:ownership.rescuedBadge')}
                  </Text>
                </View>
              )}
            </View>

            {/* Recipient User ID Input */}
            <View className="mb-4">
              <Text className="text-xs font-semibold text-gray-700 mb-1">
                {t('pets:ownership.recipientUserId')} *
              </Text>
              <TextInput
                value={toUserId}
                onChangeText={setToUserId}
                placeholder={t('pets:ownership.recipientPlaceholder')}
                placeholderTextColor="#9ca3af"
                className="bg-gray-50 border border-gray-300 rounded-xl px-3 py-2.5 text-sm text-gray-900"
                autoCapitalize="none"
              />
            </View>

            {/* Transfer Reason Selection */}
            <View className="mb-4">
              <Text className="text-xs font-semibold text-gray-700 mb-1.5">
                {t('pets:ownership.reason')}
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {REASONS.map((r) => (
                  <TouchableOpacity
                    key={r}
                    onPress={() => setReason(r)}
                    className={`px-3 py-1.5 rounded-lg border ${
                      reason === r
                        ? 'bg-primary border-primary'
                        : 'bg-white border-gray-300'
                    }`}
                  >
                    <Text
                      className={`text-xs font-medium ${
                        reason === r ? 'text-white' : 'text-gray-700'
                      }`}
                    >
                      {t(`pets:ownership.reasons.${r}` as never)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Notes Input */}
            <View className="mb-5">
              <Text className="text-xs font-semibold text-gray-700 mb-1">
                {t('pets:ownership.note')}
              </Text>
              <TextInput
                value={note}
                onChangeText={setNote}
                placeholder={t('pets:ownership.notePlaceholder')}
                placeholderTextColor="#9ca3af"
                multiline
                numberOfLines={2}
                className="bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-sm text-gray-900"
              />
            </View>

            {/* Submit Transfer Button */}
            <TouchableOpacity
              onPress={handleTransfer}
              disabled={isSubmitting}
              className="bg-primary py-3 rounded-xl items-center mb-6"
              activeOpacity={0.8}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-bold text-sm">
                  {t('pets:ownership.transferButton')}
                </Text>
              )}
            </TouchableOpacity>

            {/* Ownership History Section */}
            <View className="border-t border-gray-200 pt-4 mb-4">
              <Text className="text-sm font-bold text-gray-900 mb-3">
                📜 {t('pets:ownership.history')}
              </Text>

              {loadingHistory ? (
                <ActivityIndicator size="small" color="#2F7B53" />
              ) : history.length === 0 ? (
                <Text className="text-xs text-gray-500 italic">
                  {t('pets:ownership.noHistory')}
                </Text>
              ) : (
                <View className="gap-2">
                  {history.map((item) => (
                    <View
                      key={item.id}
                      className="bg-gray-50 rounded-xl p-3 border border-gray-200"
                    >
                      <View className="flex-row justify-between items-center mb-1">
                        <Text className="text-xs font-bold text-gray-900">
                          {t(`pets:ownership.reasons.${item.reason}` as never)}
                        </Text>
                        <Text className="text-[10px] text-gray-500">
                          {formatDate(item.created_at)}
                        </Text>
                      </View>
                      {item.note ? (
                        <Text className="text-xs text-gray-600 italic mt-0.5">
                          "{item.note}"
                        </Text>
                      ) : null}
                    </View>
                  ))}
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
