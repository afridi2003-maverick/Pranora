'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLocale } from '@pranora/i18n';
import { Button } from '@pranora/ui';
import { OrderHistoryCard } from '../../../../features/shop';
import { getMyOrders, cancelShopOrder } from '@pranora/api';
import type { ShopOrder } from '@pranora/validation';

export default function ShopOrdersPage() {
  const { locale, isBangla } = useLocale();
  const [orders, setOrders] = useState<ShopOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const mockUserId = 'u0000000-0000-0000-0000-000000000001';

  useEffect(() => {
    let mounted = true;
    async function fetchOrders() {
      try {
        const data = await getMyOrders(null, mockUserId);
        if (mounted) setOrders(data);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    fetchOrders();
    return () => {
      mounted = false;
    };
  }, []);

  const handleCancelOrder = async (orderId: string, reason: string) => {
    await cancelShopOrder(null, orderId, reason);
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'cancelled' } : o))
    );
  };

  return (
    <div className="min-h-screen bg-neutral-50/50 dark:bg-neutral-950/50 text-foreground py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href={`/${locale}/shop`}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <span>←</span>
            <span>{isBangla ? 'পেট শপে ফিরে যান' : 'Back to Pet Shop'}</span>
          </Link>
        </div>

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/40 pb-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold flex items-center gap-2 text-foreground">
              <span>📦</span>
              <span>{isBangla ? 'আমার অর্ডারসমূহ' : 'My Orders'}</span>
            </h1>
            <p className="text-xs text-muted-foreground">
              {isBangla
                ? 'আপনার সকল অর্ডারের অগ্রগতি, ট্র্যাকিং ও হিস্ট্রি দেখুন।'
                : 'Track, view, and manage your pet store orders.'}
            </p>
          </div>

          <Link href={`/${locale}/shop`}>
            <Button variant="primary" size="sm" className="gap-1.5">
              <span>🛍️</span>
              <span>{isBangla ? 'নতুন কেনাকাটা' : 'Continue Shopping'}</span>
            </Button>
          </Link>
        </div>

        {/* Orders list */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-44 rounded-2xl bg-muted/60 animate-pulse" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center border border-dashed border-border rounded-2xl p-8 space-y-3">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
              <span className="text-3xl">📦</span>
            </div>
            <h3 className="font-bold text-base text-foreground">
              {isBangla ? 'কোনো অর্ডার পাওয়া যায়নি' : 'No orders found'}
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              {isBangla
                ? 'আপনি এখনও কোনো পণ্য অর্ডার করেননি। পেট শপ ব্রাউজ করুন এবং আপনার পোষা প্রাণীর জন্য পছন্দের সামগ্রী কিনুন।'
                : 'You have not placed any orders yet. Visit our shop to order pet food and supplies.'}
            </p>
            <Link href={`/${locale}/shop`}>
              <Button variant="primary" size="sm" className="mt-2">
                {isBangla ? 'কেনাকাটা শুরু করুন' : 'Start Shopping'}
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <OrderHistoryCard
                key={order.id}
                order={order}
                onCancelOrder={handleCancelOrder}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
