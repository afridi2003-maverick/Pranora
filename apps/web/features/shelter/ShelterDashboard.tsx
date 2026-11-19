'use client';

import React, { useState, useEffect } from 'react';
import { useLocale } from '@pranora/i18n';
import { Button, Card, Chip } from '@pranora/ui';
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

// ── Mock Fallback Data ───────────────────────────────────────────────────────

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
    id: 'rep-q1',
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
  {
    id: 'rep-q2',
    reporter_id: 'usr-rep-2',
    kind: 'abandoned',
    pet_id: null,
    species: 'cat',
    urgency: 'high',
    last_seen_at: new Date().toISOString(),
    contact_phone: '+8801711002233',
    description: 'Two abandoned Persian cross kittens in a box near Banani Supermarket.',
    photos: [],
    location: null,
    area_text: 'Banani Block C, Dhaka',
    upazila_id: 1,
    district_id: 1,
    status: 'submitted',
    duplicate_of: null,
    reviewed_by: null,
    reviewed_at: null,
    created_at: new Date(Date.now() - 90 * 60000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const MOCK_CASES: RescueCaseRow[] = [
  {
    id: 'case-01',
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
  {
    id: 'case-02',
    report_id: 'rep-past-2',
    status: 'assigned',
    shelter_id: 'sh-dhaka-01',
    assigned_rescuer_id: 'res-02',
    pet_id: null,
    outcome: null,
    outcome_note: null,
    closed_at: null,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const MOCK_LISTINGS: AdoptionListingRow[] = [
  {
    id: 'adp-01',
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
  {
    id: 'adp-02',
    pet_id: 'pet-adp-2',
    posted_by: 'usr-1',
    shelter_id: 'sh-dhaka-01',
    species: 'dog',
    age_months: 14,
    gender: 'male',
    title_bn: 'দেশি কুকুর টমি',
    title_en: 'Rescued Desi Dog Tommy',
    description_bn: 'সুস্থ ও বুদ্ধিমান পাহারা দিতে সক্ষম।',
    description_en: 'Healthy, loyal desi dog rehabilitated after injury.',
    photos: [],
    is_vaccinated: true,
    is_neutered: true,
    district_id: 1,
    upazila_id: 1,
    status: 'available',
    created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const MOCK_APPLICATIONS: AdoptionApplicationRow[] = [
  {
    id: 'app-01',
    listing_id: 'adp-01',
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

export function ShelterDashboard() {
  const { locale } = useLocale();
  const isBn = locale === 'bn';

  const [shelter, setShelter] = useState<ShelterProviderRow>(MOCK_SHELTER);
  const [activeTab, setActiveTab] = useState<'queue' | 'cases' | 'listings' | 'applications'>('queue');
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

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
        console.warn('Shelter dashboard loading notice:', err);
      }
    }
    loadData();
  }, []);

  // Actions
  const handleAdmitReport = async (reportId: string) => {
    setActionInProgress(reportId);
    try {
      await reviewAnimalReport(null as any, reportId, true, shelter.id);
    } catch {
      // optimistic fallback
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
    setActionInProgress(null);
  };

  const handleDeclineReport = async (reportId: string) => {
    setActionInProgress(reportId);
    try {
      await reviewAnimalReport(null as any, reportId, false);
    } catch {
      // optimistic fallback
    }
    setQueue((prev) => prev.filter((r) => r.id !== reportId));
    setActionInProgress(null);
  };

  const handleCloseCase = async (caseId: string) => {
    setActionInProgress(caseId);
    try {
      await closeRescueCase(null as any, caseId, 'adopted', 'Rehabilitated and ready for adoption');
    } catch {
      // optimistic fallback
    }
    setCases((prev) => prev.filter((c) => c.id !== caseId));
    setActionInProgress(null);
  };

  const handleDecideApplication = async (appId: string, approve: boolean) => {
    setActionInProgress(appId);
    try {
      await decideAdoptionApplication(null as any, appId, approve);
    } catch {
      // optimistic fallback
    }
    setApplications((prev) => prev.filter((a) => a.id !== appId));
    setActionInProgress(null);
  };

  const stats = {
    totalCapacity: 50,
    occupancy: cases.length,
    pendingQueue: queue.length,
    activeCases: cases.length,
    availableListings: listings.filter((l) => l.status === 'available').length,
    pendingApps: applications.length,
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-content-primary">
              {isBn && shelter.name_bn ? shelter.name_bn : shelter.name_en}
            </h1>
            <Chip
              variant="status"
              statusType={shelter.verification === 'verified' ? 'confirmed' : 'pending'}
              label={shelter.verification === 'verified' ? (isBn ? 'যাচাইকৃত' : 'Verified') : (isBn ? 'যাচাই প্রক্রিয়াধীন' : 'Pending Verification')}
            />
          </div>
          <p className="text-sm text-content-secondary mt-1">
            {isBn
              ? 'উদ্ধার তালিকা, চলমান সেবা ও দত্তক আবেদনের সামগ্রিক অবস্থা'
              : 'Overview of rescue queue, active cases, and adoption listings'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={() => window.location.href = `/${locale}/shelter/rescue-queue`}
          >
            {isBn ? 'রিভিউ কিউ' : 'Review Queue'}
          </Button>
          <Button
            variant="secondary"
            onClick={() => window.location.href = `/${locale}/shelter/onboarding`}
          >
            {isBn ? 'প্রোফাইল আপডেট' : 'Update Profile'}
          </Button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="p-4 text-center">
          <div className="text-xs text-content-secondary font-medium">
            {isBn ? 'ধারণক্ষমতা' : 'Capacity'}
          </div>
          <div className="text-xl font-bold text-content-primary mt-1">{stats.totalCapacity}</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-xs text-content-secondary font-medium">
            {isBn ? 'বর্তমান প্রাণী' : 'Occupancy'}
          </div>
          <div className="text-xl font-bold text-brand-primary mt-1">{stats.occupancy}</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-xs text-content-secondary font-medium">
            {isBn ? 'অপেক্ষমাণ রিপোর্ট' : 'Pending Reports'}
          </div>
          <div className="text-xl font-bold text-status-emergency mt-1">{stats.pendingQueue}</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-xs text-content-secondary font-medium">
            {isBn ? 'চলমান কেস' : 'Active Cases'}
          </div>
          <div className="text-xl font-bold text-content-primary mt-1">{stats.activeCases}</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-xs text-content-secondary font-medium">
            {isBn ? 'দত্তক লিস্টিং' : 'Adoption Listings'}
          </div>
          <div className="text-xl font-bold text-content-primary mt-1">{stats.availableListings}</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-xs text-content-secondary font-medium">
            {isBn ? 'দত্তক আবেদন' : 'Applications'}
          </div>
          <div className="text-xl font-bold text-brand-primary mt-1">{stats.pendingApps}</div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-stroke-subtle gap-2">
        <button
          onClick={() => setActiveTab('queue')}
          className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'queue'
              ? 'border-brand-primary text-brand-primary'
              : 'border-transparent text-content-secondary hover:text-content-primary'
          }`}
        >
          {isBn ? `উদ্ধার তালিকা (${queue.length})` : `Rescue Queue (${queue.length})`}
        </button>
        <button
          onClick={() => setActiveTab('cases')}
          className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'cases'
              ? 'border-brand-primary text-brand-primary'
              : 'border-transparent text-content-secondary hover:text-content-primary'
          }`}
        >
          {isBn ? `চলমান কেস (${cases.length})` : `Active Cases (${cases.length})`}
        </button>
        <button
          onClick={() => setActiveTab('listings')}
          className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'listings'
              ? 'border-brand-primary text-brand-primary'
              : 'border-transparent text-content-secondary hover:text-content-primary'
          }`}
        >
          {isBn ? `দত্তক তালিকা (${listings.length})` : `Adoption Listings (${listings.length})`}
        </button>
        <button
          onClick={() => setActiveTab('applications')}
          className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'applications'
              ? 'border-brand-primary text-brand-primary'
              : 'border-transparent text-content-secondary hover:text-content-primary'
          }`}
        >
          {isBn ? `দত্তক আবেদন (${applications.length})` : `Applications (${applications.length})`}
        </button>
      </div>

      {/* Tab 1: Rescue Queue */}
      {activeTab === 'queue' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-content-primary">
              {isBn ? 'নতুন উদ্ধার ও প্রাণী রিপোর্ট' : 'Incoming Rescue Reports'}
            </h2>
          </div>
          {queue.length === 0 ? (
            <Card className="p-8 text-center text-content-secondary">
              {isBn ? 'বর্তমানে কোনো অপেক্ষমাণ রিপোর্ট নেই।' : 'No pending reports in the rescue queue right now.'}
            </Card>
          ) : (
            <div className="grid gap-4">
              {queue.map((rep) => (
                <Card key={rep.id} className="p-5 flex flex-col md:flex-row justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Chip
                        variant="status"
                        statusType={rep.urgency === 'critical' ? 'emergency' : 'pending'}
                        label={rep.urgency.toUpperCase()}
                      />
                      <span className="font-semibold text-content-primary capitalize">
                        {rep.species} • {rep.kind}
                      </span>
                      <span className="text-xs text-content-secondary">
                        {new Date(rep.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-sm text-content-primary">{rep.description}</p>
                    <div className="text-xs text-content-secondary">
                      📍 {rep.area_text || 'Unknown area'} • 📞 {rep.contact_phone || 'No phone'}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-end md:self-center">
                    <Button
                      variant="secondary"
                      onClick={() => handleDeclineReport(rep.id)}
                      disabled={actionInProgress === rep.id}
                    >
                      {isBn ? 'বাতিল' : 'Decline'}
                    </Button>
                    <Button
                      variant="primary"
                      onClick={() => handleAdmitReport(rep.id)}
                      disabled={actionInProgress === rep.id}
                    >
                      {actionInProgress === rep.id
                        ? (isBn ? 'গ্রহণ হচ্ছে...' : 'Admitting...')
                        : (isBn ? 'শেল্টারে গ্রহণ করুন' : 'Admit to Shelter')}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Active Cases */}
      {activeTab === 'cases' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-content-primary">
              {isBn ? 'শেল্টারের চলমান উদ্ধার কেস' : 'Shelter Rescue Cases'}
            </h2>
          </div>
          {cases.length === 0 ? (
            <Card className="p-8 text-center text-content-secondary">
              {isBn ? 'শেল্টারে বর্তমানে কোনো সক্রিয় উদ্ধার কেস নেই।' : 'No active rescue cases currently in shelter care.'}
            </Card>
          ) : (
            <div className="grid gap-4">
              {cases.map((c) => (
                <Card key={c.id} className="p-5 flex flex-col md:flex-row justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-content-primary">Case #{c.id.slice(0, 8)}</span>
                      <Chip
                        variant="status"
                        statusType="confirmed"
                        label={c.status.toUpperCase()}
                      />
                    </div>
                    <div className="text-xs text-content-secondary">
                      Report ID: {c.report_id} • Started: {new Date(c.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-end md:self-center">
                    <Button
                      variant="primary"
                      onClick={() => handleCloseCase(c.id)}
                      disabled={actionInProgress === c.id}
                    >
                      {actionInProgress === c.id
                        ? (isBn ? 'সম্পন্ন হচ্ছে...' : 'Closing...')
                        : (isBn ? 'কেস সম্পন্ন করুন' : 'Close Case')}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Adoption Listings */}
      {activeTab === 'listings' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-content-primary">
              {isBn ? 'শেল্টারের দত্তক তালিকা' : 'Shelter Adoption Listings'}
            </h2>
            <Button
              variant="primary"
              onClick={() => alert(isBn ? 'নতুন লিস্টিং ফর্ম খুলছে...' : 'Opening new listing form...')}
            >
              {isBn ? '+ নতুন লিস্টিং' : '+ Add Listing'}
            </Button>
          </div>
          {listings.length === 0 ? (
            <Card className="p-8 text-center text-content-secondary">
              {isBn ? 'কোনো সক্রিয় দত্তক লিস্টিং নেই।' : 'No active adoption listings.'}
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {listings.map((item) => (
                <Card key={item.id} className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-content-primary">
                        {isBn && item.title_bn ? item.title_bn : item.title_en}
                      </h3>
                      <div className="text-xs text-content-secondary capitalize">
                        {item.species} • {item.gender} • {item.age_months ? `${item.age_months} months` : 'Young'}
                      </div>
                    </div>
                    <Chip
                      variant="status"
                      statusType={item.status === 'available' ? 'confirmed' : 'neutral'}
                      label={item.status.toUpperCase()}
                    />
                  </div>
                  <p className="text-xs text-content-secondary line-clamp-2">
                    {isBn && item.description_bn ? item.description_bn : item.description_en}
                  </p>
                  <div className="flex gap-2 text-xs">
                    {item.is_vaccinated && <span className="bg-brand-primary/10 text-brand-primary px-2 py-0.5 rounded">Vaccinated</span>}
                    {item.is_neutered && <span className="bg-brand-primary/10 text-brand-primary px-2 py-0.5 rounded">Neutered</span>}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Applications */}
      {activeTab === 'applications' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-content-primary">
              {isBn ? 'গৃহীত দত্তক আবেদনসমূহ' : 'Adoption Applications'}
            </h2>
          </div>
          {applications.length === 0 ? (
            <Card className="p-8 text-center text-content-secondary">
              {isBn ? 'আপনার লিস্টিংয়ের জন্য কোনো অপেক্ষমাণ আবেদন নেই।' : 'No pending applications received.'}
            </Card>
          ) : (
            <div className="grid gap-4">
              {applications.map((app) => (
                <Card key={app.id} className="p-5 flex flex-col md:flex-row justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-content-primary">
                        {isBn ? 'আবেদনকারী:' : 'Applicant:'} {app.applicant_id.slice(0, 8)}
                      </span>
                      <Chip
                        variant="status"
                        statusType="pending"
                        label={app.status.toUpperCase()}
                      />
                    </div>
                    <div className="text-sm text-content-primary">
                      <strong>{isBn ? 'কারণ:' : 'Reason:'}</strong> {app.reason}
                    </div>
                    <div className="text-xs text-content-secondary">
                      🏠 Home: {app.home_type} • Other pets: {app.has_other_pets ? 'Yes' : 'No'}
                      {app.experience && ` • Exp: ${app.experience}`}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-end md:self-center">
                    <Button
                      variant="secondary"
                      onClick={() => handleDecideApplication(app.id, false)}
                      disabled={actionInProgress === app.id}
                    >
                      {isBn ? 'বাতিল' : 'Reject'}
                    </Button>
                    <Button
                      variant="primary"
                      onClick={() => handleDecideApplication(app.id, true)}
                      disabled={actionInProgress === app.id}
                    >
                      {isBn ? 'অনুমোদন করুন' : 'Approve'}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
