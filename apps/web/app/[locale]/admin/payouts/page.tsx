'use client';

/**
 * apps/web/app/[locale]/admin/payouts/page.tsx
 * Task: PAY-4 — Admin Provider Payout Disbursement Queue
 * Owner: Afridi | Sprint: S8
 */

import React, { useEffect, useState } from 'react';
import { useLocale } from '@pranora/i18n';
import { Button, Card, Chip, Input, Textarea } from '@pranora/ui';
import {
  listAdminPayoutQueue,
  processProviderPayout,
  type ProviderPayoutItem,
} from '@pranora/api';

export default function AdminPayoutsPage() {
  const { isBangla } = useLocale();

  const [queue, setQueue] = useState<ProviderPayoutItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'processing' | 'completed' | 'rejected'>('all');
  const [selectedItem, setSelectedItem] = useState<ProviderPayoutItem | null>(null);
  const [reference, setReference] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [processing, setProcessing] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    let mounted = true;
    async function loadQueue() {
      setLoading(true);
      try {
        const data = await listAdminPayoutQueue(null as any, { status: filter });
        if (mounted) setQueue(data);
      } catch {
        // Fallback
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadQueue();
    return () => {
      mounted = false;
    };
  }, [filter]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleAction = async (action: 'completed' | 'rejected' | 'processing') => {
    if (!selectedItem) return;
    setProcessing(true);
    try {
      await processProviderPayout(null as any, {
        payoutId: selectedItem.id,
        action,
        reference: reference.trim() || undefined,
        notes: adminNote.trim() || undefined,
      });

      setQueue((prev) =>
        prev.map((item) =>
          item.id === selectedItem.id
            ? {
                ...item,
                status: action,
                transaction_reference: reference || item.transaction_reference,
                notes: adminNote || item.notes,
              }
            : item
        )
      );

      showToast(
        action === 'completed'
          ? isBangla ? 'পে-আউট সফলভাবে বিতরণ করা হয়েছে!' : 'Payout marked as completed!'
          : action === 'processing'
          ? isBangla ? 'পে-আউট প্রসেসিং অবস্থায় রাখা হয়েছে।' : 'Payout set to processing.'
          : isBangla ? 'পে-আউট বাতিল করা হয়েছে।' : 'Payout rejected.'
      );

      setSelectedItem(null);
      setReference('');
      setAdminNote('');
    } catch {
      showToast(isBangla ? 'ত্রুটি হয়েছে' : 'Failed to process payout');
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
            🏦 {isBangla ? 'প্রোভাইডার পে-আউট বিতরণ কিউ' : 'Provider Payout Disbursement Queue'}
          </h1>
          <p className="text-xs text-content-secondary mt-1">
            {isBangla
              ? 'ক্লিনিক ও ভেটেরিনারি সেবা প্রদানকারীদের ব্যাংকিং ও বিকাশ উইথড্র অনুরোধ যাচাই ও নিষ্পত্তি করুন।'
              : 'Review and execute withdrawal payouts to verified clinic and veterinarian accounts.'}
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 border-b border-stroke-subtle pb-3">
          {(['all', 'pending', 'processing', 'completed', 'rejected'] as const).map((tab) => (
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
                ? isBangla ? 'সকল' : 'All'
                : tab === 'pending'
                ? isBangla ? '⏳ পেন্ডিং' : 'Pending'
                : tab === 'processing'
                ? isBangla ? '⚙️ প্রসেসিং' : 'Processing'
                : tab === 'completed'
                ? isBangla ? '✓ সম্পন্ন' : 'Completed'
                : isBangla ? '❌ বাতিল' : 'Rejected'}
            </button>
          ))}
        </div>

        {/* Queue List */}
        {loading ? (
          <div className="text-center py-12 text-content-secondary text-sm">
            <div className="animate-spin inline-block rounded-full h-6 w-6 border-b-2 border-primary mb-2" />
            <p>{isBangla ? 'লোড হচ্ছে...' : 'Loading payout queue...'}</p>
          </div>
        ) : queue.length === 0 ? (
          <Card className="p-8 text-center text-content-secondary text-sm">
            {isBangla ? 'এই তালিকায় কোনো পে-আউট অনুরোধ নেই' : 'No payout requests in this view.'}
          </Card>
        ) : (
          <div className="space-y-3">
            {queue.map((item) => {
              const isPending = item.status === 'pending';
              const isProcessing = item.status === 'processing';
              return (
                <Card key={item.id} className="p-4 border-stroke-subtle space-y-3">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-content-primary">
                          {item.provider_name || 'Provider Clinic'}
                        </span>
                        <Chip
                          variant="filter"
                          isSelected={item.status === 'completed'}
                          label={item.status.toUpperCase()}
                        />
                        <span className="text-xs uppercase font-semibold text-content-secondary">
                          • {item.payout_method}
                        </span>
                      </div>
                      <p className="text-xs text-content-secondary mt-1">
                        {item.account_details?.accountNumber && (
                          <span>A/C: <strong className="text-content-primary">{item.account_details.accountNumber}</strong> • </span>
                        )}
                        {item.account_details?.bankName && (
                          <span>Bank: {item.account_details.bankName} • </span>
                        )}
                        {new Date(item.created_at).toLocaleDateString()}
                      </p>
                      {item.notes && (
                        <p className="text-xs text-content-secondary mt-1 italic">
                          "{item.notes}"
                        </p>
                      )}
                    </div>

                    <div className="text-right">
                      <span className="text-lg font-black text-green-700 dark:text-lime-400">
                        ৳{item.net_amount}
                      </span>
                      {item.transaction_reference && (
                        <p className="font-mono text-[11px] text-content-secondary">
                          Ref: {item.transaction_reference}
                        </p>
                      )}
                    </div>
                  </div>

                  {(isPending || isProcessing) && (
                    <div className="flex justify-end gap-2 pt-2 border-t border-stroke-subtle">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setSelectedItem(item)}
                      >
                        {isBangla ? 'বিতরণ ও অনুমোদন' : 'Execute & Disburse'}
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
                {isBangla ? 'পে-আউট বিতরণ নিশ্চিতকরণ' : 'Confirm Payout Disbursement'}
              </h3>
              <div className="bg-surface-secondary/40 p-3 rounded-xl text-xs space-y-1">
                <p><strong>{selectedItem.provider_name}</strong></p>
                <p>Amount: <strong>৳{selectedItem.net_amount}</strong> ({selectedItem.payout_method})</p>
                <p>Account: {selectedItem.account_details?.accountNumber}</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-content-secondary block mb-1">
                  {isBangla ? 'ব্যাংক / বিকাশ লেনদেন রেফারেন্স *' : 'Transaction Reference / Txn ID *'}
                </label>
                <Input
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="e.g. BK-TRN-998811 or BEFTN-12345"
                  className="w-full text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-content-secondary block mb-1">
                  {isBangla ? 'নোট' : 'Admin Note'}
                </label>
                <Textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Disbursed via online portal..."
                  rows={2}
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
                  disabled={processing || !reference}
                  onClick={() => handleAction('completed')}
                >
                  {processing
                    ? isBangla ? 'প্রসেসিং...' : 'Processing...'
                    : isBangla ? 'বিতরণ সম্পন্ন করুন' : 'Mark Completed'}
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
