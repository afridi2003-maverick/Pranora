import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useLocale } from '@pranora/i18n';
import {
  getMyProviderProfile,
  getMyProviderLocations,
  getProviderDashboardSummary,
  getProviderSerialQueue,
  type ProviderRow,
  type ProviderLocationRow,
  type ProviderDashboardStats,
  type SerialQueueItem,
} from '@pranora/api';

// ─── Mock Data ───────────────────────────────────────────────────────────────

const MOCK_PROFILE: ProviderRow = {
  id: 'prov-001',
  owner_user_id: 'user-001',
  type: 'vet_clinic',
  name_en: 'Dr. Amina Begum Vet Clinic',
  name_bn: 'ডাঃ আমিনা বেগম পশু ক্লিনিক',
  description_en: 'Experienced veterinarian with 12 years in small animal care.',
  description_bn: 'ছোট পশু যত্নে ১২ বছরের অভিজ্ঞ পশুচিকিৎসক।',
  logo_url: null,
  phone: '+8801711000111',
  whatsapp: null,
  email: 'amina@vetcare.bd',
  website: null,
  trade_license_no: 'TRAD-123456',
  is_government: false,
  verification: 'verified',
  rating_avg: 4.8,
  rating_count: 32,
  created_at: '2024-01-15T09:00:00Z',
  updated_at: '2024-01-15T09:00:00Z',
};

const MOCK_LOCATION: ProviderLocationRow = {
  id: 'loc-001',
  provider_id: 'prov-001',
  name_en: 'PranoraCare Clinic – Dhanmondi',
  name_bn: 'প্রানোরাকেয়ার ক্লিনিক – ধানমন্ডি',
  address_en: '12/A Satmasjid Road, Dhanmondi, Dhaka-1209',
  address_bn: '১২/এ সাতমসজিদ রোড, ধানমন্ডি, ঢাকা-১২০৯',
  upazila_id: 1,
  phone: '+8801711000222',
  is_24h: false,
  has_emergency: true,
  offers_home_visit: false,
  home_visit_radius_km: null,
  species_treated: ['cat', 'dog'],
  photos: [],
  cancel_cutoff_hours: 2,
  is_active: true,
  created_at: '2024-01-15T09:00:00Z',
  updated_at: '2024-01-15T09:00:00Z',
};

const MOCK_STATS: ProviderDashboardStats = {
  todayAppointmentsCount: 14,
  activeSerialsCount: 11,
  currentServingSerial: 7,
  pendingRequestsCount: 3,
  completedTodayCount: 6,
  todayRevenue: 8750,
};

interface MockBooking {
  id: string;
  code: string;
  petName: string;
  ownerName: string;
  service: string;
  startsAt: string;
  status: string;
}

const MOCK_SCHEDULE: MockBooking[] = [
  { id: 'b1', code: 'PB-001', petName: 'Moti', ownerName: 'Rahela Khanam', service: 'Wellness Check', startsAt: '09:00', status: 'completed' },
  { id: 'b2', code: 'PB-002', petName: 'Bilu', ownerName: 'Karim Uddin', service: 'Vaccination', startsAt: '10:00', status: 'completed' },
  { id: 'b3', code: 'PB-003', petName: 'Sona', ownerName: 'Nasrin Akter', service: 'Surgery Consult', startsAt: '11:00', status: 'in_progress' },
  { id: 'b4', code: 'PB-004', petName: 'Tiger', ownerName: 'Sumon Hossain', service: 'Dental Cleaning', startsAt: '12:30', status: 'confirmed' },
  { id: 'b5', code: 'PB-005', petName: 'Lali', ownerName: 'Farida Begum', service: 'Grooming', startsAt: '14:00', status: 'pending' },
  { id: 'b6', code: 'PB-006', petName: 'Rocky', ownerName: 'Tanvir Ahmed', service: 'X-Ray', startsAt: '15:30', status: 'pending' },
];

const MOCK_SERIALS: SerialQueueItem[] = [
  { serialNo: 5, bookingId: 'b0000000-0000-0000-0000-000000000001', code: 'SQ-005', patientName: 'Biru', species: 'Cat', status: 'completed', estimatedTime: '08:45 AM' },
  { serialNo: 6, bookingId: 'b0000000-0000-0000-0000-000000000002', code: 'SQ-006', patientName: 'Kalu', species: 'Dog', status: 'completed', estimatedTime: '09:20 AM' },
  { serialNo: 7, bookingId: 'b0000000-0000-0000-0000-000000000003', code: 'SQ-007', patientName: 'Moti', species: 'Cat', status: 'serving', estimatedTime: '10:15 AM' },
  { serialNo: 8, bookingId: 'b0000000-0000-0000-0000-000000000004', code: 'SQ-008', patientName: 'Tiger', species: 'Dog', status: 'waiting', estimatedTime: '10:45 AM' },
  { serialNo: 9, bookingId: 'b0000000-0000-0000-0000-000000000005', code: 'SQ-009', patientName: 'Lali', species: 'Cat', status: 'waiting', estimatedTime: '11:15 AM' },
  { serialNo: 10, bookingId: 'b0000000-0000-0000-0000-000000000006', code: 'SQ-010', patientName: 'Rocky', species: 'Dog', status: 'waiting', estimatedTime: '11:45 AM' },
];

// ─── Types ────────────────────────────────────────────────────────────────────

type TabKey = 'schedule' | 'serials' | 'info';

// ─── Component ───────────────────────────────────────────────────────────────

export function ProviderDashboardScreen() {
  const { locale } = useLocale();
  const isBangla = locale === 'bn';

  const [activeTab, setActiveTab] = useState<TabKey>('schedule');
  const [profile, setProfile] = useState<ProviderRow>(MOCK_PROFILE);
  const [location, setLocation] = useState<ProviderLocationRow>(MOCK_LOCATION);
  const [stats, setStats] = useState<ProviderDashboardStats>(MOCK_STATS);
  const [serials, setSerials] = useState<SerialQueueItem[]>(MOCK_SERIALS);
  const [schedule] = useState<MockBooking[]>(MOCK_SCHEDULE);
  const [nowServing, setNowServing] = useState<number>(MOCK_STATS.currentServingSerial ?? 7);

  useEffect(() => {
    const client = null as any;
    getMyProviderProfile(client)
      .then((p) => {
        if (p) {
          setProfile(p);
          getMyProviderLocations(client, p.id)
            .then((locs) => {
              const first = locs?.[0];
              if (first) setLocation(first);
            })
            .catch(() => {});
        }
      })
      .catch(() => {});
    getProviderDashboardSummary(client, 'loc-001')
      .then((s) => { if (s) { setStats(s); setNowServing(s.currentServingSerial ?? 7); } })
      .catch(() => {});
    getProviderSerialQueue(client, 'loc-001')
      .then((q) => { if (q && q.length > 0) setSerials(q); })
      .catch(() => {});
  }, []);

  const t = {
    title: isBangla ? 'প্রদানকারী ড্যাশবোর্ড' : 'Provider Dashboard',
    subtitle: isBangla ? (profile.name_bn ?? profile.name_en) : profile.name_en,
    tabs: {
      schedule: isBangla ? 'সময়সূচী' : 'Schedule',
      serials: isBangla ? 'সিরিয়াল' : 'Serials',
      info: isBangla ? 'তথ্য' : 'Info',
    },
    stats: {
      todayAppts: isBangla ? 'আজকের অ্যাপয়েন্টমেন্ট' : 'Today',
      activeSerials: isBangla ? 'সক্রিয় সিরিয়াল' : 'Active Serials',
      nowServing: isBangla ? 'সেবা চলছে' : 'Now Serving',
      pending: isBangla ? 'অপেক্ষামান' : 'Pending',
      completed: isBangla ? 'সম্পন্ন' : 'Completed',
      revenue: isBangla ? 'আজকের আয়' : 'Revenue',
    },
    serials: {
      nowServingLabel: isBangla ? 'এখন সেবা' : 'Now Serving',
      callNext: isBangla ? 'পরবর্তী ডাকুন' : 'Call Next',
      waiting: isBangla ? 'অপেক্ষামান' : 'Waiting',
      serving: isBangla ? 'সেবা' : 'Serving',
      done: isBangla ? 'সম্পন্ন' : 'Done',
      noSerials: isBangla ? 'আজ কোনো সিরিয়াল নেই' : 'No serials today',
      serial: isBangla ? 'সিরিয়াল' : 'Serial',
    },
    schedule: {
      service: isBangla ? 'সেবা' : 'Service',
      confirm: isBangla ? 'নিশ্চিত' : 'Confirm',
      start: isBangla ? 'শুরু' : 'Start',
      complete: isBangla ? 'সম্পন্ন' : 'Complete',
      noSchedule: isBangla ? 'আজকে কোনো সময়সূচী নেই' : 'No appointments today',
    },
    info: {
      clinic: isBangla ? 'ক্লিনিক' : 'Clinic',
      address: isBangla ? 'ঠিকানা' : 'Address',
      phone: isBangla ? 'ফোন' : 'Phone',
      verification: isBangla ? 'যাচাইকরণ' : 'Verification',
      serialQueue: isBangla ? 'সিরিয়াল' : 'Serial Queue',
      verified: isBangla ? 'যাচাইকৃত ✓' : 'Verified ✓',
      pending: isBangla ? 'অপেক্ষামান' : 'Pending',
      enabled: isBangla ? 'সক্রিয়' : 'Enabled',
    },
  };

  // ── Call Next Serial ────────────────────────────────────────────────────────
  function handleCallNext() {
    const nextSerial = nowServing + 1;
    setNowServing(nextSerial);
    setStats((prev) => ({ ...prev, currentServingSerial: nextSerial }));
    setSerials((prev) =>
      prev.map((s) => {
        if (s.serialNo === nowServing) return { ...s, status: 'completed' as const };
        if (s.serialNo === nextSerial) return { ...s, status: 'serving' as const };
        return s;
      })
    );
  }

  // ── KPI Stats Grid ─────────────────────────────────────────────────────────
  const kpiItems = [
    { label: t.stats.todayAppts, value: `${stats.todayAppointmentsCount}`, color: '#2563eb' },
    { label: t.stats.activeSerials, value: `${stats.activeSerialsCount}`, color: '#7c3aed' },
    { label: t.stats.nowServing, value: `#${nowServing}`, color: '#059669' },
    { label: t.stats.pending, value: `${stats.pendingRequestsCount}`, color: '#d97706' },
    { label: t.stats.completed, value: `${stats.completedTodayCount}`, color: '#16a34a' },
    { label: t.stats.revenue, value: `৳${stats.todayRevenue.toLocaleString()}`, color: '#dc2626' },
  ];

  // ── Status color helper ────────────────────────────────────────────────────
  function statusColor(status: string): string {
    switch (status) {
      case 'completed': return '#16a34a';
      case 'confirmed': return '#2563eb';
      case 'in_progress': return '#7c3aed';
      case 'pending': return '#d97706';
      default: return '#6b7280';
    }
  }

  // ── Tab: Schedule ──────────────────────────────────────────────────────────
  function renderSchedule() {
    if (schedule.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📅</Text>
          <Text style={styles.emptyText}>{t.schedule.noSchedule}</Text>
        </View>
      );
    }
    return (
      <View style={styles.listContainer}>
        {schedule.map((b) => (
          <View key={b.id} style={styles.scheduleCard}>
            <View style={styles.scheduleTimeBox}>
              <Text style={styles.scheduleTime}>{b.startsAt}</Text>
            </View>
            <View style={styles.scheduleDetails}>
              <Text style={styles.schedulePet}>{b.petName}</Text>
              <Text style={styles.scheduleOwner}>{b.ownerName}</Text>
              <Text style={styles.scheduleService}>{b.service}</Text>
            </View>
            <View style={styles.scheduleRight}>
              <View style={[styles.statusBadge, { backgroundColor: statusColor(b.status) }]}>
                <Text style={styles.statusBadgeText}>{b.status.replace(/_/g, ' ')}</Text>
              </View>
              {b.status === 'pending' && (
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#2563eb' }]}>
                  <Text style={styles.actionBtnText}>{t.schedule.confirm}</Text>
                </TouchableOpacity>
              )}
              {b.status === 'confirmed' && (
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#7c3aed' }]}>
                  <Text style={styles.actionBtnText}>{t.schedule.start}</Text>
                </TouchableOpacity>
              )}
              {b.status === 'in_progress' && (
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#16a34a' }]}>
                  <Text style={styles.actionBtnText}>{t.schedule.complete}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}
      </View>
    );
  }

  // ── Tab: Serial Queue ──────────────────────────────────────────────────────
  function renderSerials() {
    if (serials.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🎫</Text>
          <Text style={styles.emptyText}>{t.serials.noSerials}</Text>
        </View>
      );
    }
    const servingItem = serials.find((s) => s.status === 'serving');
    const waitingItems = serials.filter((s) => s.status === 'waiting');
    const doneItems = serials.filter((s) => s.status === 'completed');
    const hasNext = waitingItems.length > 0;

    return (
      <View style={styles.listContainer}>
        {/* Now Serving Card */}
        <View style={styles.nowServingCard}>
          <Text style={styles.nowServingLabel}>{t.serials.nowServingLabel}</Text>
          <Text style={styles.nowServingNumber}>#{servingItem?.serialNo ?? nowServing}</Text>
          {servingItem && (
            <Text style={styles.nowServingName}>{servingItem.patientName} ({servingItem.species})</Text>
          )}
          <View style={styles.serialCounts}>
            <Text style={styles.serialCountText}>⏳ {waitingItems.length} {t.serials.waiting}</Text>
            <Text style={styles.serialCountText}>  ✅ {doneItems.length} {t.serials.done}</Text>
          </View>
          <TouchableOpacity
            style={[styles.callNextBtn, !hasNext && styles.callNextBtnDisabled]}
            onPress={handleCallNext}
            disabled={!hasNext}
          >
            <Text style={styles.callNextBtnText}>
              {t.serials.callNext} #{nowServing + 1}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Serial Items */}
        {serials.map((s) => {
          const isServing = s.status === 'serving';
          const isDone = s.status === 'completed';
          const circleColor = isServing ? '#059669' : isDone ? '#9ca3af' : '#d97706';
          const bgColor = isServing ? '#f0fdf4' : isDone ? '#f9fafb' : '#fffbeb';
          const statusLabel = isServing ? t.serials.serving : isDone ? t.serials.done : t.serials.waiting;

          return (
            <View key={s.bookingId} style={[styles.serialItem, { backgroundColor: bgColor }]}>
              <View style={[styles.serialBadge, { backgroundColor: circleColor }]}>
                <Text style={styles.serialBadgeNum}>{s.serialNo}</Text>
              </View>
              <View style={styles.serialInfo}>
                <Text style={[styles.serialOwner, isDone && styles.strikethrough]}>{s.patientName}</Text>
                <Text style={styles.serialPet}>{t.serials.serial} #{s.serialNo} · {s.species} · {s.code}</Text>
              </View>
              <Text style={[styles.serialStatus, { color: circleColor }]}>{statusLabel}</Text>
            </View>
          );
        })}
      </View>
    );
  }

  // ── Tab: Clinic Info ───────────────────────────────────────────────────────
  function renderInfo() {
    const displayName = isBangla ? (location.name_bn ?? location.name_en) : location.name_en;
    const displayAddress = isBangla ? (location.address_bn ?? location.address_en) : location.address_en;
    const isVerified = profile.verification === 'verified';

    const rows: { label: string; value: string; badge?: boolean; badgeColor?: string }[] = [
      { label: t.info.clinic, value: displayName },
      { label: t.info.address, value: displayAddress },
      { label: t.info.phone, value: location.phone ?? profile.phone ?? '' },
      {
        label: t.info.verification,
        value: isVerified ? t.info.verified : t.info.pending,
        badge: true,
        badgeColor: isVerified ? '#16a34a' : '#d97706',
      },
      {
        label: isBangla ? 'জরুরী সেবা' : 'Emergency Service',
        value: location.has_emergency ? (isBangla ? 'চালু' : 'Available') : (isBangla ? 'বন্ধ' : 'Unavailable'),
        badge: true,
        badgeColor: location.has_emergency ? '#16a34a' : '#6b7280',
      },
    ];

    return (
      <View style={styles.infoContainer}>
        {rows.map((row) => (
          <View key={row.label} style={styles.infoRow}>
            <Text style={styles.infoLabel}>{row.label}</Text>
            {row.badge ? (
              <View style={[styles.infoBadge, { backgroundColor: row.badgeColor }]}>
                <Text style={styles.infoBadgeText}>{row.value}</Text>
              </View>
            ) : (
              <Text style={styles.infoValue}>{row.value}</Text>
            )}
          </View>
        ))}
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>
            {isBangla ? 'বর্তমান সিরিয়াল' : 'Current Serial'}
          </Text>
          <Text style={[styles.infoValue, { fontSize: 24, fontWeight: '900', color: '#059669' }]}>
            #{nowServing}
          </Text>
        </View>
      </View>
    );
  }

  const TABS: { key: TabKey; label: string }[] = [
    { key: 'schedule', label: t.tabs.schedule },
    { key: 'serials', label: t.tabs.serials },
    { key: 'info', label: t.tabs.info },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>{t.title}</Text>
          <Text style={styles.headerSubtitle}>{t.subtitle}</Text>
        </View>
        <View style={[
          styles.verifiedBadge,
          { backgroundColor: profile.verification === 'verified' ? '#dcfce7' : '#fef9c3' }
        ]}>
          <Text style={[
            styles.verifiedText,
            { color: profile.verification === 'verified' ? '#15803d' : '#854d0e' }
          ]}>
            {profile.verification === 'verified' ? t.info.verified : t.info.pending}
          </Text>
        </View>
      </View>

      {/* KPI Stats Grid */}
      <View style={styles.statsGrid}>
        {kpiItems.map((item) => (
          <View key={item.label} style={styles.statCard}>
            <Text style={[styles.statValue, { color: item.color }]}>{item.value}</Text>
            <Text style={styles.statLabel}>{item.label}</Text>
          </View>
        ))}
      </View>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tabItem, activeTab === tab.key && styles.tabItemActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'schedule' && renderSchedule()}
        {activeTab === 'serials' && renderSerials()}
        {activeTab === 'info' && renderInfo()}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#111827' },
  headerSubtitle: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  verifiedBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  verifiedText: { fontSize: 12, fontWeight: '700' },

  // Stats grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 10,
    paddingVertical: 12,
    gap: 8,
  },
  statCard: {
    width: '30%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    margin: 2,
  },
  statValue: { fontSize: 20, fontWeight: '900' },
  statLabel: { fontSize: 10, color: '#6b7280', marginTop: 2, textAlign: 'center' },

  // Tab bar
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

  // Content
  content: { flex: 1 },
  listContainer: { padding: 16, gap: 10 },
  emptyContainer: { alignItems: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 15, color: '#9ca3af' },

  // Schedule
  scheduleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    gap: 10,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
    marginBottom: 8,
  },
  scheduleTimeBox: {
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    alignItems: 'center',
    minWidth: 52,
  },
  scheduleTime: { fontSize: 14, fontWeight: '800', color: '#1d4ed8', fontVariant: ['tabular-nums'] },
  scheduleDetails: { flex: 1 },
  schedulePet: { fontSize: 15, fontWeight: '700', color: '#111827' },
  scheduleOwner: { fontSize: 12, color: '#6b7280' },
  scheduleService: { fontSize: 12, color: '#4b5563', marginTop: 2 },
  scheduleRight: { alignItems: 'flex-end', gap: 6 },
  statusBadge: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  statusBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  actionBtn: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  actionBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },

  // Now Serving
  nowServingCard: {
    backgroundColor: '#f0fdf4',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    marginBottom: 12,
  },
  nowServingLabel: { fontSize: 12, fontWeight: '700', color: '#16a34a', textTransform: 'uppercase', letterSpacing: 1 },
  nowServingNumber: { fontSize: 72, fontWeight: '900', color: '#15803d', lineHeight: 80 },
  nowServingName: { fontSize: 14, color: '#16a34a', marginBottom: 8 },
  serialCounts: { flexDirection: 'row', marginBottom: 12 },
  serialCountText: { fontSize: 13, color: '#6b7280' },
  callNextBtn: {
    backgroundColor: '#2563eb',
    borderRadius: 10,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  callNextBtnDisabled: { backgroundColor: '#93c5fd' },
  callNextBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  // Serial items
  serialItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 12,
    marginBottom: 6,
    gap: 12,
  },
  serialBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serialBadgeNum: { color: '#fff', fontSize: 15, fontWeight: '900' },
  serialInfo: { flex: 1 },
  serialOwner: { fontSize: 14, fontWeight: '700', color: '#111827' },
  serialPet: { fontSize: 12, color: '#6b7280' },
  serialStatus: { fontSize: 12, fontWeight: '700' },
  strikethrough: { textDecorationLine: 'line-through', color: '#9ca3af' },

  // Info
  infoContainer: { padding: 16 },
  infoRow: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  infoLabel: { fontSize: 13, color: '#6b7280', fontWeight: '600', flex: 1 },
  infoValue: { fontSize: 14, color: '#111827', fontWeight: '500', flex: 2, textAlign: 'right' },
  infoBadge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  infoBadgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },
});
