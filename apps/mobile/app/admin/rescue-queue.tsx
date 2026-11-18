/**
 * apps/mobile/app/admin/rescue-queue.tsx
 * Task: ADM-3 — Admin Urgent Rescue Report Queue
 * Owner: Afridi | Sprint: S4
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  ScrollView,
  StyleSheet,
  Image,
} from 'react-native';
import { useLocale } from '@pranora/i18n';
import type { UrgentRescueReportItem } from '@pranora/api';
import type { UrgencyLevel, AnimalReportKind, SpeciesType } from '@pranora/types';

const MOCK_RESCUE_REPORTS: UrgentRescueReportItem[] = [
  {
    id: 'rsc-001',
    reporter_id: 'u-101',
    kind: 'injured',
    species: 'dog',
    urgency: 'critical',
    last_seen_at: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    contact_phone: '+8801711998877',
    description: 'রাস্তার পাশে গুরুতর আঘাতপ্রাপ্ত কুকুর, রক্তক্ষরণ হচ্ছে। দ্রুত চিকিৎসার প্রয়োজন।',
    photos: ['https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=400&q=80'],
    area_text: 'ধানমন্ডি লেক, ঢাকা',
    district_id: 1,
    upazila_id: 10,
    status: 'submitted',
    created_at: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    reporter_name: 'আরিফ রহমান',
    reporter_phone: '+8801711998877',
  },
  {
    id: 'rsc-002',
    reporter_id: 'u-102',
    kind: 'abandoned',
    species: 'cat',
    urgency: 'high',
    last_seen_at: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    contact_phone: '+8801822334455',
    description: '৩টি ছোট বিড়ালছানা বক্সে করে ফেলে রেখে যাওয়া হয়েছে।',
    photos: ['https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=400&q=80'],
    area_text: 'উত্তরা সেক্টর ৭, ঢাকা',
    district_id: 1,
    upazila_id: 12,
    status: 'submitted',
    created_at: new Date(Date.now() - 1000 * 60 * 95).toISOString(),
    reporter_name: 'তানজিলা ইসলাম',
    reporter_phone: '+8801822334455',
  },
];

const SPECIES_EMOJI: Record<SpeciesType, string> = {
  dog: '🐕',
  cat: '🐈',
  bird: '🦅',
  fish: '🐟',
  rabbit: '🐇',
  cow: '🐄',
  goat: '🐐',
  poultry: '🐔',
  other: '🐾',
};

const KIND_LABEL: Record<AnimalReportKind, { bn: string; en: string }> = {
  injured: { bn: 'আহত প্রাণী', en: 'Injured' },
  lost: { bn: 'হারিয়ে যাওয়া', en: 'Lost' },
  found: { bn: 'খুঁজে পাওয়া', en: 'Found' },
  abandoned: { bn: 'পরিত্যক্ত প্রাণী', en: 'Abandoned' },
};

const URGENCY_CONFIG: Record<UrgencyLevel, { bn: string; en: string; color: string; bg: string }> = {
  critical: { bn: 'জীবনঝুঁকি (Critical)', en: 'Critical', color: '#DC2626', bg: '#FEE2E2' },
  high: { bn: 'উচ্চ জরুরি (High)', en: 'High', color: '#D97706', bg: '#FEF3C7' },
  medium: { bn: 'সাধারণ জরুরি', en: 'Medium', color: '#16A34A', bg: '#DCFCE7' },
  low: { bn: 'স্বাভাবিক', en: 'Low', color: '#6B7280', bg: '#F3F4F6' },
};

export default function AdminRescueQueueScreen() {
  const { locale } = useLocale();
  const isBn = locale === 'bn';

  const [reports, setReports] = useState<UrgentRescueReportItem[]>(MOCK_RESCUE_REPORTS);
  const [urgencyFilter, setUrgencyFilter] = useState<UrgencyLevel | 'all'>('all');
  const [selectedReport, setSelectedReport] = useState<{ report: UrgentRescueReportItem; accept: boolean } | null>(null);

  const criticalCount = reports.filter((r) => r.urgency === 'critical').length;

  const filteredReports = urgencyFilter === 'all'
    ? reports
    : reports.filter((r) => r.urgency === urgencyFilter);

  function handleAction(_accept: boolean) {
    if (!selectedReport) return;
    setReports((prev) => prev.filter((r) => r.id !== selectedReport.report.id));
    setSelectedReport(null);
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>
            🚑 {isBn ? 'জরুরি উদ্ধার কিউ' : 'Rescue Queue'}
          </Text>
          {criticalCount > 0 && (
            <View style={styles.criticalBadge}>
              <Text style={styles.criticalBadgeText}>{criticalCount} Critical</Text>
            </View>
          )}
        </View>
        <Text style={styles.headerSub}>
          {isBn
            ? 'জরুরি রিপোর্ট দ্রুত পর্যালোচনা ও উদ্ধার ব্যবস্থা'
            : 'Review incoming urgent rescue reports'}
        </Text>
      </View>

      {/* Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContent}
      >
        {(['all', 'critical', 'high', 'medium', 'low'] as const).map((lvl) => (
          <TouchableOpacity
            key={lvl}
            style={[styles.filterChip, urgencyFilter === lvl && styles.filterChipActive]}
            onPress={() => setUrgencyFilter(lvl)}
          >
            <Text style={[styles.filterChipText, urgencyFilter === lvl && styles.filterChipTextActive]}>
              {lvl === 'all'
                ? isBn ? 'সব' : 'All'
                : isBn ? URGENCY_CONFIG[lvl].bn : URGENCY_CONFIG[lvl].en}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Report List */}
      <FlatList
        data={filteredReports}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const cfg = URGENCY_CONFIG[item.urgency];
          const kind = KIND_LABEL[item.kind] ?? { bn: item.kind, en: item.kind };
          const emoji = SPECIES_EMOJI[item.species] ?? '🐾';

          return (
            <View style={[styles.card, item.urgency === 'critical' && styles.cardCritical]}>
              <View style={styles.cardTop}>
                {item.photos.length > 0 ? (
                  <Image source={{ uri: item.photos[0] }} style={styles.thumb} />
                ) : (
                  <View style={styles.thumbFallback}>
                    <Text style={styles.thumbEmoji}>{emoji}</Text>
                  </View>
                )}

                <View style={styles.cardInfo}>
                  <View style={styles.badgeRow}>
                    <View style={[styles.urgencyBadge, { backgroundColor: cfg.bg }]}>
                      <Text style={[styles.urgencyText, { color: cfg.color }]}>
                        {isBn ? cfg.bn : cfg.en}
                      </Text>
                    </View>
                    <Text style={styles.kindText}>
                      {emoji} {isBn ? kind.bn : kind.en}
                    </Text>
                  </View>

                  <Text style={styles.desc} numberOfLines={2}>
                    {item.description}
                  </Text>

                  <Text style={styles.metaText}>
                    📍 {item.area_text ?? 'Dhaka'}
                  </Text>
                  <Text style={styles.metaText}>
                    👤 {item.reporter_name ?? 'Anonymous'} {item.contact_phone ? `(${item.contact_phone})` : ''}
                  </Text>
                </View>
              </View>

              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.approveBtn]}
                  onPress={() => setSelectedReport({ report: item, accept: true })}
                >
                  <Text style={styles.actionBtnText}>{isBn ? '✅ অনুমোদন' : '✅ Approve'}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.rejectBtn]}
                  onPress={() => setSelectedReport({ report: item, accept: false })}
                >
                  <Text style={styles.actionBtnText}>{isBn ? '❌ বাতিল' : '❌ Dismiss'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />

      {/* Confirmation Modal */}
      {selectedReport && (
        <Modal visible={true} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                {selectedReport.accept
                  ? isBn ? 'উদ্ধার কেস অনুমোদন করবেন?' : 'Approve Rescue Case?'
                  : isBn ? 'রিপোর্টটি বাতিল করবেন?' : 'Dismiss Report?'}
              </Text>
              <Text style={styles.modalDesc}>
                {selectedReport.accept
                  ? isBn
                    ? 'এই রিপোর্ট অনুমোদন করলে সক্রিয় রেসকিউ কেস তৈরি হবে।'
                    : 'Approving this will start an active rescue case.'
                  : isBn
                  ? 'আপনি কি নিশ্চিত যে রিপোর্টটি বাতিল করতে চান?'
                  : 'Are you sure you want to dismiss this report?'}
              </Text>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setSelectedReport(null)}
                >
                  <Text style={styles.cancelBtnText}>{isBn ? 'ফিরে যান' : 'Back'}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.confirmBtn, selectedReport.accept ? styles.approveBtn : styles.rejectBtn]}
                  onPress={() => handleAction(selectedReport.accept)}
                >
                  <Text style={styles.actionBtnText}>{isBn ? 'নিশ্চিত করুন' : 'Confirm'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111827', flex: 1 },
  headerSub: { fontSize: 13, color: '#6B7280' },
  criticalBadge: {
    backgroundColor: '#DC2626',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  criticalBadgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },

  filterScroll: { backgroundColor: '#fff', maxHeight: 48 },
  filterContent: { paddingHorizontal: 12, paddingVertical: 8, gap: 8, flexDirection: 'row' },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterChipActive: { backgroundColor: '#FEE2E2', borderColor: '#DC2626' },
  filterChipText: { fontSize: 12, color: '#6B7280' },
  filterChipTextActive: { color: '#DC2626', fontWeight: '700' },

  list: { padding: 12, gap: 12 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 8,
  },
  cardCritical: {
    borderColor: '#F87171',
    backgroundColor: '#FFF5F5',
  },
  cardTop: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  thumb: { width: 72, height: 72, borderRadius: 8 },
  thumbFallback: {
    width: 72,
    height: 72,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbEmoji: { fontSize: 32 },
  cardInfo: { flex: 1 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  urgencyBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  urgencyText: { fontSize: 10, fontWeight: '700' },
  kindText: { fontSize: 11, color: '#4B5563', fontWeight: '500' },
  desc: { fontSize: 13, color: '#1F2937', fontWeight: '500', marginBottom: 4 },
  metaText: { fontSize: 11, color: '#6B7280' },

  actionsRow: { flexDirection: 'row', gap: 8 },
  actionBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  approveBtn: { backgroundColor: '#16A34A' },
  rejectBtn: { backgroundColor: '#DC2626' },
  actionBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
  modalTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 8 },
  modalDesc: { fontSize: 13, color: '#6B7280', marginBottom: 16 },
  modalActions: { flexDirection: 'row', gap: 10 },
  cancelBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: '#F3F4F6', alignItems: 'center' },
  cancelBtnText: { color: '#374151', fontSize: 14, fontWeight: '600' },
  confirmBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
});
