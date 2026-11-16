import { useState, useEffect } from 'react';
import {
  PawPrint,
  Heart,
  Stethoscope,
  MapPin,
  AlertTriangle,
  Calendar,
  Bell,
  CheckCircle,
  Clock,
  Sparkles,
  Phone,
  Navigation,
  Share2,
  Home,
  User,
  ShieldCheck,
  Maximize2,
  Smartphone,
  Tablet,
  Monitor,
} from 'lucide-react';

import {
  Button,
  Input,
  Textarea,
  SearchBar,
  Select,
  Checkbox,
  Radio,
  Switch,
  Card,
  PromoBanner,
  CategoryTile,
  Chip,
  Tabs,
  SegmentedControl,
  LanguageToggle,
  ThemeToggle,
  TopAppBar,
  BottomNav,
  ListItem,
  Avatar,
  ProgressBar,
  StepTracker,
  Modal,
  Toast,
  EmptyState,
  CardSkeleton,
} from '../components';

export default function App() {
  // Global States
  const [locale, setLocale] = useState<'bn' | 'en'>('bn');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [viewportMode, setViewportMode] = useState<'responsive' | 'mobile' | 'tablet' | 'desktop'>('responsive');

  // Interactive Component States
  const [btnLoading, setBtnLoading] = useState(false);
  const [btnDisabled, setBtnDisabled] = useState(false);
  const [inputText, setInputText] = useState('ধানমন্ডি ৮/এ, ঢাকা');
  const [inputError, setInputError] = useState(false);
  const [textareaText, setTextareaText] = useState('বিড়ালটির পায়ে গুরুতর আঘাত লেগেছে। অবিলম্বে চিকিৎসা প্রয়োজন।');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPetType, setSelectedPetType] = useState('cat');
  const [checkboxVal, setCheckboxVal] = useState(true);
  const [radioVal, setRadioVal] = useState('urgent');
  const [switchVal, setSwitchVal] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [activeSegment, setActiveSegment] = useState('all');
  const [activeNav, setActiveNav] = useState('home');
  const [progressVal, setProgressVal] = useState(65);
  const [stepIndex, setStepIndex] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showToast, setShowToast] = useState(true);
  const [activeFilterChip, setActiveFilterChip] = useState('open_now');

  // Sync theme attribute to root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Viewport Container Width
  const viewportWidthClass = {
    responsive: 'w-full max-w-7xl',
    mobile: 'w-[390px] shadow-3 my-6 border border-stroke-medium rounded-2xl overflow-hidden',
    tablet: 'w-[768px] shadow-3 my-6 border border-stroke-medium rounded-2xl overflow-hidden',
    desktop: 'w-[1280px] shadow-3 my-6 border border-stroke-medium rounded-2xl overflow-hidden',
  }[viewportMode];

  return (
    <div className="min-h-screen bg-app-bg text-content-primary flex flex-col items-center transition-colors duration-250">
      {/* 1. Global Sticky Control Header */}
      <header className="sticky top-0 z-50 w-full bg-app-card/90 backdrop-blur-md border-b border-stroke-subtle px-4 py-3 shadow-1 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-600 flex items-center justify-center text-white shadow-1">
              <PawPrint className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight">Pranora · প্রাণোরা</span>
                <span className="px-2 py-0.5 rounded-pill text-[10px] font-bold bg-lime-400 text-green-900">
                  DESIGN SYSTEM
                </span>
              </div>
              <p className="text-xs text-content-secondary hidden sm:block">
                {locale === 'bn'
                  ? 'পোষা প্রাণীর সম্পূর্ণ সেবা — ডিজাইন সিস্টেম ও লাইভ কম্পোনেন্ট লাইব্রেরি'
                  : 'Complete Pet Care — Design System & Component Foundation'}
              </p>
            </div>
          </div>

          {/* Quick Jump Links */}
          <nav className="hidden lg:flex items-center gap-1 text-xs font-semibold text-content-secondary">
            <a href="#colors" className="px-3 py-1.5 rounded-pill hover:bg-green-50 dark:hover:bg-green-900/40 hover:text-green-600 transition-colors">
              {locale === 'bn' ? 'কালার টোকেন' : 'Colors'}
            </a>
            <a href="#typography" className="px-3 py-1.5 rounded-pill hover:bg-green-50 dark:hover:bg-green-900/40 hover:text-green-600 transition-colors">
              {locale === 'bn' ? 'টাইপোগ্রাফি' : 'Typography'}
            </a>
            <a href="#spacing" className="px-3 py-1.5 rounded-pill hover:bg-green-50 dark:hover:bg-green-900/40 hover:text-green-600 transition-colors">
              {locale === 'bn' ? 'স্পেসিং ও গ্লাস' : 'Spacing & Glass'}
            </a>
            <a href="#icons" className="px-3 py-1.5 rounded-pill hover:bg-green-50 dark:hover:bg-green-900/40 hover:text-green-600 transition-colors">
              {locale === 'bn' ? 'আইকনোগ্রাফি' : 'Icons'}
            </a>
            <a href="#components" className="px-3 py-1.5 rounded-pill hover:bg-green-50 dark:hover:bg-green-900/40 hover:text-green-600 transition-colors">
              {locale === 'bn' ? 'কম্পোনেন্টস' : 'Components'}
            </a>
          </nav>

          {/* Controls: Viewport + Theme + Language */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Viewport switch */}
            <div className="hidden md:flex items-center p-1 rounded-pill bg-gray-100 dark:bg-green-950/60 border border-stroke-subtle">
              <button
                type="button"
                onClick={() => setViewportMode('responsive')}
                title="Full Responsive"
                className={`p-1.5 rounded-pill transition-colors cursor-pointer ${
                  viewportMode === 'responsive' ? 'bg-app-card text-green-600 shadow-1' : 'text-content-secondary'
                }`}
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewportMode('mobile')}
                title="Mobile 390px"
                className={`p-1.5 rounded-pill transition-colors cursor-pointer ${
                  viewportMode === 'mobile' ? 'bg-app-card text-green-600 shadow-1' : 'text-content-secondary'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewportMode('tablet')}
                title="Tablet 768px"
                className={`p-1.5 rounded-pill transition-colors cursor-pointer ${
                  viewportMode === 'tablet' ? 'bg-app-card text-green-600 shadow-1' : 'text-content-secondary'
                }`}
              >
                <Tablet className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewportMode('desktop')}
                title="Desktop 1280px"
                className={`p-1.5 rounded-pill transition-colors cursor-pointer ${
                  viewportMode === 'desktop' ? 'bg-app-card text-green-600 shadow-1' : 'text-content-secondary'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Language Toggle */}
            <LanguageToggle currentLocale={locale} onToggle={setLocale} />

            {/* Theme Toggle */}
            <ThemeToggle theme={theme} onToggle={setTheme} />
          </div>
        </div>
      </header>

      {/* Main Container (Simulated Viewport) */}
      <main className={`${viewportWidthClass} px-4 sm:px-8 py-8 flex flex-col gap-16 transition-all duration-300`}>
        {/* Hero Section */}
        <section className="flex flex-col items-start gap-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-pill bg-green-50 dark:bg-green-900/40 border border-green-200 dark:border-green-800 text-green-700 dark:text-lime-300 text-xs font-semibold">
            <Sparkles className="w-4 h-4 text-green-600 dark:text-lime-400" />
            <span>Figma Foundations &amp; Living Style-Guide System</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
            {locale === 'bn' ? 'প্রাণোরা ডিজাইন সিস্টেম ফাউন্ডেশন' : 'Pranora Design System Foundation'}
          </h1>
          <p className="text-base sm:text-lg text-content-secondary max-w-2xl leading-relaxed">
            {locale === 'bn'
              ? 'বাংলা-প্রথম ইন্টারফেস, উচ্চতর এক্সেসিবিলিটি (WCAG AA), ডার্ক ফরেস্ট ও লাইট ব্র্যান্ড থিম, এবং সম্পূর্ণ টাইপ-সেফ কম্পোনেন্ট স্পেসিফিকেশন।'
              : 'Bangla-first interface, high accessibility (WCAG AA), Dark Forest & Light Brand themes, and production-ready component foundations.'}
          </p>
        </section>

        {/* ---------------- 2. Colors Section ---------------- */}
        <section id="colors" className="flex flex-col gap-6 scroll-mt-20">
          <div className="border-b border-stroke-subtle pb-3 flex justify-between items-baseline">
            <h2 className="text-2xl font-bold flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-green-600 inline-block" />
              {locale === 'bn' ? 'কালার টোকেন (Color Tokens)' : 'Color Tokens & Contrast Ratio'}
            </h2>
            <span className="text-xs text-content-secondary">WCAG AA Verified (≥ 4.5:1)</span>
          </div>

          {/* Primary Green Scale */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-content-secondary mb-3">
              Primary Brand: 10-Step Green Scale
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2.5">
              {[
                { token: 'green-50', hex: '#E1F3E1', textDark: true, ratio: '1.2:1 (bg)' },
                { token: 'green-100', hex: '#B8E6B5', textDark: true, ratio: '1.4:1 (bg)' },
                { token: 'green-200', hex: '#8CD2A3', textDark: true, ratio: '1.9:1 (border)' },
                { token: 'green-300', hex: '#6BBF8B', textDark: true, ratio: '2.7:1 (icon)' },
                { token: 'green-400', hex: '#4BA772', textDark: false, ratio: '3.3:1 (large)' },
                { token: 'green-500', hex: '#3A9A63', textDark: false, ratio: '4.1:1 (large)' },
                { token: 'green-600', hex: '#2F7B53', textDark: false, ratio: '5.2:1 (AA ✅)' },
                { token: 'green-700', hex: '#256E4C', textDark: false, ratio: '6.4:1 (AAA ✅)' },
                { token: 'green-800', hex: '#1D5A3F', textDark: false, ratio: '9.5:1 (AAA ✅)' },
                { token: 'green-900', hex: '#154537', textDark: false, ratio: '13.4:1 (AAA ✅)' },
              ].map((c) => (
                <div
                  key={c.token}
                  className="rounded-lg overflow-hidden border border-stroke-subtle shadow-1 flex flex-col"
                >
                  <div
                    className="h-16 flex items-end p-2 transition-transform hover:scale-105"
                    style={{ backgroundColor: c.hex }}
                  >
                    <span className={`text-[10px] font-bold ${c.textDark ? 'text-black' : 'text-white'}`}>
                      {c.hex}
                    </span>
                  </div>
                  <div className="p-2 bg-app-card text-left">
                    <p className="text-xs font-semibold text-content-primary truncate">{c.token}</p>
                    <p className="text-[10px] text-content-secondary mt-0.5">{c.ratio}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Accent Lime, Emergency & Neutrals */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Accent Lime */}
            <Card padding="md" className="flex flex-col gap-3">
              <h4 className="text-sm font-semibold text-content-primary">Accent Lime (Ref 1 inspired)</h4>
              <div className="flex gap-2">
                {[
                  { token: 'lime-300', hex: '#BEF264' },
                  { token: 'lime-400', hex: '#A3E635' },
                  { token: 'lime-500', hex: '#84CC16' },
                ].map((c) => (
                  <div key={c.token} className="flex-1 rounded-md p-3 text-green-950 font-bold text-xs" style={{ backgroundColor: c.hex }}>
                    <div>{c.token}</div>
                    <div className="text-[10px] opacity-80 mt-1">{c.hex}</div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-content-secondary">Used for active pips, promo highlights, and dark-mode focus glow.</p>
            </Card>

            {/* Emergency Scale */}
            <Card padding="md" className="flex flex-col gap-3">
              <h4 className="text-sm font-semibold text-emergency-600 dark:text-emergency-500 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                Emergency Only (Strict Semantic)
              </h4>
              <div className="flex gap-2">
                {[
                  { token: 'red-500', hex: '#EF4444' },
                  { token: 'red-600', hex: '#DC2626' },
                  { token: 'red-700', hex: '#B91C1C' },
                ].map((c) => (
                  <div key={c.token} className="flex-1 rounded-md p-3 text-white font-bold text-xs" style={{ backgroundColor: c.hex }}>
                    <div>{c.token}</div>
                    <div className="text-[10px] opacity-80 mt-1">{c.hex}</div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-content-secondary">Strictly reserved for emergency buttons, critical alerts &amp; errors.</p>
            </Card>

            {/* Semantic Roles (Light vs Dark) */}
            <Card padding="md" className="flex flex-col gap-2">
              <h4 className="text-sm font-semibold text-content-primary">Surface &amp; Background Tokens</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded bg-app-card border border-stroke-subtle">
                  <span className="font-semibold block">surface-card</span>
                  <span className="text-[10px] text-content-secondary">Card surface</span>
                </div>
                <div className="p-2 rounded bg-app-elevated border border-stroke-subtle">
                  <span className="font-semibold block">surface-elevated</span>
                  <span className="text-[10px] text-content-secondary">Elevated modal</span>
                </div>
                <div className="p-2 rounded bg-app-tinted border border-stroke-subtle">
                  <span className="font-semibold block">surface-tinted</span>
                  <span className="text-[10px] text-content-secondary">Banner highlight</span>
                </div>
                <div className="p-2 rounded bg-app-glass backdrop-blur-md border border-stroke-glass">
                  <span className="font-semibold block">surface-glass</span>
                  <span className="text-[10px] text-content-secondary">Translucent blur</span>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* ---------------- 3. Typography Section ---------------- */}
        <section id="typography" className="flex flex-col gap-6 scroll-mt-20">
          <div className="border-b border-stroke-subtle pb-3 flex justify-between items-baseline">
            <h2 className="text-2xl font-bold flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-green-600 inline-block" />
              {locale === 'bn' ? 'টাইপোগ্রাফি স্পেসিফিকেশন' : 'Typography & Bilingual Specimens'}
            </h2>
            <span className="text-xs text-content-secondary font-mono">Hind Siliguri (bn) · Inter (en)</span>
          </div>

          <div className="p-4 rounded-xl bg-green-50/50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 text-xs sm:text-sm text-green-900 dark:text-green-200 leading-relaxed">
            <strong>Bilingual Rule:</strong> Bangla typography is rendered with <code>line-height: ≥ 1.62</code> and font size minimum 14px to guarantee no clipping of diacritics (কার/ফলা যেমন: কি, কু, কৃ, ক্ট্র). English copy utilizes high x-height Inter.
          </div>

          {/* Type Scale Table */}
          <Card padding="none" className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[650px]">
              <thead>
                <tr className="border-b border-stroke-subtle text-xs font-semibold uppercase text-content-secondary bg-gray-50/50 dark:bg-green-950/20">
                  <th className="p-3.5">Style / Size</th>
                  <th className="p-3.5">Line-Height</th>
                  <th className="p-3.5">বাংলা Specimen (Hind Siliguri)</th>
                  <th className="p-3.5">English Specimen (Inter)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stroke-subtle text-sm">
                <tr>
                  <td className="p-3.5 font-mono text-xs">Display (36px / 700)</td>
                  <td className="p-3.5 font-mono text-xs">58px (bn) / 44px</td>
                  <td className="p-3.5 text-3xl sm:text-4xl font-bold font-bangla leading-[1.62]">
                    আপনার পোষা প্রাণীর যত্ন
                  </td>
                  <td className="p-3.5 text-3xl sm:text-4xl font-bold font-english leading-tight">
                    Complete Pet Care
                  </td>
                </tr>
                <tr>
                  <td className="p-3.5 font-mono text-xs">H1 (28px / 700)</td>
                  <td className="p-3.5 font-mono text-xs">46px (bn) / 36px</td>
                  <td className="p-3.5 text-2xl font-bold font-bangla leading-[1.64]">
                    জরুরি উদ্ধার ও দত্তক সেবা
                  </td>
                  <td className="p-3.5 text-2xl font-bold font-english leading-tight">
                    Emergency Rescue &amp; Adoption
                  </td>
                </tr>
                <tr>
                  <td className="p-3.5 font-mono text-xs">H2 (20px / 600)</td>
                  <td className="p-3.5 font-mono text-xs">34px (bn) / 28px</td>
                  <td className="p-3.5 text-xl font-semibold font-bangla leading-[1.70]">
                    নিকটস্থ ভেটেরিনারি ক্লিনিক খুঁজুন
                  </td>
                  <td className="p-3.5 text-xl font-semibold font-english leading-tight">
                    Find Nearest Vet Clinic
                  </td>
                </tr>
                <tr>
                  <td className="p-3.5 font-mono text-xs">Body (16px / 400)</td>
                  <td className="p-3.5 font-mono text-xs">26px (bn) / 24px</td>
                  <td className="p-3.5 text-base font-bangla leading-[1.63]">
                    টিকা ও চিকিৎসার সম্পূর্ণ তথ্য এক ক্লিকে পান।
                  </td>
                  <td className="p-3.5 text-base font-english leading-normal">
                    Track medical history and vaccines in one place.
                  </td>
                </tr>
                <tr>
                  <td className="p-3.5 font-mono text-xs">Body Small (14px / 400)</td>
                  <td className="p-3.5 font-mono text-xs">24px (bn) / 20px</td>
                  <td className="p-3.5 text-sm font-bangla leading-[1.71]">
                    ২৪/৭ জরুরি সহায়তার জন্য ডাক্তারকে কল করুন।
                  </td>
                  <td className="p-3.5 text-sm font-english leading-normal">
                    Call emergency helpline for urgent care.
                  </td>
                </tr>
                <tr>
                  <td className="p-3.5 font-mono text-xs">Caption (12px / 600)</td>
                  <td className="p-3.5 font-mono text-xs">20px (bn) / 16px</td>
                  <td className="p-3.5 text-xs font-semibold font-bangla">
                    * শুধুমাত্র ট্যাগ বা মেটাডাটা লেবেলে প্রযোজ্য
                  </td>
                  <td className="p-3.5 text-xs font-semibold font-english uppercase tracking-wider">
                    VERIFIED SHELTER BADGE
                  </td>
                </tr>
              </tbody>
            </table>
          </Card>

          {/* Numerals & Currency Specimen */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card padding="md">
              <span className="text-xs uppercase font-bold text-green-600 dark:text-lime-400 block mb-1">
                Bangla Numerals &amp; Taka Format
              </span>
              <p className="text-2xl font-bold font-bangla">৳ ১,২৫০ · ২.৫ কি.মি. · ১২টি ক্লিনিক</p>
              <span className="text-xs text-content-secondary mt-1 block">
                Bangla digits used for prices, distances, and quantities.
              </span>
            </Card>

            <Card padding="md">
              <span className="text-xs uppercase font-bold text-green-600 dark:text-lime-400 block mb-1">
                Phone Number West-Digits Rule
              </span>
              <p className="text-2xl font-bold font-mono">+880 1712-345678</p>
              <span className="text-xs text-content-secondary mt-1 block">
                Dialable numbers always use Western digits for dialer compatibility.
              </span>
            </Card>
          </div>
        </section>

        {/* ---------------- 4. Spacing, Radius & Glass Section ---------------- */}
        <section id="spacing" className="flex flex-col gap-6 scroll-mt-20">
          <div className="border-b border-stroke-subtle pb-3 flex justify-between items-baseline">
            <h2 className="text-2xl font-bold flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-green-600 inline-block" />
              {locale === 'bn' ? 'স্পেসিং, রেডিয়াস ও গ্লাস স্টাইল' : 'Spacing, Radius & Glassmorphism'}
            </h2>
            <span className="text-xs text-content-secondary font-mono">4px Baseline Scale</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Spacing Bars */}
            <Card padding="md" className="flex flex-col gap-3">
              <h3 className="text-sm font-semibold">Spacing Scale</h3>
              <div className="flex flex-col gap-2">
                {[
                  { name: 'space-1', val: '4px' },
                  { name: 'space-2', val: '8px' },
                  { name: 'space-3', val: '12px' },
                  { name: 'space-4', val: '16px' },
                  { name: 'space-6', val: '24px' },
                  { name: 'space-8', val: '32px' },
                  { name: 'space-12', val: '48px' },
                ].map((s) => (
                  <div key={s.name} className="flex items-center gap-3 text-xs">
                    <span className="w-16 font-mono text-content-secondary">{s.name}</span>
                    <div className="h-4 bg-green-600 rounded-sm" style={{ width: s.val }} />
                    <span className="font-mono text-content-primary">{s.val}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Corner Radius */}
            <Card padding="md" className="flex flex-col gap-3">
              <h3 className="text-sm font-semibold">Corner Radius Scale</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { name: 'radius-sm', val: '8px', cls: 'rounded-sm' },
                  { name: 'radius-md', val: '12px', cls: 'rounded-md' },
                  { name: 'radius-lg', val: '20px', cls: 'rounded-lg' },
                  { name: 'radius-xl', val: '28px', cls: 'rounded-xl' },
                ].map((r) => (
                  <div key={r.name} className="flex flex-col items-center justify-center p-3 bg-green-50 dark:bg-green-900/40 border border-green-300 dark:border-green-700 text-center" style={{ borderRadius: r.val }}>
                    <span className="text-xs font-bold text-green-900 dark:text-lime-300">{r.name}</span>
                    <span className="text-[10px] text-content-secondary">{r.val}</span>
                  </div>
                ))}
              </div>
              <div className="mt-2 p-2 rounded-pill bg-green-600 text-white text-center text-xs font-semibold">
                radius-pill (9999px)
              </div>
            </Card>

            {/* Dark Forest Glass Style (Ref 1 inspired) */}
            <Card variant="glass" padding="md" className="flex flex-col justify-between">
              <div>
                <span className="px-2 py-0.5 rounded-pill text-[10px] font-bold bg-lime-400 text-green-950 uppercase tracking-wide">
                  Ref 1 Glass Effect
                </span>
                <h4 className="text-base font-bold mt-2">Translucent Forest Card</h4>
                <p className="text-xs text-content-secondary mt-1">
                  12px backdrop-blur with 1px translucent highlight border and deep shadow.
                </p>
              </div>
              <div className="mt-4 p-3 rounded-lg bg-green-900/40 border border-white/10 flex items-center justify-between text-xs font-medium">
                <span>backdrop-blur-md</span>
                <span className="text-lime-400 font-mono">active</span>
              </div>
            </Card>
          </div>
        </section>

        {/* ---------------- 5. Iconography Section ---------------- */}
        <section id="icons" className="flex flex-col gap-6 scroll-mt-20">
          <div className="border-b border-stroke-subtle pb-3 flex justify-between items-baseline">
            <h2 className="text-2xl font-bold flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-green-600 inline-block" />
              {locale === 'bn' ? 'আইকনোগ্রাফি (Lucide Icons)' : 'Iconography & Stroke Guidelines'}
            </h2>
            <span className="text-xs text-content-secondary">2.0px Stroke Outline · No Emojis</span>
          </div>

          <Card padding="md">
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4 text-center">
              {[
                { icon: <PawPrint className="w-6 h-6 mx-auto text-green-600 dark:text-lime-400" />, label: 'Pet Care' },
                { icon: <Heart className="w-6 h-6 mx-auto text-rose-500" />, label: 'Adoption' },
                { icon: <AlertTriangle className="w-6 h-6 mx-auto text-emergency-500" />, label: 'Emergency' },
                { icon: <Stethoscope className="w-6 h-6 mx-auto text-green-600 dark:text-lime-400" />, label: 'Vet Care' },
                { icon: <MapPin className="w-6 h-6 mx-auto text-green-500" />, label: 'Nearest Vet' },
                { icon: <Calendar className="w-6 h-6 mx-auto text-blue-500" />, label: 'Booking' },
                { icon: <Phone className="w-6 h-6 mx-auto text-green-600" />, label: 'Direct Call' },
                { icon: <ShieldCheck className="w-6 h-6 mx-auto text-green-600 dark:text-lime-400" />, label: 'Verified BVC' },
              ].map((item, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-gray-50/50 dark:bg-green-950/20 border border-stroke-subtle flex flex-col items-center gap-1.5">
                  {item.icon}
                  <span className="text-xs font-medium text-content-secondary">{item.label}</span>
                </div>
              ))}
            </div>
          </Card>
        </section>

        {/* ---------------- 6. Components Showcase Section ---------------- */}
        <section id="components" className="flex flex-col gap-12 scroll-mt-20">
          <div className="border-b border-stroke-subtle pb-3 flex flex-wrap justify-between items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full bg-green-600 inline-block" />
                {locale === 'bn' ? 'কম্পোনেন্ট লাইব্রেরি' : 'Interactive Component Library'}
              </h2>
              <p className="text-xs text-content-secondary mt-0.5">
                Side-by-side bilingual demonstrations with interactive state toggles.
              </p>
            </div>

            {/* Sandbox global state triggers */}
            <div className="flex items-center gap-2 bg-app-card p-1.5 rounded-pill border border-stroke-subtle text-xs">
              <button
                type="button"
                onClick={() => setBtnLoading(!btnLoading)}
                className={`px-3 py-1 rounded-pill transition-colors cursor-pointer ${
                  btnLoading ? 'bg-green-600 text-white font-bold' : 'text-content-secondary hover:text-content-primary'
                }`}
              >
                {btnLoading ? 'Loading: ON' : 'Toggle Loading'}
              </button>
              <button
                type="button"
                onClick={() => setBtnDisabled(!btnDisabled)}
                className={`px-3 py-1 rounded-pill transition-colors cursor-pointer ${
                  btnDisabled ? 'bg-amber-500 text-white font-bold' : 'text-content-secondary hover:text-content-primary'
                }`}
              >
                {btnDisabled ? 'Disabled: ON' : 'Toggle Disabled'}
              </button>
              <button
                type="button"
                onClick={() => setInputError(!inputError)}
                className={`px-3 py-1 rounded-pill transition-colors cursor-pointer ${
                  inputError ? 'bg-emergency-600 text-white font-bold' : 'text-content-secondary hover:text-content-primary'
                }`}
              >
                {inputError ? 'Error: ON' : 'Toggle Error'}
              </button>
            </div>
          </div>

          {/* 6.1 Buttons Showcase */}
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-bold text-content-primary">
              1. Buttons (Variants, Sizes &amp; Bilingual Proof)
            </h3>

            <Card padding="md" className="flex flex-col gap-6">
              {/* Primary, Secondary, Ghost, Danger */}
              <div className="flex flex-wrap items-center gap-4">
                <Button variant="primary" isLoading={btnLoading} disabled={btnDisabled}>
                  {locale === 'bn' ? 'বুক করুন / Book Now' : 'Book Appointment'}
                </Button>
                <Button variant="secondary" isLoading={btnLoading} disabled={btnDisabled}>
                  {locale === 'bn' ? 'বিস্তারিত দেখুন / View Details' : 'View Details'}
                </Button>
                <Button variant="danger" leftIcon={<AlertTriangle className="w-4 h-4" />} isLoading={btnLoading} disabled={btnDisabled}>
                  {locale === 'bn' ? 'জরুরি সেবা / Emergency' : 'Emergency Help'}
                </Button>
                <Button variant="lime" isLoading={btnLoading} disabled={btnDisabled}>
                  {locale === 'bn' ? 'দত্তক নিন / Adopt' : 'Adopt a Pet'}
                </Button>
                <Button variant="ghost" disabled={btnDisabled}>
                  {locale === 'bn' ? 'বাতিল করুন' : 'Cancel'}
                </Button>
              </div>

              {/* Sizes */}
              <div className="flex flex-wrap items-center gap-3 border-t border-stroke-subtle pt-4">
                <span className="text-xs font-semibold text-content-secondary w-full">Sizes:</span>
                <Button size="sm" variant="primary">Small (36px)</Button>
                <Button size="md" variant="primary">Medium (44px standard)</Button>
                <Button size="lg" variant="primary">Large (52px CTA)</Button>
                <Button size="fab" variant="danger" title="Emergency Floating Action Button">
                  <Phone className="w-6 h-6 stroke-[2.5]" />
                </Button>
              </div>

              {/* Side-by-side Short vs Long Text */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-stroke-subtle pt-4">
                <div>
                  <span className="text-xs font-semibold text-content-secondary block mb-2">
                    Short Label (bn &amp; en):
                  </span>
                  <div className="flex gap-2">
                    <Button variant="primary" size="sm">কল করুন</Button>
                    <Button variant="secondary" size="sm">Call Now</Button>
                  </div>
                </div>
                <div>
                  <span className="text-xs font-semibold text-content-secondary block mb-2">
                    Long Sentence Stress Test (No Clipping):
                  </span>
                  <Button variant="primary" size="md" isFullWidth>
                    {locale === 'bn'
                      ? 'নিকটস্থ অনুমোদিত পশু চিকিৎসকের সাথে তাৎক্ষণিক সিরিয়াল বুক করুন'
                      : 'Book instant serial with verified nearest veterinary doctor'}
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* 6.2 Form Controls Showcase */}
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-bold text-content-primary">
              2. Form Inputs &amp; Controls
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card padding="md" className="flex flex-col gap-4">
                <Input
                  label={locale === 'bn' ? 'আপনার ঠিকানা / Your Location' : 'Location Address'}
                  placeholder="যেমন: ধানমন্ডি ২৭, ঢাকা"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  leftIcon={<MapPin className="w-5 h-5" />}
                  error={inputError ? (locale === 'bn' ? 'সঠিক এলাকা প্রদান করুন' : 'Please provide a valid location') : undefined}
                />

                <Input
                  isPhone
                  label={locale === 'bn' ? 'মোবাইল নম্বর (ওটিপির জন্য)' : 'Mobile Number (for OTP)'}
                  placeholder="01712-345678"
                  helperText={locale === 'bn' ? 'আমরা একটি গোপন কোড পাঠাব' : 'We will send a 6-digit OTP code'}
                />

                <Select
                  label={locale === 'bn' ? 'প্রাণীর প্রজাতি / Pet Species' : 'Pet Species'}
                  value={selectedPetType}
                  onChange={(e) => setSelectedPetType(e.target.value)}
                  options={[
                    { value: 'cat', label: locale === 'bn' ? 'বিড়াল (Cat)' : 'Cat' },
                    { value: 'dog', label: locale === 'bn' ? 'কুকুর (Dog)' : 'Dog' },
                    { value: 'bird', label: locale === 'bn' ? 'পাখি (Bird)' : 'Bird' },
                    { value: 'rabbit', label: locale === 'bn' ? 'খরগোশ (Rabbit)' : 'Rabbit' },
                  ]}
                />

                <SearchBar
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onClear={() => setSearchQuery('')}
                  shortcutHint="Ctrl+K"
                  placeholder={locale === 'bn' ? 'ক্লিনিক বা ভেটের নাম খুঁজুন...' : 'Search clinic or doctor...'}
                />
              </Card>

              <Card padding="md" className="flex flex-col gap-4">
                <Textarea
                  label={locale === 'bn' ? 'উদ্ধার পরিস্থিতির বিবরণ' : 'Rescue Case Description'}
                  value={textareaText}
                  onChange={(e) => setTextareaText(e.target.value)}
                  maxLength={150}
                  currentLength={textareaText.length}
                  helperText={locale === 'bn' ? 'পরিস্থিতির জরুরি অবস্থা স্পষ্টভাবে উল্লেখ করুন' : 'Mention animal condition clearly'}
                />

                <div className="flex flex-col gap-2 pt-2 border-t border-stroke-subtle">
                  <Checkbox
                    checked={checkboxVal}
                    onChange={(e) => setCheckboxVal(e.target.checked)}
                    label={locale === 'bn' ? 'আমি এই প্রাণীর দায়িত্ব নিতে রাজি' : 'I agree to foster this rescued pet'}
                    description={locale === 'bn' ? 'শেল্টার টিম আপনার সাথে যোগাযোগ করবে' : 'Shelter team will verify details'}
                  />

                  <div className="pt-2">
                    <span className="text-sm font-semibold text-content-primary block mb-2">
                      {locale === 'bn' ? 'আরজেন্সি লেভেল (Radio Card)' : 'Urgency Level'}
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <Radio
                        asCard
                        name="urgency"
                        checked={radioVal === 'standard'}
                        onChange={() => setRadioVal('standard')}
                        label={locale === 'bn' ? 'সাধারণ (Standard)' : 'Standard'}
                        description="২৪ ঘণ্টার মধ্যে"
                      />
                      <Radio
                        asCard
                        name="urgency"
                        checked={radioVal === 'urgent'}
                        onChange={() => setRadioVal('urgent')}
                        label={locale === 'bn' ? 'জরুরি (Urgent)' : 'Urgent'}
                        description="অবিলম্বে ডাক্তার দরকার"
                      />
                    </div>
                  </div>

                  <div className="pt-3 border-t border-stroke-subtle flex items-center justify-between">
                    <Switch
                      checked={switchVal}
                      onChange={setSwitchVal}
                      label={locale === 'bn' ? '২৪/৭ জরুরি নোটিফিকেশন চালু রাখুন' : '24/7 Emergency Alerts Active'}
                      description={locale === 'bn' ? 'কাছের প্রাণীর নোটিফিকেশন আসবে' : 'Receive instant push alerts'}
                    />
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* 6.3 Cards & Inspiration Elements (Ref 1 & Ref 2) */}
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-bold text-content-primary">
              3. Cards, Promo Banners &amp; Pastel Category Tiles (Ref 1 &amp; Ref 2)
            </h3>

            {/* Promo Banner (Ref 2 inspired) */}
            <PromoBanner
              tag={locale === 'bn' ? 'বিশেষ সেবা' : 'FREE CHECKUP'}
              title={locale === 'bn' ? 'রেসকিউ প্রাণীদের জন্য ফ্রি ভ্যাকসিনেশন ও হেলথ ক্যাম্প' : 'Free Vaccination & Health Camp for Rescued Pets'}
              description={locale === 'bn' ? 'ধানমন্ডি ও মিরপুর এলাকায় চলতি সপ্তাহে বিনামূল্যে প্রাথমিক চিকিৎসা দেওয়া হবে।' : 'Free medical checkup across Dhaka clinics this week.'}
              ctaText={locale === 'bn' ? 'সিরিয়াল নিন' : 'Claim Slot'}
              onCtaClick={() => setIsModalOpen(true)}
              illustration={<PawPrint className="w-20 h-20 text-white/30" />}
            />

            {/* Pastel Category Tiles (Ref 2 inspired) */}
            <div>
              <span className="text-xs font-semibold text-content-secondary uppercase tracking-wider block mb-3">
                Pastel Category Tiles (Dual Language Labels)
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                <CategoryTile
                  icon={<Stethoscope className="w-5 h-5 text-green-700 dark:text-green-300" />}
                  title={locale === 'bn' ? 'ক্লিনিক ডাক্তার' : 'Vet Clinic'}
                  subtitle={locale === 'bn' ? 'সিরিয়াল বুকিং' : 'Book Doctor'}
                  colorScheme="green"
                  isActive
                />
                <CategoryTile
                  icon={<Heart className="w-5 h-5 text-rose-600 dark:text-rose-300" />}
                  title={locale === 'bn' ? 'দত্তক গ্রহণ' : 'Adoption'}
                  subtitle={locale === 'bn' ? 'নতুন পরিবার' : 'Find Home'}
                  colorScheme="rose"
                />
                <CategoryTile
                  icon={<AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-300" />}
                  title={locale === 'bn' ? 'প্রাণী উদ্ধার' : 'Rescue Case'}
                  subtitle={locale === 'bn' ? 'জরুরি রিপোর্ট' : 'Report Animal'}
                  colorScheme="amber"
                />
                <CategoryTile
                  icon={<Home className="w-5 h-5 text-lime-700 dark:text-lime-300" />}
                  title={locale === 'bn' ? 'বাসায় ডাক্তার' : 'Home Visit'}
                  subtitle={locale === 'bn' ? 'হোম কেয়ার' : 'At-home Vet'}
                  colorScheme="lime"
                />
                <CategoryTile
                  icon={<Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-300" />}
                  title={locale === 'bn' ? 'গ্রুমিং ও বাথ' : 'Pet Grooming'}
                  subtitle={locale === 'bn' ? 'স্পা ও পরিচর্যা' : 'Spa & Care'}
                  colorScheme="blue"
                />
              </div>
            </div>

            {/* Basic & Glass Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card variant="basic" isInteractive padding="md" className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-green-600 dark:text-lime-400 uppercase">
                    {locale === 'bn' ? 'নিকটস্থ ক্লিনিক' : 'Nearest Clinic'}
                  </span>
                  <Chip label="এখন খোলা" variant="status" statusType="completed" />
                </div>
                <h4 className="text-lg font-bold text-content-primary">ধানমন্ডি পেট কেয়ার অ্যান্ড হসপিটাল</h4>
                <p className="text-xs text-content-secondary">
                  দূরত্ব: ২.৩ কি.মি. · ফি: ৳ ৬০০ · ড. তানভীর আহমেদ (BVC রেজি: ৪১৫২)
                </p>
                <div className="flex gap-2 mt-2">
                  <Button size="sm" variant="primary" leftIcon={<Calendar className="w-4 h-4" />}>
                    {locale === 'bn' ? 'বুক করুন' : 'Book'}
                  </Button>
                  <Button size="sm" variant="secondary" leftIcon={<Phone className="w-4 h-4" />}>
                    {locale === 'bn' ? 'কল' : 'Call'}
                  </Button>
                </div>
              </Card>

              <Card variant="glass" isInteractive padding="md" className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-lime-400 uppercase">
                    {locale === 'bn' ? 'উদ্ধার রিপোর্ট' : 'Urgent Rescue Case'}
                  </span>
                  <Chip label="উদ্ধার চলছে" variant="status" statusType="pending" />
                </div>
                <h4 className="text-lg font-bold text-content-primary">মিরপুর ১০ — আহত বিড়াল ছানা</h4>
                <p className="text-xs text-content-secondary">
                  রিপোর্টকারী: রিফাত · ৩ মিনিট আগে রিপোর্ট করা হয়েছে · রেসকিউয়ার রওনা হয়েছে
                </p>
                <div className="flex gap-2 mt-2">
                  <Button size="sm" variant="lime" leftIcon={<Navigation className="w-4 h-4" />}>
                    {locale === 'bn' ? 'লোকেশন দেখুন' : 'View Location'}
                  </Button>
                  <Button size="sm" variant="ghost">
                    {locale === 'bn' ? 'আপডেট' : 'Updates'}
                  </Button>
                </div>
              </Card>
            </div>
          </div>

          {/* 6.4 Chips, Badges & Stepper Tracker */}
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-bold text-content-primary">
              4. Chips, Status Badges &amp; Step Tracker
            </h3>

            <Card padding="md" className="flex flex-col gap-6">
              {/* Filter Chips */}
              <div>
                <span className="text-xs font-semibold text-content-secondary block mb-2">Filter Chips:</span>
                <div className="flex flex-wrap gap-2">
                  <Chip
                    label={locale === 'bn' ? 'এখন খোলা (Open Now)' : 'Open Now'}
                    isSelected={activeFilterChip === 'open_now'}
                    onSelect={() => setActiveFilterChip('open_now')}
                  />
                  <Chip
                    label={locale === 'bn' ? '২৪/৭ জরুরি' : '24/7 Emergency'}
                    isSelected={activeFilterChip === '24_7'}
                    onSelect={() => setActiveFilterChip('24_7')}
                  />
                  <Chip
                    label={locale === 'bn' ? 'বাসায় ভিজিট' : 'Home Visit'}
                    isSelected={activeFilterChip === 'home_visit'}
                    onSelect={() => setActiveFilterChip('home_visit')}
                  />
                  <Chip
                    label={locale === 'bn' ? 'টিকা সেবা' : 'Vaccination'}
                    isSelected={activeFilterChip === 'vaccine'}
                    onSelect={() => setActiveFilterChip('vaccine')}
                  />
                </div>
              </div>

              {/* Status Badges */}
              <div>
                <span className="text-xs font-semibold text-content-secondary block mb-2">Semantic Status Badges:</span>
                <div className="flex flex-wrap gap-2">
                  <Chip label={locale === 'bn' ? 'অপেক্ষমাণ' : 'Pending'} variant="status" statusType="pending" icon={<Clock className="w-3.5 h-3.5" />} />
                  <Chip label={locale === 'bn' ? 'অনুমোদিত' : 'Confirmed'} variant="status" statusType="confirmed" icon={<CheckCircle className="w-3.5 h-3.5" />} />
                  <Chip label={locale === 'bn' ? 'সম্পন্ন' : 'Completed'} variant="status" statusType="completed" icon={<CheckCircle className="w-3.5 h-3.5" />} />
                  <Chip label={locale === 'bn' ? 'খুব জরুরি' : 'Critical'} variant="status" statusType="emergency" icon={<AlertTriangle className="w-3.5 h-3.5" />} />
                  <Chip label={locale === 'bn' ? 'বাতিল' : 'Cancelled'} variant="status" statusType="neutral" />
                </div>
              </div>

              {/* Step Tracker */}
              <div className="border-t border-stroke-subtle pt-4">
                <span className="text-xs font-semibold text-content-secondary block mb-3">
                  Rescue &amp; Adoption 4-Step Tracker:
                </span>
                <StepTracker
                  currentStepIndex={stepIndex}
                  steps={[
                    { id: '1', label: locale === 'bn' ? 'জমা হয়েছে' : 'Submitted' },
                    { id: '2', label: locale === 'bn' ? 'দেখা হচ্ছে' : 'Reviewing' },
                    { id: '3', label: locale === 'bn' ? 'উদ্ধার চলছে' : 'In Action' },
                    { id: '4', label: locale === 'bn' ? 'সম্পন্ন' : 'Resolved' },
                  ]}
                />
                <div className="flex justify-center gap-2 mt-4">
                  <Button size="sm" variant="ghost" disabled={stepIndex === 0} onClick={() => setStepIndex((s) => s - 1)}>
                    পূর্ববর্তী ধাপ / Back
                  </Button>
                  <Button size="sm" variant="secondary" disabled={stepIndex === 3} onClick={() => setStepIndex((s) => s + 1)}>
                    পরবর্তী ধাপ / Next Step
                  </Button>
                </div>
              </div>

              {/* Linear Progress */}
              <div className="border-t border-stroke-subtle pt-4 flex flex-col gap-2">
                <ProgressBar
                  value={progressVal}
                  showPercentage
                  label={locale === 'bn' ? 'প্রোফাইল সম্পূর্ণতা' : 'Profile Completion'}
                />
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => setProgressVal((p) => Math.max(0, p - 10))}>
                    -10%
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setProgressVal((p) => Math.min(100, p + 10))}>
                    +10%
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* 6.5 Navigation & App Bars */}
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-bold text-content-primary">
              5. Navigation (Top Bar, Tabs &amp; Bottom Bar with Center FAB)
            </h3>

            <Card padding="none" className="overflow-hidden flex flex-col gap-4">
              {/* Top App Bar Preview */}
              <TopAppBar
                title={locale === 'bn' ? 'নিকটস্থ ভেটেরিনারি ডাক্তার' : 'Nearest Vet Doctors'}
                subtitle={locale === 'bn' ? 'ধানমন্ডি, ঢাকা' : 'Dhanmondi, Dhaka'}
                onBack={() => {}}
                actions={
                  <div className="flex items-center gap-1">
                    <button className="p-2 rounded-full hover:bg-green-100 dark:hover:bg-green-900 transition-colors">
                      <Bell className="w-5 h-5 text-content-secondary" />
                    </button>
                    <button className="p-2 rounded-full hover:bg-green-100 dark:hover:bg-green-900 transition-colors">
                      <Share2 className="w-5 h-5 text-content-secondary" />
                    </button>
                  </div>
                }
              />

              {/* Tabs Preview */}
              <div className="p-4">
                <Tabs
                  activeId={activeTab}
                  onChange={setActiveTab}
                  variant="underline"
                  items={[
                    { id: 'overview', label: locale === 'bn' ? 'সারসংক্ষেপ' : 'Overview', count: 3 },
                    { id: 'vaccines', label: locale === 'bn' ? 'টিকা রেকর্ড' : 'Vaccines', count: 5 },
                    { id: 'history', label: locale === 'bn' ? 'চিকিৎসা ইতিহাস' : 'Medical History' },
                    { id: 'reminders', label: locale === 'bn' ? 'রিমাইন্ডার' : 'Reminders', count: 1 },
                  ]}
                />
              </div>

              {/* Segmented Control */}
              <div className="p-4 border-t border-stroke-subtle flex justify-center">
                <SegmentedControl
                  selectedId={activeSegment}
                  onChange={setActiveSegment}
                  options={[
                    { id: 'all', label: locale === 'bn' ? 'সব (All)' : 'All' },
                    { id: 'open', label: locale === 'bn' ? 'এখন খোলা' : 'Open Now' },
                    { id: 'emergency', label: locale === 'bn' ? 'জরুরি সেবা' : 'Emergency' },
                  ]}
                />
              </div>

              {/* Bottom Navigation with Center Elevated FAB (Ref 1 inspired) */}
              <div className="p-4 bg-gray-50/60 dark:bg-green-950/40 border-t border-stroke-subtle">
                <span className="text-xs font-semibold text-content-secondary block mb-3 text-center">
                  Bottom Navigation with Center Elevated FAB (Ref 1):
                </span>
                <BottomNav
                  activeId={activeNav}
                  onChange={setActiveNav}
                  onFabClick={() => setIsModalOpen(true)}
                  items={[
                    { id: 'home', label: locale === 'bn' ? 'হোম' : 'Home', icon: <Home className="w-5 h-5" /> },
                    { id: 'map', label: locale === 'bn' ? 'ম্যাপ' : 'Map', icon: <MapPin className="w-5 h-5" /> },
                    { id: 'rescue', label: locale === 'bn' ? 'উদ্ধার' : 'Rescue', icon: <AlertTriangle className="w-5 h-5" />, badgeCount: 2 },
                    { id: 'profile', label: locale === 'bn' ? 'প্রোফাইল' : 'Profile', icon: <User className="w-5 h-5" /> },
                  ]}
                />
              </div>
            </Card>
          </div>

          {/* 6.6 List Items & Avatars */}
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-bold text-content-primary">
              6. List Items, Species Avatars &amp; Skeletons
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card padding="none" className="overflow-hidden divide-y divide-stroke-subtle">
                <ListItem
                  leading={<Avatar name="Minu" size="md" status="online" />}
                  title={locale === 'bn' ? 'মিনু (দেশীয় বিড়াল)' : 'Minu (Local Cat)'}
                  subtitle={locale === 'bn' ? 'বয়স: ১ বছর ২ মাস · রেবিস টিকা সম্পন্ন' : 'Age: 1y 2m · Rabies Vaccinated'}
                  showChevron
                  onClick={() => {}}
                />
                <ListItem
                  leading={<Avatar name="Tommy" size="md" status="emergency" />}
                  title={locale === 'bn' ? 'টমি (জার্মান শেফার্ড)' : 'Tommy (German Shepherd)'}
                  subtitle={locale === 'bn' ? 'টিকার সময় পার হয়ে গেছে (জরুরি)' : 'Vaccine Overdue (Emergency)'}
                  showChevron
                  onClick={() => {}}
                />
                <ListItem
                  leading={<Avatar icon={<Stethoscope className="w-5 h-5 text-green-600" />} size="md" />}
                  title={locale === 'bn' ? 'ড. তানভীর আহমেদ' : 'Dr. Tanvir Ahmed'}
                  subtitle={locale === 'bn' ? 'ভেটেরিনারি সার্জন · BVC ৪১৫২' : 'Veterinary Surgeon · BVC 4152'}
                  trailing={
                    <Button size="sm" variant="primary">বুক করুন</Button>
                  }
                />
              </Card>

              {/* Skeletons Preview */}
              <div className="flex flex-col gap-3">
                <span className="text-xs font-semibold text-content-secondary">
                  Shimmer Skeleton Loaders:
                </span>
                <CardSkeleton />
              </div>
            </div>
          </div>

          {/* 6.7 Feedback & Dialogs (Modal & Toast) */}
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-bold text-content-primary">
              7. Feedback, Modals &amp; Empty States
            </h3>

            <Card padding="md" className="flex flex-col gap-6">
              <div className="flex flex-wrap items-center gap-4">
                <Button variant="primary" onClick={() => setIsModalOpen(true)}>
                  {locale === 'bn' ? 'মডাল খুলুন / Open Modal' : 'Open Modal Dialog'}
                </Button>

                <Button variant="secondary" onClick={() => setShowToast(!showToast)}>
                  {locale === 'bn' ? 'টোস্ট নোটিফিকেশন টগল' : 'Toggle Toast'}
                </Button>
              </div>

              {/* Toast Display Preview */}
              {showToast && (
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-semibold text-content-secondary">Live Toast Previews:</span>
                  <div className="flex flex-wrap gap-3">
                    <Toast
                      type="success"
                      message={locale === 'bn' ? 'সিরিয়াল সফলভাবে নিশ্চিত হয়েছে!' : 'Booking Confirmed!'}
                      description={locale === 'bn' ? 'আপনার সিরিয়াল নম্বর: ১২' : 'Serial number: 12'}
                      onDismiss={() => setShowToast(false)}
                      actionText={locale === 'bn' ? 'রসিদ' : 'Receipt'}
                    />
                    <Toast
                      type="emergency"
                      message={locale === 'bn' ? 'জরুরি উদ্ধার অ্যালার্ট গৃহীত হয়েছে' : 'Emergency Rescue Alert Received'}
                      description={locale === 'bn' ? 'রেসকিউয়ার দ্রুত রওনা হচ্ছে' : 'Rescuer dispatched immediately'}
                      onDismiss={() => setShowToast(false)}
                    />
                  </div>
                </div>
              )}

              {/* Empty State Component */}
              <div className="border-t border-stroke-subtle pt-6">
                <EmptyState
                  icon={<PawPrint className="w-8 h-8" />}
                  title={locale === 'bn' ? 'কোনো পূর্ববর্তী অ্যাপয়েন্টমেন্ট নেই' : 'No Appointments Found'}
                  description={locale === 'bn' ? 'আপনার পোষা প্রাণীর জন্য নিকটস্থ ডাক্তারের সিরিয়াল নিতে নিচে চাপুন।' : 'Find trusted vets nearby and book your first serial.'}
                  actionText={locale === 'bn' ? 'ডাক্তার খুঁজুন' : 'Find Doctors'}
                  onAction={() => {}}
                />
              </div>
            </Card>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-stroke-subtle pt-8 pb-12 flex flex-col sm:flex-row items-center justify-between text-xs text-content-secondary gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-green-600 dark:text-lime-400">Pranora (প্রাণোরা)</span>
            <span>·</span>
            <span>Design System v1.0.0</span>
          </div>
          <p>
            Made with ❤️ for Bangladesh's pets · <a href="#colors" className="underline hover:text-green-600">Back to Top</a>
          </p>
        </footer>
      </main>

      {/* Modal Dialog Instance */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={locale === 'bn' ? 'জরুরি প্রাণী উদ্ধার রিপোর্ট' : 'Report Emergency Rescue'}
        description={locale === 'bn' ? 'পরিস্থিতির সঠিক তথ্য দিন যাতে উদ্ধারকারী দ্রুত পৌঁছাতে পারে' : 'Provide exact details for immediate rescuer dispatch'}
        variant="center"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              {locale === 'bn' ? 'বাতিল' : 'Cancel'}
            </Button>
            <Button variant="danger" leftIcon={<AlertTriangle className="w-4 h-4" />} onClick={() => setIsModalOpen(false)}>
              {locale === 'bn' ? 'রিপোর্ট পাঠান' : 'Submit Report'}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4 text-left">
          <Input
            label={locale === 'bn' ? 'প্রাণীর বর্তমান অবস্থান' : 'Current Location'}
            defaultValue="মিরপুর ১০ গোলচত্বর, ঢাকা"
            leftIcon={<MapPin className="w-4 h-4" />}
          />
          <Textarea
            label={locale === 'bn' ? 'আঘাতের বর্ণনা' : 'Injury Details'}
            defaultValue="একটি বিড়াল ছানা ড্রেনে পড়ে আহত হয়েছে।"
          />
        </div>
      </Modal>
    </div>
  );
}
