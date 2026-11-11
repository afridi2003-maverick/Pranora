import { View, Text, TouchableOpacity } from 'react-native';

export default function HomeScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-green-50 p-6">
      <Text className="text-3xl font-bold text-primary mb-2 text-center">
        🐾 প্রাণোরা
      </Text>
      <Text className="text-base text-black/87 mb-8 text-center">
        আপনার পোষা প্রাণীর সম্পূর্ণ যত্ন, এক জায়গায়।
      </Text>

      <TouchableOpacity
        className="w-full py-4 rounded-xl bg-emergency items-center mb-4"
        activeOpacity={0.8}
      >
        <Text className="text-white text-lg font-bold">
          🚨 জরুরি সেবা / Emergency
        </Text>
      </TouchableOpacity>
    </View>
  );
}

