import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useLocale } from '@pranora/i18n';
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

  const isOutOfStock = product.stock <= 0;

  const photo = product.images[0] || 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=500';

  return (
    <View className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-3 shadow-sm">
      {/* Image & Badges */}
      <View className="relative w-full h-36 bg-gray-100">
        <Image source={{ uri: photo }} className="w-full h-full" resizeMode="cover" />

        <View className="absolute top-2 left-2 flex-col gap-1 items-start">
          {hasDiscount && (
            <View className="bg-red-500 px-2 py-0.5 rounded-full">
              <Text className="text-white text-[10px] font-bold">
                {isBangla ? `${discountPercent}% ছাড়` : `${discountPercent}% OFF`}
              </Text>
            </View>
          )}
          {product.requires_prescription && (
            <View className="bg-amber-600 px-2 py-0.5 rounded">
              <Text className="text-white text-[10px] font-medium">
                {isBangla ? 'প্রেসক্রিপশন আবশ্যক' : 'Rx Required'}
              </Text>
            </View>
          )}
        </View>

        <View className="absolute bottom-2 left-2 bg-black/60 px-2 py-0.5 rounded">
          <Text className="text-white text-[10px] font-medium capitalize">
            {product.category}
          </Text>
        </View>
      </View>

      {/* Details */}
      <View className="p-3">
        <View className="flex-row items-center justify-between mb-1">
          <Text className="text-[11px] text-gray-500 font-medium">
            {product.species.map((s) => (s === 'dog' ? '🐶 Dog' : '🐱 Cat')).join(', ')}
          </Text>
          <Text
            className={`text-[11px] font-semibold ${
              !isOutOfStock ? 'text-green-600' : 'text-red-500'
            }`}
          >
            {!isOutOfStock ? (isBangla ? 'স্টকে আছে' : 'In Stock') : (isBangla ? 'স্টক শেষ' : 'Out of Stock')}
          </Text>
        </View>

        <Text className="font-bold text-sm text-gray-900 mb-1" numberOfLines={1}>
          {title}
        </Text>

        {description ? (
          <Text className="text-xs text-gray-500 mb-2 leading-4" numberOfLines={2}>
            {description}
          </Text>
        ) : null}

        {/* Pricing & Add Button */}
        <View className="flex-row items-center justify-between pt-2 border-t border-gray-100 mt-1">
          <View className="flex-row items-baseline gap-1">
            <Text className="text-base font-extrabold text-green-700">
              ৳{currentPrice.toLocaleString('bn-BD')}
            </Text>
            {hasDiscount && (
              <Text className="text-xs text-gray-400 line-through">
                ৳{product.price.toLocaleString('bn-BD')}
              </Text>
            )}
          </View>

          <TouchableOpacity
            onPress={() => onAddToCart(product)}
            disabled={isOutOfStock}
            className={`px-3 py-1.5 rounded-lg flex-row items-center gap-1 ${
              isOutOfStock
                ? 'bg-gray-200'
                : cartQuantity > 0
                ? 'bg-green-100 border border-green-600'
                : 'bg-green-600'
            }`}
            activeOpacity={0.8}
          >
            <Text
              className={`text-xs font-bold ${
                isOutOfStock
                  ? 'text-gray-400'
                  : cartQuantity > 0
                  ? 'text-green-800'
                  : 'text-white'
              }`}
            >
              {cartQuantity > 0
                ? isBangla
                  ? `কার্টে (${cartQuantity})`
                  : `In Cart (${cartQuantity})`
                : isBangla
                ? 'কিনুন'
                : 'Add'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
