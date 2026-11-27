'use client';

import React, { useState } from 'react';
import { useLocale } from '@pranora/i18n';
import { Modal, Button, Input, Textarea } from '@pranora/ui';
import type { CartItem, CreateShopOrderInput } from '@pranora/validation';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  providerId: string;
  onConfirmOrder: (orderInput: CreateShopOrderInput) => Promise<{
    order_id: string;
    order_code: string;
    total: number;
    payment_method: string;
  }>;
  onOrderSuccess: (orderCode: string) => void;
}

export function CheckoutModal({
  isOpen,
  onClose,
  items,
  providerId,
  onConfirmOrder,
  onOrderSuccess,
}: CheckoutModalProps) {
  const { isBangla } = useLocale();

  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('01711000111');
  const [shippingAddress, setShippingAddress] = useState('House 12, Road 4, Dhanmondi, Dhaka');
  const [deliveryArea, setDeliveryArea] = useState<'dhaka' | 'outside'>('dhaka');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');
  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [createdOrderCode, setCreatedOrderCode] = useState<string | null>(null);

  const subtotal = items.reduce((acc, item) => {
    const price = item.product.sale_price ?? item.product.price;
    return acc + price * item.quantity;
  }, 0);

  const deliveryFee = deliveryArea === 'dhaka' ? 60 : 120;
  const total = subtotal + deliveryFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!phone || !phone.match(/^(\+?88)?01[3-9]\d{8}$/)) {
      setErrorMsg(isBangla ? 'সঠিক ১১ ডিজিটের ফোন নম্বর লিখুন' : 'Valid 11-digit phone number is required');
      return;
    }

    if (!shippingAddress || shippingAddress.trim().length < 5) {
      setErrorMsg(isBangla ? 'সম্পূর্ণ ডেলিভারি ঠিকানা লিখুন' : 'Complete delivery address is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const orderPayload: CreateShopOrderInput = {
        provider_id: providerId,
        shipping_address: `${shippingAddress} (${deliveryArea === 'dhaka' ? 'Inside Dhaka' : 'Outside Dhaka'})`,
        phone,
        items: items.map((it) => ({
          product_id: it.product.id,
          quantity: it.quantity,
        })),
        payment_method: paymentMethod,
        delivery_fee: deliveryFee,
        notes: notes.trim() || undefined,
      };

      const result = await onConfirmOrder(orderPayload);
      setCreatedOrderCode(result.order_code);
      onOrderSuccess(result.order_code);
    } catch (err: any) {
      setErrorMsg(err.message || (isBangla ? 'অর্ডার প্রক্রিয়া সম্পন্ন করতে ব্যর্থ হয়েছে' : 'Failed to place order'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = () => {
    if (createdOrderCode) setCreatedOrderCode(null);
    onClose();
  };

  // suppress unused warning — customerName shown in form
  void customerName;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleModalClose}
      title={
        createdOrderCode
          ? isBangla ? '🎉 অর্ডার সফল হয়েছে!' : '🎉 Order Successful!'
          : isBangla ? '📦 চেকআউট ও পেমেন্ট' : '📦 Checkout & Payment'
      }
      variant="center"
      className="max-w-xl w-full"
    >
      {createdOrderCode ? (
        <div className="py-6 flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-5xl">
            ✅
          </div>

          <div className="space-y-1">
            <h3 className="text-xl font-bold text-foreground">
              {isBangla ? 'আপনার অর্ডার সফলভাবে গ্রহণ করা হয়েছে!' : 'Your Order Has Been Placed!'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {isBangla ? 'ট্র্যাকিং কোড:' : 'Tracking Code:'}{' '}
              <span className="font-mono font-bold text-primary">{createdOrderCode}</span>
            </p>
          </div>

          <div className="bg-muted/40 border border-border/60 rounded-xl p-4 w-full text-left text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{isBangla ? 'পেমেন্ট পদ্ধতি:' : 'Payment Method:'}</span>
              <span className="font-semibold text-foreground">
                {paymentMethod === 'cash'
                  ? isBangla ? 'ক্যাশ অন ডেলিভারি (COD)' : 'Cash on Delivery (COD)'
                  : isBangla ? 'অনলাইন পেমেন্ট (SSLCommerz)' : 'Online Payment (SSLCommerz)'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{isBangla ? 'সর্বমোট প্রদেয়:' : 'Total Amount:'}</span>
              <span className="font-bold text-primary">৳{total.toLocaleString('bn-BD')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{isBangla ? 'ডেলিভারি ঠিকানা:' : 'Delivery Address:'}</span>
              <span className="font-medium text-foreground line-clamp-1">{shippingAddress}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{isBangla ? 'সম্ভাব্য ডেলিভারি:' : 'Estimated Delivery:'}</span>
              <span className="font-medium text-foreground">
                {deliveryArea === 'dhaka'
                  ? isBangla ? '১-২ কার্যদিবস' : '1-2 Business Days'
                  : isBangla ? '২-৪ কার্যদিবস' : '2-4 Business Days'}
              </span>
            </div>
          </div>

          <Button variant="primary" size="md" onClick={handleModalClose} className="w-full">
            {isBangla ? 'অর্ডার সমাপ্ত করুন' : 'Done'}
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          {errorMsg && (
            <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 text-xs p-3 rounded-lg">
              {errorMsg}
            </div>
          )}

          {/* Contact Details */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {isBangla ? '১. যোগাযোগ তথ্য' : '1. Contact Details'}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-foreground block mb-1">
                  {isBangla ? 'আপনার নাম' : 'Full Name'}
                </label>
                <Input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder={isBangla ? 'উদা: মাহির আহমেদ' : 'e.g. Mahir Ahmed'}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground block mb-1">
                  {isBangla ? 'মোবাইল নম্বর *' : 'Phone Number *'}
                </label>
                <Input
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="017XXXXXXXX"
                />
              </div>
            </div>
          </div>

          {/* Delivery Area & Address */}
          <div className="space-y-3 pt-2 border-t border-border/40">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {isBangla ? '২. ডেলিভারি এলাকা ও ঠিকানা' : '2. Delivery Area & Address'}
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <label
                className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer text-xs transition-all ${
                  deliveryArea === 'dhaka'
                    ? 'border-primary bg-primary/5 font-semibold text-foreground'
                    : 'border-border text-muted-foreground'
                }`}
              >
                <input
                  type="radio"
                  name="deliveryArea"
                  checked={deliveryArea === 'dhaka'}
                  onChange={() => setDeliveryArea('dhaka')}
                  className="accent-primary"
                />
                <span>🚚</span>
                <div>
                  <div className="text-foreground">{isBangla ? 'ঢাকা মেট্রো' : 'Inside Dhaka'}</div>
                  <div className="text-[11px] text-muted-foreground">৳৬০ (১-২ দিন)</div>
                </div>
              </label>

              <label
                className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer text-xs transition-all ${
                  deliveryArea === 'outside'
                    ? 'border-primary bg-primary/5 font-semibold text-foreground'
                    : 'border-border text-muted-foreground'
                }`}
              >
                <input
                  type="radio"
                  name="deliveryArea"
                  checked={deliveryArea === 'outside'}
                  onChange={() => setDeliveryArea('outside')}
                  className="accent-primary"
                />
                <span>🚚</span>
                <div>
                  <div className="text-foreground">{isBangla ? 'ঢাকার বাইরে' : 'Outside Dhaka'}</div>
                  <div className="text-[11px] text-muted-foreground">৳১২০ (২-৪ দিন)</div>
                </div>
              </label>
            </div>

            <div>
              <label className="text-xs font-medium text-foreground block mb-1">
                {isBangla ? 'সম্পূর্ণ ঠিকানা (বাসা, রোড, এলাকা) *' : 'Full Delivery Address *'}
              </label>
              <Textarea
                required
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                placeholder={isBangla ? 'বাসা/ফ্ল্যাট নং, রোড, থানা, জেলা' : 'House, Road, Area, District'}
                rows={2}
              />
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-3 pt-2 border-t border-border/40">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {isBangla ? '৩. পেমেন্ট পদ্ধতি' : '3. Payment Method'}
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer text-xs transition-all ${
                  paymentMethod === 'cash'
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-border hover:bg-muted/30'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === 'cash'}
                  onChange={() => setPaymentMethod('cash')}
                  className="mt-0.5 accent-primary"
                />
                <div className="flex-1">
                  <div className="font-semibold flex items-center gap-1.5 text-foreground">
                    <span>💵</span>
                    {isBangla ? 'ক্যাশ অন ডেলিভারি' : 'Cash on Delivery (COD)'}
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    {isBangla ? 'পণ্য হাতে পেয়ে মূল্য পরিশোধ করুন' : 'Pay when you receive the package'}
                  </div>
                </div>
              </label>

              <label
                className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer text-xs transition-all ${
                  paymentMethod === 'card'
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-border hover:bg-muted/30'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === 'card'}
                  onChange={() => setPaymentMethod('card')}
                  className="mt-0.5 accent-primary"
                />
                <div className="flex-1">
                  <div className="font-semibold flex items-center gap-1.5 text-foreground">
                    <span>💳</span>
                    {isBangla ? 'অনলাইন পেমেন্ট' : 'Online Payment'}
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    {isBangla ? 'বিকাশ, নগদ, রকেট বা ডেবিট/ক্রেডিট কার্ড' : 'bKash, Nagad, Rocket, or Cards'}
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Delivery Note */}
          <div>
            <label className="text-xs font-medium text-foreground block mb-1">
              {isBangla ? 'বিশেষ নোট / ডেলিভারি নির্দেশনা (ঐচ্ছিক)' : 'Delivery Notes (Optional)'}
            </label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={isBangla ? 'উদা: সন্ধ্যার পর ডেলিভারি দিন' : 'e.g. Please deliver after 5 PM'}
            />
          </div>

          {/* Summary */}
          <div className="bg-muted/40 rounded-xl p-3 border border-border/60 text-xs space-y-1.5">
            <div className="flex justify-between text-muted-foreground">
              <span>{isBangla ? `পণ্যসমূহ (${items.length}টি)` : `Items (${items.length})`}</span>
              <span>৳{subtotal.toLocaleString('bn-BD')}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>{isBangla ? 'ডেলিভারি ফি' : 'Delivery Fee'}</span>
              <span>৳{deliveryFee.toLocaleString('bn-BD')}</span>
            </div>
            <div className="flex justify-between font-bold text-sm text-foreground border-t border-border/40 pt-1.5">
              <span>{isBangla ? 'সর্বমোট' : 'Total Payable'}</span>
              <span className="text-primary">৳{total.toLocaleString('bn-BD')}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <Button type="button" variant="ghost" size="md" onClick={onClose} className="flex-1">
              {isBangla ? 'বাতিল' : 'Cancel'}
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSubmitting}
              className="flex-1 gap-1.5"
            >
              <span>{isBangla ? 'অর্ডার নিশ্চিত করুন' : 'Place Order'} →</span>
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
