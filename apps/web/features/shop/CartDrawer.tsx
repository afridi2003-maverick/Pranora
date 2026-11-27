'use client';

import React from 'react';
import { useLocale } from '@pranora/i18n';
import { Modal, Button } from '@pranora/ui';
import type { CartItem } from '@pranora/validation';
interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onProceedToCheckout: () => void;
}

export function CartDrawer({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
}: CartDrawerProps) {
  const { isBangla } = useLocale();

  const subtotal = items.reduce((acc, item) => {
    const price = item.product.sale_price ?? item.product.price;
    return acc + price * item.quantity;
  }, 0);

  const deliveryFee = items.length > 0 ? 60 : 0;
  const total = subtotal + deliveryFee;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isBangla ? '🛒 শপিং কার্ট' : '🛒 Shopping Cart'}
      variant="center"
      className="max-w-lg w-full"
    >
      <div className="flex flex-col max-h-[75vh]">
        {items.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center gap-3">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
              <span className="text-3xl">🛍️</span>
            </div>
            <p className="font-medium text-base text-foreground">
              {isBangla ? 'আপনার কার্ট খালি' : 'Your cart is empty'}
            </p>
            <p className="text-xs text-muted-foreground max-w-xs">
              {isBangla
                ? 'পোষা প্রাণীর প্রিয় খাবার, ওষুধ ও খেলনা কার্টে যোগ করে অর্ডার করুন।'
                : 'Browse pet food, supplies, and accessories to add items to your cart.'}
            </p>
            <Button size="sm" variant="primary" onClick={onClose} className="mt-2">
              {isBangla ? 'শপিং শুরু করুন' : 'Start Shopping'}
            </Button>
          </div>
        ) : (
          <>
            {/* Items list */}
            <div className="flex-1 overflow-y-auto divide-y divide-border/40 pr-1 -mr-1">
              {items.map((item) => {
                const prod = item.product;
                const unitPrice = prod.sale_price ?? prod.price;
                const title = isBangla ? prod.name_bn : prod.name_en;

                return (
                  <div key={prod.id} className="py-3 flex gap-3 items-center">
                    <img
                      src={prod.images[0] || 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=500&auto=format&fit=crop&q=60'}
                      alt={title}
                      className="w-16 h-16 rounded-lg object-cover bg-muted shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm text-foreground line-clamp-1">
                        {title}
                      </h4>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="text-xs font-semibold text-primary">
                          ৳{unitPrice.toLocaleString('bn-BD')}
                        </span>
                        {prod.sale_price && (
                          <span className="text-[11px] line-through text-muted-foreground">
                            ৳{prod.price.toLocaleString('bn-BD')}
                          </span>
                        )}
                      </div>

                      {/* Stepper controls */}
                      <div className="flex items-center gap-2 mt-2">
                        <div className="inline-flex items-center border border-border rounded-md bg-muted/30">
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(prod.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-40"
                          >
                            <span className="text-xs font-bold">−</span>
                          </button>
                          <span className="px-2 text-xs font-bold text-foreground min-w-[24px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(prod.id, item.quantity + 1)}
                            disabled={item.quantity >= prod.stock}
                            className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-40"
                          >
                            <span className="text-xs font-bold">+</span>
                          </button>
                        </div>

                        <span className="text-xs font-bold text-foreground ml-auto">
                          ৳{(unitPrice * item.quantity).toLocaleString('bn-BD')}
                        </span>

                        <button
                          type="button"
                          onClick={() => onRemoveItem(prod.id)}
                          className="p-1 text-red-500 hover:text-red-700 transition-colors ml-1"
                          title={isBangla ? 'মুছে ফেলুন' : 'Remove item'}
                        >
                          <span>🗑️</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Price breakdown and footer CTA */}
            <div className="mt-4 pt-4 border-t border-border/60 flex flex-col gap-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{isBangla ? 'সাবটোটাল' : 'Subtotal'}</span>
                <span>৳{subtotal.toLocaleString('bn-BD')}</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{isBangla ? 'হোম ডেলিভারি ফি (ঢাকা)' : 'Home Delivery Fee (Dhaka)'}</span>
                <span>৳{deliveryFee.toLocaleString('bn-BD')}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-foreground border-t border-border/40 pt-2">
                <span>{isBangla ? 'সর্বমোট' : 'Total'}</span>
                <span className="text-primary">৳{total.toLocaleString('bn-BD')}</span>
              </div>

              <div className="flex items-center gap-2 mt-3">
                <Button variant="ghost" size="md" onClick={onClose} className="flex-1">
                  {isBangla ? 'আরো পণ্য দেখুন' : 'Continue Shopping'}
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={onProceedToCheckout}
                  className="flex-1 gap-1.5"
                >
                  <span>{isBangla ? 'অর্ডার করুন' : 'Checkout'}</span>
                  <span>→</span>
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
