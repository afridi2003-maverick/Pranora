'use client';

import React, { useState } from 'react';
import { useLocale } from '@pranora/i18n';
import type { Product } from '@pranora/validation';
import { ProductCard } from './ProductCard';
import { CartDrawer } from './CartDrawer';
import { CheckoutModal } from './CheckoutModal';
import type { CartItem, CreateShopOrderInput } from '@pranora/validation';

interface ProductListProps {
  products: Product[];
  onPlaceOrder?: (orderInput: CreateShopOrderInput) => Promise<{
    order_id: string;
    order_code: string;
    total: number;
    payment_method: string;
  }>;
}

export function ProductList({ products, onPlaceOrder }: ProductListProps) {
  const { isBangla } = useLocale();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSpecies, setSelectedSpecies] = useState<'all' | 'dog' | 'cat'>('all');

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [_lastOrderCode, setLastOrderCode] = useState<string | null>(null);

  // Filter products
  const filteredProducts = products.filter((p) => {
    if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
    if (selectedSpecies !== 'all' && !p.species.includes(selectedSpecies)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchBn = p.name_bn.toLowerCase().includes(q) || (p.description_bn && p.description_bn.toLowerCase().includes(q));
      const matchEn = p.name_en.toLowerCase().includes(q) || (p.description_en && p.description_en.toLowerCase().includes(q));
      if (!matchBn && !matchEn) return false;
    }
    return true;
  });

  const categories: { id: string; labelBn: string; labelEn: string; icon: string }[] = [
    { id: 'all', labelBn: 'সকল পণ্য', labelEn: 'All Products', icon: '🐾' },
    { id: 'food', labelBn: 'খাবার', labelEn: 'Food', icon: '🍖' },
    { id: 'medicine', labelBn: 'ওষুধ', labelEn: 'Medicine', icon: '💊' },
    { id: 'accessories', labelBn: 'এক্সেসরিজ', labelEn: 'Accessories', icon: '🦮' },
    { id: 'toys', labelBn: 'খেলনা', labelEn: 'Toys', icon: '🎾' },
    { id: 'hygiene', labelBn: 'পরিচ্ছন্নতা', labelEn: 'Hygiene', icon: '🧴' },
  ];

  const handleAddToCart = (product: Product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const totalCartCount = cartItems.reduce((acc, it) => acc + it.quantity, 0);
  const totalCartPrice = cartItems.reduce((acc, it) => {
    const price = it.product.sale_price ?? it.product.price;
    return acc + price * it.quantity;
  }, 0);

  const handleConfirmOrder = async (orderInput: CreateShopOrderInput) => {
    if (onPlaceOrder) {
      return await onPlaceOrder(orderInput);
    }
    // Fallback demo order
    return {
      order_id: 'mock-ord-1',
      order_code: `PR-ORD-261127-${Math.floor(1000 + Math.random() * 9000)}`,
      total: orderInput.delivery_fee + totalCartPrice,
      payment_method: orderInput.payment_method,
    };
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters Bar */}
      <div className="bg-card border border-border/60 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search input */}
        <div className="relative w-full md:w-80">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">🔍</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isBangla ? 'খাবার, ওষুধ বা খেলনা খুঁজুন...' : 'Search pet food, toys, supplies...'}
            className="w-full pl-9 pr-3 py-2 text-sm bg-muted/40 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
          />
        </div>

        {/* Species selector buttons */}
        <div className="flex items-center gap-1.5 self-start md:self-auto">
          <button
            type="button"
            onClick={() => setSelectedSpecies('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              selectedSpecies === 'all'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted/60 text-muted-foreground hover:bg-muted'
            }`}
          >
            {isBangla ? 'সকল প্রাণী' : 'All Pets'}
          </button>
          <button
            type="button"
            onClick={() => setSelectedSpecies('dog')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 ${
              selectedSpecies === 'dog'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted/60 text-muted-foreground hover:bg-muted'
            }`}
          >
            🐶 {isBangla ? 'কুকুর' : 'Dog'}
          </button>
          <button
            type="button"
            onClick={() => setSelectedSpecies('cat')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 ${
              selectedSpecies === 'cat'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted/60 text-muted-foreground hover:bg-muted'
            }`}
          >
            🐱 {isBangla ? 'বিড়াল' : 'Cat'}
          </button>
        </div>
      </div>

      {/* Category Pills Slider */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              selectedCategory === cat.id
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-card border border-border/60 text-foreground hover:border-primary/50'
            }`}
          >
            <span>{cat.icon}</span>
            <span>{isBangla ? cat.labelBn : cat.labelEn}</span>
          </button>
        ))}
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-border rounded-2xl p-8">
          <div className="text-3xl mb-2">🔍</div>
          <h3 className="font-bold text-base text-foreground mb-1">
            {isBangla ? 'কোনো পণ্য খুঁজে পাওয়া যায়নি' : 'No products found'}
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {isBangla
              ? 'আপনার অনুসন্ধান শব্দ বা ফিল্টার পরিবর্তন করে পুনরায় চেষ্টা করুন।'
              : 'Try adjusting your search query or selected category.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredProducts.map((prod) => {
            const inCart = cartItems.find((it) => it.product.id === prod.id)?.quantity ?? 0;
            return (
              <ProductCard
                key={prod.id}
                product={prod}
                onAddToCart={handleAddToCart}
                cartQuantity={inCart}
              />
            );
          })}
        </div>
      )}

      {/* Floating Cart Trigger Pill */}
      {totalCartCount > 0 && (
        <div className="fixed bottom-6 right-6 z-40 animate-bounce-short">
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-3 bg-primary text-primary-foreground px-5 py-3 rounded-full shadow-lg hover:shadow-xl hover:bg-primary/95 transition-all"
          >
            <div className="relative">
              <span>🛍️</span>
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {totalCartCount}
              </span>
            </div>
            <div className="text-left">
              <div className="text-xs font-medium opacity-90">
                {isBangla ? 'কার্ট দেখুন' : 'View Cart'}
              </div>
              <div className="text-sm font-bold">
                ৳{totalCartPrice.toLocaleString('bn-BD')}
              </div>
            </div>
          </button>
        </div>
      )}

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cartItems}
        providerId={products[0]?.provider_id || 'c0000000-0000-0000-0000-000000000001'}
        onConfirmOrder={handleConfirmOrder}
        onOrderSuccess={(code) => {
          setLastOrderCode(code);
          setCartItems([]);
        }}
      />
    </div>
  );
}
