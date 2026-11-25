'use client';

import React, { useState, useEffect } from 'react';
import { useLocale } from '@pranora/i18n';
import { Button, Card, Input } from '@pranora/ui';
import { normalizeBdPhone } from '@pranora/api';
import { phoneSchema, emailSchema } from '@pranora/validation';

export default function LoginPage() {
  const { isBangla } = useLocale();
  const [activeTab, setActiveTab] = useState<'phone' | 'email'>('phone');
  
  // Form states
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [otpToken, setOtpToken] = useState('');
  
  // UI states
  const [step, setStep] = useState<'input' | 'verify'>('input');
  const [countdown, setCountdown] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (activeTab === 'phone') {
      const normalized = normalizeBdPhone(phone);
      const validation = phoneSchema.safeParse(normalized);
      if (!validation.success) {
        setErrorMsg(
          isBangla
            ? 'সঠিক বাংলাদেশি মোবাইল নম্বর দিন (যেমন: 01712345678 বা +8801712345678)'
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
    // Simulate OTP dispatch (production connects to Supabase client)
    setTimeout(() => {
      setIsLoading(false);
      setStep('verify');
      setCountdown(60);
      setSuccessMsg(
        isBangla
          ? 'আপনার কোড পাঠানো হয়েছে। ৫ মিনিটের মধ্যে ব্যবহার করুন।'
          : 'OTP code has been sent. Valid for 5 minutes.'
      );
    }, 600);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (otpToken.length !== 6) {
      setErrorMsg(
        isBangla ? '৬ সংখ্যার সঠিক OTP কোড দিন' : 'Enter 6-digit OTP code'
      );
      return;
    }

    setIsLoading(true);
    // Simulate OTP verification
    setTimeout(() => {
      setIsLoading(false);
      setSuccessMsg(
        isBangla ? 'সফলভাবে লগইন হয়েছে!' : 'Successfully signed in!'
      );
    }, 600);
  };

  return (
    <div className="min-h-screen bg-green-50/40 dark:bg-gray-900 text-content-primary flex flex-col">
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Brand header */}
          <div className="text-center mb-6">
            <span className="text-4xl mb-2 inline-block">🐾</span>
            <h1 className="text-2xl sm:text-3xl font-bold font-bangla text-green-900 dark:text-green-300">
              {isBangla ? 'প্রাণোরায় স্বাগতম' : 'Welcome to Pranora'}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 font-bangla">
              {isBangla
                ? 'আপনার পোষা প্রাণীর যত্ন শুরু করতে লগইন করুন'
                : 'Sign in to manage and care for your pets'}
            </p>
          </div>

          <Card className="p-6 sm:p-8 bg-white dark:bg-gray-800 shadow-md rounded-2xl border border-gray-100 dark:border-gray-700">
            {/* Login Tab Switcher */}
            {step === 'input' && (
              <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('phone');
                    setErrorMsg(null);
                  }}
                  className={`flex-1 py-3 text-sm font-semibold border-b-2 font-bangla transition-colors ${
                    activeTab === 'phone'
                      ? 'border-green-600 text-green-700 dark:text-green-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  📱 {isBangla ? 'ফোন নম্বর' : 'Phone Number'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('email');
                    setErrorMsg(null);
                  }}
                  className={`flex-1 py-3 text-sm font-semibold border-b-2 font-bangla transition-colors ${
                    activeTab === 'email'
                      ? 'border-green-600 text-green-700 dark:text-green-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  ✉️ {isBangla ? 'ইমেইল' : 'Email'}
                </button>
              </div>
            )}

            {/* Notification messages */}
            {errorMsg && (
              <div className="p-3 mb-4 text-sm text-red-700 bg-red-50 dark:bg-red-900/30 rounded-lg border border-red-200 dark:border-red-800 font-bangla">
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="p-3 mb-4 text-sm text-green-700 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-800 font-bangla">
                {successMsg}
              </div>
            )}

            {/* Step 1: Input Phone or Email */}
            {step === 'input' ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                {activeTab === 'phone' ? (
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 font-bangla">
                      {isBangla ? 'মোবাইল নম্বর' : 'Mobile Number'}
                    </label>
                    <div className="relative">
                      <Input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="01712345678"
                        required
                        className="font-mono text-base"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1.5 font-bangla">
                      {isBangla
                        ? 'আমরা এই নম্বরে ৬ সংখ্যার একটি OTP পাঠাব'
                        : 'We will send a 6-digit OTP to this number'}
                    </p>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 font-bangla">
                      {isBangla ? 'ইমেইল ঠিকানা' : 'Email Address'}
                    </label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="user@example.com"
                      required
                    />
                  </div>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={isLoading}
                  className="w-full mt-4"
                >
                  {isLoading
                    ? isBangla
                      ? 'পাঠানো হচ্ছে...'
                      : 'Sending...'
                    : isBangla
                    ? 'OTP কোড পাঠান'
                    : 'Send OTP Code'}
                </Button>
              </form>
            ) : (
              /* Step 2: Verify OTP */
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 font-bangla">
                      {isBangla ? 'OTP কোড লিখুন' : 'Enter OTP Code'}
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setStep('input');
                        setOtpToken('');
                        setErrorMsg(null);
                      }}
                      className="text-xs text-green-600 hover:underline font-bangla"
                    >
                      {isBangla ? 'পরিবর্তন করুন' : 'Change'}
                    </button>
                  </div>
                  <Input
                    type="text"
                    maxLength={6}
                    value={otpToken}
                    onChange={(e) => setOtpToken(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••••"
                    required
                    className="text-center tracking-widest text-xl font-bold font-mono"
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={isLoading}
                  className="w-full mt-2"
                >
                  {isLoading
                    ? isBangla
                      ? 'যাচাই হচ্ছে...'
                      : 'Verifying...'
                    : isBangla
                    ? 'যাচাই করুন ও প্রবেশ করুন'
                    : 'Verify & Sign In'}
                </Button>

                <div className="text-center mt-3">
                  {countdown > 0 ? (
                    <span className="text-xs text-gray-500 font-bangla">
                      {isBangla
                        ? `${countdown} সেকেন্ড পর পুনরায় কোড পাঠানো যাবে`
                        : `Resend code in ${countdown}s`}
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      className="text-xs font-semibold text-green-700 dark:text-green-400 hover:underline font-bangla"
                    >
                      {isBangla ? 'আবার OTP পাঠান' : 'Resend OTP'}
                    </button>
                  )}
                </div>
              </form>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
}
