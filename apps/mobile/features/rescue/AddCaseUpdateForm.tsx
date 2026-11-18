import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useLocale } from '@pranora/i18n';
import type { RescueStatus } from '@pranora/types';

interface AddCaseUpdateFormProps {
  caseId: string;
  currentStatus: RescueStatus;
  onSubmit: (payload: {
    case_id: string;
    note?: string | null;
    status?: RescueStatus | null;
    photos?: string[];
  }) => Promise<{ error?: string }>;
  isSubmitting?: boolean;
}

const STATUS_TRANSITIONS: { id: RescueStatus | 'keep'; bn: string; en: string }[] = [
  { id: 'keep', bn: 'বর্তমান অবস্থা অপরিবর্তিত', en: 'Keep Status' },
  { id: 'rescue_in_progress', bn: 'উদ্ধার চলছে (In Progress)', en: 'In Progress' },
  { id: 'under_review', bn: 'পুনর্বিবেচনা (Under Review)', en: 'Review Needed' },
  { id: 'closed', bn: 'কেস সম্পন্ন (Closed)', en: 'Closed' },
];

const SAMPLE_UPDATE_PHOTOS = [
  'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=600',
  'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=600',
];

export function AddCaseUpdateForm({
  caseId,
  currentStatus: _currentStatus,
  onSubmit,
  isSubmitting = false,
}: AddCaseUpdateFormProps) {
  const { isBangla } = useLocale();

  const [note, setNote] = useState('');
  const [targetStatus, setTargetStatus] = useState<RescueStatus | 'keep'>('keep');
  const [photos, setPhotos] = useState<string[]>([]);
  const [isStripping, setIsStripping] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleAddSamplePhoto = () => {
    if (photos.length >= 4) return;
    setIsStripping(true);
    setTimeout(() => {
      const nextPhoto = SAMPLE_UPDATE_PHOTOS[photos.length % SAMPLE_UPDATE_PHOTOS.length]!;
      setPhotos((prev) => [...prev, nextPhoto]);
      setIsStripping(false);
    }, 350);
  };

  const handleRemovePhoto = (idx: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!note.trim() && photos.length === 0 && targetStatus === 'keep') {
      setErrorMsg(
        isBangla
          ? 'একটি নোট, ছবি বা অবস্থা নির্বাচন করুন।'
          : 'Please provide note, photo, or status change.'
      );
      return;
    }

    const payload = {
      case_id: caseId,
      note: note.trim() || null,
      status: targetStatus === 'keep' ? null : targetStatus,
      photos,
    };

    const res = await onSubmit(payload);
    if (res.error) {
      setErrorMsg(res.error);
    } else {
      setNote('');
      setPhotos([]);
      setTargetStatus('keep');
      setSuccessMsg(
        isBangla ? 'আপডেট পোস্ট হয়েছে!' : 'Update posted!'
      );
      setTimeout(() => setSuccessMsg(null), 3000);
    }
  };

  return (
    <View className="bg-white rounded-2xl border border-gray-200 p-4 mb-4 shadow-sm">
      <Text className="text-sm font-bold text-gray-900 mb-1">
        ✍️ {isBangla ? 'কেস আপডেট লিখুন' : 'Post Case Progress Update'}
      </Text>
      <Text className="text-xs text-gray-500 mb-3">
        {isBangla
          ? 'উদ্ধার ও চিকিৎসার অগ্রগতি টাইমলাইনে যোগ করুন।'
          : 'Record on-site treatments, transport, or status.'}
      </Text>

      {errorMsg && (
        <View className="p-2.5 rounded-lg bg-red-50 border border-red-200 mb-3">
          <Text className="text-xs text-red-700">{errorMsg}</Text>
        </View>
      )}

      {successMsg && (
        <View className="p-2.5 rounded-lg bg-green-50 border border-green-200 mb-3">
          <Text className="text-xs text-green-800">✓ {successMsg}</Text>
        </View>
      )}

      {/* Note Input */}
      <TextInput
        multiline
        numberOfLines={3}
        placeholder={
          isBangla
            ? 'যেমন: প্রাথমিক ড্রেসিং করা হয়েছে, ভেট ক্লিনিকে নেওয়া হচ্ছে...'
            : 'Describe current progress, treatment, or handover...'
        }
        value={note}
        onChangeText={setNote}
        textAlignVertical="top"
        className="border border-gray-300 rounded-xl p-3 text-xs text-gray-900 bg-gray-50 h-20 mb-3"
      />

      {/* Status Transition Pills */}
      <Text className="text-xs font-semibold text-gray-800 mb-1.5">
        {isBangla ? 'অবস্থা পরিবর্তন (ঐচ্ছিক)' : 'Update Status (Optional)'}
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2 mb-3">
        {STATUS_TRANSITIONS.map((s) => {
          const isSelected = targetStatus === s.id;
          return (
            <TouchableOpacity
              key={s.id}
              onPress={() => setTargetStatus(s.id)}
              className={`px-3 py-1.5 rounded-lg border ${
                isSelected ? 'bg-primary border-primary' : 'bg-gray-100 border-gray-200'
              }`}
            >
              <Text
                className={`text-xs ${
                  isSelected ? 'text-white font-bold' : 'text-gray-700'
                }`}
              >
                {isBangla ? s.bn : s.en}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Photo Attachment */}
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-xs font-semibold text-gray-800">
          {isBangla ? 'ছবি যুক্ত করুন (সর্বোচ্চ ৪টি)' : 'Photos (Max 4)'}
        </Text>
        <Text className="text-[10px] text-green-700 font-medium">
          🔒 {isBangla ? 'EXIF মেটাডেটা সরানো হয়' : 'EXIF Stripped'}
        </Text>
      </View>

      <TouchableOpacity
        onPress={handleAddSamplePhoto}
        disabled={photos.length >= 4 || isStripping}
        className="p-2.5 border border-dashed border-gray-300 rounded-xl items-center justify-center bg-gray-50 mb-3"
      >
        {isStripping ? (
          <ActivityIndicator size="small" color="#2F7B53" />
        ) : (
          <Text className="text-xs text-green-700 font-semibold">
            📷 {isBangla ? '+ ছবি তুলুন বা যোগ করুন' : '+ Add Photo'}
          </Text>
        )}
      </TouchableOpacity>

      {photos.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2 mb-3">
          {photos.map((src, idx) => (
            <View key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
              <Image source={{ uri: src }} className="w-full h-full" resizeMode="cover" />
              <TouchableOpacity
                onPress={() => handleRemovePhoto(idx)}
                className="absolute top-1 right-1 bg-black/60 rounded-full w-4 h-4 items-center justify-center"
              >
                <Text className="text-white text-[10px] font-bold">✕</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Submit Button */}
      <TouchableOpacity
        onPress={handleSubmit}
        disabled={isSubmitting || isStripping}
        className="w-full py-2.5 rounded-xl bg-primary items-center justify-center"
      >
        {isSubmitting ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <Text className="text-white font-bold text-xs">
            {isBangla ? 'আপডেট পোস্ট করুন' : 'Post Update'}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
