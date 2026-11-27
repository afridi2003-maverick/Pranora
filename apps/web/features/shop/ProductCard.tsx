'use client';

import React from 'react';
import { useLocale } from '@pranora/i18n';
import { Card, Button } from '@pranora/ui';
import type { Product } from '@pranora/validation';
interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  cartQuantity?: number;
}

export function ProductCard({ product, onAddToCart, cartQuantity = 0 }: ProductCardProps) {
  const { isBangla } = useLocale();

  const title = isBangla ? product.name_bn : product.name_en;
  const description = isBangla
    ? product.description_bn || product.description_en
    : product.description_en || product.description_bn;

  const currentPrice = product.sale_price ?? product.price;
  const hasDiscount = product.sale_price !== null && product.sale_price !== undefined && product.sale_price < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.sale_price!) / product.price) * 100)
    : 0;

  const categoryLabels: Record<string, { bn: string; en: string }> = {
    food: { bn: 'খাবার', en: 'Food' },
    medicine: { bn: 'ওষুধ', en: 'Medicine' },
    accessories: { bn: 'এক্সেসরিজ', en: 'Accessories' },
    toys: { bn: 'খেলনা', en: 'Toys' },
    hygiene: { bn: 'পরিচ্ছন্নতা', en: 'Hygiene' },
  };

  const isOutOfStock = product.stock <= 0;

  return (
    <Card className="flex flex-col h-full overflow-hidden border border-border/60 hover:shadow-md transition-shadow duration-200">
      {/* Image container */}
      <div className="relative aspect-square w-full bg-muted overflow-hidden">
        <img
          src={product.images[0] || 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=500&auto=format&fit=crop&q=60'}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 items-start">
          {hasDiscount && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
              {isBangla ? `${discountPercent}% ছাড়` : `${discountPercent}% OFF`}
            </span>
          )}
          {product.requires_prescription && (
            <span className="bg-amber-600 text-white text-xs font-medium px-2 py-0.5 rounded shadow-sm flex items-center gap-1">
              <span className="text-xs font-medium">⚠️ {isBangla ? 'প্রেসক্রিপশন আবশ্যক' : 'Rx Required'}</span>
            </span>
          )}
        </div>

        {/* Category Pill */}
        <div className="absolute bottom-2.5 left-2.5">
          <span className="bg-black/60 backdrop-blur-sm text-white text-[11px] font-medium px-2 py-0.5 rounded-md">
            {isBangla ? categoryLabels[product.category]?.bn : categoryLabels[product.category]?.en}
          </span>
        </div>
      </div>

      {/* Body content */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {product.species.map((sp) => (
            <span key={sp} className="bg-muted px-1.5 py-0.5 rounded capitalize">
              {sp === 'dog' ? (isBangla ? '🐶 কুকুর' : '🐶 Dog') : (isBangla ? '🐱 বিড়াল' : '🐱 Cat')}
            </span>
          ))}
          <span className="ml-auto text-[11px] flex items-center gap-1">
            {!isOutOfStock ? (
              <span className="text-emerald-600 font-medium flex items-center gap-0.5">
                ✅ {isBangla ? 'স্টকে আছে' : 'In Stock'}
              </span>
            ) : (
              <span className="text-red-500 font-medium">
                {isBangla ? 'স্টক শেষ' : 'Out of Stock'}
              </span>
            )}
          </span>
        </div>

        <h3 className="font-semibold text-base line-clamp-1 text-foreground" title={title}>
          {title}
        </h3>

        {description && (
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {description}
          </p>
        )}

        {/* Price & CTA section */}
        <div className="mt-auto pt-3 border-t border-border/40 flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold text-primary">
                ৳{currentPrice.toLocaleString('bn-BD')}
              </span>
              {hasDiscount && (
                <span className="text-xs line-through text-muted-foreground">
                  ৳{product.price.toLocaleString('bn-BD')}
                </span>
              )}
            </div>
          </div>

          <Button
            size="sm"
            variant={cartQuantity > 0 ? 'secondary' : 'primary'}
            disabled={isOutOfStock}
            onClick={() => onAddToCart(product)}
            className="gap-1.5"
          >
            <span>🛒</span>
            {cartQuantity > 0 ? (
              <span>{isBangla ? `কার্টে (${cartQuantity})` : `In Cart (${cartQuantity})`}</span>
            ) : (
              <span>{isBangla ? 'কিনুন' : 'Add'}</span>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}
