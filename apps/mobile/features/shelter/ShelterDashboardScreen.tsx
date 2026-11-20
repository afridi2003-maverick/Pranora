import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useLocale } from '@pranora/i18n';
import {
  getMyShelterProfile,
  getShelterRescueQueue,
  getShelterActiveCases,
  getShelterAdoptionListings,
  getShelterPendingApplications,
  reviewAnimalReport,
  closeRescueCase,
  decideAdoptionApplication,
  type ShelterProviderRow,
  type AnimalReportRow,
  type RescueCaseRow,
  type AdoptionListingRow,
  type AdoptionApplicationRow,
} from '@pranora/api';

const MOCK_SHELTER: ShelterProviderRow = {
  id: 'sh-dhaka-01',
  owner_user_id: 'usr-1',
  type: 'shelter',
  name_en: 'Dhaka Animal Welfare Sanctuary',
  name_bn: 'ঢাকা প্রাণী কল্যাণ অভয়ারণ্য',
  phone: '+8801711223344',
  email: 'info@dhakashelter.org',
  verification: 'verified',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const MOCK_QUEUE: AnimalReportRow[] = [
  {
    id: 'rep-m1',
    reporter_id: 'usr-rep-1',
    kind: 'injured',
    pet_id: null,
    species: 'dog',
    urgency: 'critical',
    last_seen_at: new Date().toISOString(),
    contact_phone: '+8801811998877',
    description: 'Severely injured stray puppy near Dhanmondi Lake, limping with leg wound.',
    photos: [],
    location: null,
    area_text: 'Dhanmondi 8/A, Dhaka',
    upazila_id: 1,
    district_id: 1,
    status: 'submitted',
    duplicate_of: null,
    reviewed_by: null,
    reviewed_at: null,
    created_at: new Date(Date.now() - 30 * 60000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const MOCK_CASES: RescueCaseRow[] = [
  {
    id: 'case-m1',
    report_id: 'rep-past-1',
    status: 'rescue_in_progress',
    shelter_id: 'sh-dhaka-01',
    assigned_rescuer_id: 'res-01',
    pet_id: 'pet-rec-1',
    outcome: null,
    outcome_note: null,
    closed_at: null,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const MOCK_LISTINGS: AdoptionListingRow[] = [
  {
    id: 'adp-m1',
    pet_id: 'pet-adp-1',
    posted_by: 'usr-1',
    shelter_id: 'sh-dhaka-01',
    species: 'cat',
    age_months: 6,
    gender: 'female',
    title_bn: 'মায়াবী বিড়াল ছানা মিমি',
    title_en: 'Loving Kitten Mimi',
    description_bn: 'সম্পূর্ণ সুস্থ ও ভ্যাকসিনেটেড বিড়াল ছানা।',
    description_en: 'Vaccinated and playful friendly kitten looking for forever family.',
    photos: [],
    is_vaccinated: true,
    is_neutered: false,
    district_id: 1,
    upazila_id: 1,
    status: 'available',
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const MOCK_APPLICATIONS: AdoptionApplicationRow[] = [
  {
    id: 'app-m1',
    listing_id: 'adp-m1',
    applicant_id: 'usr-applicant-1',
    home_type: 'own_flat',
    has_other_pets: false,
    experience: 'Had cats during childhood for 5 years.',
    reason: 'Looking to adopt a companion cat for my quiet apartment.',
    status: 'submitted',
    reviewed_by: null,
    reviewed_at: null,
    decision_note: null,
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export function ShelterDashboardScreen() {
  const { locale } = useLocale();
  const isBn = locale === 'bn';

  const [shelter, setShelter] = useState<ShelterProviderRow>(MOCK_SHELTER);
  const [activeTab, setActiveTab] = useState<'queue' | 'cases' | 'listings' | 'applications'>('queue');

  const [queue, setQueue] = useState<AnimalReportRow[]>(MOCK_QUEUE);
  const [cases, setCases] = useState<RescueCaseRow[]>(MOCK_CASES);
  const [listings, setListings] = useState<AdoptionListingRow[]>(MOCK_LISTINGS);
  const [applications, setApplications] = useState<AdoptionApplicationRow[]>(MOCK_APPLICATIONS);

  useEffect(() => {
    async function loadData() {
      try {
        const profile = await getMyShelterProfile(null as any);
        if (profile) {
          setShelter(profile);
          const [qData, cData, lData, aData] = await Promise.all([
            getShelterRescueQueue(null as any, profile.id).catch(() => MOCK_QUEUE),
            getShelterActiveCases(null as any, profile.id).catch(() => MOCK_CASES),
            getShelterAdoptionListings(null as any, profile.id).catch(() => MOCK_LISTINGS),
            getShelterPendingApplications(null as any, profile.id).catch(() => MOCK_APPLICATIONS),
          ]);
          if (qData.length > 0) setQueue(qData);
          if (cData.length > 0) setCases(cData);
          if (lData.length > 0) setListings(lData);
          if (aData.length > 0) setApplications(aData);
        }
      } catch (err) {
        console.warn('Shelter mobile dashboard warning:', err);
      }
    }
    loadData();
  }, []);

  const handleAdmitReport = async (reportId: string) => {
    try {
      await reviewAnimalReport(null as any, reportId, true, shelter.id);
    } catch {
      // optimistic
    }
    setQueue((prev) => prev.filter((r) => r.id !== reportId));
    setCases((prev) => [
      {
        id: `case-new-${Date.now()}`,
        report_id: reportId,
        status: 'rescue_in_progress',
        shelter_id: shelter.id,
        assigned_rescuer_id: null,
        pet_id: null,
        outcome: null,
        outcome_note: null,
        closed_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  const handleDeclineReport = async (reportId: string) => {
    try {
      await reviewAnimalReport(null as any, reportId, false);
    } catch {
      // optimistic
    }
    setQueue((prev) => prev.filter((r) => r.id !== reportId));
  };

  const handleCloseCase = async (caseId: string) => {
    try {
      await closeRescueCase(null as any, caseId, 'adopted', 'Ready for adoption');
    } catch {
      // optimistic
    }
    setCases((prev) => prev.filter((c) => c.id !== caseId));
  };

  const handleDecideApplication = async (appId: string, approve: boolean) => {
    try {
      await decideAdoptionApplication(null as any, appId, approve);
    } catch {
      // optimistic
    }
    setApplications((prev) => prev.filter((a) => a.id !== appId));
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f9fafb' }} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      {/* Shelter Header */}
      <View style={{ backgroundColor: '#ffffff', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb', marginBottom: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#111827' }}>
              {isBn && shelter.name_bn ? shelter.name_bn : shelter.name_en}
            </Text>
            <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
              {shelter.phone} • {shelter.email || 'shelter@pranora.com'}
            </Text>
          </View>
          <View style={{ backgroundColor: '#dcfce7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
            <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#16a34a' }}>
              {shelter.verification === 'verified' ? (isBn ? 'যাচাইকৃত' : 'VERIFIED') : (isBn ? 'অপেক্ষমাণ' : 'PENDING')}
            </Text>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f3f4f6' }}>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 11, color: '#6b7280' }}>{isBn ? 'প্রাণী' : 'Occ.'}</Text>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#10b981', marginTop: 2 }}>{cases.length}</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 11, color: '#6b7280' }}>{isBn ? 'রিপোর্ট' : 'Queue'}</Text>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#ef4444', marginTop: 2 }}>{queue.length}</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 11, color: '#6b7280' }}>{isBn ? 'কেস' : 'Cases'}</Text>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#111827', marginTop: 2 }}>{cases.length}</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 11, color: '#6b7280' }}>{isBn ? 'লিস্টিং' : 'Listings'}</Text>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#111827', marginTop: 2 }}>{listings.length}</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 11, color: '#6b7280' }}>{isBn ? 'আবেদন' : 'Apps'}</Text>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#3b82f6', marginTop: 2 }}>{applications.length}</Text>
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View style={{ flexDirection: 'row', backgroundColor: '#ffffff', borderRadius: 8, padding: 4, borderWidth: 1, borderColor: '#e5e7eb', marginBottom: 16 }}>
        {(['queue', 'cases', 'listings', 'applications'] as const).map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => setActiveTab(t)}
            style={{
              flex: 1,
              paddingVertical: 8,
              borderRadius: 6,
              alignItems: 'center',
              backgroundColor: activeTab === t ? '#10b981' : 'transparent',
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: activeTab === t ? 'bold' : '500',
                color: activeTab === t ? '#ffffff' : '#4b5563',
              }}
            >
              {t === 'queue' ? (isBn ? 'রিপোর্ট' : 'Queue') :
               t === 'cases' ? (isBn ? 'কেস' : 'Cases') :
               t === 'listings' ? (isBn ? 'লিস্টিং' : 'Listings') :
               (isBn ? 'আবেদন' : 'Apps')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab 1: Queue */}
      {activeTab === 'queue' && (
        <View style={{ gap: 12 }}>
          {queue.length === 0 ? (
            <View style={{ backgroundColor: '#ffffff', padding: 24, borderRadius: 12, alignItems: 'center' }}>
              <Text style={{ color: '#6b7280', fontSize: 14 }}>
                {isBn ? 'বর্তমানে কোনো অপেক্ষমাণ রিপোর্ট নেই।' : 'No pending reports in queue.'}
              </Text>
            </View>
          ) : (
            queue.map((rep) => (
              <View key={rep.id} style={{ backgroundColor: '#ffffff', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb' }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                  <Text style={{ fontWeight: 'bold', color: '#111827', textTransform: 'capitalize' }}>
                    {rep.species} • {rep.kind}
                  </Text>
                  <View style={{ backgroundColor: '#fee2e2', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                    <Text style={{ fontSize: 10, color: '#dc2626', fontWeight: 'bold' }}>
                      {rep.urgency.toUpperCase()}
                    </Text>
                  </View>
                </View>
                <Text style={{ fontSize: 13, color: '#374151', marginBottom: 8 }}>{rep.description}</Text>
                <Text style={{ fontSize: 11, color: '#6b7280', marginBottom: 12 }}>
                  📍 {rep.area_text} • 📞 {rep.contact_phone}
                </Text>
                <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'flex-end' }}>
                  <TouchableOpacity
                    onPress={() => handleDeclineReport(rep.id)}
                    style={{ paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6, borderWidth: 1, borderColor: '#d1d5db' }}
                  >
                    <Text style={{ fontSize: 12, color: '#374151' }}>{isBn ? 'বাতিল' : 'Decline'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleAdmitReport(rep.id)}
                    style={{ backgroundColor: '#10b981', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 6 }}
                  >
                    <Text style={{ fontSize: 12, color: '#ffffff', fontWeight: 'bold' }}>
                      {isBn ? 'শেল্টারে গ্রহণ' : 'Admit'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      )}

      {/* Tab 2: Cases */}
      {activeTab === 'cases' && (
        <View style={{ gap: 12 }}>
          {cases.length === 0 ? (
            <View style={{ backgroundColor: '#ffffff', padding: 24, borderRadius: 12, alignItems: 'center' }}>
              <Text style={{ color: '#6b7280', fontSize: 14 }}>
                {isBn ? 'কোনো সক্রিয় উদ্ধার কেস নেই।' : 'No active rescue cases.'}
              </Text>
            </View>
          ) : (
            cases.map((c) => (
              <View key={c.id} style={{ backgroundColor: '#ffffff', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb' }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text style={{ fontWeight: 'bold', color: '#111827' }}>Case #{c.id.slice(0, 8)}</Text>
                  <Text style={{ fontSize: 11, color: '#10b981', fontWeight: '600' }}>{c.status.toUpperCase()}</Text>
                </View>
                <Text style={{ fontSize: 12, color: '#6b7280', marginBottom: 12 }}>
                  Report: {c.report_id} • Started: {new Date(c.created_at).toLocaleDateString()}
                </Text>
                <TouchableOpacity
                  onPress={() => handleCloseCase(c.id)}
                  style={{ alignSelf: 'flex-end', backgroundColor: '#10b981', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 6 }}
                >
                  <Text style={{ fontSize: 12, color: '#ffffff', fontWeight: 'bold' }}>
                    {isBn ? 'কেস সম্পন্ন করুন' : 'Close Case'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      )}

      {/* Tab 3: Listings */}
      {activeTab === 'listings' && (
        <View style={{ gap: 12 }}>
          {listings.length === 0 ? (
            <View style={{ backgroundColor: '#ffffff', padding: 24, borderRadius: 12, alignItems: 'center' }}>
              <Text style={{ color: '#6b7280', fontSize: 14 }}>
                {isBn ? 'কোনো সক্রিয় দত্তক লিস্টিং নেই।' : 'No active listings.'}
              </Text>
            </View>
          ) : (
            listings.map((item) => (
              <View key={item.id} style={{ backgroundColor: '#ffffff', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb' }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text style={{ fontWeight: 'bold', color: '#111827' }}>
                    {isBn && item.title_bn ? item.title_bn : item.title_en}
                  </Text>
                  <Text style={{ fontSize: 11, color: '#10b981', fontWeight: '600' }}>{item.status.toUpperCase()}</Text>
                </View>
                <Text style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>
                  {item.species} • {item.gender} • {item.age_months ? `${item.age_months}m` : ''}
                </Text>
                <Text style={{ fontSize: 12, color: '#374151' }}>
                  {isBn && item.description_bn ? item.description_bn : item.description_en}
                </Text>
              </View>
            ))
          )}
        </View>
      )}

      {/* Tab 4: Applications */}
      {activeTab === 'applications' && (
        <View style={{ gap: 12 }}>
          {applications.length === 0 ? (
            <View style={{ backgroundColor: '#ffffff', padding: 24, borderRadius: 12, alignItems: 'center' }}>
              <Text style={{ color: '#6b7280', fontSize: 14 }}>
                {isBn ? 'কোনো অপেক্ষমাণ আবেদন নেই।' : 'No applications received.'}
              </Text>
            </View>
          ) : (
            applications.map((app) => (
              <View key={app.id} style={{ backgroundColor: '#ffffff', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb' }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text style={{ fontWeight: 'bold', color: '#111827' }}>Applicant: {app.applicant_id.slice(0, 8)}</Text>
                  <Text style={{ fontSize: 11, color: '#f59e0b', fontWeight: 'bold' }}>{app.status.toUpperCase()}</Text>
                </View>
                <Text style={{ fontSize: 13, color: '#374151', marginVertical: 6 }}>{app.reason}</Text>
                <Text style={{ fontSize: 11, color: '#6b7280', marginBottom: 12 }}>
                  Home: {app.home_type} • Other pets: {app.has_other_pets ? 'Yes' : 'No'}
                </Text>
                <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'flex-end' }}>
                  <TouchableOpacity
                    onPress={() => handleDecideApplication(app.id, false)}
                    style={{ paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6, borderWidth: 1, borderColor: '#d1d5db' }}
                  >
                    <Text style={{ fontSize: 12, color: '#374151' }}>{isBn ? 'বাতিল' : 'Reject'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDecideApplication(app.id, true)}
                    style={{ backgroundColor: '#10b981', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 6 }}
                  >
                    <Text style={{ fontSize: 12, color: '#ffffff', fontWeight: 'bold' }}>
                      {isBn ? 'অনুমোদন' : 'Approve'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      )}
    </ScrollView>
  );
}
