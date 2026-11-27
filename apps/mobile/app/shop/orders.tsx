import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useLocale } from '@pranora/i18n';
import { OrderHistoryCard } from '../../features/shop';
import { getMyOrders, cancelShopOrder } from '@pranora/api';
import type { ShopOrder } from '@pranora/validation';

export default function MobileShopOrdersScreen() {
  const router = useRouter();
  const { isBangla } = useLocale();
  const [orders, setOrders] = useState<ShopOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const mockUserId = 'u0000000-0000-0000-0000-000000000001';

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const data = await getMyOrders(null, mockUserId);
        if (mounted) setOrders(data);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    load();
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
    <View className="flex-1 bg-gray-50">
      {/* Top Header */}
      <View className="p-4 bg-white border-b border-gray-200 flex-row items-center justify-between">
        <TouchableOpacity onPress={() => router.back()} className="p-1">
          <Text className="text-sm font-bold text-gray-700">← {isBangla ? 'পেছনে' : 'Back'}</Text>
        </TouchableOpacity>
        <Text className="text-base font-bold text-gray-900">
          📦 {isBangla ? 'আমার অর্ডারসমূহ' : 'My Orders'}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Body */}
      <ScrollView className="flex-1 p-3">
        {isLoading ? (
          <View className="py-12 items-center">
            <ActivityIndicator size="small" color="#15803d" />
            <Text className="text-xs text-gray-500 mt-2">
              {isBangla ? 'অর্ডার লোড হচ্ছে...' : 'Loading orders...'}
            </Text>
          </View>
        ) : orders.length === 0 ? (
          <View className="py-16 items-center">
            <Text className="text-4xl mb-2">📦</Text>
            <Text className="text-base font-bold text-gray-800 mb-1">
              {isBangla ? 'কোনো অর্ডার পাওয়া যায়নি' : 'No orders found'}
            </Text>
            <Text className="text-xs text-gray-500 text-center px-6 mb-4">
              {isBangla
                ? 'আপনি এখনও কোনো অর্ডার করেননি। পেট শপ থেকে পছন্দের খাদ্য ও ওষুধ কিনুন।'
                : 'You have not placed any orders yet.'}
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/shop')}
              className="bg-green-600 px-4 py-2.5 rounded-xl"
            >
              <Text className="text-white font-bold text-xs">
                {isBangla ? 'শপিং করুন' : 'Start Shopping'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          orders.map((order) => (
            <OrderHistoryCard
              key={order.id}
              order={order}
              onCancelOrder={handleCancelOrder}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}
