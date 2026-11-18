'use client';

/**
 * apps/web/app/[locale]/admin/audit/page.tsx
 * Task: ADM-4 — Audit Log & History
 * Owner: Afridi | Sprint: S6 (unblocked in S4)
 */

import React, { useState } from 'react';
import { useLocale } from '@pranora/i18n';
import { Card, Chip, EmptyState, Modal, Button } from '@pranora/ui';
import { LanguageHeader } from '../../../../components/LanguageHeader';
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
    new_data: { role: 'vet', status: 'verified', verified_by: 'a-001', verified_at: new Date().toISOString() },
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
    new_data: { doc_type: 'trade_license', file_path: 'docs/trade_01.pdf', status: 'draft' },
    ip_address: '202.4.112.5',
    created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
  {
    id: 104,
    actor_id: 'a-001',
    actor_name: 'Afridi (Admin)',
    actor_phone: '+8801700000001',
    action: 'UPDATE',
    table_name: 'app_config',
    record_id: null,
    old_data: { key: 'enable_sms_otp', value: true },
    new_data: { key: 'enable_sms_otp', value: true, last_updated: '2026-11-18' },
    ip_address: '103.205.71.12',
    created_at: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
  },
];

const TABLE_FILTERS = [
  { key: 'all', labelBn: 'সকল টেবিল', labelEn: 'All Tables' },
  { key: 'user_roles', labelBn: 'ইউজার রোলস', labelEn: 'User Roles' },
  { key: 'providers', labelBn: 'প্রোভাইডার্স', labelEn: 'Providers' },
  { key: 'provider_documents', labelBn: 'ডকুমেন্টস', labelEn: 'Documents' },
  { key: 'app_config', labelBn: 'অ্যাপ কনফিগ', labelEn: 'App Config' },
];

const ACTION_FILTERS = [
  { key: 'all', labelBn: 'সকল অ্যাকশন', labelEn: 'All Actions' },
  { key: 'INSERT', labelBn: 'যুক্ত (INSERT)', labelEn: 'INSERT' },
  { key: 'UPDATE', labelBn: 'আপডেট (UPDATE)', labelEn: 'UPDATE' },
  { key: 'DELETE', labelBn: 'মুছে ফেলা (DELETE)', labelEn: 'DELETE' },
];

export default function AdminAuditPage() {
  const { locale } = useLocale();
  const isBn = locale === 'bn';

  const [tableFilter, setTableFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);

  const filteredLogs = MOCK_AUDIT_LOGS.filter((log) => {
    const matchesTable = tableFilter === 'all' || log.table_name === tableFilter;
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    return matchesTable && matchesAction;
  });

  function getActionBadge(action: string) {
    if (action === 'INSERT') return { label: action, type: 'confirmed' as const };
    if (action === 'UPDATE') return { label: action, type: 'pending' as const };
    return { label: action, type: 'emergency' as const };
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <LanguageHeader />

      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-5">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-2xl">📋</span>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              {isBn ? 'অডিট লগ ও হিস্টোরি' : 'Audit Logs & History'}
            </h1>
            <span className="ml-auto bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 text-xs font-semibold px-2.5 py-1 rounded-full">
              ADM-4
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {isBn
              ? 'কে, কখন, কোন তথ্যে কী পরিবর্তন করেছেন তার অপরিবর্তনীয় রেকর্ড'
              : 'Immutable record of who changed what, where, and when'}
          </p>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="max-w-4xl mx-auto px-4 pt-4 space-y-2">
        <div className="flex gap-2 flex-wrap items-center">
          <span className="text-xs font-semibold text-gray-500 uppercase mr-1">
            {isBn ? 'টেবিল:' : 'Table:'}
          </span>
          {TABLE_FILTERS.map((f) => (
            <Chip
              key={f.key}
              label={isBn ? f.labelBn : f.labelEn}
              variant="filter"
              isSelected={tableFilter === f.key}
              onSelect={() => setTableFilter(f.key)}
              className="cursor-pointer"
            />
          ))}
        </div>

        <div className="flex gap-2 flex-wrap items-center">
          <span className="text-xs font-semibold text-gray-500 uppercase mr-1">
            {isBn ? 'অ্যাকশন:' : 'Action:'}
          </span>
          {ACTION_FILTERS.map((f) => (
            <Chip
              key={f.key}
              label={isBn ? f.labelBn : f.labelEn}
              variant="filter"
              isSelected={actionFilter === f.key}
              onSelect={() => setActionFilter(f.key)}
              className="cursor-pointer"
            />
          ))}
        </div>
      </div>

      {/* Content List */}
      <main className="max-w-4xl mx-auto px-4 py-4 pb-24 space-y-3">
        {filteredLogs.length === 0 ? (
          <EmptyState
            icon="📋"
            title={isBn ? 'কোনো অডিট রেকর্ড পাওয়া যায়নি' : 'No audit records found'}
            description={
              isBn
                ? 'নির্বাচিত ফিল্টারের সাথে কোনো রেকর্ড মেলেনি।'
                : 'No audit records match the selected filter.'
            }
          />
        ) : (
          filteredLogs.map((log) => {
            const badge = getActionBadge(log.action);
            return (
              <Card key={log.id} className="p-4 hover:shadow-sm transition">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Chip label={badge.label} variant="status" statusType={badge.type} />
                      <span className="font-mono text-xs font-semibold bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-gray-700 dark:text-gray-300">
                        {log.table_name}
                      </span>
                      {log.record_id && (
                        <span className="font-mono text-xs text-gray-400 truncate max-w-[150px]">
                          id: {log.record_id}
                        </span>
                      )}
                    </div>

                    <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      {isBn ? 'কর্তা:' : 'Actor:'}{' '}
                      <span className="font-semibold text-green-700 dark:text-green-400">
                        {log.actor_name ?? log.actor_id ?? 'System'}
                      </span>
                      {log.ip_address && (
                        <span className="text-xs text-gray-400 ml-2">({log.ip_address})</span>
                      )}
                    </div>

                    <div className="text-xs text-gray-400">
                      {new Date(log.created_at).toLocaleString(isBn ? 'bn-BD' : 'en-US')}
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setSelectedLog(log)}
                    className="self-end sm:self-center"
                  >
                    {isBn ? '🔍 বিবরণ দেখুন' : '🔍 View Diff'}
                  </Button>
                </div>
              </Card>
            );
          })
        )}
      </main>

      {/* JSON Diff Details Modal */}
      {selectedLog && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedLog(null)}
          title={isBn ? 'অডিট পরিবর্তনের বিবরণ' : 'Audit Change Details'}
        >
          <div className="space-y-4 max-h-[70vh] overflow-y-auto">
            <div className="text-xs font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded">
              <div>Table: {selectedLog.table_name}</div>
              <div>Action: {selectedLog.action}</div>
              <div>Timestamp: {selectedLog.created_at}</div>
            </div>

            {selectedLog.old_data && (
              <div>
                <h4 className="text-xs font-bold uppercase text-red-600 dark:text-red-400 mb-1">
                  {isBn ? 'পূর্ববর্তী মান (Old Data):' : 'Previous Value (Old Data):'}
                </h4>
                <pre className="text-xs bg-red-50 dark:bg-red-950/40 p-3 rounded border border-red-200 dark:border-red-900 overflow-x-auto">
                  {JSON.stringify(selectedLog.old_data, null, 2)}
                </pre>
              </div>
            )}

            {selectedLog.new_data && (
              <div>
                <h4 className="text-xs font-bold uppercase text-green-600 dark:text-green-400 mb-1">
                  {isBn ? 'নতুন মান (New Data):' : 'New Value (New Data):'}
                </h4>
                <pre className="text-xs bg-green-50 dark:bg-green-950/40 p-3 rounded border border-green-200 dark:border-green-900 overflow-x-auto">
                  {JSON.stringify(selectedLog.new_data, null, 2)}
                </pre>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button variant="ghost" onClick={() => setSelectedLog(null)}>
                {isBn ? 'বন্ধ করুন' : 'Close'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
