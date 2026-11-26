'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@pranora/i18n';
import { Button, Card, Input } from '@pranora/ui';
import {
  normalizeBdPhone,
  signInWithEmailOtp,
  signInWithPhoneOtp,
  verifyEmailOtp,
  verifyPhoneOtp,
} from '@pranora/api';
import { phoneSchema, emailSchema } from '@pranora/validation';
import { useSession } from '../../../../hooks/useSession';
import { useToast } from '../../../../components/ToastProvider';

export default function LoginPage() {
  const router = useRouter();
  const { locale, isBangla } = useLocale();
  const { supabase, isConfigured, isAuthenticated, refreshSession } = useSession();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'phone' | 'email'>('phone');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [otpToken, setOtpToken] = useState('');

  const [step, setStep] = useState<'input' | 'verify'>('input');
  const [countdown, setCountdown] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace(`/${locale}`);
    }
  }, [isAuthenticated, locale, router]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
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
            : 'Enter a valid Bangladeshi phone number (e.g. 01712345678 or +8801712345678)'
        );
        return;
      }
    } else {
      const validation = emailSchema.safeParse(email);
      if (!validation.success) {
        setErrorMsg(isBangla ? 'সঠিক ইমেইল ঠিকানা দিন' : 'Enter a valid email address');
        return;
      }
    }

    setIsLoading(true);
    try {
      const res =
        activeTab === 'phone'
          ? await signInWithPhoneOtp(supabase, phone)
          : await signInWithEmailOtp(supabase, email);

      if (!res.success) {
        setErrorMsg(
          res.error ||
            (isBangla ? 'OTP পাঠানো যায়নি, আবার চেষ্টা করুন।' : 'Could not send OTP. Please try again.')
        );
        return;
      }

      setStep('verify');
      setCountdown(60);
      setSuccessMsg(
        isBangla
          ? 'আপনার কোড পাঠানো হয়েছে। ৫ মিনিটের মধ্যে ব্যবহার করুন।'
          : 'OTP code has been sent. Valid for 5 minutes.'
      );
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : isBangla
          ? 'সার্ভারের সাথে সংযোগ করা যায়নি।'
          : 'Unable to reach authentication server.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (otpToken.length !== 6) {
      setErrorMsg(isBangla ? '৬ সংখ্যার সঠিক OTP কোড দিন' : 'Enter 6-digit OTP code');
      return;
    }

    setIsLoading(true);
    try {
      const res =
        activeTab === 'phone'
          ? await verifyPhoneOtp(supabase, phone, otpToken)
          : await verifyEmailOtp(supabase, email, otpToken);

      if (!res.success) {
        setErrorMsg(
          res.error || (isBangla ? 'OTP যাচাই সফল হয়নি।' : 'OTP verification failed.')
        );
        return;
      }

      await refreshSession();
      showToast({
        type: 'success',
        message: isBangla ? 'সফলভাবে লগইন হয়েছে!' : 'Successfully signed in!',
      });
      router.push(`/${locale}`);
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : isBangla
          ? 'যাচাইকরণে সমস্যা হয়েছে।'
          : 'Verification failed.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-5">
        {/* Brand header */}
        <div className="text-center">
          <span className="text-4xl mb-2 inline-block">🐾</span>
          <h1 className="text-2xl sm:text-3xl font-bold text-green-800 dark:text-lime-400">
            {isBangla ? 'প্রাণোরায় স্বাগতম' : 'Welcome to Pranora'}
          </h1>
          <p className="text-sm text-content-secondary mt-1">
            {isBangla
              ? 'আপনার পোষা প্রাণীর যত্ন শুরু করতে লগইন করুন'
              : 'Sign in to manage and care for your pets'}
          </p>
        </div>

        {!isConfigured && (
          <div className="p-3 rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-900/30 text-amber-900 dark:text-amber-200 text-xs">
            {isBangla
              ? 'লোকাল মোড: Supabase কী কনফিগার করা নেই (.env.local)। রিয়েল OTP পেতে Supabase সংযুক্ত করুন।'
              : 'Local mode: Supabase credentials are using placeholders in .env.local. Configure real keys for live OTP.'}
          </div>
        )}

        <Card className="p-6 sm:p-8 bg-app-card shadow-2 rounded-xl border border-stroke-subtle">
          {step === 'input' && (
            <div className="flex border-b border-stroke-subtle mb-6">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('phone');
                  setErrorMsg(null);
                }}
                className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'phone'
                    ? 'border-green-600 text-green-700 dark:text-lime-400'
                    : 'border-transparent text-content-secondary hover:text-content-primary'
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
                className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'email'
                    ? 'border-green-600 text-green-700 dark:text-lime-400'
                    : 'border-transparent text-content-secondary hover:text-content-primary'
                }`}
              >
                ✉️ {isBangla ? 'ইমেইল' : 'Email'}
              </button>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 mb-4 text-sm text-red-700 bg-red-50 dark:bg-red-900/30 dark:text-red-200 rounded-lg border border-red-200 dark:border-red-800">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="p-3 mb-4 text-sm text-green-700 bg-green-50 dark:bg-green-900/30 dark:text-green-200 rounded-lg border border-green-200 dark:border-green-800">
              {successMsg}
            </div>
          )}

          {step === 'input' ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              {activeTab === 'phone' ? (
                <div>
                  <label className="block text-xs font-semibold text-content-secondary mb-1">
                    {isBangla ? 'মোবাইল নম্বর' : 'Mobile Number'}
                  </label>
                  <Input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01712345678"
                    required
                    className="font-mono text-base"
                  />
                  <p className="text-xs text-content-secondary mt-1.5">
                    {isBangla
                      ? 'আমরা এই নম্বরে ৬ সংখ্যার একটি OTP পাঠাব'
                      : 'We will send a 6-digit OTP to this number'}
                  </p>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-content-secondary mb-1">
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
                className="w-full mt-2"
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
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-content-secondary">
                    {isBangla ? 'OTP কোড লিখুন' : 'Enter OTP Code'}
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setStep('input');
                      setOtpToken('');
                      setErrorMsg(null);
                    }}
                    className="text-xs text-green-600 dark:text-lime-400 hover:underline cursor-pointer"
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
                  <span className="text-xs text-content-secondary">
                    {isBangla
                      ? `${countdown} সেকেন্ড পর পুনরায় কোড পাঠানো যাবে`
                      : `Resend code in ${countdown}s`}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="text-xs font-semibold text-green-700 dark:text-lime-400 hover:underline cursor-pointer"
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
  );
}
