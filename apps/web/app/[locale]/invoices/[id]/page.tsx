'use client';

/**
 * apps/web/app/[locale]/invoices/[id]/page.tsx
 * Task: PAY-3 — Digital Invoice View & Receipt (Printable)
 * Owner: Afridi | Sprint: S8
 */

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLocale } from '@pranora/i18n';
import { Button, Card, Chip } from '@pranora/ui';
import { getBookingInvoice, type InvoiceData } from '@pranora/api';

export default function InvoicePage() {
  const { isBangla } = useLocale();
  const params = useParams();
  const router = useRouter();
  const bookingId = (params?.id as string) || 'demo-booking-1';

  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const data = await getBookingInvoice(null as any, bookingId);
        if (mounted) setInvoice(data);
      } catch {
        // Fallback
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [bookingId]);

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-app-bg flex items-center justify-center p-4">
        <div className="animate-spin inline-block rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-app-bg flex items-center justify-center p-4">
        <Card className="p-8 text-center space-y-4">
          <p className="text-xl">📄</p>
          <p className="text-sm font-semibold text-content-primary">
            {isBangla ? 'চালান খুঁজে পাওয়া যায়নি' : 'Invoice not found'}
          </p>
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            {isBangla ? 'ফিরে যান' : 'Go back'}
          </Button>
        </Card>
      </div>
    );
  }

  const isPaid = invoice.paymentStatus === 'paid';
  const isRefunded = invoice.paymentStatus === 'refunded';

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 py-8 px-4 font-bangla print:p-0 print:bg-white">
      <div className="max-w-3xl mx-auto space-y-4">
        {/* Navigation & Actions Bar (Hidden on print) */}
        <div className="flex justify-between items-center print:hidden">
          <button
            onClick={() => router.back()}
            className="text-xs text-content-secondary hover:text-content-primary flex items-center gap-1 cursor-pointer"
          >
            ← {isBangla ? 'পেছনে যান' : 'Back'}
          </button>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={handlePrint}>
              🖨️ {isBangla ? 'প্রিন্ট / ডাউনলোড (PDF)' : 'Print / Download (PDF)'}
            </Button>
          </div>
        </div>

        {/* Printable Invoice Sheet */}
        <Card className="p-8 sm:p-12 bg-white dark:bg-gray-900 shadow-xl border-stroke-subtle rounded-2xl print:shadow-none print:border-none print:rounded-none">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-stroke-subtle">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-green-700 dark:text-lime-400">Pranora</span>
                <span className="text-xs px-2 py-0.5 rounded bg-green-100 dark:bg-green-950 text-green-800 dark:text-green-300 font-bold">
                  Official Receipt
                </span>
              </div>
              <p className="text-xs text-content-secondary mt-1">
                {isBangla ? 'বাংলাদেশের সমন্বিত ভেটেরিনারি ও পেট কেয়ার প্ল্যাটফর্ম' : 'Unified Veterinary & Pet Care Platform, Bangladesh'}
              </p>
              <p className="text-xs text-content-secondary">https://pranora.com.bd</p>
            </div>

            <div className="sm:text-right">
              <h1 className="text-2xl font-black tracking-tight text-content-primary uppercase">
                {isBangla ? 'চালান / মানি রিসিট' : 'Invoice / Receipt'}
              </h1>
              <p className="font-mono text-sm font-bold text-primary mt-1">{invoice.invoiceNumber}</p>
              <div className="mt-2">
                <Chip
                  variant="filter"
                  isSelected={isPaid}
                  label={
                    isPaid
                      ? isBangla ? '✓ পরিশোধিত (PAID)' : '✓ PAID'
                      : isRefunded
                      ? isBangla ? '↩ রিফান্ডকৃত (REFUNDED)' : '↩ REFUNDED'
                      : isBangla ? '⏳ অপরিশোধিত (PENDING)' : '⏳ PENDING'
                  }
                />
              </div>
            </div>
          </div>

          {/* Parties Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 border-b border-stroke-subtle text-xs">
            <div>
              <p className="font-bold text-content-secondary uppercase tracking-wider mb-2">
                {isBangla ? 'সেবা প্রদানকারী ক্লিনিক / ডাক্তার:' : 'Billed By (Provider):'}
              </p>
              <p className="font-bold text-sm text-content-primary">
                {isBangla ? invoice.provider.nameBn : invoice.provider.nameEn}
              </p>
              {invoice.provider.phone && (
                <p className="text-content-secondary mt-0.5">📞 {invoice.provider.phone}</p>
              )}
              <p className="text-content-secondary">Dhaka, Bangladesh</p>
            </div>

            <div className="sm:text-right">
              <p className="font-bold text-content-secondary uppercase tracking-wider mb-2">
                {isBangla ? 'গ্রাহকের বিবরণ (Billed To):' : 'Billed To (Customer):'}
              </p>
              <p className="font-bold text-sm text-content-primary">{invoice.customer.name}</p>
              {invoice.customer.phone && (
                <p className="text-content-secondary mt-0.5">📱 {invoice.customer.phone}</p>
              )}
              <p className="text-content-secondary mt-2">
                {isBangla ? 'তারিখ:' : 'Date:'}{' '}
                <span className="font-semibold text-content-primary">
                  {new Date(invoice.issuedAt).toLocaleDateString([], {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </p>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="py-6 border-b border-stroke-subtle">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-stroke-subtle/80 text-content-secondary uppercase">
                  <th className="py-2.5 font-bold">{isBangla ? 'সেবার বিবরণ' : 'Description'}</th>
                  <th className="py-2.5 text-center font-bold">{isBangla ? 'পরিমাণ' : 'Qty'}</th>
                  <th className="py-2.5 text-right font-bold">{isBangla ? 'একক মূল্য' : 'Unit Price'}</th>
                  <th className="py-2.5 text-right font-bold">{isBangla ? 'মোট' : 'Amount'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stroke-subtle/50 text-content-primary">
                {invoice.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-3 font-medium">{item.description}</td>
                    <td className="py-3 text-center">{item.quantity}</td>
                    <td className="py-3 text-right">৳{item.unitPrice}</td>
                    <td className="py-3 text-right font-bold">৳{item.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Calculation & Payment Info */}
          <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div className="space-y-1.5 text-content-secondary bg-surface-secondary/40 p-4 rounded-xl border border-stroke-subtle">
              <p className="font-bold text-content-primary uppercase text-[10px] tracking-wider mb-1">
                {isBangla ? 'পেমেন্ট লেনদেন বিবরণ' : 'Payment Details'}
              </p>
              <p>
                {isBangla ? 'মাধ্যম:' : 'Method:'}{' '}
                <span className="font-semibold uppercase text-content-primary">{invoice.paymentMethod}</span>
              </p>
              {invoice.transactionId && (
                <p className="font-mono text-[11px]">
                  {isBangla ? 'ট্রানজ্যাকশন আইডি:' : 'Txn ID:'}{' '}
                  <span className="font-semibold text-content-primary">{invoice.transactionId}</span>
                </p>
              )}
              <p>
                {isBangla ? 'অবস্থা:' : 'Status:'}{' '}
                <span className="font-bold text-green-700 dark:text-lime-400 uppercase">
                  {invoice.paymentStatus}
                </span>
              </p>
            </div>

            <div className="space-y-2 text-right">
              <div className="flex justify-between text-content-secondary">
                <span>{isBangla ? 'উপ-মোট (Subtotal):' : 'Subtotal:'}</span>
                <span className="font-semibold text-content-primary">৳{invoice.subtotal}</span>
              </div>
              <div className="flex justify-between text-content-secondary">
                <span>{isBangla ? 'ছাড় (Discount):' : 'Discount:'}</span>
                <span className="font-semibold text-content-primary">৳{invoice.discount}</span>
              </div>
              <div className="flex justify-between text-content-secondary">
                <span>{isBangla ? 'ভ্যাট / ট্যাক্স (VAT 0%):' : 'VAT / Tax (0%):'}</span>
                <span className="font-semibold text-content-primary">৳{invoice.tax}</span>
              </div>
              <div className="flex justify-between text-base font-black text-green-800 dark:text-lime-300 border-t border-stroke-subtle pt-2">
                <span>{isBangla ? 'সর্বমোট পরিশোধিত:' : 'Grand Total:'}</span>
                <span>৳{invoice.total} {invoice.currency}</span>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="mt-8 pt-4 border-t border-stroke-subtle/50 text-[11px] text-content-secondary text-center">
            <p>
              {isBangla
                ? 'প্রণোরা ব্যবহার করার জন্য ধন্যবাদ। এই চালানটি কম্পিউটার জেনারেটেড এবং কোনো স্বাক্ষরের প্রয়োজন নেই।'
                : 'Thank you for choosing Pranora. This is a computer generated invoice and requires no physical signature.'}
            </p>
            <p className="text-[10px] mt-0.5 text-content-secondary/70">
              Support: support@pranora.com.bd | Helpline: +880 9612-PRANORA
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
