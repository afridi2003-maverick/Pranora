import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useLocale } from '@pranora/i18n';
import type { Product, CartItem, CreateShopOrderInput } from '@pranora/validation';
import { ProductCard } from './ProductCard';
import { CartModal } from './CartModal';
import { CheckoutModal } from './CheckoutModal';

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
  const [selectedSpecies, _setSelectedSpecies] = useState<'all' | 'dog' | 'cat'>('all');

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const categories = [
    { id: 'all', labelBn: 'সকল', labelEn: 'All' },
    { id: 'food', labelBn: 'খাবার', labelEn: 'Food' },
    { id: 'medicine', labelBn: 'ওষুধ', labelEn: 'Medicine' },
    { id: 'accessories', labelBn: 'এক্সেসরিজ', labelEn: 'Accessories' },
    { id: 'toys', labelBn: 'খেলনা', labelEn: 'Toys' },
    { id: 'hygiene', labelBn: 'পরিচ্ছন্নতা', labelEn: 'Hygiene' },
  ];

  const filteredProducts = products.filter((p) => {
    if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
    if (selectedSpecies !== 'all' && !p.species.includes(selectedSpecies)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchBn = p.name_bn.toLowerCase().includes(q);
      const matchEn = p.name_en.toLowerCase().includes(q);
      if (!matchBn && !matchEn) return false;
    }
    return true;
  });

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
      setCartItems((prev) => prev.filter((it) => it.product.id !== productId));
      return;
    }
    setCartItems((prev) =>
      prev.map((it) =>
        it.product.id === productId ? { ...it, quantity } : it
      )
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCartItems((prev) => prev.filter((it) => it.product.id !== productId));
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
    return {
      order_id: 'mock-ord-mobile',
      order_code: `PR-ORD-261127-${Math.floor(1000 + Math.random() * 9000)}`,
      total: orderInput.delivery_fee + totalCartPrice,
      payment_method: orderInput.payment_method,
    };
  };

  return (
    <View className="flex-1">
      {/* Search Bar */}
      <View className="bg-white p-3 rounded-2xl border border-gray-200 mb-3">
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={isBangla ? 'খাবার, ওষুধ বা খেলনা খুঁজুন...' : 'Search pet food, supplies...'}
          className="text-sm text-gray-900"
        />
      </View>

      {/* Category Horizontal Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
        <View className="flex-row gap-2">
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              onPress={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl border ${
                selectedCategory === cat.id
                  ? 'bg-green-600 border-green-600'
                  : 'bg-white border-gray-200'
              }`}
            >
              <Text
                className={`text-xs font-bold ${
                  selectedCategory === cat.id ? 'text-white' : 'text-gray-700'
                }`}
              >
                {isBangla ? cat.labelBn : cat.labelEn}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Products list */}
      <ScrollView className="flex-1">
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
      </ScrollView>

      {/* Cart button footer */}
      {totalCartCount > 0 && (
        <View className="pt-2">
          <TouchableOpacity
            onPress={() => setIsCartOpen(true)}
            className="bg-green-600 py-3.5 px-4 rounded-2xl flex-row items-center justify-between shadow-md"
            activeOpacity={0.85}
          >
            <View className="flex-row items-center gap-2">
              <Text className="text-white font-bold text-sm">🛒 {totalCartCount} Items</Text>
            </View>
            <Text className="text-white font-extrabold text-sm">
              ৳{totalCartPrice.toLocaleString('bn-BD')} →
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Cart Modal */}
      <CartModal
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
        onOrderSuccess={() => {
          setCartItems([]);
        }}
      />
    </View>
  );
}
