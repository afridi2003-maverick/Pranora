import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useLocale } from '@pranora/i18n';
import type { ShopOrder } from '@pranora/validation';

interface OrderHistoryCardProps {
  order: ShopOrder;
  onCancelOrder?: (orderId: string, reason: string) => Promise<void>;
}

export function OrderHistoryCard({ order, onCancelOrder }: OrderHistoryCardProps) {
  const { isBangla } = useLocale();

  const statusLabel: Record<string, { bn: string; en: string; color: string }> = {
    placed: { bn: 'গৃহীত হয়েছে', en: 'Placed', color: 'bg-blue-100 text-blue-700' },
    confirmed: { bn: 'নিশ্চিত হয়েছে', en: 'Confirmed', color: 'bg-amber-100 text-amber-700' },
    shipped: { bn: 'পথে আছে', en: 'Shipped', color: 'bg-purple-100 text-purple-700' },
    delivered: { bn: 'ডেলিভারি সম্পন্ন', en: 'Delivered', color: 'bg-green-100 text-green-700' },
    cancelled: { bn: 'বাতিলকৃত', en: 'Cancelled', color: 'bg-red-100 text-red-700' },
    returned: { bn: 'ফেরত', en: 'Returned', color: 'bg-gray-100 text-gray-700' },
  };

  const st = statusLabel[order.status] ?? statusLabel['placed'] ?? { bn: 'গৃহীত', en: 'Placed', color: 'bg-blue-100 text-blue-700' };
  const canCancel = ['placed', 'confirmed'].includes(order.status) && onCancelOrder;

  return (
    <View className="bg-white rounded-2xl border border-gray-200 p-4 mb-3 shadow-sm">
      <View className="flex-row items-center justify-between pb-2 border-b border-gray-100">
        <View className="flex-row items-center gap-1.5">
          <Text className="text-base">📦</Text>
          <Text className="font-mono font-bold text-xs text-gray-900">{order.code}</Text>
        </View>
        <View className={`px-2 py-0.5 rounded-full ${st.color.split(' ')[0]}`}>
          <Text className={`text-[11px] font-bold ${st.color.split(' ')[1]}`}>
            {isBangla ? st.bn : st.en}
          </Text>
        </View>
      </View>

      {/* Items */}
      <View className="py-2">
        {order.items?.map((it) => (
          <View key={it.id} className="flex-row justify-between py-1">
            <Text className="text-xs text-gray-700 max-w-[70%]" numberOfLines={1}>
              {it.product
                ? isBangla
                  ? it.product.name_bn
                  : it.product.name_en
                : 'Item'}{' '}
              × {it.quantity}
            </Text>
            <Text className="text-xs font-semibold text-gray-900">
              ৳{(it.unit_price * it.quantity).toLocaleString('bn-BD')}
            </Text>
          </View>
        ))}
      </View>

      {/* Footer */}
      <View className="flex-row items-center justify-between pt-2 border-t border-gray-100 mt-1">
        <View>
          <Text className="text-[11px] text-gray-400">
            {order.payment_method.toUpperCase()} •{' '}
            {order.payment_status === 'paid' ? 'Paid' : 'Pending'}
          </Text>
        </View>

        <View className="flex-row items-center gap-2">
          <Text className="text-sm font-extrabold text-green-700">
            ৳{order.total.toLocaleString('bn-BD')}
          </Text>

          {canCancel && (
            <TouchableOpacity
              onPress={() => onCancelOrder(order.id, 'Cancelled from mobile app')}
              className="bg-red-50 border border-red-300 px-2.5 py-1 rounded-md"
            >
              <Text className="text-red-600 text-[11px] font-bold">
                {isBangla ? 'বাতিল' : 'Cancel'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}
