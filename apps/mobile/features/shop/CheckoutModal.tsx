import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import { useLocale } from '@pranora/i18n';
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

  const [phone, setPhone] = useState('01711000111');
  const [shippingAddress, setShippingAddress] = useState('House 12, Road 4, Dhanmondi, Dhaka');
  const [deliveryArea, setDeliveryArea] = useState<'dhaka' | 'outside'>('dhaka');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');
  const [notes, _setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [createdOrderCode, setCreatedOrderCode] = useState<string | null>(null);

  const subtotal = items.reduce((acc, item) => {
    const price = item.product.sale_price ?? item.product.price;
    return acc + price * item.quantity;
  }, 0);

  const deliveryFee = deliveryArea === 'dhaka' ? 60 : 120;
  const total = subtotal + deliveryFee;

  const handleSubmit = async () => {
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

  const handleClose = () => {
    if (createdOrderCode) {
      setCreatedOrderCode(null);
    }
    onClose();
  };

  return (
    <Modal visible={isOpen} animationType="slide" transparent={true} onRequestClose={handleClose}>
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-white rounded-t-3xl p-5 max-h-[90%] flex-col">
          {/* Header */}
          <View className="flex-row items-center justify-between pb-3 border-b border-gray-200">
            <Text className="text-lg font-bold text-gray-900">
              {createdOrderCode
                ? isBangla
                  ? '🎉 অর্ডার সফল!'
                  : '🎉 Order Successful!'
                : isBangla
                ? '📦 চেকআউট ও পেমেন্ট'
                : '📦 Checkout & Payment'}
            </Text>
            <TouchableOpacity onPress={handleClose} className="p-1">
              <Text className="text-gray-500 font-bold text-base">✕</Text>
            </TouchableOpacity>
          </View>

          {createdOrderCode ? (
            <View className="py-6 items-center">
              <Text className="text-4xl mb-2">✅</Text>
              <Text className="text-lg font-bold text-gray-900 mb-1">
                {isBangla ? 'আপনার অর্ডার গ্রহণ করা হয়েছে!' : 'Your Order is Placed!'}
              </Text>
              <Text className="text-xs text-gray-500 mb-4">
                {isBangla ? 'অর্ডার ট্র্যাকিং কোড:' : 'Order Code:'}{' '}
                <Text className="font-bold text-green-700">{createdOrderCode}</Text>
              </Text>

              <View className="w-full bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-2 mb-6">
                <View className="flex-row justify-between">
                  <Text className="text-xs text-gray-500">{isBangla ? 'পেমেন্ট পদ্ধতি:' : 'Payment:'}</Text>
                  <Text className="text-xs font-semibold text-gray-900">
                    {paymentMethod === 'cash' ? 'Cash on Delivery (COD)' : 'Online Payment'}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-xs text-gray-500">{isBangla ? 'সর্বমোট মূল্য:' : 'Total Amount:'}</Text>
                  <Text className="text-xs font-bold text-green-700">৳{total.toLocaleString('bn-BD')}</Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={handleClose}
                className="w-full bg-green-600 py-3 rounded-xl items-center"
              >
                <Text className="text-white font-bold text-sm">
                  {isBangla ? 'সমাপ্ত করুন' : 'Done'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView className="py-3">
              {errorMsg && (
                <View className="bg-red-50 p-2.5 rounded-lg border border-red-200 mb-3">
                  <Text className="text-red-600 text-xs">{errorMsg}</Text>
                </View>
              )}

              {/* Contact */}
              <Text className="text-xs font-bold text-gray-500 uppercase mb-2">
                {isBangla ? '১. যোগাযোগ নম্বর' : '1. Contact Info'}
              </Text>
              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder="017XXXXXXXX"
                keyboardType="phone-pad"
                className="border border-gray-300 rounded-xl px-3 py-2 text-sm text-gray-900 mb-3"
              />

              {/* Delivery Area */}
              <Text className="text-xs font-bold text-gray-500 uppercase mb-2">
                {isBangla ? '২. ডেলিভারি এলাকা' : '2. Delivery Area'}
              </Text>
              <View className="flex-row gap-2 mb-3">
                <TouchableOpacity
                  onPress={() => setDeliveryArea('dhaka')}
                  className={`flex-1 p-2.5 rounded-xl border ${
                    deliveryArea === 'dhaka'
                      ? 'border-green-600 bg-green-50'
                      : 'border-gray-300'
                  }`}
                >
                  <Text className="text-xs font-bold text-gray-800">
                    {isBangla ? 'ঢাকা মেট্রো' : 'Dhaka Metro'}
                  </Text>
                  <Text className="text-[10px] text-gray-500">৳৬০ (১-২ দিন)</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setDeliveryArea('outside')}
                  className={`flex-1 p-2.5 rounded-xl border ${
                    deliveryArea === 'outside'
                      ? 'border-green-600 bg-green-50'
                      : 'border-gray-300'
                  }`}
                >
                  <Text className="text-xs font-bold text-gray-800">
                    {isBangla ? 'ঢাকার বাইরে' : 'Outside Dhaka'}
                  </Text>
                  <Text className="text-[10px] text-gray-500">৳১২০ (২-৪ দিন)</Text>
                </TouchableOpacity>
              </View>

              <Text className="text-xs font-bold text-gray-500 uppercase mb-1">
                {isBangla ? 'ডেলিভারি ঠিকানা' : 'Delivery Address'}
              </Text>
              <TextInput
                value={shippingAddress}
                onChangeText={setShippingAddress}
                placeholder={isBangla ? 'বাসা, রোড, থানা, জেলা' : 'House, Road, Area, District'}
                multiline
                numberOfLines={2}
                className="border border-gray-300 rounded-xl px-3 py-2 text-sm text-gray-900 mb-3"
              />

              {/* Payment Method */}
              <Text className="text-xs font-bold text-gray-500 uppercase mb-2">
                {isBangla ? '৩. পেমেন্ট পদ্ধতি' : '3. Payment Method'}
              </Text>
              <View className="flex-row gap-2 mb-3">
                <TouchableOpacity
                  onPress={() => setPaymentMethod('cash')}
                  className={`flex-1 p-2.5 rounded-xl border ${
                    paymentMethod === 'cash'
                      ? 'border-green-600 bg-green-50'
                      : 'border-gray-300'
                  }`}
                >
                  <Text className="text-xs font-bold text-gray-800">
                    💵 {isBangla ? 'ক্যাশ অন ডেলিভারি' : 'Cash on Delivery'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setPaymentMethod('card')}
                  className={`flex-1 p-2.5 rounded-xl border ${
                    paymentMethod === 'card'
                      ? 'border-green-600 bg-green-50'
                      : 'border-gray-300'
                  }`}
                >
                  <Text className="text-xs font-bold text-gray-800">
                    💳 {isBangla ? 'অনলাইন পেমেন্ট' : 'Online Payment'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Summary */}
              <View className="bg-gray-50 p-3 rounded-xl border border-gray-200 mb-4">
                <View className="flex-row justify-between mb-1">
                  <Text className="text-xs text-gray-500">{isBangla ? 'সাবটোটাল' : 'Subtotal'}</Text>
                  <Text className="text-xs font-medium text-gray-800">৳{subtotal.toLocaleString('bn-BD')}</Text>
                </View>
                <View className="flex-row justify-between mb-1">
                  <Text className="text-xs text-gray-500">{isBangla ? 'ডেলিভারি ফি' : 'Delivery Fee'}</Text>
                  <Text className="text-xs font-medium text-gray-800">৳{deliveryFee.toLocaleString('bn-BD')}</Text>
                </View>
                <View className="flex-row justify-between pt-1 border-t border-gray-200">
                  <Text className="text-sm font-bold text-gray-900">{isBangla ? 'সর্বমোট' : 'Total'}</Text>
                  <Text className="text-base font-extrabold text-green-700">৳{total.toLocaleString('bn-BD')}</Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={handleSubmit}
                disabled={isSubmitting}
                className="bg-green-600 py-3.5 rounded-xl items-center mb-6"
                activeOpacity={0.85}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <Text className="text-white font-bold text-sm">
                    {isBangla ? 'অর্ডার নিশ্চিত করুন' : 'Confirm Order'}
                  </Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}
