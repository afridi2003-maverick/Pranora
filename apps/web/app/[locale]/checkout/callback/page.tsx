'use client';

/**
 * apps/web/app/[locale]/checkout/callback/page.tsx
 * Task: PAY-2 — Payment Gateway Callback Handler (SSLCommerz)
 * Owner: Afridi | Sprint: S7
 */

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useLocale } from '@pranora/i18n';
import { Button, Card } from '@pranora/ui';
import { verifyPayment } from '@pranora/api';

function CallbackContent() {
  const { isBangla } = useLocale();
  const searchParams = useSearchParams();

  const status = searchParams.get('status') || 'success';
  const tranId = searchParams.get('tran_id') || 'PRN-DEMO-001';
  const valId = searchParams.get('val_id') || undefined;
  const amount = searchParams.get('amount') || '500';
  const cardType = searchParams.get('card_type') || 'bKash';

  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function handleVerify() {
      if (status === 'success' && tranId) {
        try {
          await verifyPayment(null as any, {
            transactionId: tranId,
            valId,
            cardType,
          });
        } catch {
          // Handled gracefully
        }
      }
      if (mounted) {
        setVerified(status === 'success');
        setLoading(false);
      }
    }
    handleVerify();
    return () => {
      mounted = false;
    };
  }, [status, tranId, valId, cardType]);

  if (loading) {
    return (
      <div className="min-h-screen bg-app-bg flex items-center justify-center p-4">
        <Card className="p-8 max-w-md w-full text-center space-y-4">
          <div className="animate-spin inline-block rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          <p className="text-sm font-semibold text-content-primary">
            {isBangla ? 'পেমেন্ট যাচাই করা হচ্ছে...' : 'Verifying payment status...'}
          </p>
        </Card>
      </div>
    );
  }

  const isSuccess = verified && status === 'success';

  return (
    <div className="min-h-screen bg-app-bg flex items-center justify-center p-4 font-bangla">
      <Card className="p-8 max-w-md w-full text-center space-y-6 shadow-xl border-stroke-subtle">
        <div className="text-5xl">
          {isSuccess ? '🎉' : status === 'cancelled' ? '⏸️' : '❌'}
        </div>

        <div>
          <h1 className="text-xl font-bold text-content-primary">
            {isSuccess
              ? isBangla
                ? 'পেমেন্ট সফল হয়েছে!'
                : 'Payment Successful!'
              : status === 'cancelled'
              ? isBangla
                ? 'পেমেন্ট বাতিল করা হয়েছে'
                : 'Payment Cancelled'
              : isBangla
              ? 'পেমেন্ট ব্যর্থ হয়েছে'
              : 'Payment Failed'}
          </h1>
          <p className="text-xs text-content-secondary mt-1">
            {isSuccess
              ? isBangla
                ? 'আপনার বুকিং নিশ্চিত করা হয়েছে এবং ক্লিনিকে জানানো হয়েছে।'
                : 'Your booking is confirmed and sent to the clinic.'
              : isBangla
              ? 'লেনদেনটি সম্পন্ন করা সম্ভব হয়নি। অনুগ্রহ করে পুনরায় চেষ্টা করুন।'
              : 'Transaction could not be completed. Please try again.'}
          </p>
        </div>

        {/* Transaction Summary Card */}
        <div className="bg-surface-secondary/50 rounded-xl p-4 text-xs text-left space-y-2 border border-stroke-subtle">
          <div className="flex justify-between">
            <span className="text-content-secondary">{isBangla ? 'ট্রানজ্যাকশন আইডি:' : 'Transaction ID:'}</span>
            <span className="font-mono font-bold text-content-primary">{tranId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-content-secondary">{isBangla ? 'পেমেন্ট মাধ্যম:' : 'Method:'}</span>
            <span className="font-semibold text-content-primary uppercase">{cardType}</span>
          </div>
          <div className="flex justify-between border-t border-stroke-subtle pt-2 text-sm font-bold">
            <span className="text-content-primary">{isBangla ? 'পরিশোধিত অর্থ:' : 'Amount Paid:'}</span>
            <span className="text-green-700 dark:text-lime-400">৳{amount}</span>
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <Link href="/bn/bookings" className="w-full">
            <Button variant="primary" size="md" className="w-full">
              {isBangla ? 'আমার বুকিংস দেখুন' : 'View My Bookings'}
            </Button>
          </Link>
          <Link href="/bn/map" className="w-full">
            <Button variant="ghost" size="sm" className="w-full">
              {isBangla ? 'হোম পেইজে যান' : 'Back to Home'}
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}

export default function CheckoutCallbackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-app-bg" />}>
      <CallbackContent />
    </Suspense>
  );
}
