import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useLocale } from '@pranora/i18n';
import type { LostFoundBoardItem } from '@pranora/api';

interface ReportSightingModalProps {
  item: LostFoundBoardItem | null;
  visible: boolean;
  onClose: () => void;
  onSubmitSighting: (params: {
    reportId: string;
    message: string;
    locationText?: string;
    contactPhone?: string;
  }) => Promise<{ success: boolean; error?: string }>;
}

export function ReportSightingModal({
  item,
  visible,
  onClose,
  onSubmitSighting,
}: ReportSightingModalProps) {
  const { isBangla } = useLocale();

  const [message, setMessage] = useState('');
  const [locationText, setLocationText] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!item) return null;

  const handleResetAndClose = () => {
    setMessage('');
    setLocationText('');
    setContactPhone('');
    setError(null);
    setIsSuccess(false);
    onClose();
  };

  const handleSubmit = async () => {
    if (!message.trim()) {
      setError(isBangla ? 'অনুগ্রহ করে বিস্তারিত বার্তা লিখুন।' : 'Please describe what you saw.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await onSubmitSighting({
        reportId: item.id,
        message: message.trim(),
        locationText: locationText.trim() || undefined,
        contactPhone: contactPhone.trim() || undefined,
      });

      if (res.success) {
        setIsSuccess(true);
      } else {
        setError(res.error || (isBangla ? 'বার্তা পাঠাতে ব্যর্থ হয়েছে।' : 'Failed to send sighting report.'));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Server error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={handleResetAndClose}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            👁️ {isBangla ? 'আমি দেখেছি — সন্ধান বার্তা' : "I've Seen It (RSC-10)"}
          </Text>
          <TouchableOpacity onPress={handleResetAndClose} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
        </View>

        {isSuccess ? (
          <View style={styles.successContainer}>
            <Text style={{ fontSize: 48, textAlign: 'center', marginBottom: 12 }}>📬</Text>
            <Text style={styles.successTitle}>
              {isBangla ? 'সন্ধান বার্তা সফলভাবে পাঠানো হয়েছে!' : 'Sighting Sent to Reporter!'}
            </Text>
            <Text style={styles.successDesc}>
              {isBangla
                ? 'প্রাণীর মূল রিপোর্টকারীকে একটি ইন-অ্যাপ নোটিফিকেশন পাঠানো হয়েছে। আপনার পাঠানো তথ্যের প্রেক্ষিতে মালিক সিদ্ধান্ত নেবেন যে তিনি তার যোগাযোগ নম্বর শেয়ার করবেন কিনা।'
                : "The pet's original reporter has received an in-app notification. They will decide whether to share their phone number based on your report."}
            </Text>
            <TouchableOpacity onPress={handleResetAndClose} style={styles.doneBtn}>
              <Text style={styles.doneBtnText}>{isBangla ? 'সম্পন্ন' : 'Done'}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Animal info header */}
            <View style={styles.infoCard}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <View style={[styles.badge, item.kind === 'lost' ? styles.badgeLost : styles.badgeFound]}>
                  <Text style={[styles.badgeText, item.kind === 'lost' ? styles.badgeTextLost : styles.badgeTextFound]}>
                    {item.kind === 'lost' ? (isBangla ? 'হারানো' : 'Lost') : (isBangla ? 'পাওয়া গেছে' : 'Found')}
                  </Text>
                </View>
                <Text style={styles.speciesText}>🐾 {item.species}</Text>
              </View>
              {item.area_text && (
                <Text style={styles.areaText}>📍 {item.area_text} (~১ কিমি গ্রিড)</Text>
              )}
            </View>

            {error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Message Input */}
            <Text style={styles.fieldLabel}>
              {isBangla ? 'কোথায় ও কখন দেখেছেন?' : 'Where & when did you see this animal?'} *
            </Text>
            <TextInput
              multiline
              numberOfLines={4}
              value={message}
              onChangeText={setMessage}
              placeholder={
                isBangla
                  ? 'যেমন: আজ সকালে ডিওএইচএস ৪ নম্বর রোডের মোড়ে কুকুরটি দেখেছি...'
                  : 'e.g. Saw this dog near road 4 this morning...'
              }
              style={styles.textArea}
            />

            {/* Location Landmark */}
            <Text style={styles.fieldLabel}>
              {isBangla ? 'নির্দিষ্ট ল্যান্ডমার্ক / স্থান' : 'Specific Landmark / Location'}
            </Text>
            <TextInput
              value={locationText}
              onChangeText={setLocationText}
              placeholder={isBangla ? 'যেমন: পার্কের পশ্চিম গেটের পাশে' : 'e.g. Near the west gate of the park'}
              style={styles.input}
            />

            {/* Phone */}
            <Text style={styles.fieldLabel}>
              {isBangla ? 'আপনার ফোন নম্বর (ঐচ্ছিক)' : 'Your Phone Number (Optional)'}
            </Text>
            <TextInput
              value={contactPhone}
              onChangeText={setContactPhone}
              placeholder="+88017XXXXXXXX"
              style={styles.input}
            />

            {/* Privacy note */}
            <View style={styles.privacyBox}>
              <Text style={styles.privacyText}>
                🔒 {isBangla
                  ? 'জনসমক্ষে ফোন নম্বর উন্মুক্ত হয় না। বার্তাটি সরাসরি নিবন্ধিত রিপোর্টকারীর ইন-অ্যাপ ইনবক্সে পৌঁছাবে।'
                  : 'Numbers are never public. Your message is delivered securely via in-app notification.'}
              </Text>
            </View>

            {/* Submit */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isSubmitting}
              style={styles.submitBtn}
              activeOpacity={0.8}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text style={styles.submitBtnText}>
                  👁️ {isBangla ? 'সন্ধান বার্তা পাঠান' : 'Send Sighting'}
                </Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    backgroundColor: '#f9fafb',
  },
  headerTitle: { fontSize: 15, fontWeight: '700', color: '#111827' },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: { fontWeight: 'bold', color: '#4b5563', fontSize: 13 },
  content: { flex: 1, padding: 16 },
  infoCard: {
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 16,
  },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
  badgeLost: { backgroundColor: '#ffe4e6' },
  badgeFound: { backgroundColor: '#d1fae5' },
  badgeText: { fontSize: 10, fontWeight: '700' },
  badgeTextLost: { color: '#be123c' },
  badgeTextFound: { color: '#047857' },
  speciesText: { fontSize: 12, fontWeight: '700', color: '#111827', textTransform: 'capitalize' },
  areaText: { fontSize: 11, color: '#6b7280' },
  errorBox: {
    padding: 10,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 8,
    marginBottom: 12,
  },
  errorText: { color: '#b91c1c', fontSize: 11 },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: '#374151', marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    backgroundColor: '#f9fafb',
    marginBottom: 14,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    padding: 12,
    fontSize: 13,
    backgroundColor: '#f9fafb',
    textAlignVertical: 'top',
    minHeight: 80,
    marginBottom: 14,
  },
  privacyBox: {
    padding: 12,
    backgroundColor: '#eff6ff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    marginBottom: 20,
  },
  privacyText: { fontSize: 11, color: '#1e40af', lineHeight: 16 },
  submitBtn: {
    backgroundColor: '#16a34a',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 30,
  },
  submitBtnText: { color: '#ffffff', fontSize: 14, fontWeight: '700' },
  successContainer: { flex: 1, padding: 24, justifyContent: 'center', alignItems: 'center' },
  successTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 8, textAlign: 'center' },
  successDesc: { fontSize: 12, color: '#4b5563', lineHeight: 18, textAlign: 'center', marginBottom: 20 },
  doneBtn: { backgroundColor: '#16a34a', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 },
  doneBtnText: { color: '#ffffff', fontWeight: '700', fontSize: 13 },
});
