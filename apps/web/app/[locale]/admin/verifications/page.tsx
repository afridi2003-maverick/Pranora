'use client';

/**
 * apps/web/app/[locale]/admin/verifications/page.tsx
 * Task: ADM-1 — Admin verification of vets, shelters, rescuers, adoption listers
 * Owner: Afridi | Sprint: S4
 */

import React, { useState, useCallback } from 'react';
import { useLocale } from '@pranora/i18n';
import { Button, Card, Chip, EmptyState, LoadingState, Modal, Tabs, Textarea } from '@pranora/ui';
import type { VerifiableRole, PendingRoleRequest, ProviderPendingDoc } from '@pranora/api';

// ─────────────────────────────────────────────
// Mock data
// ─────────────────────────────────────────────

const MOCK_ROLE_REQUESTS: PendingRoleRequest[] = [
  {
    user_id: 'u-001',
    role: 'rescuer',
    status: 'pending',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    verified_at: null,
    verified_by: null,
    full_name: 'Kamal Hossain',
    full_name_bn: 'কামাল হোসেন',
    phone: '+8801711223344',
    avatar_url: null,
  },
  {
    user_id: 'u-002',
    role: 'vet',
    status: 'pending',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    verified_at: null,
    verified_by: null,
    full_name: 'Dr. Nadia Akter',
    full_name_bn: 'ডা. নাদিয়া আক্তার',
    phone: '+8801855667788',
    avatar_url: null,
  },
  {
    user_id: 'u-003',
    role: 'shelter',
    status: 'pending',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    verified_at: null,
    verified_by: null,
    full_name: 'Prani Shelter BD',
    full_name_bn: 'প্রাণী আশ্রয় BD',
    phone: '+8801933445566',
    avatar_url: null,
  },
  {
    user_id: 'u-004',
    role: 'adoption_lister',
    status: 'pending',
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    verified_at: null,
    verified_by: null,
    full_name: 'Sabbir Ahmed',
    full_name_bn: 'সাব্বির আহমেদ',
    phone: '+8801622334455',
    avatar_url: null,
  },
];

const MOCK_PROVIDER_DOCS: ProviderPendingDoc[] = [
  {
    id: 'doc-001',
    provider_id: 'prov-001',
    vet_id: null,
    doc_type: 'bvc_certificate',
    file_path: 'provider_docs/prov-001/bvc.pdf',
    status: 'pending',
    reviewed_by: null,
    review_note: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    provider_name_en: 'Dhaka Pet Clinic',
    provider_name_bn: 'ঢাকা পেট ক্লিনিক',
    provider_verification: 'pending',
  },
  {
    id: 'doc-002',
    provider_id: 'prov-002',
    vet_id: null,
    doc_type: 'trade_license',
    file_path: 'provider_docs/prov-002/trade.pdf',
    status: 'draft',
    reviewed_by: null,
    review_note: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    provider_name_en: 'Animal Care Center Chittagong',
    provider_name_bn: 'অ্যানিমাল কেয়ার সেন্টার চট্টগ্রাম',
    provider_verification: 'draft',
  },
];

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

const ROLE_EMOJI: Record<VerifiableRole, string> = {
  rescuer: '🚑',
  shelter: '🏠',
  vet: '🩺',
  provider: '🏥',
  adoption_lister: '🐾',
};

const DOC_TYPE_LABEL: Record<string, { bn: string; en: string }> = {
  bvc_certificate: { bn: 'BVC সনদপত্র', en: 'BVC Certificate' },
  trade_license: { bn: 'ট্রেড লাইসেন্স', en: 'Trade License' },
  nid: { bn: 'জাতীয় পরিচয়পত্র', en: 'National ID' },
};

function formatRelativeTime(isoString: string, locale: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (locale === 'bn') {
    if (days > 0) return `${days} দিন আগে`;
    if (hours > 0) return `${hours} ঘণ্টা আগে`;
    return `${mins} মিনিট আগে`;
  }
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  return `${mins}m ago`;
}

// ─────────────────────────────────────────────
// Confirm Modal
// ─────────────────────────────────────────────

interface ConfirmModalProps {
  isOpen: boolean;
  action: 'approve' | 'reject' | null;
  targetName: string;
  locale: string;
  onConfirm: (note: string) => void;
  onClose: () => void;
  loading: boolean;
}

function ConfirmModal({ isOpen, action, targetName, locale, onConfirm, onClose, loading }: ConfirmModalProps) {
  const [note, setNote] = useState('');
  const isApprove = action === 'approve';

  const bn = {
    approveTitle: 'যাচাই অনুমোদন করবেন?',
    rejectTitle: 'যাচাই প্রত্যাখ্যান করবেন?',
    approveDesc: `"${targetName}" এর আবেদন অনুমোদন করলে তারা সংশ্লিষ্ট সকল সুবিধা পাবেন।`,
    rejectDesc: 'প্রত্যাখ্যানের কারণ (ঐচ্ছিক):',
    notePlaceholder: 'প্রত্যাখ্যানের কারণ লিখুন...',
    confirm: 'নিশ্চিত করুন',
    cancel: 'বাতিল',
  };
  const en = {
    approveTitle: 'Approve Verification?',
    rejectTitle: 'Reject Verification?',
    approveDesc: `Approving will grant "${targetName}" full privileges on Pranora.`,
    rejectDesc: 'Reason for rejection (optional):',
    notePlaceholder: 'Enter rejection reason...',
    confirm: 'Confirm',
    cancel: 'Cancel',
  };
  const t = locale === 'bn' ? bn : en;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isApprove ? t.approveTitle : t.rejectTitle}>
      <div className="space-y-4">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {isApprove ? t.approveDesc : t.rejectDesc}
        </p>
        {!isApprove && (
          <Textarea
            placeholder={t.notePlaceholder}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
          />
        )}
        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            {t.cancel}
          </Button>
          <Button
            variant={isApprove ? 'primary' : 'danger'}
            onClick={() => onConfirm(note)}
            isLoading={loading}
          >
            {t.confirm}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// ─────────────────────────────────────────────
// Role Request Card
// ─────────────────────────────────────────────

interface RoleCardProps {
  req: PendingRoleRequest;
  locale: string;
  onAction: (req: PendingRoleRequest, action: 'approve' | 'reject') => void;
}

function RoleRequestCard({ req, locale, onAction }: RoleCardProps) {
  const isBn = locale === 'bn';
  const name = isBn ? (req.full_name_bn ?? req.full_name) : (req.full_name ?? req.full_name_bn);
  const roleLabelBn: Record<VerifiableRole, string> = {
    rescuer: 'উদ্ধারকারী',
    shelter: 'আশ্রয়কেন্দ্র পরিচালক',
    vet: 'পশু চিকিৎসক',
    provider: 'সেবাদাতা',
    adoption_lister: 'দত্তক তালিকাকারী',
  };
  const roleLabelEn: Record<VerifiableRole, string> = {
    rescuer: 'Rescuer',
    shelter: 'Shelter Manager',
    vet: 'Veterinarian',
    provider: 'Service Provider',
    adoption_lister: 'Adoption Lister',
  };
  const roleLabel = isBn ? roleLabelBn[req.role] : roleLabelEn[req.role];

  return (
    <Card className="p-4">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center text-2xl flex-shrink-0">
          {req.avatar_url ? (
            <img src={req.avatar_url} alt={name ?? ''} className="w-12 h-12 rounded-full object-cover" />
          ) : (
            ROLE_EMOJI[req.role]
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="font-semibold text-gray-900 dark:text-white truncate">
              {name ?? '—'}
            </span>
            <Chip label={roleLabel} variant="status" statusType="pending" />
          </div>
          {req.phone && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">📞 {req.phone}</p>
          )}
          <p className="text-xs text-gray-400 dark:text-gray-500">
            {isBn ? 'আবেদন:' : 'Requested:'} {formatRelativeTime(req.created_at, locale)}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
          <Button
            size="sm"
            variant="primary"
            onClick={() => onAction(req, 'approve')}
          >
            {isBn ? '✅ অনুমোদন' : '✅ Approve'}
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => onAction(req, 'reject')}
          >
            {isBn ? '❌ প্রত্যাখ্যান' : '❌ Reject'}
          </Button>
        </div>
      </div>
    </Card>
  );
}

// ─────────────────────────────────────────────
// Provider Document Card
// ─────────────────────────────────────────────

interface ProviderDocCardProps {
  doc: ProviderPendingDoc;
  locale: string;
  onAction: (doc: ProviderPendingDoc, action: 'approve' | 'reject') => void;
}

function ProviderDocCard({ doc, locale, onAction }: ProviderDocCardProps) {
  const isBn = locale === 'bn';
  const provName = isBn
    ? (doc.provider_name_bn ?? doc.provider_name_en)
    : (doc.provider_name_en ?? doc.provider_name_bn);
  const docLabel = DOC_TYPE_LABEL[doc.doc_type] ?? { bn: doc.doc_type, en: doc.doc_type };

  return (
    <Card className="p-4">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-2xl flex-shrink-0">
          🏥
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="font-semibold text-gray-900 dark:text-white truncate">
              {provName ?? '—'}
            </span>
            <Chip label={isBn ? docLabel.bn : docLabel.en} variant="status" statusType="neutral" />
            <Chip
              label={
                isBn
                  ? doc.status === 'pending'
                    ? 'অপেক্ষামান'
                    : 'খসড়া'
                  : doc.status === 'pending'
                  ? 'Pending'
                  : 'Draft'
              }
              variant="status"
              statusType={doc.status === 'pending' ? 'pending' : 'neutral'}
            />
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">
            {isBn ? 'জমা দেওয়া হয়েছে:' : 'Submitted:'} {formatRelativeTime(doc.created_at, locale)}
          </p>
          <a
            href={`#doc-${doc.id}`}
            className="text-xs text-green-600 dark:text-green-400 hover:underline"
            onClick={(e) => e.preventDefault()}
          >
            {isBn ? '📎 ডকুমেন্ট দেখুন' : '📎 View Document'}
          </a>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
          <Button size="sm" variant="primary" onClick={() => onAction(doc, 'approve')}>
            {isBn ? '✅ অনুমোদন' : '✅ Approve'}
          </Button>
          <Button size="sm" variant="danger" onClick={() => onAction(doc, 'reject')}>
            {isBn ? '❌ প্রত্যাখ্যান' : '❌ Reject'}
          </Button>
        </div>
      </div>
    </Card>
  );
}

// ─────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────

const ROLE_FILTERS: Array<{ key: VerifiableRole | 'all'; labelBn: string; labelEn: string }> = [
  { key: 'all', labelBn: 'সব', labelEn: 'All' },
  { key: 'rescuer', labelBn: 'উদ্ধারকারী', labelEn: 'Rescuer' },
  { key: 'shelter', labelBn: 'আশ্রয়কেন্দ্র', labelEn: 'Shelter' },
  { key: 'vet', labelBn: 'পশু চিকিৎসক', labelEn: 'Veterinarian' },
  { key: 'provider', labelBn: 'সেবাদাতা', labelEn: 'Provider' },
  { key: 'adoption_lister', labelBn: 'দত্তক তালিকাকারী', labelEn: 'Adoption Lister' },
];

export default function AdminVerificationsPage() {
  const { locale } = useLocale();
  const isBn = locale === 'bn';

  const [activeTab, setActiveTab] = useState<'roles' | 'providers'>('roles');
  const [roleFilter, setRoleFilter] = useState<VerifiableRole | 'all'>('all');
  const [loading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [roleRequests, setRoleRequests] = useState<PendingRoleRequest[]>(MOCK_ROLE_REQUESTS);
  const [providerDocs, setProviderDocs] = useState<ProviderPendingDoc[]>(MOCK_PROVIDER_DOCS);

  const [modalOpen, setModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    type: 'role' | 'provider';
    action: 'approve' | 'reject';
    target: PendingRoleRequest | ProviderPendingDoc;
  } | null>(null);

  const [toast, setToast] = useState<{ message: string; kind: 'success' | 'error' } | null>(null);

  const showToast = useCallback((message: string, kind: 'success' | 'error') => {
    setToast({ message, kind });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const filteredRoles =
    roleFilter === 'all' ? roleRequests : roleRequests.filter((r) => r.role === roleFilter);

  function handleRoleAction(req: PendingRoleRequest, action: 'approve' | 'reject') {
    setPendingAction({ type: 'role', action, target: req });
    setModalOpen(true);
  }

  function handleProviderAction(doc: ProviderPendingDoc, action: 'approve' | 'reject') {
    setPendingAction({ type: 'provider', action, target: doc });
    setModalOpen(true);
  }

  async function handleConfirm(_note: string) {
    if (!pendingAction) return;
    setActionLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 600));
      if (pendingAction.type === 'role') {
        const req = pendingAction.target as PendingRoleRequest;
        setRoleRequests((prev) =>
          prev.filter((r) => !(r.user_id === req.user_id && r.role === req.role))
        );
      } else {
        const doc = pendingAction.target as ProviderPendingDoc;
        setProviderDocs((prev) => prev.filter((d) => d.id !== doc.id));
      }

      showToast(
        pendingAction.action === 'approve'
          ? isBn
            ? 'সফলভাবে অনুমোদিত হয়েছে ✅'
            : 'Successfully approved ✅'
          : isBn
          ? 'প্রত্যাখ্যাত হয়েছে ❌'
          : 'Request rejected ❌',
        'success'
      );
      setModalOpen(false);
      setPendingAction(null);
    } catch {
      showToast(
        isBn ? 'কার্যক্রম সম্পন্ন হয়নি। পুনরায় চেষ্টা করুন।' : 'Action failed. Please try again.',
        'error'
      );
    } finally {
      setActionLoading(false);
    }
  }

  function getTargetName(): string {
    if (!pendingAction) return '';
    if (pendingAction.type === 'role') {
      const req = pendingAction.target as PendingRoleRequest;
      return isBn
        ? req.full_name_bn ?? req.full_name ?? '—'
        : req.full_name ?? req.full_name_bn ?? '—';
    }
    const doc = pendingAction.target as ProviderPendingDoc;
    return isBn
      ? doc.provider_name_bn ?? doc.provider_name_en ?? '—'
      : doc.provider_name_en ?? doc.provider_name_bn ?? '—';
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-5">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-2xl">🛡️</span>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              {isBn ? 'যাচাই ব্যবস্থাপনা' : 'Verification Management'}
            </h1>
            {roleRequests.length + providerDocs.length > 0 && (
              <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5">
                {roleRequests.length + providerDocs.length}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {isBn ? 'অপেক্ষামান আবেদনসমূহ পর্যালোচনা করুন' : 'Review pending verification requests'}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-3xl mx-auto px-4 pt-4">
        <Tabs
          items={[
            {
              id: 'roles',
              label: isBn ? 'ভূমিকা অনুরোধ' : 'Role Requests',
              count: roleRequests.length,
            },
            {
              id: 'providers',
              label: isBn ? 'প্রদানকারী ডকুমেন্ট' : 'Provider Documents',
              count: providerDocs.length,
            },
          ]}
          activeId={activeTab}
          onChange={(id) => setActiveTab(id as 'roles' | 'providers')}
        />
      </div>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 py-4 pb-24 space-y-4">
        {loading ? (
          <LoadingState
            message={isBn ? 'যাচাই আবেদন লোড হচ্ছে...' : 'Loading verification requests...'}
          />
        ) : activeTab === 'roles' ? (
          <>
            {/* Role filter chips */}
            <div className="flex gap-2 flex-wrap">
              {ROLE_FILTERS.map((f) => (
                <Chip
                  key={f.key}
                  label={isBn ? f.labelBn : f.labelEn}
                  variant="filter"
                  isSelected={roleFilter === f.key}
                  onSelect={() => setRoleFilter(f.key as VerifiableRole | 'all')}
                  className="cursor-pointer"
                />
              ))}
            </div>

            {filteredRoles.length === 0 ? (
              <EmptyState
                icon="✅"
                title={isBn ? 'কোনো অপেক্ষামান আবেদন নেই' : 'No pending verifications'}
                description={
                  isBn
                    ? 'সব যাচাই আবেদন পর্যালোচনা করা হয়েছে।'
                    : 'All verification requests have been reviewed.'
                }
              />
            ) : (
              filteredRoles.map((req) => (
                <RoleRequestCard
                  key={`${req.user_id}-${req.role}`}
                  req={req}
                  locale={locale}
                  onAction={handleRoleAction}
                />
              ))
            )}
          </>
        ) : (
          <>
            {providerDocs.length === 0 ? (
              <EmptyState
                icon="✅"
                title={isBn ? 'কোনো অপেক্ষামান ডকুমেন্ট নেই' : 'No pending documents'}
                description={
                  isBn
                    ? 'সব প্রদানকারীর ডকুমেন্ট পর্যালোচনা করা হয়েছে।'
                    : 'All provider documents have been reviewed.'
                }
              />
            ) : (
              providerDocs.map((doc) => (
                <ProviderDocCard
                  key={doc.id}
                  doc={doc}
                  locale={locale}
                  onAction={handleProviderAction}
                />
              ))
            )}
          </>
        )}
      </main>

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={modalOpen}
        action={pendingAction?.action ?? null}
        targetName={getTargetName()}
        locale={locale}
        onConfirm={handleConfirm}
        onClose={() => {
          setModalOpen(false);
          setPendingAction(null);
        }}
        loading={actionLoading}
      />

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium ${
            toast.kind === 'success' ? 'bg-green-600' : 'bg-red-600'
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}
