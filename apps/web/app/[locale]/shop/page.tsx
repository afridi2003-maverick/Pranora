'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLocale } from '@pranora/i18n';
import { Button } from '@pranora/ui';
import { ProductList } from '../../../features/shop';
import { getProducts, createShopOrder } from '@pranora/api';
import type { Product, CreateShopOrderInput } from '@pranora/validation';

export default function ShopCatalogPage() {
  const { locale, isBangla } = useLocale();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const data = await getProducts(null);
        if (mounted) setProducts(data);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const handlePlaceOrder = async (orderInput: CreateShopOrderInput) => {
    return await createShopOrder(null, orderInput);
  };

  return (
    <div className="min-h-screen bg-neutral-50/50 dark:bg-neutral-950/50 text-foreground py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl p-6 sm:p-10 text-white shadow-md relative overflow-hidden">
          <div className="relative z-10 max-w-xl space-y-3">
            <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold">
              <span>🛍️</span>
              <span>{isBangla ? 'প্রাণোরা পেট শপ' : 'Pranora Pet Shop'}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              {isBangla
                ? 'পোষা প্রাণীর সেরা খাবার, ওষুধ ও যত্ন'
                : 'Premium Pet Food, Care & Supplies'}
            </h1>
            <p className="text-sm sm:text-base text-emerald-50 leading-relaxed">
              {isBangla
                ? 'ভেটেরিনারি অনুমোদিত খাদ্য ও ওষুধ সরাসরি আপনার দরজায়। ঢাকা সহ সারাদেশে দ্রুত হোম ডেলিভারি ও ক্যাশ অন ডেলিভারি সুবিধা।'
                : 'Veterinarian verified nutrition, healthcare essentials and toys delivered right to your doorstep across Bangladesh with COD.'}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link href={`/${locale}/shop/orders`}>
                <Button variant="secondary" size="sm" className="bg-white/10 text-white border-white/40 hover:bg-white/20">
                  <span className="mr-1.5">📦</span>
                  {isBangla ? 'আমার অর্ডারসমূহ' : 'My Orders'}
                </Button>
              </Link>
            </div>
          </div>

          {/* Value props badges */}
          <div className="mt-8 pt-6 border-t border-white/20 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span>🚚</span>
              <span>{isBangla ? 'দ্রুত হোম ডেলিভারি (১-২ দিন)' : 'Fast Home Delivery (1-2 days)'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>✅</span>
              <span>{isBangla ? '১০০% অরিজিনাল পণ্য' : '100% Genuine Products'}</span>
            </div>
            <div className="flex items-center gap-2 col-span-2 sm:col-span-1">
              <span>❤️</span>
              <span>{isBangla ? 'ক্যাশ অন ডেলিভারি ও বিকাশ' : 'Cash on Delivery & bKash'}</span>
            </div>
          </div>
        </div>

        {/* Product Catalog */}
        <section>
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-80 rounded-2xl bg-muted/60 animate-pulse" />
              ))}
            </div>
          ) : (
            <ProductList products={products} onPlaceOrder={handlePlaceOrder} />
          )}
        </section>
      </div>
    </div>
  );
}
