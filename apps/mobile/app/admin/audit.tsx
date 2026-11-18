/**
 * apps/mobile/app/admin/audit.tsx
 * Task: ADM-4 — Audit Log & History
 * Owner: Afridi | Sprint: S6 (unblocked in S4)
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
} from 'react-native';
import { useLocale } from '@pranora/i18n';
import type { AuditLogEntry } from '@pranora/api';

const MOCK_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 101,
    actor_id: 'a-001',
    actor_name: 'Afridi (Admin)',
    actor_phone: '+8801700000001',
    action: 'UPDATE',
    table_name: 'user_roles',
    record_id: 'u-002',
    old_data: { role: 'vet', status: 'pending', verified_by: null },
    new_data: { role: 'vet', status: 'verified', verified_by: 'a-001' },
    ip_address: '103.205.71.12',
    created_at: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
  },
  {
    id: 102,
    actor_id: 'a-001',
    actor_name: 'Afridi (Admin)',
    actor_phone: '+8801700000001',
    action: 'UPDATE',
    table_name: 'providers',
    record_id: 'p-001',
    old_data: { name_en: 'Dhaka Pet Clinic', verification: 'pending' },
    new_data: { name_en: 'Dhaka Pet Clinic', verification: 'verified' },
    ip_address: '103.205.71.12',
    created_at: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
  },
  {
    id: 103,
    actor_id: 'u-003',
    actor_name: 'Prani Shelter BD',
    actor_phone: '+8801933445566',
    action: 'INSERT',
    table_name: 'provider_documents',
    record_id: 'd-001',
    old_data: null,
    new_data: { doc_type: 'trade_license', status: 'draft' },
    ip_address: '202.4.112.5',
    created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
];

const TABLE_FILTERS = [
  { key: 'all', bn: 'সব', en: 'All' },
  { key: 'user_roles', bn: 'রোলস', en: 'Roles' },
  { key: 'providers', bn: 'প্রোভাইডার্স', en: 'Providers' },
  { key: 'provider_documents', bn: 'ডকুমেন্টস', en: 'Docs' },
];

export default function AdminAuditScreen() {
  const { locale } = useLocale();
  const isBn = locale === 'bn';

  const [tableFilter, setTableFilter] = useState('all');
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);

  const filteredLogs = tableFilter === 'all'
    ? MOCK_AUDIT_LOGS
    : MOCK_AUDIT_LOGS.filter((l) => l.table_name === tableFilter);

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>
            📋 {isBn ? 'অডিট লগ ও হিস্টোরি' : 'Audit Logs'}
          </Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>ADM-4</Text>
          </View>
        </View>
        <Text style={styles.headerSub}>
          {isBn
            ? 'সকল ডাটাবেস পরিবর্তন ও অ্যাডমিন অ্যাকশনের রেকর্ড'
            : 'Immutable audit trail of all changes'}
        </Text>
      </View>

      {/* Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContent}
      >
        {TABLE_FILTERS.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterChip, tableFilter === f.key && styles.filterChipActive]}
            onPress={() => setTableFilter(f.key)}
          >
            <Text style={[styles.filterChipText, tableFilter === f.key && styles.filterChipTextActive]}>
              {isBn ? f.bn : f.en}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* List */}
      <FlatList
        data={filteredLogs}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const isInsert = item.action === 'INSERT';
          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() => setSelectedLog(item)}
              activeOpacity={0.7}
            >
              <View style={styles.cardHeader}>
                <View
                  style={[
                    styles.actionBadge,
                    isInsert ? styles.badgeInsert : styles.badgeUpdate,
                  ]}
                >
                  <Text style={styles.actionBadgeText}>{item.action}</Text>
                </View>
                <Text style={styles.tableName}>{item.table_name}</Text>
                <Text style={styles.timeText}>
                  {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>

              <Text style={styles.actorName}>
                {isBn ? 'কর্তা:' : 'By:'} {item.actor_name ?? item.actor_id ?? 'System'}
              </Text>
              {item.record_id && (
                <Text style={styles.recordId}>ID: {item.record_id}</Text>
              )}
            </TouchableOpacity>
          );
        }}
      />

      {/* Detail Modal */}
      {selectedLog && (
        <Modal visible={true} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                {isBn ? 'অডিট পরিবর্তনের বিবরণ' : 'Audit Change Details'}
              </Text>
              <ScrollView style={styles.modalScroll}>
                <Text style={styles.detailMeta}>Table: {selectedLog.table_name}</Text>
                <Text style={styles.detailMeta}>Action: {selectedLog.action}</Text>
                <Text style={styles.detailMeta}>Time: {selectedLog.created_at}</Text>

                {selectedLog.old_data && (
                  <View style={styles.diffBox}>
                    <Text style={styles.diffTitleOld}>Old Data:</Text>
                    <Text style={styles.diffCode}>
                      {JSON.stringify(selectedLog.old_data, null, 2)}
                    </Text>
                  </View>
                )}

                {selectedLog.new_data && (
                  <View style={styles.diffBox}>
                    <Text style={styles.diffTitleNew}>New Data:</Text>
                    <Text style={styles.diffCode}>
                      {JSON.stringify(selectedLog.new_data, null, 2)}
                    </Text>
                  </View>
                )}
              </ScrollView>

              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setSelectedLog(null)}
              >
                <Text style={styles.closeBtnText}>{isBn ? 'বন্ধ করুন' : 'Close'}</Text>
              </TouchableOpacity>
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
  badge: {
    backgroundColor: '#DCFCE7',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: { color: '#16A34A', fontSize: 11, fontWeight: '700' },

  filterScroll: { backgroundColor: '#fff', maxHeight: 48 },
  filterContent: { paddingHorizontal: 12, paddingVertical: 8, gap: 8, flexDirection: 'row' },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterChipActive: { backgroundColor: '#DCFCE7', borderColor: '#16A34A' },
  filterChipText: { fontSize: 12, color: '#6B7280' },
  filterChipTextActive: { color: '#16A34A', fontWeight: '600' },

  list: { padding: 12, gap: 10 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 8,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  actionBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  badgeInsert: { backgroundColor: '#DCFCE7' },
  badgeUpdate: { backgroundColor: '#DBEAFE' },
  actionBadgeText: { fontSize: 11, fontWeight: '700', color: '#1E40AF' },
  tableName: { fontSize: 13, fontWeight: '600', color: '#374151', flex: 1 },
  timeText: { fontSize: 11, color: '#9CA3AF' },
  actorName: { fontSize: 13, color: '#4B5563', marginBottom: 2 },
  recordId: { fontSize: 11, color: '#9CA3AF', fontFamily: 'monospace' },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 12 },
  modalScroll: { marginBottom: 16 },
  detailMeta: { fontSize: 12, color: '#6B7280', marginBottom: 4, fontFamily: 'monospace' },
  diffBox: { marginTop: 10, padding: 10, backgroundColor: '#F9FAFB', borderRadius: 8 },
  diffTitleOld: { fontSize: 11, fontWeight: '700', color: '#DC2626', marginBottom: 4 },
  diffTitleNew: { fontSize: 11, fontWeight: '700', color: '#16A34A', marginBottom: 4 },
  diffCode: { fontSize: 11, color: '#374151', fontFamily: 'monospace' },
  closeBtn: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  closeBtnText: { fontSize: 14, fontWeight: '600', color: '#374151' },
});
