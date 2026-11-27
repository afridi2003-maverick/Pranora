import React from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useLocale } from '@pranora/i18n';
import type { CartItem } from '@pranora/validation';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onProceedToCheckout: () => void;
}

export function CartModal({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
}: CartModalProps) {
  const { isBangla } = useLocale();

  const subtotal = items.reduce((acc, item) => {
    const price = item.product.sale_price ?? item.product.price;
    return acc + price * item.quantity;
  }, 0);

  const deliveryFee = items.length > 0 ? 60 : 0;
  const total = subtotal + deliveryFee;

  return (
    <Modal visible={isOpen} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-white rounded-t-3xl p-5 max-h-[85%] flex-col">
          {/* Header */}
          <View className="flex-row items-center justify-between pb-3 border-b border-gray-200">
            <Text className="text-lg font-bold text-gray-900">
              {isBangla ? '🛒 শপিং কার্ট' : '🛒 Shopping Cart'}
            </Text>
            <TouchableOpacity onPress={onClose} className="p-1">
              <Text className="text-gray-500 font-bold text-base">✕</Text>
            </TouchableOpacity>
          </View>

          {/* Body */}
          {items.length === 0 ? (
            <View className="py-12 items-center justify-center">
              <Text className="text-4xl mb-2">🛍️</Text>
              <Text className="text-base font-bold text-gray-800 mb-1">
                {isBangla ? 'আপনার কার্ট খালি' : 'Your cart is empty'}
              </Text>
              <Text className="text-xs text-gray-500 text-center px-4">
                {isBangla
                  ? 'পোষা প্রাণীর খাদ্য, ওষুধ বা খেলনা কার্টে যোগ করে অর্ডার করুন।'
                  : 'Add pet items to your cart to place an order.'}
              </Text>
            </View>
          ) : (
            <ScrollView className="divide-y divide-gray-100 my-2">
              {items.map((item) => {
                const prod = item.product;
                const unitPrice = prod.sale_price ?? prod.price;
                const title = isBangla ? prod.name_bn : prod.name_en;

                return (
                  <View key={prod.id} className="py-3 flex-row items-center gap-3">
                    <Image
                      source={{
                        uri: prod.images[0] || 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=500',
                      }}
                      className="w-14 h-14 rounded-lg bg-gray-100"
                      resizeMode="cover"
                    />

                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-gray-900" numberOfLines={1}>
                        {title}
                      </Text>
                      <Text className="text-xs text-green-700 font-bold mt-0.5">
                        ৳{unitPrice.toLocaleString('bn-BD')}
                      </Text>

                      <View className="flex-row items-center justify-between mt-2">
                        {/* Stepper */}
                        <View className="flex-row items-center border border-gray-300 rounded-md">
                          <TouchableOpacity
                            onPress={() => onUpdateQuantity(prod.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="px-2.5 py-1"
                          >
                            <Text className="text-gray-600 font-bold">-</Text>
                          </TouchableOpacity>
                          <Text className="px-2 text-xs font-bold text-gray-800">
                            {item.quantity}
                          </Text>
                          <TouchableOpacity
                            onPress={() => onUpdateQuantity(prod.id, item.quantity + 1)}
                            disabled={item.quantity >= prod.stock}
                            className="px-2.5 py-1"
                          >
                            <Text className="text-gray-600 font-bold">+</Text>
                          </TouchableOpacity>
                        </View>

                        <Text className="text-xs font-bold text-gray-900">
                          ৳{(unitPrice * item.quantity).toLocaleString('bn-BD')}
                        </Text>

                        <TouchableOpacity
                          onPress={() => onRemoveItem(prod.id)}
                          className="p-1"
                        >
                          <Text className="text-red-500 font-semibold text-xs">🗑️</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          )}

          {/* Footer */}
          {items.length > 0 && (
            <View className="pt-3 border-t border-gray-200">
              <View className="flex-row justify-between mb-1">
                <Text className="text-xs text-gray-500">{isBangla ? 'সাবটোটাল' : 'Subtotal'}</Text>
                <Text className="text-xs font-medium text-gray-700">৳{subtotal.toLocaleString('bn-BD')}</Text>
              </View>
              <View className="flex-row justify-between mb-1">
                <Text className="text-xs text-gray-500">{isBangla ? 'ডেলিভারি ফি' : 'Delivery Fee'}</Text>
                <Text className="text-xs font-medium text-gray-700">৳{deliveryFee.toLocaleString('bn-BD')}</Text>
              </View>
              <View className="flex-row justify-between mb-3 pt-1 border-t border-gray-100">
                <Text className="text-sm font-bold text-gray-900">{isBangla ? 'সর্বমোট' : 'Total'}</Text>
                <Text className="text-base font-extrabold text-green-700">৳{total.toLocaleString('bn-BD')}</Text>
              </View>

              <TouchableOpacity
                onPress={onProceedToCheckout}
                className="bg-green-600 py-3 rounded-xl items-center shadow-sm"
                activeOpacity={0.85}
              >
                <Text className="text-white font-bold text-sm">
                  {isBangla ? 'অর্ডার করতে এগিয়ে যান →' : 'Proceed to Checkout →'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}
