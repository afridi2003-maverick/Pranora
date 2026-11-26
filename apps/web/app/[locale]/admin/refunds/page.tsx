'use client';

/**
 * apps/web/app/[locale]/admin/refunds/page.tsx
 * Task: PAY-3 — Admin Refund Management Queue
 * Owner: Afridi | Sprint: S8
 */

import React, { useEffect, useState } from 'react';
import { useLocale } from '@pranora/i18n';
import { Button, Card, Chip, Textarea } from '@pranora/ui';
import { listRefundRequests, processPaymentRefund, type RefundRequestItem } from '@pranora/api';

export default function AdminRefundsPage() {
  const { isBangla } = useLocale();

  const [requests, setRequests] = useState<RefundRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'requested' | 'processed' | 'rejected'>('all');
  const [selectedItem, setSelectedItem] = useState<RefundRequestItem | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [processing, setProcessing] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    let mounted = true;
    async function fetchRequests() {
      setLoading(true);
      try {
        const data = await listRefundRequests(null as any, { status: filter });
        if (mounted) setRequests(data);
      } catch {
        // Fallback
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchRequests();
    return () => {
      mounted = false;
    };
  }, [filter]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleAction = async (action: 'approved' | 'rejected') => {
    if (!selectedItem) return;
    setProcessing(true);
    try {
      await processPaymentRefund(null as any, {
        paymentId: selectedItem.id,
        action,
        adminNote: adminNote.trim() || undefined,
      });

      setRequests((prev) =>
        prev.map((r) =>
          r.id === selectedItem.id
            ? {
                ...r,
                refund_status: action === 'approved' ? 'processed' : 'rejected',
                refund_admin_note: adminNote,
                refunded_at: action === 'approved' ? new Date().toISOString() : null,
              }
            : r
        )
      );

      showToast(
        action === 'approved'
          ? isBangla ? 'রিফান্ড সফলভাবে প্রসেস করা হয়েছে!' : 'Refund approved and processed!'
          : isBangla ? 'রিফান্ড অনুরোধ বাতিল করা হয়েছে।' : 'Refund request rejected.'
      );

      setSelectedItem(null);
      setAdminNote('');
    } catch {
      showToast(isBangla ? 'ত্রুটি হয়েছে, আবার চেষ্টা করুন' : 'Error processing refund');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-app-bg py-8 px-4 font-bangla">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Toast */}
        {toast && (
          <div className="fixed top-4 right-4 z-50 bg-primary text-white text-xs px-4 py-2 rounded-xl shadow-lg">
            {toast}
          </div>
        )}

        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-content-primary">
            💰 {isBangla ? 'রিফান্ড ব্যবস্থাপনা ও কিউ' : 'Refund Management Queue'}
          </h1>
          <p className="text-xs text-content-secondary mt-1">
            {isBangla
              ? 'গ্রাহক ও ক্লিনিকের বাতিলকৃত লেনদেনের রিফান্ড পর্যালোচনা ও নিষ্পত্তি করুন।'
              : 'Review and disburse customer refund requests for cancelled appointments and services.'}
          </p>
        </div>

        {/* Filters */}
        <div className="flex gap-2 border-b border-stroke-subtle pb-3">
          {(['all', 'requested', 'processed', 'rejected'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                filter === tab
                  ? 'bg-primary text-white'
                  : 'bg-surface-secondary text-content-secondary hover:text-content-primary'
              }`}
            >
              {tab === 'all'
                ? isBangla ? 'সকল অনুরোধ' : 'All'
                : tab === 'requested'
                ? isBangla ? '⏳ পেন্ডিং (Pending)' : 'Pending'
                : tab === 'processed'
                ? isBangla ? '✓ সম্পন্ন (Processed)' : 'Processed'
                : isBangla ? '❌ বাতিল (Rejected)' : 'Rejected'}
            </button>
          ))}
        </div>

        {/* Content Table / List */}
        {loading ? (
          <div className="text-center py-12 text-content-secondary text-sm">
            <div className="animate-spin inline-block rounded-full h-6 w-6 border-b-2 border-primary mb-2" />
            <p>{isBangla ? 'লোড হচ্ছে...' : 'Loading refund requests...'}</p>
          </div>
        ) : requests.length === 0 ? (
          <Card className="p-8 text-center text-content-secondary text-sm">
            {isBangla ? 'কোনো রিফান্ড অনুরোধ নেই' : 'No refund requests found in this view'}
          </Card>
        ) : (
          <div className="space-y-3">
            {requests.map((item) => {
              const isPending = item.refund_status === 'requested';
              return (
                <Card key={item.id} className="p-4 border-stroke-subtle space-y-3">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-content-primary">
                          {item.customer_name || 'Customer'}
                        </span>
                        <span className="text-xs text-content-secondary font-mono">
                          ({item.customer_phone || item.user_id.slice(0, 8)})
                        </span>
                        <Chip
                          variant="filter"
                          isSelected={isPending}
                          label={item.refund_status.toUpperCase()}
                        />
                      </div>
                      <p className="text-xs text-content-secondary mt-1">
                        {isBangla ? 'ট্রানজ্যাকশন:' : 'Txn:'}{' '}
                        <span className="font-mono font-semibold">{item.gateway_tran_id}</span> •{' '}
                        <span className="uppercase">{item.method}</span>
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-base font-bold text-green-700 dark:text-lime-400">
                        ৳{item.refund_amount}
                      </span>
                      <p className="text-[10px] text-content-secondary">
                        {new Date(item.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {item.refund_reason && (
                    <div className="bg-surface-secondary/40 p-2.5 rounded-lg text-xs text-content-secondary">
                      <span className="font-semibold text-content-primary">
                        {isBangla ? 'কারণ:' : 'Reason:'}{' '}
                      </span>
                      {item.refund_reason}
                    </div>
                  )}

                  {item.refund_admin_note && (
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      ℹ️ {isBangla ? 'প্রশাসক নোট:' : 'Admin Note:'} {item.refund_admin_note}
                    </p>
                  )}

                  {isPending && (
                    <div className="flex justify-end gap-2 pt-2 border-t border-stroke-subtle">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setSelectedItem(item)}
                      >
                        {isBangla ? 'পর্যালোচনা ও সিদ্ধান্ত' : 'Review & Action'}
                      </Button>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}

        {/* Action Modal */}
        {selectedItem && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
            <Card className="p-6 max-w-md w-full space-y-4 bg-app-card border-stroke-subtle">
              <h3 className="font-bold text-base text-content-primary">
                {isBangla ? 'রিফান্ড প্রক্রিয়াকরণ' : 'Process Refund Request'}
              </h3>
              <p className="text-xs text-content-secondary">
                {selectedItem.customer_name} • ৳{selectedItem.refund_amount} ({selectedItem.method})
              </p>

              <div>
                <label className="text-xs font-semibold text-content-secondary block mb-1">
                  {isBangla ? 'প্রশাসক নোট / bKash রিফান্ড আইডি:' : 'Admin Note / Refund Reference:'}
                </label>
                <Textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="e.g. bKash reversal executed manually..."
                  rows={3}
                  className="w-full text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={processing}
                  onClick={() => setSelectedItem(null)}
                >
                  {isBangla ? 'বাতিল' : 'Cancel'}
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  disabled={processing}
                  onClick={() => handleAction('rejected')}
                >
                  {isBangla ? 'প্রত্যাখ্যান' : 'Reject'}
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  disabled={processing}
                  onClick={() => handleAction('approved')}
                >
                  {processing
                    ? isBangla ? 'প্রসেসিং...' : 'Processing...'
                    : isBangla ? 'রিফান্ড সম্পন্ন করুন' : 'Approve & Refund'}
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
