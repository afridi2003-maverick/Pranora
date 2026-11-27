import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useLocale } from '@pranora/i18n';
import { ProductList } from '../../features/shop';
import { getProducts, createShopOrder } from '@pranora/api';
import type { Product, CreateShopOrderInput } from '@pranora/validation';

export default function MobileShopScreen() {
  const router = useRouter();
  const { isBangla } = useLocale();
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
    <View className="flex-1 bg-gray-50">
      {/* Top Header */}
      <View className="p-4 bg-green-700 flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-white text-lg font-extrabold">
            🛍️ {isBangla ? 'প্রাণোরা পেট শপ' : 'Pranora Pet Shop'}
          </Text>
          <Text className="text-green-100 text-xs mt-0.5">
            {isBangla ? 'খাবার, ওষুধ ও সামগ্রী হোম ডেলিভারি' : 'Pet food & care home delivered'}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => router.push('/shop/orders')}
          className="bg-white/20 px-3 py-1.5 rounded-xl border border-white/30"
          activeOpacity={0.8}
        >
          <Text className="text-white text-xs font-bold">
            📦 {isBangla ? 'আমার অর্ডার' : 'My Orders'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View className="flex-1 p-3">
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#15803d" />
            <Text className="text-xs text-gray-500 mt-2">
              {isBangla ? 'পণ্য লোড হচ্ছে...' : 'Loading catalog...'}
            </Text>
          </View>
        ) : (
          <ProductList products={products} onPlaceOrder={handlePlaceOrder} />
        )}
      </View>
    </View>
  );
}
