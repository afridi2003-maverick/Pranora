'use client';

/**
 * apps/web/app/[locale]/provider/payouts/page.tsx
 * Task: PAY-4 — Provider Earnings & Payout Management
 * Owner: Afridi | Sprint: S8
 */

import React, { useEffect, useState } from 'react';
import { useLocale } from '@pranora/i18n';
import { Button, Card, Chip, Input, Textarea } from '@pranora/ui';
import {
  getProviderEarnings,
  requestProviderPayout,
  listProviderPayouts,
  type ProviderEarningsSummary,
  type ProviderPayoutItem,
} from '@pranora/api';

export default function ProviderPayoutsPage() {
  const { isBangla } = useLocale();

  const providerId = 'demo-provider-1';
  const [summary, setSummary] = useState<ProviderEarningsSummary | null>(null);
  const [payouts, setPayouts] = useState<ProviderPayoutItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState('');

  // Form state
  const [amount, setAmount] = useState('5000');
  const [method, setMethod] = useState<'bkash' | 'nagad' | 'bank_transfer'>('bkash');
  const [accountNumber, setAccountNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [branchName, setBranchName] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        const [sum, list] = await Promise.all([
          getProviderEarnings(null as any, providerId),
          listProviderPayouts(null as any, providerId),
        ]);
        if (mounted) {
          setSummary(sum);
          setPayouts(list);
        }
      } catch {
        // Fallback
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      mounted = false;
    };
  }, [providerId]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleRequestPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmt = parseFloat(amount);
    if (!numAmt || numAmt < 500) {
      showToast(isBangla ? 'সর্বনিম্ন উইথড্র ৫০০০ টাকা' : 'Minimum withdrawal is 500 BDT');
      return;
    }
    if (!accountNumber) {
      showToast(isBangla ? 'অ্যাকাউন্ট নম্বর আবশ্যক' : 'Account number is required');
      return;
    }

    setSubmitting(true);
    try {
      await requestProviderPayout(null as any, {
        providerId,
        amount: numAmt,
        method,
        accountDetails: {
          accountNumber,
          bankName: method === 'bank_transfer' ? bankName : undefined,
          branchName: method === 'bank_transfer' ? branchName : undefined,
        },
        notes: notes.trim() || undefined,
      });

      showToast(isBangla ? 'উইথড্র অনুরোধ সফলভাবে পাঠানো হয়েছে!' : 'Withdrawal request submitted successfully!');
      setShowModal(false);

      // Optimistic update
      const newPayout: ProviderPayoutItem = {
        id: `po-${Date.now()}`,
        provider_id: providerId,
        amount: numAmt,
        commission_deducted: 0,
        net_amount: numAmt,
        currency: 'BDT',
        status: 'pending',
        payout_method: method,
        account_details: { accountNumber },
        transaction_reference: null,
        processed_at: null,
        notes: notes || null,
        created_at: new Date().toISOString(),
      };
      setPayouts([newPayout, ...payouts]);
      if (summary) {
        setSummary({
          ...summary,
          availableBalance: Math.max(0, summary.availableBalance - numAmt),
          pendingPayout: summary.pendingPayout + numAmt,
        });
      }
    } catch {
      showToast(isBangla ? 'অনুরোধ ব্যর্থ হয়েছে' : 'Failed to submit withdrawal request');
    } finally {
      setSubmitting(false);
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl font-bold text-content-primary">
              💼 {isBangla ? 'উপার্জন ও পে-আউট ড্যাশবোর্ড' : 'Earnings & Provider Payouts'}
            </h1>
            <p className="text-xs text-content-secondary mt-1">
              {isBangla
                ? 'অনলাইন বুকিং ও সেবার আয় ট্র্যাক করুন এবং সরাসরি বিকাশ, নগদ বা ব্যাংক অ্যাকাউন্টে উইথড্র করুন।'
                : 'Track online service revenue and disburse earnings to your bKash, Nagad, or bank account.'}
            </p>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={() => setShowModal(true)}
            disabled={!summary || summary.availableBalance < 500}
          >
            💸 {isBangla ? 'উইথড্র অনুরোধ করুন' : 'Request Payout'}
          </Button>
        </div>

        {/* Earnings KPI Cards */}
        {summary && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card className="p-4 border-stroke-subtle">
              <p className="text-xs text-content-secondary">{isBangla ? 'মোট আয় (Gross)' : 'Gross Revenue'}</p>
              <p className="text-xl font-extrabold text-content-primary mt-1">৳{summary.grossEarnings}</p>
              <p className="text-[10px] text-content-secondary mt-0.5">সব সফল বুকিং</p>
            </Card>

            <Card className="p-4 border-stroke-subtle">
              <p className="text-xs text-content-secondary">{isBangla ? 'প্ল্যাটফর্ম ফি (১০%)' : 'Platform Fee (10%)'}</p>
              <p className="text-xl font-extrabold text-amber-700 dark:text-amber-400 mt-1">
                ৳{summary.platformCommission}
              </p>
              <p className="text-[10px] text-content-secondary mt-0.5">রক্ষণাবেক্ষণ ও গেটওয়ে</p>
            </Card>

            <Card className="p-4 border-stroke-subtle">
              <p className="text-xs text-content-secondary">{isBangla ? 'উইথড্র সম্পন্ন' : 'Total Paid Out'}</p>
              <p className="text-xl font-extrabold text-blue-700 dark:text-blue-400 mt-1">৳{summary.paidOut}</p>
              <p className="text-[10px] text-content-secondary mt-0.5">পূর্বে স্থানান্তরিত</p>
            </Card>

            <Card className="p-4 bg-green-50/60 dark:bg-green-950/30 border-primary">
              <p className="text-xs text-green-800 dark:text-green-300 font-bold">
                {isBangla ? 'উত্তোলনযোগ্য ব্যালেন্স' : 'Available Balance'}
              </p>
              <p className="text-xl font-black text-green-700 dark:text-lime-400 mt-1">
                ৳{summary.availableBalance}
              </p>
              <p className="text-[10px] text-green-700 dark:text-green-400 mt-0.5">এখনই উত্তোলন করুন</p>
            </Card>
          </div>
        )}

        {/* Payout History List */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-content-primary">
            📋 {isBangla ? 'উইথড্র হিস্ট্রি' : 'Payout History'}
          </h2>

          {loading ? (
            <div className="text-center py-12 text-content-secondary text-sm">
              <div className="animate-spin inline-block rounded-full h-6 w-6 border-b-2 border-primary mb-2" />
              <p>{isBangla ? 'লোড হচ্ছে...' : 'Loading payouts...'}</p>
            </div>
          ) : payouts.length === 0 ? (
            <Card className="p-8 text-center text-content-secondary text-sm">
              {isBangla ? 'এখনো কোনো পে-আউট হিস্ট্রি নেই' : 'No payout history yet.'}
            </Card>
          ) : (
            <div className="space-y-2">
              {payouts.map((po) => {
                const isDone = po.status === 'completed';
                const isPending = po.status === 'pending';
                return (
                  <Card key={po.id} className="p-3.5 border-stroke-subtle flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-content-primary">৳{po.net_amount}</span>
                        <Chip
                          variant="filter"
                          isSelected={isDone}
                          label={po.status.toUpperCase()}
                        />
                        <span className="text-xs uppercase font-semibold text-content-secondary">
                          • {po.payout_method}
                        </span>
                      </div>
                      <p className="text-xs text-content-secondary mt-0.5">
                        {po.account_details?.accountNumber && (
                          <span>A/C: {po.account_details.accountNumber} • </span>
                        )}
                        {new Date(po.created_at).toLocaleDateString([], {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                        {po.transaction_reference && (
                          <span className="font-mono text-primary font-bold">
                            {' '}
                            (Ref: {po.transaction_reference})
                          </span>
                        )}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-content-secondary">
                        {isDone
                          ? isBangla ? '✓ পরিশোধিত' : 'Completed'
                          : isPending
                          ? isBangla ? '⏳ প্রক্রিয়াকরণাধীন' : 'In Review'
                          : po.status}
                      </span>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Withdrawal Request Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
            <Card className="p-6 max-w-md w-full space-y-4 bg-app-card border-stroke-subtle">
              <h3 className="font-bold text-base text-content-primary">
                {isBangla ? 'নতুন উইথড্র অনুরোধ' : 'Request Earnings Withdrawal'}
              </h3>
              <p className="text-xs text-content-secondary">
                {isBangla
                  ? `সর্বোচ্চ উত্তোলনযোগ্য ব্যালেন্স: ৳${summary?.availableBalance || 0}`
                  : `Available for withdrawal: ৳${summary?.availableBalance || 0}`}
              </p>

              <form onSubmit={handleRequestPayout} className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-content-secondary block mb-1">
                    {isBangla ? 'টাকার পরিমাণ (BDT) *' : 'Amount (BDT) *'}
                  </label>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min={500}
                    max={summary?.availableBalance || 100000}
                    className="w-full text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-content-secondary block mb-1">
                    {isBangla ? 'পেমেন্ট মাধ্যম *' : 'Payout Method *'}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['bkash', 'nagad', 'bank_transfer'] as const).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setMethod(m)}
                        className={`text-xs py-2 px-2 rounded-lg font-bold border transition-all cursor-pointer ${
                          method === m
                            ? 'bg-primary text-white border-primary'
                            : 'border-stroke-subtle text-content-secondary'
                        }`}
                      >
                        {m === 'bkash' ? 'bKash' : m === 'nagad' ? 'Nagad' : 'Bank'}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-content-secondary block mb-1">
                    {method === 'bank_transfer'
                      ? isBangla ? 'ব্যাংক হিসাব নম্বর *' : 'Bank Account Number *'
                      : isBangla ? 'মোবাইল নম্বর (Wallet Number) *' : 'Wallet Phone Number *'}
                  </label>
                  <Input
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder={method === 'bank_transfer' ? '1234567890...' : '017XXXXXXXX'}
                    className="w-full text-sm"
                    required
                  />
                </div>

                {method === 'bank_transfer' && (
                  <>
                    <div>
                      <label className="text-xs font-semibold text-content-secondary block mb-1">
                        {isBangla ? 'ব্যাংকের নাম *' : 'Bank Name *'}
                      </label>
                      <Input
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        placeholder="e.g. BRAC Bank PLC"
                        className="w-full text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-content-secondary block mb-1">
                        {isBangla ? 'শাখার নাম' : 'Branch Name'}
                      </label>
                      <Input
                        value={branchName}
                        onChange={(e) => setBranchName(e.target.value)}
                        placeholder="e.g. Gulshan Branch"
                        className="w-full text-sm"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="text-xs font-semibold text-content-secondary block mb-1">
                    {isBangla ? 'নোট (ঐচ্ছিক)' : 'Note (Optional)'}
                  </label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Weekly payout, etc."
                    rows={2}
                    className="w-full text-xs"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-stroke-subtle">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={submitting}
                    onClick={() => setShowModal(false)}
                  >
                    {isBangla ? 'বাতিল' : 'Cancel'}
                  </Button>
                  <Button type="submit" variant="primary" size="sm" disabled={submitting}>
                    {submitting
                      ? isBangla ? 'পাঠানো হচ্ছে...' : 'Submitting...'
                      : isBangla ? 'অনুরোধ নিশ্চিত করুন' : 'Confirm Request'}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
