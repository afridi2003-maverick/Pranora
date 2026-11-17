import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useLocale } from '@pranora/i18n';
import { normalizeBdPhone } from '@pranora/api';
import { phoneSchema, emailSchema } from '@pranora/validation';

export default function MobileLoginScreen() {
  const { isBangla, toggleLocale } = useLocale();
  const [activeTab, setActiveTab] = useState<'phone' | 'email'>('phone');

  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [otpToken, setOtpToken] = useState('');

  const [step, setStep] = useState<'input' | 'verify'>('input');
  const [countdown, setCountdown] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSendOtp = () => {
    setErrorMsg(null);

    if (activeTab === 'phone') {
      const normalized = normalizeBdPhone(phone);
      const validation = phoneSchema.safeParse(normalized);
      if (!validation.success) {
        setErrorMsg(
          isBangla
            ? 'সঠিক বাংলাদেশি মোবাইল নম্বর দিন (+8801XXXXXXXXX)'
            : 'Enter a valid Bangladeshi phone number (+8801XXXXXXXXX)'
        );
        return;
      }
    } else {
      const validation = emailSchema.safeParse(email);
      if (!validation.success) {
        setErrorMsg(
          isBangla ? 'সঠিক ইমেইল ঠিকানা দিন' : 'Enter a valid email address'
        );
        return;
      }
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep('verify');
      setCountdown(60);
    }, 600);
  };

  const handleVerifyOtp = () => {
    setErrorMsg(null);
    if (otpToken.length !== 6) {
      setErrorMsg(
        isBangla ? '৬ সংখ্যার সঠিক OTP কোড দিন' : 'Enter 6-digit OTP code'
      );
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 600);
  };

  return (
    <SafeAreaView className="flex-1 bg-green-50/50">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 justify-center px-6"
      >
        <View className="items-center mb-6">
          <Text className="text-4xl mb-2">🐾</Text>
          <Text className="text-2xl font-bold text-green-900 mb-1">
            {isBangla ? 'প্রাণোরায় স্বাগতম' : 'Welcome to Pranora'}
          </Text>
          <Text className="text-sm text-gray-600 text-center">
            {isBangla
              ? 'লগইন করতে আপনার ফোন বা ইমেইল দিন'
              : 'Sign in with your phone or email'}
          </Text>
        </View>

        <View className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          {step === 'input' && (
            <View className="flex-row bg-gray-100 p-1 rounded-xl mb-6">
              <TouchableOpacity
                onPress={() => {
                  setActiveTab('phone');
                  setErrorMsg(null);
                }}
                className={`flex-1 py-2.5 rounded-lg items-center ${
                  activeTab === 'phone' ? 'bg-white shadow-xs' : ''
                }`}
              >
                <Text
                  className={`text-sm font-bold ${
                    activeTab === 'phone' ? 'text-green-700' : 'text-gray-500'
                  }`}
                >
                  📱 {isBangla ? 'ফোন নম্বর' : 'Phone'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setActiveTab('email');
                  setErrorMsg(null);
                }}
                className={`flex-1 py-2.5 rounded-lg items-center ${
                  activeTab === 'email' ? 'bg-white shadow-xs' : ''
                }`}
              >
                <Text
                  className={`text-sm font-bold ${
                    activeTab === 'email' ? 'text-green-700' : 'text-gray-500'
                  }`}
                >
                  ✉️ {isBangla ? 'ইমেইল' : 'Email'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {errorMsg && (
            <View className="p-3 bg-red-50 border border-red-200 rounded-xl mb-4">
              <Text className="text-red-700 text-xs font-semibold">{errorMsg}</Text>
            </View>
          )}

          {step === 'input' ? (
            <View>
              {activeTab === 'phone' ? (
                <View className="mb-4">
                  <Text className="text-xs font-bold text-gray-700 mb-1.5">
                    {isBangla ? 'মোবাইল নম্বর' : 'Mobile Number'}
                  </Text>
                  <TextInput
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="017XXXXXXXX"
                    keyboardType="phone-pad"
                    className="border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900 bg-gray-50/50"
                  />
                </View>
              ) : (
                <View className="mb-4">
                  <Text className="text-xs font-bold text-gray-700 mb-1.5">
                    {isBangla ? 'ইমেইল ঠিকানা' : 'Email Address'}
                  </Text>
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="example@email.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    className="border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900 bg-gray-50/50"
                  />
                </View>
              )}

              <TouchableOpacity
                onPress={handleSendOtp}
                disabled={isLoading}
                className="w-full py-3.5 bg-green-700 rounded-xl items-center mt-2"
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white font-bold text-base">
                    {isBangla ? 'OTP পাঠান' : 'Send OTP'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-xs font-bold text-gray-700">
                  {isBangla ? 'OTP কোড' : 'Enter OTP'}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setStep('input');
                    setOtpToken('');
                    setErrorMsg(null);
                  }}
                >
                  <Text className="text-xs text-green-700 font-bold">
                    {isBangla ? 'পরিবর্তন' : 'Change'}
                  </Text>
                </TouchableOpacity>
              </View>

              <TextInput
                value={otpToken}
                onChangeText={(t) => setOtpToken(t.replace(/\D/g, ''))}
                maxLength={6}
                placeholder="••••••"
                keyboardType="number-pad"
                className="border border-gray-200 rounded-xl px-4 py-3 text-center text-2xl font-bold tracking-widest text-gray-900 bg-gray-50/50 mb-4"
              />

              <TouchableOpacity
                onPress={handleVerifyOtp}
                disabled={isLoading}
                className="w-full py-3.5 bg-green-700 rounded-xl items-center"
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white font-bold text-base">
                    {isBangla ? 'যাচাই করুন' : 'Verify & Sign In'}
                  </Text>
                )}
              </TouchableOpacity>

              <View className="items-center mt-4">
                {countdown > 0 ? (
                  <Text className="text-xs text-gray-500">
                    {isBangla
                      ? `${countdown} সেকেন্ড পরে পুনরায় পাঠান`
                      : `Resend in ${countdown}s`}
                  </Text>
                ) : (
                  <TouchableOpacity onPress={handleSendOtp}>
                    <Text className="text-xs text-green-700 font-bold">
                      {isBangla ? 'আবার কোড পাঠান' : 'Resend Code'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        </View>

        {/* Locale toggle footer */}
        <TouchableOpacity
          onPress={toggleLocale}
          className="mt-6 items-center"
          activeOpacity={0.7}
        >
          <Text className="text-xs text-green-800 font-bold">
            🌐 {isBangla ? 'Switch to English' : 'বাংলায় দেখুন'}
          </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
