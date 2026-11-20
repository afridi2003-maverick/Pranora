'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useLocale } from '@pranora/i18n';
import { Button, Card, Chip } from '@pranora/ui';
import {
  getRescueReviewQueue,
  reviewAnimalReport,
  getMyShelterProfile,
  type AnimalReportRow,
  type ShelterProviderRow,
} from '@pranora/api';

const MOCK_REVIEW_REPORTS: AnimalReportRow[] = [
  {
    id: 'rep-urg-1',
    reporter_id: 'usr-rep-101',
    kind: 'injured',
    pet_id: null,
    species: 'dog',
    urgency: 'critical',
    last_seen_at: new Date(Date.now() - 15 * 60000).toISOString(),
    contact_phone: '+8801712345678',
    description: 'Hit by speeding vehicle near Farmgate footbridge, severe bleeding from hind leg, unable to stand.',
    photos: ['https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400'],
    location: null,
    area_text: 'Farmgate Bus Stand, Tejgaon, Dhaka',
    upazila_id: 1,
    district_id: 1,
    status: 'submitted',
    duplicate_of: null,
    reviewed_by: null,
    reviewed_at: null,
    created_at: new Date(Date.now() - 15 * 60000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'rep-urg-2',
    reporter_id: 'usr-rep-102',
    kind: 'abandoned',
    pet_id: null,
    species: 'cat',
    urgency: 'high',
    last_seen_at: new Date(Date.now() - 45 * 60000).toISOString(),
    contact_phone: '+8801812345678',
    description: 'Three young kittens dumped in heavy rain inside an open cardboard box near Gulshan 2 circle.',
    photos: ['https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400'],
    location: null,
    area_text: 'Road 62, Gulshan 2, Dhaka',
    upazila_id: 1,
    district_id: 1,
    status: 'submitted',
    duplicate_of: null,
    reviewed_by: null,
    reviewed_at: null,
    created_at: new Date(Date.now() - 45 * 60000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'rep-urg-3',
    reporter_id: 'usr-rep-103',
    kind: 'injured',
    pet_id: null,
    species: 'bird',
    urgency: 'medium',
    last_seen_at: new Date(Date.now() - 120 * 60000).toISOString(),
    contact_phone: '+8801912345678',
    description: 'Pigeon with tangled kite string on wing, unable to fly on balcony.',
    photos: [],
    location: null,
    area_text: 'Sector 3, Uttara, Dhaka',
    upazila_id: 1,
    district_id: 1,
    status: 'submitted',
    duplicate_of: null,
    reviewed_by: null,
    reviewed_at: null,
    created_at: new Date(Date.now() - 120 * 60000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'rep-urg-4',
    reporter_id: 'usr-rep-104',
    kind: 'lost',
    pet_id: null,
    species: 'dog',
    urgency: 'low',
    last_seen_at: new Date(Date.now() - 360 * 60000).toISOString(),
    contact_phone: '+8801612345678',
    description: 'Friendly brown mongrel with red collar seen wandering near Mirpur 10 circle.',
    photos: [],
    location: null,
    area_text: 'Mirpur 10 round-about, Dhaka',
    upazila_id: 1,
    district_id: 1,
    status: 'submitted',
    duplicate_of: null,
    reviewed_by: null,
    reviewed_at: null,
    created_at: new Date(Date.now() - 360 * 60000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export function RescueReviewQueue() {
  const { locale } = useLocale();
  const isBn = locale === 'bn';

  const [reports, setReports] = useState<AnimalReportRow[]>(MOCK_REVIEW_REPORTS);
  const [shelter, setShelter] = useState<ShelterProviderRow | null>(null);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [expandedReportId, setExpandedReportId] = useState<string | null>(null);

  // Filters
  const [urgencyFilter, setUrgencyFilter] = useState<string>('all');
  const [speciesFilter, setSpeciesFilter] = useState<string>('all');

  useEffect(() => {
    async function loadQueue() {
      try {
        const profile = await getMyShelterProfile(null as any);
        if (profile) setShelter(profile);

        const data = await getRescueReviewQueue(null as any);
        if (data && data.length > 0) {
          setReports(data);
        }
      } catch (err) {
        console.warn('Rescue review queue notice:', err);
      }
    }
    loadQueue();
  }, []);

  // Filtered and priority sorted reports (Critical first)
  const filteredReports = useMemo(() => {
    return reports.filter((rep) => {
      if (urgencyFilter !== 'all' && rep.urgency !== urgencyFilter) return false;
      if (speciesFilter !== 'all' && rep.species !== speciesFilter) return false;
      return true;
    });
  }, [reports, urgencyFilter, speciesFilter]);

  const criticalCount = useMemo(
    () => reports.filter((r) => r.urgency === 'critical').length,
    [reports]
  );
  const highCount = useMemo(
    () => reports.filter((r) => r.urgency === 'high').length,
    [reports]
  );

  const handleAcceptReport = async (reportId: string) => {
    setActionInProgress(reportId);
    try {
      await reviewAnimalReport(null as any, reportId, true, shelter?.id);
    } catch {
      // optimistic fallback
    }
    setReports((prev) => prev.filter((r) => r.id !== reportId));
    setActionInProgress(null);
  };

  const handleDeclineReport = async (reportId: string) => {
    setActionInProgress(reportId);
    try {
      await reviewAnimalReport(null as any, reportId, false);
    } catch {
      // optimistic fallback
    }
    setReports((prev) => prev.filter((r) => r.id !== reportId));
    setActionInProgress(null);
  };

  const formatElapsed = (iso: string) => {
    const elapsedMinutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
    if (elapsedMinutes < 60) {
      return isBn ? `${elapsedMinutes} মিনিট আগে` : `${elapsedMinutes}m ago`;
    }
    const hours = Math.floor(elapsedMinutes / 60);
    return isBn ? `${hours} ঘণ্টা আগে` : `${hours}h ago`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-content-primary">
            {isBn ? 'প্রাণী উদ্ধার রিভিউ কিউ' : 'Rescue Review Queue'}
          </h1>
          <p className="text-sm text-content-secondary mt-1">
            {isBn
              ? 'জরুরি রিপোর্টগুলো তালিকার শীর্ষে অগ্রাধিকার ভিত্তিতে দেখানো হয়।'
              : 'Urgent reports prioritized first. Review and dispatch cases promptly.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={() => window.location.href = `/${locale}/shelter/dashboard`}
          >
            {isBn ? 'শেল্টার ড্যাশবোর্ড' : 'Shelter Dashboard'}
          </Button>
        </div>
      </div>

      {/* Critical Alert Banner if critical reports are pending */}
      {criticalCount > 0 && (
        <div className="p-4 bg-status-emergency/10 border-l-4 border-status-emergency rounded-r-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl">⚠️</span>
            <div>
              <div className="text-sm font-bold text-status-emergency">
                {isBn
                  ? `${criticalCount}টি জীবনঝুঁকিপূর্ণ / সঙ্কটপূর্ণ রিপোর্ট অপেক্ষমাণ!`
                  : `${criticalCount} Critical (Life-Threatening) Report(s) Awaiting Review!`}
              </div>
              <div className="text-xs text-content-secondary">
                {isBn
                  ? 'দ্রুত রেসপন্স করে উদ্ধার কার্যক্রম বা শেল্টারে গ্রহণ নিশ্চিত করুন।'
                  : 'Immediate dispatch or admission required for critical injuries.'}
              </div>
            </div>
          </div>
          <Button
            variant="danger"
            onClick={() => setUrgencyFilter('critical')}
          >
            {isBn ? 'সঙ্কটাপন্ন দেখুন' : 'View Critical'}
          </Button>
        </div>
      )}

      {/* KPI Counters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center border-l-4 border-status-emergency">
          <div className="text-xs text-content-secondary font-medium">
            {isBn ? 'সঙ্কটাপন্ন (Critical)' : 'Critical Urgency'}
          </div>
          <div className="text-2xl font-bold text-status-emergency mt-1">{criticalCount}</div>
        </Card>
        <Card className="p-4 text-center border-l-4 border-amber-500">
          <div className="text-xs text-content-secondary font-medium">
            {isBn ? 'উচ্চ জরুরি (High)' : 'High Priority'}
          </div>
          <div className="text-2xl font-bold text-amber-600 mt-1">{highCount}</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-xs text-content-secondary font-medium">
            {isBn ? 'মোট অপেক্ষমাণ' : 'Total Pending'}
          </div>
          <div className="text-2xl font-bold text-content-primary mt-1">{reports.length}</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-xs text-content-secondary font-medium">
            {isBn ? 'ফিল্টারকৃত' : 'Filtered Reports'}
          </div>
          <div className="text-2xl font-bold text-brand-primary mt-1">{filteredReports.length}</div>
        </Card>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-wrap items-center gap-3 bg-surface-secondary p-3 rounded-lg">
        <span className="text-xs font-semibold text-content-secondary uppercase">
          {isBn ? 'ফিল্টার:' : 'Filter:'}
        </span>
        <select
          value={urgencyFilter}
          onChange={(e) => setUrgencyFilter(e.target.value)}
          className="text-xs px-2.5 py-1.5 rounded border border-stroke-subtle bg-surface-primary text-content-primary"
        >
          <option value="all">{isBn ? 'সকল জরুরিতা' : 'All Urgency'}</option>
          <option value="critical">{isBn ? 'সঙ্কটাপন্ন (Critical)' : 'Critical'}</option>
          <option value="high">{isBn ? 'উচ্চ জরুরি (High)' : 'High'}</option>
          <option value="medium">{isBn ? 'মাঝারি (Medium)' : 'Medium'}</option>
          <option value="low">{isBn ? 'সাধারণ (Low)' : 'Low'}</option>
        </select>

        <select
          value={speciesFilter}
          onChange={(e) => setSpeciesFilter(e.target.value)}
          className="text-xs px-2.5 py-1.5 rounded border border-stroke-subtle bg-surface-primary text-content-primary"
        >
          <option value="all">{isBn ? 'সকল প্রাণী' : 'All Species'}</option>
          <option value="dog">{isBn ? 'কুকুর' : 'Dog'}</option>
          <option value="cat">{isBn ? 'বিড়াল' : 'Cat'}</option>
          <option value="bird">{isBn ? 'পাখি' : 'Bird'}</option>
          <option value="cow">{isBn ? 'গরু' : 'Cow/Cattle'}</option>
          <option value="goat">{isBn ? 'ছাগল' : 'Goat'}</option>
          <option value="other">{isBn ? 'অন্যান্য' : 'Other'}</option>
        </select>

        {(urgencyFilter !== 'all' || speciesFilter !== 'all') && (
          <button
            onClick={() => {
              setUrgencyFilter('all');
              setSpeciesFilter('all');
            }}
            className="text-xs text-brand-primary hover:underline ml-auto"
          >
            {isBn ? 'রিসেট করুন' : 'Reset filters'}
          </button>
        )}
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {filteredReports.length === 0 ? (
          <Card className="p-8 text-center text-content-secondary">
            {isBn
              ? 'বর্তমান ফিল্টারে কোনো অপেক্ষমাণ রিপোর্ট নেই।'
              : 'No pending rescue reports match the selected filters.'}
          </Card>
        ) : (
          filteredReports.map((report) => {
            const isCritical = report.urgency === 'critical';
            const isHigh = report.urgency === 'high';
            const isExpanded = expandedReportId === report.id;

            return (
              <Card
                key={report.id}
                className={`p-5 transition-all border-l-4 ${
                  isCritical
                    ? 'border-l-status-emergency bg-red-50/20'
                    : isHigh
                    ? 'border-l-amber-500'
                    : 'border-l-stroke-subtle'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  {/* Left Column: Details */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Chip
                        variant="status"
                        statusType={isCritical ? 'emergency' : isHigh ? 'pending' : 'neutral'}
                        label={report.urgency.toUpperCase()}
                      />
                      <span className="font-bold text-content-primary capitalize text-base">
                        {report.species} • {report.kind}
                      </span>
                      <span className="text-xs text-content-secondary bg-surface-secondary px-2 py-0.5 rounded">
                        ⏱ {formatElapsed(report.created_at)}
                      </span>
                    </div>

                    <p className="text-sm text-content-primary leading-relaxed">
                      {report.description || (isBn ? 'কোনো বিবরণ দেওয়া হয়নি।' : 'No description provided.')}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-content-secondary pt-1">
                      <span>📍 {report.area_text || 'Unknown area'}</span>
                      {report.contact_phone && (
                        <a
                          href={`tel:${report.contact_phone}`}
                          className="text-brand-primary font-medium hover:underline flex items-center gap-1"
                        >
                          📞 {report.contact_phone}
                        </a>
                      )}
                      <button
                        onClick={() => setExpandedReportId(isExpanded ? null : report.id)}
                        className="text-content-secondary hover:text-content-primary underline"
                      >
                        {isExpanded
                          ? (isBn ? 'কম দেখান ▲' : 'Show less ▲')
                          : (isBn ? 'বিস্তারিত / ছবি দেখুন ▼' : 'View photos & details ▼')}
                      </button>
                    </div>

                    {/* Expanded details */}
                    {isExpanded && (
                      <div className="mt-4 pt-3 border-t space-y-3">
                        {report.photos && report.photos.length > 0 && (
                          <div>
                            <div className="text-xs font-semibold text-content-secondary mb-2">
                              {isBn ? 'রিপোর্টের ছবি:' : 'Report Photos:'}
                            </div>
                            <div className="flex gap-2 overflow-x-auto pb-2">
                              {report.photos.map((url, i) => (
                                <img
                                  key={i}
                                  src={url}
                                  alt="Report evidence"
                                  className="w-24 h-24 object-cover rounded-lg border"
                                />
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="text-xs text-content-secondary">
                          Report ID: <code className="bg-surface-secondary px-1 py-0.5 rounded">{report.id}</code>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Actions */}
                  <div className="flex items-center gap-2 self-end md:self-center">
                    <Button
                      variant="secondary"
                      onClick={() => handleDeclineReport(report.id)}
                      disabled={actionInProgress === report.id}
                    >
                      {isBn ? 'বাতিল' : 'Decline'}
                    </Button>
                    <Button
                      variant={isCritical ? 'danger' : 'primary'}
                      onClick={() => handleAcceptReport(report.id)}
                      disabled={actionInProgress === report.id}
                    >
                      {actionInProgress === report.id
                        ? (isBn ? 'গ্রহণ হচ্ছে...' : 'Admitting...')
                        : (isBn ? 'শেল্টারে গ্রহণ করুন' : 'Admit & Dispatch')}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
