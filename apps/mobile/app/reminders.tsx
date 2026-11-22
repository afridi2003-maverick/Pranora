/**
 * HLT-2: Reminders Screen (Mobile)
 * Owner: afridi | apps/mobile/app/reminders.tsx
 *
 * FlatList of upcoming reminders, add via bottom sheet, swipe-to-delete / mark-done.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  TextInput,
  ScrollView,
  Alert,
  StyleSheet,
} from 'react-native';
import { useLocale } from '@pranora/i18n';
import type { ReminderItem, ReminderType, CreateReminderParams } from '@pranora/api';

// ── Mock Data ─────────────────────────────────────────────────────────────────

const MOCK_PETS = [
  { id: 'pet-1', name: 'Milo', species: 'dog' },
  { id: 'pet-2', name: 'Luna', species: 'cat' },
];

const INITIAL_REMINDERS: ReminderItem[] = [
  {
    id: 'rem-1',
    petId: 'pet-1',
    ownerId: 'user-1',
    type: 'vaccine',
    title: 'Rabies booster due',
    remindAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString(),
    repeatDays: 365,
    vaccinationId: null,
    isDone: false,
    lastSentAt: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'rem-2',
    petId: 'pet-2',
    ownerId: 'user-1',
    type: 'deworming',
    title: 'Monthly deworming',
    remindAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString(),
    repeatDays: 30,
    vaccinationId: null,
    isDone: false,
    lastSentAt: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'rem-3',
    petId: 'pet-1',
    ownerId: 'user-1',
    type: 'checkup',
    title: 'Annual wellness check',
    remindAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10).toISOString(),
    repeatDays: null,
    vaccinationId: null,
    isDone: false,
    lastSentAt: null,
    createdAt: new Date().toISOString(),
  },
];

const REMINDER_TYPES: ReminderType[] = [
  'vaccine', 'deworming', 'flea_tick', 'medicine', 'grooming', 'checkup', 'custom',
];

type ReminderTypeIconMap = Record<ReminderType, string>;
const TYPE_ICONS: ReminderTypeIconMap = {
  vaccine:   '💉',
  deworming: '🐛',
  flea_tick: '🦟',
  medicine:  '💊',
  grooming:  '✂️',
  checkup:   '🩺',
  custom:    '🔔',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatRemindAt(iso: string): string {
  return new Date(iso).toLocaleString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function daysUntil(iso: string): number {
  return Math.ceil((new Date(iso).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

function petName(petId: string): string {
  return MOCK_PETS.find(p => p.id === petId)?.name ?? petId;
}

// ── Add Reminder Bottom Sheet ─────────────────────────────────────────────────

interface AddReminderSheetProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (params: CreateReminderParams) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

function AddReminderSheet({ visible, onClose, onAdd, t }: AddReminderSheetProps) {
  const [petId,      setPetId]      = useState(MOCK_PETS[0]?.id ?? 'pet-1');
  const [type,       setType]       = useState<ReminderType>('vaccine');
  const [title,      setTitle]      = useState('');
  const [date,       setDate]       = useState('');
  const [time,       setTime]       = useState('');
  const [repeat,     setRepeat]     = useState(false);
  const [repeatDays, setRepeatDays] = useState('');

  function reset() {
    setTitle(''); setDate(''); setTime('');
    setRepeat(false); setRepeatDays('');
    setType('vaccine'); setPetId(MOCK_PETS[0]?.id ?? 'pet-1');
  }

  function handleAdd() {
    if (!title.trim() || !date || !time) {
      Alert.alert('Missing fields', 'Please fill in title, date, and time.');
      return;
    }
    const remindAt = new Date(`${date}T${time}`).toISOString();
    onAdd({
      petId,
      type,
      title: title.trim(),
      remindAt,
      repeatDays: repeat && repeatDays ? parseInt(repeatDays, 10) : null,
    });
    reset();
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.sheetOverlay}>
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.sheetTitle}>{t('health:reminders.add_reminder')}</Text>

            {/* Pet */}
            <Text style={styles.label}>Pet</Text>
            <View style={styles.chipRow}>
              {MOCK_PETS.map(p => (
                <TouchableOpacity
                  key={p.id}
                  style={[styles.chip, petId === p.id && styles.chipActive]}
                  onPress={() => setPetId(p.id)}
                >
                  <Text style={[styles.chipText, petId === p.id && styles.chipTextActive]}>
                    {p.species === 'dog' ? '🐕' : '🐈'} {p.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Type */}
            <Text style={styles.label}>{t('health:reminders.form.type')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              <View style={styles.chipRow}>
                {REMINDER_TYPES.map(rt => (
                  <TouchableOpacity
                    key={rt}
                    style={[styles.chip, type === rt && styles.chipActive]}
                    onPress={() => setType(rt)}
                  >
                    <Text style={[styles.chipText, type === rt && styles.chipTextActive]}>
                      {TYPE_ICONS[rt]} {t(`health:reminders.types.${rt}`)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {/* Title */}
            <Text style={styles.label}>{t('health:reminders.form.title')}</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder={t('health:reminders.form.title_placeholder')}
              placeholderTextColor="#9CA3AF"
            />

            {/* Date */}
            <Text style={styles.label}>{t('health:reminders.form.remind_at')}</Text>
            <TextInput
              style={styles.input}
              value={date}
              onChangeText={setDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
            />
            <TextInput
              style={[styles.input, { marginTop: 6 }]}
              value={time}
              onChangeText={setTime}
              placeholder="HH:MM (24h)"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
            />

            {/* Repeat */}
            <TouchableOpacity
              style={styles.repeatRow}
              onPress={() => setRepeat(r => !r)}
            >
              <View style={[styles.checkbox, repeat && styles.checkboxActive]}>
                {repeat && <Text style={{ color: '#fff', fontSize: 12 }}>✓</Text>}
              </View>
              <Text style={styles.repeatLabel}>{t('health:reminders.form.repeat_toggle')}</Text>
            </TouchableOpacity>

            {repeat && (
              <>
                <Text style={styles.label}>{t('health:reminders.form.repeat_days')}</Text>
                <TextInput
                  style={styles.input}
                  value={repeatDays}
                  onChangeText={setRepeatDays}
                  placeholder={t('health:reminders.form.repeat_placeholder')}
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                />
              </>
            )}

            {/* Buttons */}
            <View style={styles.btnRow}>
              <TouchableOpacity style={styles.btnCancel} onPress={onClose}>
                <Text style={styles.btnCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnAdd} onPress={handleAdd}>
                <Text style={styles.btnAddText}>{t('health:reminders.add_reminder')}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ── Reminder Item Row ─────────────────────────────────────────────────────────

interface ReminderRowProps {
  item: ReminderItem;
  t: (key: string, params?: Record<string, string | number>) => string;
  onDone: (id: string) => void;
  onDelete: (id: string) => void;
}

function ReminderRow({ item, t, onDone, onDelete }: ReminderRowProps) {
  const days = daysUntil(item.remindAt);
  const urgent = days <= 1;

  return (
    <View style={[styles.row, urgent && styles.rowUrgent]}>
      <Text style={styles.rowIcon}>{TYPE_ICONS[item.type]}</Text>
      <View style={styles.rowBody}>
        <View style={styles.rowMeta}>
          <Text style={styles.rowType}>{t(`health:reminders.types.${item.type}`)}</Text>
          <Text style={styles.rowPet}>{petName(item.petId)}</Text>
          {(item.type === 'vaccine' || item.type === 'checkup') && (
            <Text style={styles.rowSms}>📱 {t('health:reminders.sms_badge')}</Text>
          )}
          {item.repeatDays && (
            <Text style={styles.rowRepeat}>
              {t('health:reminders.repeat', { days: item.repeatDays })}
            </Text>
          )}
        </View>
        <Text style={styles.rowTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={[styles.rowDate, urgent && styles.rowDateUrgent]}>
          {formatRemindAt(item.remindAt)}
          {days === 0 ? ' — আজ!' : days === 1 ? ' — আগামীকাল' : ` — ${days} দিন`}
        </Text>
      </View>
      <View style={styles.rowActions}>
        <TouchableOpacity onPress={() => onDone(item.id)} style={styles.actionBtn}>
          <Text style={styles.actionDone}>✓</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onDelete(item.id)} style={styles.actionBtn}>
          <Text style={styles.actionDelete}>🗑</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function RemindersScreen() {
  const { t } = useLocale();
  const [reminders, setReminders] = useState<ReminderItem[]>(INITIAL_REMINDERS);
  const [showSheet, setShowSheet] = useState(false);

  function handleAdd(params: CreateReminderParams) {
    const newItem: ReminderItem = {
      id:            `rem-${Date.now()}`,
      petId:         params.petId,
      ownerId:       'user-1',
      type:          params.type,
      title:         params.title,
      remindAt:      params.remindAt,
      repeatDays:    params.repeatDays ?? null,
      vaccinationId: params.vaccinationId ?? null,
      isDone:        false,
      lastSentAt:    null,
      createdAt:     new Date().toISOString(),
    };
    setReminders(prev =>
      [...prev, newItem].sort(
        (a, b) => new Date(a.remindAt).getTime() - new Date(b.remindAt).getTime()
      )
    );
  }

  function handleDone(id: string) {
    setReminders(prev => prev.filter(r => r.id !== id));
  }

  function handleDelete(id: string) {
    Alert.alert(
      t('health:reminders.delete'),
      t('health:reminders.delete_confirm'),
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () =>
            setReminders(prev => prev.filter(r => r.id !== id)) },
      ]
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>🔔 {t('health:reminders.title')}</Text>
          <Text style={styles.headerSub}>{t('health:reminders.subtitle')}</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowSheet(true)}>
          <Text style={styles.addBtnText}>+ {t('health:reminders.add_reminder')}</Text>
        </TouchableOpacity>
      </View>

      {/* SMS Reminder Notice (HLT-6) */}
      <View style={styles.smsNotice}>
        <Text style={styles.smsNoticeText}>📱 {t('health:reminders.sms_opt_in_notice')}</Text>
      </View>

      {reminders.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🔔</Text>
          <Text style={styles.emptyTitle}>{t('health:reminders.empty')}</Text>
          <Text style={styles.emptyDesc}>{t('health:reminders.empty_desc')}</Text>
          <TouchableOpacity style={styles.addBtn} onPress={() => setShowSheet(true)}>
            <Text style={styles.addBtnText}>{t('health:reminders.add_reminder')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={reminders}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          renderItem={({ item }) => (
            <ReminderRow item={item} t={t} onDone={handleDone} onDelete={handleDelete} />
          )}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        />
      )}

      <AddReminderSheet
        visible={showSheet}
        onClose={() => setShowSheet(false)}
        onAdd={handleAdd}
        t={t}
      />
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: '#F8FAF9' },
  header:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingBottom: 8, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#E5EDE9' },
  headerTitle:  { fontSize: 20, fontWeight: '700', color: '#1A2E25' },
  headerSub:    { fontSize: 12, color: '#6B7280', marginTop: 2 },
  smsNotice:    { backgroundColor: '#ECFDF5', paddingHorizontal: 16, paddingVertical: 8, borderBottomWidth: 1, borderColor: '#A7F3D0' },
  smsNoticeText:{ fontSize: 12, fontWeight: '500', color: '#065F46' },
  addBtn:       { backgroundColor: '#2F7B53', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
  addBtnText:   { color: '#fff', fontSize: 13, fontWeight: '600' },

  row:          { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#fff', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#E5EDE9' },
  rowUrgent:    { borderColor: '#FCA5A5', backgroundColor: '#FFF5F5' },
  rowIcon:      { fontSize: 24, marginRight: 12, marginTop: 2 },
  rowBody:      { flex: 1 },
  rowMeta:      { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 4 },
  rowType:      { fontSize: 11, fontWeight: '600', color: '#2F7B53', backgroundColor: '#E8F5EE', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  rowPet:       { fontSize: 11, color: '#6B7280' },
  rowSms:       { fontSize: 10, fontWeight: '600', color: '#047857', backgroundColor: '#D1FAE5', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 20 },
  rowRepeat:    { fontSize: 11, color: '#6B7280', fontStyle: 'italic' },
  rowTitle:     { fontSize: 15, fontWeight: '600', color: '#1A2E25' },
  rowDate:      { fontSize: 12, color: '#6B7280', marginTop: 2 },
  rowDateUrgent:{ color: '#DC2626', fontWeight: '600' },
  rowActions:   { flexDirection: 'column', alignItems: 'center', gap: 8, marginLeft: 8 },
  actionBtn:    { padding: 4 },
  actionDone:   { fontSize: 18, color: '#2F7B53' },
  actionDelete: { fontSize: 16 },

  sheetOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet:        { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '90%' },
  sheetHandle:  { width: 40, height: 4, borderRadius: 2, backgroundColor: '#D1D5DB', alignSelf: 'center', marginBottom: 16 },
  sheetTitle:   { fontSize: 18, fontWeight: '700', color: '#1A2E25', marginBottom: 16 },
  label:        { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 },
  chipRow:      { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  chip:         { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#D1D5DB', backgroundColor: '#F9FAFB' },
  chipActive:   { borderColor: '#2F7B53', backgroundColor: '#E8F5EE' },
  chipText:     { fontSize: 13, color: '#374151' },
  chipTextActive:{ color: '#2F7B53', fontWeight: '600' },
  input:        { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: '#1A2E25', backgroundColor: '#F9FAFB' },
  repeatRow:    { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  checkbox:     { width: 20, height: 20, borderRadius: 5, borderWidth: 2, borderColor: '#D1D5DB', alignItems: 'center', justifyContent: 'center' },
  checkboxActive:{ borderColor: '#2F7B53', backgroundColor: '#2F7B53' },
  repeatLabel:  { fontSize: 14, color: '#374151' },
  btnRow:       { flexDirection: 'row', gap: 12, marginTop: 20, marginBottom: 8 },
  btnCancel:    { flex: 1, borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  btnCancelText:{ fontSize: 15, color: '#374151', fontWeight: '500' },
  btnAdd:       { flex: 1, backgroundColor: '#2F7B53', borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  btnAddText:   { fontSize: 15, color: '#fff', fontWeight: '600' },

  empty:        { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 },
  emptyIcon:    { fontSize: 48 },
  emptyTitle:   { fontSize: 18, fontWeight: '700', color: '#1A2E25', textAlign: 'center' },
  emptyDesc:    { fontSize: 14, color: '#6B7280', textAlign: 'center' },
});
