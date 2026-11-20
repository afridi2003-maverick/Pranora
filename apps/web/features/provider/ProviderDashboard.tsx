'use client';

import React, { useState, useEffect } from 'react';
import { useLocale } from '@pranora/i18n';
import { Button, Card, Chip } from '@pranora/ui';
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
  { id: 'b1', code: 'PB-20240120-001', petName: 'Moti', ownerName: 'Rahela Khanam', service: 'Wellness Check', startsAt: '09:00', status: 'completed' },
  { id: 'b2', code: 'PB-20240120-002', petName: 'Bilu', ownerName: 'Karim Uddin', service: 'Vaccination', startsAt: '10:00', status: 'completed' },
  { id: 'b3', code: 'PB-20240120-003', petName: 'Sona', ownerName: 'Nasrin Akter', service: 'Surgery Consult', startsAt: '11:00', status: 'in_progress' },
  { id: 'b4', code: 'PB-20240120-004', petName: 'Tiger', ownerName: 'Sumon Hossain', service: 'Dental Cleaning', startsAt: '12:30', status: 'confirmed' },
  { id: 'b5', code: 'PB-20240120-005', petName: 'Lali', ownerName: 'Farida Begum', service: 'Grooming', startsAt: '14:00', status: 'confirmed' },
  { id: 'b6', code: 'PB-20240120-006', petName: 'Rocky', ownerName: 'Tanvir Ahmed', service: 'X-Ray', startsAt: '15:30', status: 'pending' },
  { id: 'b7', code: 'PB-20240120-007', petName: 'Mimi', ownerName: 'Shirin Sultana', service: 'Follow-up', startsAt: '16:00', status: 'pending' },
];

const MOCK_SERIALS: SerialQueueItem[] = [
  { serialNo: 5, bookingId: 'b0000000-0000-0000-0000-000000000001', code: 'SQ-005', patientName: 'Biru', species: 'Cat', status: 'completed', estimatedTime: '08:45 AM' },
  { serialNo: 6, bookingId: 'b0000000-0000-0000-0000-000000000002', code: 'SQ-006', patientName: 'Kalu', species: 'Dog', status: 'completed', estimatedTime: '09:20 AM' },
  { serialNo: 7, bookingId: 'b0000000-0000-0000-0000-000000000003', code: 'SQ-007', patientName: 'Moti', species: 'Cat', status: 'serving', estimatedTime: '10:15 AM' },
  { serialNo: 8, bookingId: 'b0000000-0000-0000-0000-000000000004', code: 'SQ-008', patientName: 'Tiger', species: 'Dog', status: 'waiting', estimatedTime: '10:45 AM' },
  { serialNo: 9, bookingId: 'b0000000-0000-0000-0000-000000000005', code: 'SQ-009', patientName: 'Lali', species: 'Cat', status: 'waiting', estimatedTime: '11:15 AM' },
  { serialNo: 10, bookingId: 'b0000000-0000-0000-0000-000000000006', code: 'SQ-010', patientName: 'Rocky', species: 'Dog', status: 'waiting', estimatedTime: '11:45 AM' },
  { serialNo: 11, bookingId: 'b0000000-0000-0000-0000-000000000007', code: 'SQ-011', patientName: 'Sona', species: 'Cat', status: 'waiting', estimatedTime: '12:15 PM' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_CHIP_MAP: Record<string, 'pending' | 'confirmed' | 'completed' | 'neutral' | 'emergency'> = {
  pending: 'pending',
  confirmed: 'confirmed',
  in_progress: 'confirmed',
  completed: 'completed',
  cancelled_by_owner: 'neutral',
  cancelled_by_provider: 'neutral',
  no_show: 'emergency',
};

type TabKey = 'schedule' | 'serials' | 'bookings' | 'info';

// ─── Component ───────────────────────────────────────────────────────────────

export function ProviderDashboard() {
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
    tabs: {
      schedule: isBangla ? 'আজকের সময়সূচী' : "Today's Schedule",
      serials: isBangla ? 'লাইভ সিরিয়াল' : 'Live Serial Queue',
      bookings: isBangla ? 'সব বুকিং' : 'All Bookings',
      info: isBangla ? 'ক্লিনিক তথ্য' : 'Clinic Info',
    },
    stats: {
      todayAppts: isBangla ? 'আজকের অ্যাপয়েন্টমেন্ট' : "Today's Appointments",
      activeSerials: isBangla ? 'সক্রিয় সিরিয়াল' : 'Active Serials',
      nowServing: isBangla ? 'এখন সেবা দেওয়া হচ্ছে' : 'Now Serving',
      pending: isBangla ? 'অপেক্ষামান' : 'Pending',
      completed: isBangla ? 'সম্পন্ন' : 'Completed Today',
      revenue: isBangla ? 'আজকের আয়' : "Today's Revenue",
    },
    serials: {
      nowServingLabel: isBangla ? 'এখন সেবা' : 'Now Serving',
      callNext: isBangla ? 'পরবর্তী ডাকুন' : 'Call Next Serial',
      waiting: isBangla ? 'অপেক্ষামান' : 'Waiting',
      serving: isBangla ? 'সেবা চলছে' : 'Serving',
      done: isBangla ? 'সম্পন্ন' : 'Done',
      noSerials: isBangla ? 'আজ কোনো সিরিয়াল নেই' : 'No serials today',
      serial: isBangla ? 'সিরিয়াল' : 'Serial',
    },
    schedule: {
      patient: isBangla ? 'রোগী' : 'Patient',
      service: isBangla ? 'সেবা' : 'Service',
      time: isBangla ? 'সময়' : 'Time',
      status: isBangla ? 'অবস্থা' : 'Status',
      actions: isBangla ? 'পদক্ষেপ' : 'Actions',
      noSchedule: isBangla ? 'আজকে কোনো সময়সূচী নেই' : 'No appointments scheduled today',
    },
    info: {
      clinicName: isBangla ? 'ক্লিনিকের নাম' : 'Clinic Name',
      address: isBangla ? 'ঠিকানা' : 'Address',
      phone: isBangla ? 'ফোন' : 'Phone',
      verification: isBangla ? 'যাচাইকরণ' : 'Verification',
      serialEnabled: isBangla ? 'সিরিয়াল চালু' : 'Serial Queue',
      verified: isBangla ? 'যাচাইকৃত ✓' : 'Verified ✓',
      pending: isBangla ? 'অপেক্ষামান' : 'Pending',
      enabled: isBangla ? 'সক্রিয়' : 'Enabled',
      disabled: isBangla ? 'নিষ্ক্রিয়' : 'Disabled',
    },
    viewFullBookings: isBangla ? 'সম্পূর্ণ বুকিং ম্যানেজার দেখুন' : 'View Full Booking Manager',
  };

  // ── Call Next Serial (optimistic) ──────────────────────────────────────────
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

  // ── KPI Stats Bar ──────────────────────────────────────────────────────────
  const kpiCards = [
    { label: t.stats.todayAppts, value: stats.todayAppointmentsCount, color: '#2563eb' },
    { label: t.stats.activeSerials, value: stats.activeSerialsCount, color: '#7c3aed' },
    { label: t.stats.nowServing, value: `#${nowServing}`, color: '#059669' },
    { label: t.stats.pending, value: stats.pendingRequestsCount, color: '#d97706' },
    { label: t.stats.completed, value: stats.completedTodayCount, color: '#16a34a' },
    { label: t.stats.revenue, value: `৳${stats.todayRevenue.toLocaleString('en-BD')}`, color: '#dc2626' },
  ];

  // ── Tab content ────────────────────────────────────────────────────────────

  function renderSchedule() {
    if (schedule.length === 0) {
      return <p className="text-center text-gray-400 py-10">{t.schedule.noSchedule}</p>;
    }
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left text-gray-600 uppercase text-xs">
              <th className="px-4 py-3">{t.schedule.time}</th>
              <th className="px-4 py-3">{t.schedule.patient}</th>
              <th className="px-4 py-3">{t.schedule.service}</th>
              <th className="px-4 py-3">{t.schedule.status}</th>
              <th className="px-4 py-3">{t.schedule.actions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {schedule.map((b) => (
              <tr key={b.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono font-semibold text-gray-700">{b.startsAt}</td>
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">{b.petName}</div>
                  <div className="text-xs text-gray-500">{b.ownerName}</div>
                </td>
                <td className="px-4 py-3 text-gray-600">{b.service}</td>
                <td className="px-4 py-3">
                  <Chip
                    variant="status"
                    label={b.status.replace(/_/g, ' ')}
                    statusType={STATUS_CHIP_MAP[b.status] ?? 'neutral'}
                  />
                </td>
                <td className="px-4 py-3">
                  {b.status === 'pending' && (
                    <Button size="sm" variant="secondary">
                      {isBangla ? 'নিশ্চিত করুন' : 'Confirm'}
                    </Button>
                  )}
                  {b.status === 'confirmed' && (
                    <Button size="sm" variant="primary">
                      {isBangla ? 'শুরু করুন' : 'Start'}
                    </Button>
                  )}
                  {b.status === 'in_progress' && (
                    <Button size="sm" variant="secondary">
                      {isBangla ? 'সম্পন্ন' : 'Complete'}
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  function renderSerialQueue() {
    if (serials.length === 0) {
      return (
        <div className="py-16 text-center">
          <p className="text-5xl mb-4">🎫</p>
          <p className="text-gray-400 text-lg">{t.serials.noSerials}</p>
        </div>
      );
    }
    const servingItem = serials.find((s) => s.status === 'serving');
    const waitingItems = serials.filter((s) => s.status === 'waiting');
    const doneItems = serials.filter((s) => s.status === 'completed');
    const hasNext = waitingItems.length > 0;

    return (
      <div className="space-y-6">
        {/* Now Serving Display */}
        <div className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-green-50 rounded-2xl border border-green-200">
          <div className="text-center">
            <div className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-1">
              {t.serials.nowServingLabel}
            </div>
            <div className="text-7xl font-black text-green-700">
              #{servingItem?.serialNo ?? nowServing}
            </div>
            {servingItem && (
              <div className="text-sm text-green-600 mt-1">{servingItem.patientName} ({servingItem.species})</div>
            )}
          </div>
          <div className="flex flex-col gap-3 flex-1 items-center sm:items-end">
            <Button
              variant="primary"
              size="lg"
              onClick={handleCallNext}
              disabled={!hasNext}
            >
              {t.serials.callNext} #{nowServing + 1}
            </Button>
            <div className="flex gap-4 text-sm text-gray-500">
              <span>⏳ {waitingItems.length} {t.serials.waiting}</span>
              <span>✅ {doneItems.length} {t.serials.done}</span>
            </div>
          </div>
        </div>

        {/* Serial List */}
        <div className="space-y-2">
          {serials.map((s) => {
            const isServing = s.status === 'serving';
            const isDone = s.status === 'completed';
            const bgCls = isServing
              ? 'bg-green-50 border-green-300'
              : isDone
              ? 'bg-gray-50 border-gray-200'
              : 'bg-amber-50 border-amber-200';
            const badgeCls = isServing
              ? 'bg-green-500 text-white'
              : isDone
              ? 'bg-gray-400 text-white'
              : 'bg-amber-400 text-white';
            const statusLabel = isServing
              ? t.serials.serving
              : isDone
              ? t.serials.done
              : t.serials.waiting;

            return (
              <div
                key={s.bookingId}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl border ${bgCls}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${badgeCls}`}>
                  {s.serialNo}
                </div>
                <div className="flex-1">
                  <div className={`font-medium ${isDone ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                    {s.patientName}
                  </div>
                  <div className="text-xs text-gray-500">{t.serials.serial} #{s.serialNo} · {s.species} · {s.code}</div>
                </div>
                <span className="text-xs font-semibold text-gray-500">{statusLabel}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  function renderBookings() {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <p className="text-5xl">📋</p>
        <p className="text-gray-600 text-lg font-medium">
          {isBangla ? 'সম্পূর্ণ বুকিং ম্যানেজার' : 'Full Booking Manager'}
        </p>
        <p className="text-sm text-gray-400">
          {isBangla
            ? 'সব বুকিং দেখতে এবং পরিচালনা করতে নিচের বোতামে ক্লিক করুন'
            : 'Click below to view and manage all your bookings'}
        </p>
        <a href={`/${locale}/provider/bookings`}>
          <Button variant="primary" size="lg">
            {t.viewFullBookings}
          </Button>
        </a>
      </div>
    );
  }

  function renderClinicInfo() {
    const displayName = isBangla ? (location.name_bn ?? location.name_en) : location.name_en;
    const displayAddress = isBangla ? (location.address_bn ?? location.address_en) : location.address_en;
    const isVerified = profile.verification === 'verified';

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-2">
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">{t.info.clinicName}</div>
          <div className="font-semibold text-gray-800">{displayName}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">{t.info.address}</div>
          <div className="text-gray-700">{displayAddress}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">{t.info.phone}</div>
          <div className="text-gray-700 font-mono">{location.phone ?? profile.phone}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">{t.info.verification}</div>
          <Chip
            variant="status"
            label={isVerified ? t.info.verified : t.info.pending}
            statusType={isVerified ? 'completed' : 'pending'}
          />
        </div>
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">{isBangla ? 'জরুরী সেবা' : 'Emergency Service'}</div>
          <Chip
            variant="status"
            label={location.has_emergency ? (isBangla ? 'চালু' : 'Available') : (isBangla ? 'বন্ধ' : 'Unavailable')}
            statusType={location.has_emergency ? 'confirmed' : 'neutral'}
          />
        </div>
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
            {isBangla ? 'বর্তমান সিরিয়াল' : 'Current Serial'}
          </div>
          <div className="text-2xl font-bold text-green-600">#{nowServing}</div>
        </div>
      </div>
    );
  }

  const TABS: { key: TabKey; label: string }[] = [
    { key: 'schedule', label: t.tabs.schedule },
    { key: 'serials', label: t.tabs.serials },
    { key: 'bookings', label: t.tabs.bookings },
    { key: 'info', label: t.tabs.info },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t.title}</h1>
          <p className="text-sm text-gray-500">
            {isBangla ? profile.name_bn ?? profile.name_en : profile.name_en}
          </p>
        </div>
        <Chip
          variant="status"
          label={profile.verification === 'verified' ? t.info.verified : t.info.pending}
          statusType={profile.verification === 'verified' ? 'completed' : 'pending'}
        />
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpiCards.map((card) => (
          <Card key={card.label} className="p-4 text-center">
            <div
              className="text-2xl font-black"
              style={{ color: card.color }}
            >
              {card.value}
            </div>
            <div className="text-xs text-gray-500 mt-1 leading-tight">{card.label}</div>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Card className="overflow-hidden">
        {/* Tab Bar */}
        <div className="flex border-b border-gray-200 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.key
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'schedule' && renderSchedule()}
          {activeTab === 'serials' && renderSerialQueue()}
          {activeTab === 'bookings' && renderBookings()}
          {activeTab === 'info' && renderClinicInfo()}
        </div>
      </Card>
    </div>
  );
}
