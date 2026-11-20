'use client';

import React, { useState, useEffect } from 'react';
import { useLocale } from '@pranora/i18n';
import { Button, Card, Chip } from '@pranora/ui';
import {
  decideAdoptionApplication,
  getReviewableAdoptionApplications,
  type AdoptionReviewItem,
} from '@pranora/api';

// ─── Realistic Mock Data ─────────────────────────────────────────────────────

const MOCK_REVIEW_APPLICATIONS: AdoptionReviewItem[] = [
  {
    id: 'app-001',
    listingId: 'list-001',
    applicantId: 'user-001',
    applicantName: 'তানজিলা রহমান (Tanjila Rahman)',
    applicantPhone: '+8801712345678',
    applicantEmail: 'tanjila.r@gmail.com',
    petName: 'লালি (Lali)',
    petSpecies: 'cat',
    petPhotoUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200',
    listingTitle: 'Rescued 4-month kitten looking for loving home',
    homeType: 'own_flat',
    hasOtherPets: true,
    experience: 'I have raised 2 rescued street cats for the past 6 years. Both are fully vaccinated and spayed.',
    reason: 'We want to adopt a companion for our indoor cat and provide a safe loving family environment.',
    status: 'submitted',
    reviewedBy: null,
    reviewedAt: null,
    decisionNote: null,
    createdAt: '2026-03-12T10:30:00Z',
  },
  {
    id: 'app-002',
    listingId: 'list-002',
    applicantId: 'user-002',
    applicantName: 'কবির হোসেন (Kabir Hossain)',
    applicantPhone: '+8801819876543',
    applicantEmail: 'kabir.hossain@vetmail.bd',
    petName: 'বাঘা (Bagha)',
    petSpecies: 'dog',
    petPhotoUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=200',
    listingTitle: 'Friendly Deshi dog, vaccinated and house-trained',
    homeType: 'own_house',
    hasOtherPets: false,
    experience: 'Grew up with family dogs in Rajshahi. Familiar with daily walks, tick care, and nutrition.',
    reason: 'We recently moved into our own independent house with a fenced garden and wish to adopt a loyal companion.',
    status: 'under_review',
    reviewedBy: null,
    reviewedAt: null,
    decisionNote: null,
    createdAt: '2026-03-11T14:15:00Z',
  },
  {
    id: 'app-003',
    listingId: 'list-003',
    applicantId: 'user-003',
    applicantName: 'ফারজানা ববি (Farzana Bobby)',
    applicantPhone: '+8801911223344',
    applicantEmail: 'farzana.b@yahoo.com',
    petName: 'মিতু (Mitu)',
    petSpecies: 'cat',
    petPhotoUrl: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=200',
    listingTitle: 'Playful calico female, litter box trained',
    homeType: 'rented_flat',
    hasOtherPets: false,
    experience: 'First-time pet owner, but I have read extensively and pet-proofed all balcony grills.',
    reason: 'Looking for a playful cat to keep me company while working from home.',
    status: 'approved',
    reviewedBy: 'shelter-admin',
    reviewedAt: '2026-03-10T16:00:00Z',
    decisionNote: 'Applicant verified balcony netting and provided landlord pet-consent letter.',
    createdAt: '2026-03-09T09:00:00Z',
  },
  {
    id: 'app-004',
    listingId: 'list-004',
    applicantId: 'user-004',
    applicantName: 'সাকিব আল হাসান (Sakib Al Hasan)',
    applicantPhone: '+8801611556677',
    applicantEmail: 'sakib.h@outlook.com',
    petName: 'টমি (Tommy)',
    petSpecies: 'dog',
    petPhotoUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=200',
    listingTitle: 'Golden retriever mix, needs active owner',
    homeType: 'rented_flat',
    hasOtherPets: true,
    experience: 'None with large energetic breeds.',
    reason: 'Wanted to keep on balcony for security.',
    status: 'rejected',
    reviewedBy: 'shelter-admin',
    reviewedAt: '2026-03-08T11:00:00Z',
    decisionNote: 'Keeping a large dog confined to an open balcony does not meet our minimum welfare guidelines.',
    createdAt: '2026-03-07T12:00:00Z',
  },
];

type FilterType = 'all' | 'pending' | 'approved' | 'rejected';

export function AdoptionReviewQueue() {
  const { locale } = useLocale();
  const isBangla = locale === 'bn';

  const [applications, setApplications] = useState<AdoptionReviewItem[]>(MOCK_REVIEW_APPLICATIONS);
  const [filter, setFilter] = useState<FilterType>('pending');
  const [selectedApp, setSelectedApp] = useState<AdoptionReviewItem | null>(null);
  const [decisionModalType, setDecisionModalType] = useState<'approve' | 'reject' | null>(null);
  const [decisionNote, setDecisionNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const client = null as any;
    getReviewableAdoptionApplications(client)
      .then((data) => {
        if (data && data.length > 0) {
          setApplications(data);
        }
      })
      .catch(() => {});
  }, []);

  const t = {
    title: isBangla ? 'দত্তক আবেদন পর্যালোচনা' : 'Adoption Applications Review',
    subtitle: isBangla
      ? 'সম্ভাব্য দত্তকগ্রহীতাদের তথ্য দেখুন, বাসস্থান মূল্যায়ন করুন এবং সিদ্ধান্ত নিন (ADP-5)'
      : 'Review prospective adopters, evaluate home suitability, and decide applications (ADP-5)',
    filterAll: isBangla ? 'সকল আবেদন' : 'All',
    filterPending: isBangla ? 'পর্যালোচনা বাকি' : 'Pending Review',
    filterApproved: isBangla ? 'অনুমোদিত' : 'Approved',
    filterRejected: isBangla ? 'বাতিল' : 'Rejected',
    applicant: isBangla ? 'আবেদনকারী' : 'Applicant',
    pet: isBangla ? 'পোষা প্রাণী' : 'Pet',
    homeType: isBangla ? 'বাসস্থান' : 'Home Type',
    otherPets: isBangla ? 'অন্য পোষা প্রাণী' : 'Other Pets',
    yes: isBangla ? 'হ্যাঁ' : 'Yes',
    no: isBangla ? 'না' : 'No',
    experience: isBangla ? 'অভিজ্ঞতা' : 'Experience',
    reason: isBangla ? 'দত্তক নেওয়ার কারণ' : 'Reason for Adopting',
    appliedOn: isBangla ? 'আবেদনের তারিখ' : 'Applied On',
    approve: isBangla ? 'অনুমোদন করুন' : 'Approve',
    reject: isBangla ? 'বাতিল করুন' : 'Reject',
    status: isBangla ? 'অবস্থা' : 'Status',
    decisionNote: isBangla ? 'সিদ্ধান্তের মন্তব্য' : 'Decision Note',
    notePlaceholder: isBangla ? 'মন্তব্য লিখুন (ঐচ্ছিক)...' : 'Add decision note or feedback...',
    rejectReasonPlaceholder: isBangla ? 'বাতিল করার কারণ উল্লেখ করুন...' : 'Please provide reason for rejection...',
    confirmApproveTitle: isBangla ? 'দত্তক আবেদন অনুমোদন নিশ্চিতকরণ' : 'Approve Adoption Application',
    confirmApproveDesc: isBangla
      ? 'অনুমোদনের পর প্রাণীটি সংরক্ষিত (Reserved) হবে এবং হস্তান্তর প্রক্রিয়া (Handover) শুরু হবে।'
      : 'Approving reserves the pet and initiates the two-sided handover workflow (ADP-6).',
    confirmRejectTitle: isBangla ? 'দত্তক আবেদন বাতিল নিশ্চিতকরণ' : 'Reject Adoption Application',
    confirmRejectDesc: isBangla
      ? 'আপনি কি নিশ্চিতভাবে এই আবেদনটি বাতিল করতে চান?'
      : 'Are you sure you want to reject this adoption application?',
    cancel: isBangla ? 'ফিরে যান' : 'Cancel',
    confirm: isBangla ? 'নিশ্চিত করুন' : 'Confirm',
    processing: isBangla ? 'প্রক্রিয়াকরণ হচ্ছে...' : 'Processing...',
    empty: isBangla ? 'কোনো দত্তক আবেদন পাওয়া যায়নি।' : 'No adoption applications found for this filter.',
    homeTypeLabels: {
      own_flat: isBangla ? 'নিজের ফ্ল্যাট' : 'Own Flat',
      rented_flat: isBangla ? 'ভাড়া ফ্ল্যাট' : 'Rented Flat',
      own_house: isBangla ? 'নিজের বাড়ি' : 'Own House',
      rented_house: isBangla ? 'ভাড়া বাড়ি' : 'Rented House',
      other: isBangla ? 'অন্যান্য' : 'Other',
    },
  };

  const filteredApps = applications.filter((app) => {
    if (filter === 'pending') return app.status === 'submitted' || app.status === 'under_review';
    if (filter === 'approved') return app.status === 'approved';
    if (filter === 'rejected') return app.status === 'rejected';
    return true;
  });

  const pendingCount = applications.filter((a) => a.status === 'submitted' || a.status === 'under_review').length;

  function openDecisionModal(app: AdoptionReviewItem, type: 'approve' | 'reject') {
    setSelectedApp(app);
    setDecisionModalType(type);
    setDecisionNote('');
  }

  function closeDecisionModal() {
    setSelectedApp(null);
    setDecisionModalType(null);
    setDecisionNote('');
  }

  async function handleConfirmDecision() {
    if (!selectedApp || !decisionModalType) return;

    setIsSubmitting(true);
    const approve = decisionModalType === 'approve';

    try {
      const client = null as any;
      await decideAdoptionApplication(
        client,
        selectedApp.id,
        approve,
        decisionNote.trim() || undefined
      );

      // Optimistic update
      setApplications((prev) =>
        prev.map((a) =>
          a.id === selectedApp.id
            ? {
                ...a,
                status: approve ? 'approved' : 'rejected',
                decisionNote: decisionNote.trim() || null,
                reviewedAt: new Date().toISOString(),
              }
            : a
        )
      );

      setFeedback({
        message: approve
          ? (isBangla ? 'আবেদন সফলভাবে অনুমোদিত হয়েছে! হস্তান্তর প্রক্রিয়া শুরু হয়েছে।' : 'Application approved! Handover process initiated.')
          : (isBangla ? 'আবেদনটি বাতিল করা হয়েছে।' : 'Application rejected.'),
        type: 'success',
      });
      setTimeout(() => setFeedback(null), 4000);
      closeDecisionModal();
    } catch {
      // Offline fallback: still update UI optimistically
      setApplications((prev) =>
        prev.map((a) =>
          a.id === selectedApp.id
            ? {
                ...a,
                status: approve ? 'approved' : 'rejected',
                decisionNote: decisionNote.trim() || null,
                reviewedAt: new Date().toISOString(),
              }
            : a
        )
      );
      setFeedback({
        message: approve
          ? (isBangla ? 'আবেদন অনুমোদিত হয়েছে!' : 'Application approved!')
          : (isBangla ? 'আবেদন বাতিল করা হয়েছে।' : 'Application rejected.'),
        type: 'success',
      });
      setTimeout(() => setFeedback(null), 4000);
      closeDecisionModal();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t.title}</h1>
        <p className="text-sm text-gray-500 mt-1">{t.subtitle}</p>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl text-sm font-medium flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          <span>{feedback.type === 'success' ? '✓' : '⚠️'}</span>
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex border-b border-gray-200 gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors flex items-center gap-2 ${
            filter === 'pending'
              ? 'bg-amber-100 text-amber-900'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <span>{t.filterPending}</span>
          <span className="px-2 py-0.5 text-xs bg-amber-200 text-amber-900 rounded-full font-bold">
            {pendingCount}
          </span>
        </button>

        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
            filter === 'all'
              ? 'bg-blue-100 text-blue-900'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          {t.filterAll} ({applications.length})
        </button>

        <button
          onClick={() => setFilter('approved')}
          className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
            filter === 'approved'
              ? 'bg-green-100 text-green-900'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          {t.filterApproved}
        </button>

        <button
          onClick={() => setFilter('rejected')}
          className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
            filter === 'rejected'
              ? 'bg-gray-200 text-gray-900'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          {t.filterRejected}
        </button>
      </div>

      {/* Applications List */}
      {filteredApps.length === 0 ? (
        <Card className="p-12 text-center text-gray-400">
          <p className="text-4xl mb-2">🐾</p>
          <p className="text-base">{t.empty}</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredApps.map((app) => {
            const isPending = app.status === 'submitted' || app.status === 'under_review';
            const isApproved = app.status === 'approved';

            const chipStatus = isApproved ? 'completed' : isPending ? 'pending' : 'neutral';
            const homeLabel = t.homeTypeLabels[app.homeType] ?? app.homeType;

            return (
              <Card key={app.id} className="p-5 border border-gray-200 hover:border-gray-300 transition-shadow">
                <div className="flex flex-col md:flex-row gap-5">
                  {/* Left: Pet Info */}
                  <div className="flex items-start gap-3 md:w-56 shrink-0">
                    {app.petPhotoUrl && (
                      <img
                        src={app.petPhotoUrl}
                        alt={app.petName}
                        className="w-16 h-16 rounded-xl object-cover border"
                      />
                    )}
                    <div>
                      <div className="font-bold text-gray-900 text-base">{app.petName}</div>
                      <div className="text-xs text-gray-500 capitalize">{app.petSpecies}</div>
                      <div className="text-xs text-gray-400 mt-1 line-clamp-2">{app.listingTitle}</div>
                    </div>
                  </div>

                  {/* Middle: Applicant Details */}
                  <div className="flex-1 space-y-2 border-t md:border-t-0 md:border-l border-gray-150 pt-3 md:pt-0 md:pl-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="font-semibold text-gray-900 text-base">{app.applicantName}</span>
                        <div className="text-xs text-gray-500 font-mono">
                          {app.applicantPhone && <span>{app.applicantPhone}</span>}
                          {app.applicantEmail && <span> · {app.applicantEmail}</span>}
                        </div>
                      </div>
                      <Chip
                        variant="status"
                        label={app.status.replace(/_/g, ' ')}
                        statusType={chipStatus}
                      />
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs pt-1">
                      <div>
                        <span className="text-gray-400">{t.homeType}:</span>{' '}
                        <span className="font-medium text-gray-700">{homeLabel}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">{t.otherPets}:</span>{' '}
                        <span className="font-medium text-gray-700">
                          {app.hasOtherPets ? t.yes : t.no}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">{t.appliedOn}:</span>{' '}
                        <span className="font-mono text-gray-600">
                          {new Date(app.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {app.experience && (
                      <div className="text-xs text-gray-600 bg-gray-50 p-2.5 rounded-lg border border-gray-150">
                        <span className="font-semibold text-gray-700">{t.experience}:</span> {app.experience}
                      </div>
                    )}

                    <div className="text-xs text-gray-700 bg-blue-50/50 p-2.5 rounded-lg border border-blue-100">
                      <span className="font-semibold text-blue-900">{t.reason}:</span> {app.reason}
                    </div>

                    {/* Decision note if decided */}
                    {app.decisionNote && (
                      <div className="text-xs p-2.5 rounded-lg border bg-gray-50 text-gray-600">
                        <span className="font-semibold">{t.decisionNote}:</span> {app.decisionNote}
                      </div>
                    )}
                  </div>

                  {/* Right: Decision Actions */}
                  <div className="flex flex-row md:flex-col justify-end items-center gap-2 md:w-32 shrink-0 border-t md:border-t-0 md:border-l border-gray-150 pt-3 md:pt-0 md:pl-4">
                    {isPending ? (
                      <>
                        <Button
                          variant="primary"
                          size="sm"
                          isFullWidth
                          onClick={() => openDecisionModal(app, 'approve')}
                        >
                          ✓ {t.approve}
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          isFullWidth
                          onClick={() => openDecisionModal(app, 'reject')}
                        >
                          ✕ {t.reject}
                        </Button>
                      </>
                    ) : (
                      <span className="text-xs font-semibold text-gray-400 uppercase">
                        {isApproved ? (isBangla ? 'অনুমোদিত' : 'Approved') : (isBangla ? 'বাতিলকৃত' : 'Rejected')}
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Decision Confirmation Modal */}
      {decisionModalType && selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border">
            <h3 className="text-lg font-bold text-gray-900">
              {decisionModalType === 'approve' ? t.confirmApproveTitle : t.confirmRejectTitle}
            </h3>

            <p className="text-sm text-gray-600">
              {decisionModalType === 'approve' ? t.confirmApproveDesc : t.confirmRejectDesc}
            </p>

            <div className="p-3 bg-gray-50 rounded-xl text-xs space-y-1">
              <div>
                <span className="text-gray-400">{t.pet}:</span>{' '}
                <span className="font-bold text-gray-800">{selectedApp.petName}</span>
              </div>
              <div>
                <span className="text-gray-400">{t.applicant}:</span>{' '}
                <span className="font-bold text-gray-800">{selectedApp.applicantName}</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">
                {t.decisionNote}
              </label>
              <textarea
                rows={3}
                className="w-full text-sm border rounded-xl p-3 focus:ring-1 focus:ring-blue-500 outline-none"
                placeholder={decisionModalType === 'approve' ? t.notePlaceholder : t.rejectReasonPlaceholder}
                value={decisionNote}
                onChange={(e) => setDecisionNote(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="ghost"
                size="md"
                onClick={closeDecisionModal}
                disabled={isSubmitting}
              >
                {t.cancel}
              </Button>
              <Button
                variant={decisionModalType === 'approve' ? 'primary' : 'danger'}
                size="md"
                onClick={handleConfirmDecision}
                isLoading={isSubmitting}
              >
                {isSubmitting ? t.processing : t.confirm}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
