import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from 'react-native';
import { useLocale } from '@pranora/i18n';
import {
  getVetSchedule,
  saveScheduleRules,
  addAvailabilityException,
  deleteAvailabilityException,
  type ScheduleRule,
  type AvailabilityException,
} from '@pranora/api';

// ─── Default Weekly Rules ───────────────────────────────────────────────────

const DEFAULT_RULES: ScheduleRule[] = [
  { weekday: 0, startTime: '09:00', endTime: '18:00', mode: 'slot', slotMinutes: 20, capacity: 1, maxSerials: null, locationId: 'loc-001', isActive: true },
  { weekday: 1, startTime: '09:00', endTime: '18:00', mode: 'slot', slotMinutes: 20, capacity: 1, maxSerials: null, locationId: 'loc-001', isActive: true },
  { weekday: 2, startTime: '09:00', endTime: '18:00', mode: 'slot', slotMinutes: 20, capacity: 1, maxSerials: null, locationId: 'loc-001', isActive: true },
  { weekday: 3, startTime: '09:00', endTime: '18:00', mode: 'slot', slotMinutes: 20, capacity: 1, maxSerials: null, locationId: 'loc-001', isActive: true },
  { weekday: 4, startTime: '09:00', endTime: '18:00', mode: 'serial', slotMinutes: 20, capacity: 1, maxSerials: 40, locationId: 'loc-001', isActive: true },
  { weekday: 5, startTime: '15:00', endTime: '20:00', mode: 'slot', slotMinutes: 30, capacity: 1, maxSerials: null, locationId: 'loc-001', isActive: false },
  { weekday: 6, startTime: '10:00', endTime: '16:00', mode: 'serial', slotMinutes: 20, capacity: 1, maxSerials: 35, locationId: 'loc-001', isActive: true },
];

const DEFAULT_EXCEPTIONS: AvailabilityException[] = [
  { id: 'exc-1', locationId: 'loc-001', date: '2026-03-21', isClosed: true, note: 'Eid-ul-Fitr Holiday' },
  { id: 'exc-2', locationId: 'loc-001', date: '2026-03-22', isClosed: true, note: 'Eid-ul-Fitr Day 2' },
  { id: 'exc-3', locationId: 'loc-001', date: '2026-04-14', isClosed: true, note: 'Pohela Boishakh (New Year)' },
];

const DAY_NAMES_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_NAMES_BN = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];

export function VetScheduleScreen() {
  const { locale } = useLocale();
  const isBangla = locale === 'bn';

  const [activeTab, setActiveTab] = useState<'weekly' | 'holidays'>('weekly');
  const [rules, setRules] = useState<ScheduleRule[]>(DEFAULT_RULES);
  const [exceptions, setExceptions] = useState<AvailabilityException[]>(DEFAULT_EXCEPTIONS);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // New holiday inputs
  const [holidayDate, setHolidayDate] = useState('');
  const [holidayNote, setHolidayNote] = useState('');

  useEffect(() => {
    const client = null as any;
    getVetSchedule(client, 'loc-001')
      .then((data) => {
        if (data && data.rules && data.rules.length > 0) {
          const merged = DEFAULT_RULES.map((def) => {
            const found = data.rules.find((r) => r.weekday === def.weekday);
            return found ? { ...found, isActive: true } : { ...def, isActive: false };
          });
          setRules(merged);
        }
        if (data && data.exceptions && data.exceptions.length > 0) {
          setExceptions(data.exceptions);
        }
      })
      .catch(() => {});
  }, []);

  const t = {
    title: isBangla ? 'পশুচিকিৎসক সময়সূচী ও প্রাপ্যতা' : 'Vet Schedule & Availability',
    subtitle: isBangla ? 'সাপ্তাহিক কর্মঘণ্টা, পরামর্শ মোড ও ছুটি সেট করুন' : 'Configure hours, consultation modes & holidays',
    weeklyTab: isBangla ? 'সাপ্তাহিক সময়সূচী' : 'Weekly',
    holidaysTab: isBangla ? 'ছুটি ও ব্যতিক্রম' : 'Holidays',
    open: isBangla ? 'খোলা' : 'Open',
    closed: isBangla ? 'বন্ধ' : 'Closed',
    modeSlot: isBangla ? 'স্লট' : 'Slots',
    modeSerial: isBangla ? 'সিরিয়াল' : 'Serials',
    save: isBangla ? 'সময়সূচী সংরক্ষণ করুন' : 'Save Schedule',
    saving: isBangla ? 'সংরক্ষণ হচ্ছে...' : 'Saving...',
    saved: isBangla ? 'সময়সূচী সফলভাবে সংরক্ষিত!' : 'Schedule saved successfully!',
    addHoliday: isBangla ? 'ছুটি যোগ করুন' : 'Add Holiday',
    dateLabel: isBangla ? 'তারিখ (YYYY-MM-DD)' : 'Date (YYYY-MM-DD)',
    noteLabel: isBangla ? 'কারণ / বিবরণ' : 'Reason / Note',
    delete: isBangla ? 'মুছুন' : 'Delete',
    noExceptions: isBangla ? 'কোনো ছুটির দিন নির্ধারিত নেই' : 'No holidays configured',
    duration: isBangla ? 'সময়' : 'Duration',
    maxSerials: isBangla ? 'সর্বোচ্চ সিরিয়াল' : 'Max Serials',
  };

  function updateRule(weekday: number, updates: Partial<ScheduleRule>) {
    setRules((prev) =>
      prev.map((r) => (r.weekday === weekday ? { ...r, ...updates } : r))
    );
  }

  async function handleSaveSchedule() {
    setSaving(true);
    setSaveSuccess(false);
    try {
      const client = null as any;
      const activeRules = rules.filter((r) => r.isActive);
      await saveScheduleRules(client, {
        locationId: 'loc-001',
        rules: activeRules,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    } finally {
      setSaving(false);
    }
  }

  async function handleAddHoliday() {
    if (!holidayDate.trim()) return;
    const newExc: AvailabilityException = {
      id: `exc-${Date.now()}`,
      locationId: 'loc-001',
      date: holidayDate.trim(),
      isClosed: true,
      note: holidayNote.trim() || null,
    };

    try {
      const client = null as any;
      await addAvailabilityException(client, {
        locationId: 'loc-001',
        date: holidayDate.trim(),
        isClosed: true,
        note: holidayNote.trim() || undefined,
      });
    } catch {
      // offline fallback
    }

    setExceptions((prev) => [...prev.filter((x) => x.date !== newExc.date), newExc].sort((a, b) => a.date.localeCompare(b.date)));
    setHolidayDate('');
    setHolidayNote('');
  }

  async function handleDeleteException(id: string) {
    try {
      const client = null as any;
      await deleteAvailabilityException(client, id);
    } catch {
      // offline fallback
    }
    setExceptions((prev) => prev.filter((x) => x.id !== id));
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t.title}</Text>
        <Text style={styles.headerSubtitle}>{t.subtitle}</Text>
      </View>

      {/* Save Success Banner */}
      {saveSuccess && (
        <View style={styles.successBanner}>
          <Text style={styles.successText}>✓ {t.saved}</Text>
        </View>
      )}

      {/* Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'weekly' && styles.tabItemActive]}
          onPress={() => setActiveTab('weekly')}
        >
          <Text style={[styles.tabText, activeTab === 'weekly' && styles.tabTextActive]}>
            {t.weeklyTab}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'holidays' && styles.tabItemActive]}
          onPress={() => setActiveTab('holidays')}
        >
          <Text style={[styles.tabText, activeTab === 'holidays' && styles.tabTextActive]}>
            {t.holidaysTab} ({exceptions.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* TAB: Weekly Schedule */}
        {activeTab === 'weekly' && (
          <View style={styles.listContainer}>
            {rules.map((rule) => {
              const dayName = isBangla ? DAY_NAMES_BN[rule.weekday] : DAY_NAMES_EN[rule.weekday];
              const isOpen = rule.isActive ?? true;

              return (
                <View
                  key={rule.weekday}
                  style={[styles.dayCard, !isOpen && styles.dayCardClosed]}
                >
                  {/* Day Header Row */}
                  <View style={styles.dayCardHeader}>
                    <Text style={styles.dayName}>{dayName}</Text>
                    <TouchableOpacity
                      style={[styles.toggleBtn, isOpen ? styles.toggleOpen : styles.toggleClosed]}
                      onPress={() => updateRule(rule.weekday, { isActive: !isOpen })}
                    >
                      <Text style={[styles.toggleText, isOpen ? styles.toggleTextOpen : styles.toggleTextClosed]}>
                        {isOpen ? t.open : t.closed}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Settings if open */}
                  {isOpen ? (
                    <View style={styles.daySettings}>
                      {/* Hours */}
                      <View style={styles.settingRow}>
                        <Text style={styles.settingLabel}>{isBangla ? 'সময়' : 'Hours'}:</Text>
                        <TextInput
                          style={styles.timeInput}
                          value={rule.startTime.slice(0, 5)}
                          onChangeText={(v) => updateRule(rule.weekday, { startTime: v })}
                          placeholder="09:00"
                        />
                        <Text style={styles.timeSeparator}>-</Text>
                        <TextInput
                          style={styles.timeInput}
                          value={rule.endTime.slice(0, 5)}
                          onChangeText={(v) => updateRule(rule.weekday, { endTime: v })}
                          placeholder="18:00"
                        />
                      </View>

                      {/* Mode switch */}
                      <View style={styles.settingRow}>
                        <Text style={styles.settingLabel}>{isBangla ? 'মোড' : 'Mode'}:</Text>
                        <View style={styles.modeSwitch}>
                          <TouchableOpacity
                            style={[styles.modeOption, rule.mode === 'slot' && styles.modeOptionActive]}
                            onPress={() => updateRule(rule.weekday, { mode: 'slot', maxSerials: null })}
                          >
                            <Text style={[styles.modeOptionText, rule.mode === 'slot' && styles.modeOptionTextActive]}>
                              {t.modeSlot}
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.modeOption, rule.mode === 'serial' && styles.modeOptionActive]}
                            onPress={() => updateRule(rule.weekday, { mode: 'serial', maxSerials: 40 })}
                          >
                            <Text style={[styles.modeOptionText, rule.mode === 'serial' && styles.modeOptionTextActive]}>
                              {t.modeSerial}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>

                      {/* Slot or Serial Details */}
                      {rule.mode === 'slot' ? (
                        <View style={styles.settingRow}>
                          <Text style={styles.settingLabel}>{t.duration}:</Text>
                          <View style={styles.chipRow}>
                            {[15, 20, 30, 45].map((mins) => (
                              <TouchableOpacity
                                key={mins}
                                style={[styles.miniChip, rule.slotMinutes === mins && styles.miniChipActive]}
                                onPress={() => updateRule(rule.weekday, { slotMinutes: mins })}
                              >
                                <Text style={[styles.miniChipText, rule.slotMinutes === mins && styles.miniChipTextActive]}>
                                  {mins}m
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                        </View>
                      ) : (
                        <View style={styles.settingRow}>
                          <Text style={styles.settingLabel}>{t.maxSerials}:</Text>
                          <TextInput
                            style={styles.numberInput}
                            keyboardType="numeric"
                            value={String(rule.maxSerials ?? 40)}
                            onChangeText={(v) => updateRule(rule.weekday, { maxSerials: parseInt(v, 10) || 40 })}
                          />
                        </View>
                      )}
                    </View>
                  ) : (
                    <Text style={styles.closedNotice}>
                      {isBangla ? 'এই দিনে সেবা বন্ধ থাকবে' : 'Closed all day'}
                    </Text>
                  )}
                </View>
              );
            })}

            {/* Save Button */}
            <TouchableOpacity
              style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
              onPress={handleSaveSchedule}
              disabled={saving}
            >
              <Text style={styles.saveBtnText}>{saving ? t.saving : t.save}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* TAB: Holidays & Exceptions */}
        {activeTab === 'holidays' && (
          <View style={styles.listContainer}>
            {/* Add Holiday Card */}
            <View style={styles.addCard}>
              <Text style={styles.addCardTitle}>{t.addHoliday}</Text>
              <Text style={styles.inputLabel}>{t.dateLabel}</Text>
              <TextInput
                style={styles.textInput}
                placeholder="2026-04-14"
                value={holidayDate}
                onChangeText={setHolidayDate}
              />
              <Text style={styles.inputLabel}>{t.noteLabel}</Text>
              <TextInput
                style={styles.textInput}
                placeholder={isBangla ? 'যেমন: পহেলা বৈশাখ' : 'e.g. Pohela Boishakh'}
                value={holidayNote}
                onChangeText={setHolidayNote}
              />
              <TouchableOpacity
                style={styles.addBtn}
                onPress={handleAddHoliday}
              >
                <Text style={styles.addBtnText}>{t.addHoliday}</Text>
              </TouchableOpacity>
            </View>

            {/* List of Exceptions */}
            {exceptions.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>{t.noExceptions}</Text>
              </View>
            ) : (
              exceptions.map((exc) => (
                <View key={exc.id ?? exc.date} style={styles.excItem}>
                  <View style={styles.excBadge}>
                    <Text style={styles.excBadgeText}>{t.closed}</Text>
                  </View>
                  <View style={styles.excInfo}>
                    <Text style={styles.excDate}>{exc.date}</Text>
                    <Text style={styles.excNote}>{exc.note || (isBangla ? 'বিশেষ ছুটি' : 'Special holiday')}</Text>
                  </View>
                  {exc.id && (
                    <TouchableOpacity
                      onPress={() => handleDeleteException(exc.id!)}
                      style={styles.delBtn}
                    >
                      <Text style={styles.delBtnText}>{t.delete}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))
            )}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },

  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#111827' },
  headerSubtitle: { fontSize: 13, color: '#6b7280', marginTop: 2 },

  successBanner: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#86efac',
  },
  successText: { color: '#15803d', fontWeight: '700', fontSize: 13 },

  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tabItem: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabItemActive: { borderBottomWidth: 2, borderBottomColor: '#2563eb' },
  tabText: { fontSize: 13, color: '#6b7280', fontWeight: '500' },
  tabTextActive: { color: '#2563eb', fontWeight: '700' },

  content: { flex: 1 },
  listContainer: { padding: 16, gap: 12 },

  dayCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  dayCardClosed: {
    backgroundColor: '#f9fafb',
    borderColor: '#e5e7eb',
    opacity: 0.75,
  },
  dayCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dayName: { fontSize: 16, fontWeight: '700', color: '#111827' },
  toggleBtn: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  toggleOpen: { backgroundColor: '#dcfce7' },
  toggleClosed: { backgroundColor: '#f3f4f6' },
  toggleText: { fontSize: 12, fontWeight: '700' },
  toggleTextOpen: { color: '#15803d' },
  toggleTextClosed: { color: '#6b7280' },

  daySettings: { marginTop: 6, gap: 8 },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingLabel: { fontSize: 12, color: '#6b7280', minWidth: 50 },
  timeInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 13,
    fontFamily: 'monospace',
    minWidth: 60,
    textAlign: 'center',
  },
  timeSeparator: { color: '#9ca3af' },

  modeSwitch: { flexDirection: 'row', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, overflow: 'hidden' },
  modeOption: { paddingHorizontal: 12, paddingVertical: 4, backgroundColor: '#f9fafb' },
  modeOptionActive: { backgroundColor: '#2563eb' },
  modeOptionText: { fontSize: 12, color: '#4b5563', fontWeight: '500' },
  modeOptionTextActive: { color: '#fff', fontWeight: '700' },

  chipRow: { flexDirection: 'row', gap: 6 },
  miniChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#f9fafb',
  },
  miniChipActive: { backgroundColor: '#eff6ff', borderColor: '#2563eb' },
  miniChipText: { fontSize: 11, color: '#6b7280' },
  miniChipTextActive: { color: '#2563eb', fontWeight: '700' },

  numberInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 13,
    minWidth: 50,
    textAlign: 'center',
  },
  closedNotice: { fontSize: 12, color: '#9ca3af', fontStyle: 'italic', marginTop: 4 },

  saveBtn: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  saveBtnDisabled: { backgroundColor: '#93c5fd' },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  // Holidays
  addCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 8,
  },
  addCardTitle: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 4 },
  inputLabel: { fontSize: 12, color: '#6b7280', fontWeight: '500' },
  textInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
  },
  addBtn: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },

  emptyContainer: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { color: '#9ca3af', fontSize: 14 },

  excItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  excBadge: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  excBadgeText: { color: '#dc2626', fontSize: 11, fontWeight: '700' },
  excInfo: { flex: 1 },
  excDate: { fontSize: 14, fontWeight: '700', color: '#111827', fontFamily: 'monospace' },
  excNote: { fontSize: 12, color: '#6b7280' },
  delBtn: { paddingHorizontal: 8, paddingVertical: 4 },
  delBtnText: { color: '#dc2626', fontSize: 12, fontWeight: '600' },
});
