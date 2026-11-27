'use client';

import React, { useState } from 'react';
import { useLocale } from '@pranora/i18n';
import { Card, Button, Modal, Textarea } from '@pranora/ui';
import type { ShopOrder } from '@pranora/validation';

interface OrderHistoryCardProps {
  order: ShopOrder;
  onCancelOrder?: (orderId: string, reason: string) => Promise<void>;
}

export function OrderHistoryCard({ order, onCancelOrder }: OrderHistoryCardProps) {
  const { isBangla } = useLocale();
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  const statusConfig: Record<
    string,
    { labelBn: string; labelEn: string; emoji: string; className: string }
  > = {
    placed: {
      labelBn: 'গৃহীত হয়েছে',
      labelEn: 'Placed',
      emoji: '📦',
      className: 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400',
    },
    confirmed: {
      labelBn: 'নিশ্চিত হয়েছে',
      labelEn: 'Confirmed',
      emoji: '✅',
      className: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400',
    },
    shipped: {
      labelBn: 'পথে আছে',
      labelEn: 'Shipped',
      emoji: '🚚',
      className: 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400',
    },
    delivered: {
      labelBn: 'ডেলিভারি সম্পন্ন',
      labelEn: 'Delivered',
      emoji: '✅',
      className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400',
    },
    cancelled: {
      labelBn: 'বাতিলকৃত',
      labelEn: 'Cancelled',
      emoji: '❌',
      className: 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400',
    },
    returned: {
      labelBn: 'ফেরত এসেছে',
      labelEn: 'Returned',
      emoji: '↩️',
      className: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300',
    },
  };

  const statusInfo = statusConfig[order.status] ?? {
    labelBn: 'গৃহীত হয়েছে',
    labelEn: 'Placed',
    emoji: '📦',
    className: 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400',
  };

  const canCancel = ['placed', 'confirmed'].includes(order.status) && onCancelOrder;

  const handleConfirmCancel = async () => {
    if (!onCancelOrder) return;
    setIsCancelling(true);
    try {
      await onCancelOrder(order.id, cancelReason || 'Customer requested cancellation');
      setIsCancelModalOpen(false);
    } finally {
      setIsCancelling(false);
    }
  };

  const formattedDate = new Date(order.created_at).toLocaleDateString(
    isBangla ? 'bn-BD' : 'en-US',
    {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }
  );

  return (
    <Card className="p-4 border border-border/60 hover:shadow-sm transition-shadow">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 pb-3">
        <div className="flex items-center gap-2">
          <span>📦</span>
          <span className="font-mono font-bold text-sm text-foreground">{order.code}</span>
          <span className="text-xs text-muted-foreground">• {formattedDate}</span>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full ${statusInfo.className}`}
          >
            <span>{statusInfo.emoji}</span>
            {isBangla ? statusInfo.labelBn : statusInfo.labelEn}
          </span>
        </div>
      </div>

      {/* Items preview */}
      <div className="py-3 divide-y divide-border/20">
        {order.items && order.items.length > 0 ? (
          order.items.map((it) => (
            <div key={it.id} className="py-2 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 max-w-[70%]">
                <span className="font-medium text-foreground line-clamp-1">
                  {it.product
                    ? isBangla
                      ? it.product.name_bn
                      : it.product.name_en
                    : isBangla
                    ? 'পোষা প্রাণীর পণ্য'
                    : 'Pet Product'}
                </span>
                <span className="text-muted-foreground shrink-0">× {it.quantity}</span>
              </div>
              <span className="font-semibold text-foreground">
                ৳{(it.unit_price * it.quantity).toLocaleString('bn-BD')}
              </span>
            </div>
          ))
        ) : (
          <p className="text-xs text-muted-foreground py-2">
            {isBangla ? 'পণ্য তথ্যাবলি সংরক্ষিত' : 'Order items'}
          </p>
        )}
      </div>

      {/* Footer & Total */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/40 pt-3">
        <div className="text-xs text-muted-foreground">
          <span>{isBangla ? 'পেমেন্ট:' : 'Payment:'} </span>
          <span className="font-semibold text-foreground uppercase">{order.payment_method}</span>
          <span className="mx-1">•</span>
          <span
            className={
              order.payment_status === 'paid'
                ? 'text-emerald-600 font-medium'
                : 'text-amber-600 font-medium'
            }
          >
            {order.payment_status === 'paid'
              ? isBangla
                ? 'পরিশোধিত'
                : 'Paid'
              : isBangla
              ? 'বকেয়া (COD)'
              : 'Pending (COD)'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-xs text-muted-foreground mr-1.5">
              {isBangla ? 'মোট:' : 'Total:'}
            </span>
            <span className="text-base font-bold text-primary">
              ৳{order.total.toLocaleString('bn-BD')}
            </span>
          </div>

          {canCancel && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => setIsCancelModalOpen(true)}
              className="text-xs h-8 px-2.5"
            >
              {isBangla ? 'বাতিল করুন' : 'Cancel'}
            </Button>
          )}
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        title={isBangla ? 'অর্ডার বাতিলের নিশ্চিতকরণ' : 'Cancel Order Confirmation'}
        variant="center"
        className="max-w-md w-full"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-amber-600 text-xs bg-amber-50 dark:bg-amber-950/40 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
            <span>⚠️</span>
            <span>
              {isBangla
                ? 'অর্ডারটি বাতিল করলে আপনার সংরক্ষিত পণ্যের স্টক পুনরায় ফিরে আসবে।'
                : 'Cancelling this order will release the reserved stock back to the store.'}
            </span>
          </div>

          <div>
            <label className="text-xs font-medium text-foreground block mb-1">
              {isBangla ? 'বাতিলের কারণ লিখুন' : 'Reason for Cancellation'}
            </label>
            <Textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder={isBangla ? 'উদা: ভুলবশত অর্ডার দিয়েছি' : 'e.g. Placed order by mistake'}
              rows={2}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCancelModalOpen(false)}
            >
              {isBangla ? 'ফিরে যান' : 'Go Back'}
            </Button>
            <Button
              variant="danger"
              size="sm"
              isLoading={isCancelling}
              onClick={handleConfirmCancel}
            >
              {isBangla ? 'অর্ডার বাতিল করুন' : 'Confirm Cancel'}
            </Button>
          </div>
        </div>
      </Modal>
    </Card>
  );
}
