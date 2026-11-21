import type { TypedSupabaseClient } from '../client';
import type { Article, ArticleListQuery, ArticleCategory } from '@pranora/validation';

export type { Article, ArticleListQuery, ArticleCategory };

// ── In-Memory Fallback Dataset (§4.12, §8.1, SVC-TIPS) ─────────────────────────

export const MOCK_ARTICLES: Article[] = [
  {
    id: 'art-001-hot-weather',
    slug: 'hot-weather-cat-hydration-care',
    title_bn: 'তীব্র গরমে বিড়ালের পানিশূন্যতা রোধ ও দৈনন্দিন যত্ন',
    title_en: 'Preventing Cat Dehydration and Daily Care in Hot Weather',
    body_bn: `বাংলাদেশে গ্রীষ্মের তাপদাহে বিড়ালরা সহজেই ডিহাইড্রেশন বা পানিশূন্যতার শিকার হয়। বিড়াল প্রকৃতিগতভাবে কম পানি পান করে, যার ফলে মূত্রনালীর ইনফেকশন বা কিডনির জটিলতা সৃষ্টি হতে পারে।

## ১. পানির পাত্র ও পরিষ্কার পরিচ্ছন্নতা
বিড়ালের খাবার ও পানির পাত্র কখনোই পাশাপাশি রাখবেন না। অন্তত দুটি ভিন্ন স্থানে পরিষ্কার মাটির পাত্রে বা সিরামিকের পাত্রে ঠান্ডা পানি রাখুন। বিড়াল চলন্ত পানি পছন্দ করে, তাই সম্ভব হলে পেট ওয়াটার ফাউন্টেন ব্যবহার করতে পারেন।

## ২. ভেজা খাবার বা ওয়েট ফুড
শুকনো ড্রাই ফুডের পাশাপাশি দৈনিক খাবারে ওয়েট ফুড (যেমন- স্যুপ, ক্যান ফুড বা সেদ্ধ মুরগির মাংসের ঝোল) যোগ করুন। এতে তাদের শরীরের ৬০-৭০% পানির চাহিদা খাদ্য থেকেই পূরণ হবে।

## ৩. হিটস্ট্রোকের লক্ষণ
যদি বিড়াল মুখ হাঁ করে কুকুরের মতো দম ফেলে (Panting), লালা ঝরায় বা নিস্তেজ হয়ে পড়ে, তবে অবিলম্বে ভেজা সুতি কাপড় দিয়ে তার পায়ের তালু এবং কান মুছে দিন এবং ফ্যানের নিচে রাখুন। কখনোই বরফ পানি ঢালবেন না।`,
    body_en: `During scorching summer months in Bangladesh, domestic cats are at high risk of heat exhaustion and dehydration. Naturally, cats have a low thirst drive, which increases the likelihood of feline urinary tract issues and kidney stress.

## 1. Fresh Water Stations
Keep fresh water bowls away from food dishes. Place water stations in quiet, shaded spots. Ceramic or stainless steel bowls keep water cooler. Consider a pet water fountain as running water encourages cats to drink more.

## 2. Incorporate Wet Food
Complement dry kibble with formulated wet food, broth, or boiled chicken broth (without salt or onions). Wet food provides natural hydration and eases digestion.

## 3. Warning Signs of Heatstroke
If your cat pants with mouth open, drools excessively, or becomes unresponsive, gently apply room-temperature damp towels to paw pads and seek veterinary attention immediately. Never submerge in ice water.`,
    excerpt_bn: 'গ্রীষ্মের তাপদাহে বিড়ালের সুস্থতা নিশ্চিত করতে বিশুদ্ধ পানি সরবরাহ, ওয়েট ফুড এবং হিটস্ট্রোকের সতর্কতা সম্পর্কে জেনে নিন।',
    excerpt_en: 'Crucial tips on keeping cats hydrated, encouraging water intake, and recognizing heatstroke signs during peak summer.',
    category: 'diet',
    species: ['cat'],
    cover_url: null,
    read_time_minutes: 4,
    tags: ['cat', 'hydration', 'summer', 'diet'],
    is_featured: true,
    author_name_bn: 'ডাঃ সাকিব হাসান (ভেটেরিনারি সার্জন)',
    author_name_en: 'Dr. Sakib Hasan (Veterinary Surgeon)',
    published_at: '2026-05-10T10:00:00.000Z',
    created_at: '2026-05-10T10:00:00.000Z',
  },
  {
    id: 'art-002-puppy-vaccines',
    slug: 'puppy-essential-vaccination-schedule-bd',
    title_bn: 'ছানা কুকুরের প্রাথমিক টিকা ও টিকাদান নির্দেশিকা',
    title_en: 'Essential Puppy Vaccination Guide & Schedule in Bangladesh',
    body_bn: `ছানা কুকুর (Puppy) ঘরে আনার পর সবচেয়ে গুরুত্বপূর্ণ দায়িত্ব হলো তাদের সময়মতো টিকা দেওয়া। প্রাথমিক টিকা না দিলে পারভো ভাইরাস ও ডিস্টেম্পারের মতো মারাত্মক সংক্রামক রোগে ছানার মৃত্যুঝুঁকি থাকে।

## প্রাথমিক টিকার সময়সূচি:
1. **৬ থেকে ৮ সপ্তাহ:** প্রথম DHPPIL কম্বিনেশন ভ্যাকসিন (পারভো, ডিস্টেম্পার, হেপাটাইটিস ও লেপ্টোস্পাইরোসিস প্রতিরোধী)।
2. **১০ থেকে ১২ সপ্তাহ:** কম্বিনেশন টিকার প্রথম বুস্টার ডোজ।
3. **৩ মাস (১২ সপ্তাহ):** জলাতঙ্ক বা র‍্যাবিস (Rabies) টিকা।
4. **বার্ষিক:** প্রতি বছর একবার র‍্যাবিস ও কম্বিনেশন বুস্টার টিকা নবায়ন করতে হবে।

## টিকাদানের আগে করণীয়:
টিকা দেওয়ার অন্তত ৭ দিন আগে নিবন্ধিত ভেটেরিনারি চিকিৎসকের পরামর্শ অনুযায়ী সঠিক ডোজে কৃমিনাশক (Dewormer) খাওয়াতে হবে। অসুস্থ বা জ্বর থাকা অবস্থায় কখনোই টিকা দেবেন না।`,
    body_en: `Welcoming a puppy into your home requires an absolute commitment to their core immunization schedule. Unvaccinated puppies face mortality rates over 80% from Parvovirus and Canine Distemper.

## Recommended Schedule:
1. **6-8 Weeks:** First DHPPiL core combination shot.
2. **10-12 Weeks:** Second booster dose.
3. **12 Weeks (3 Months):** Rabies vaccination.
4. **Annual:** Yearly rabies and multi-component booster shots.

## Important Pre-conditions:
Deworm your puppy under clinical supervision at least 7 days before vaccine administration. Never vaccinate an animal that exhibits fever, diarrhea, or acute lethargy.`,
    excerpt_bn: 'ছানা কুকুরের জীবন বাঁচাতে পারভোভাইরাস ও জলাতঙ্কের প্রাথমিক টিকাদানের সঠিক সময়সূচি ও নিয়মাবলী।',
    excerpt_en: 'A complete timeline for puppy core vaccinations, deworming prerequisites, and annual booster routines.',
    category: 'vaccine',
    species: ['dog'],
    cover_url: null,
    read_time_minutes: 3,
    tags: ['dog', 'puppy', 'vaccine', 'rabies'],
    is_featured: false,
    author_name_bn: 'প্রাণোরা ভেটেরিনারি বোর্ড',
    author_name_en: 'Pranora Veterinary Board',
    published_at: '2026-06-14T09:30:00.000Z',
    created_at: '2026-06-14T09:30:00.000Z',
  },
  {
    id: 'art-003-monsoon-skin',
    slug: 'monsoon-skin-infection-prevention',
    title_bn: 'বর্ষাকালে পোষা প্রাণীর ত্বকের ছত্রাক ও অ্যালার্জি প্রতিরোধ',
    title_en: 'Preventing Monsoon Fungal Skin Infections in Pets',
    body_bn: `বর্ষার স্যাঁতসেঁতে আবহাওয়া এবং উচ্চ আর্দ্রতায় কুকুর ও বিড়ালের ত্বকে ফাঙ্গাল ইনফেকশন ও চুলকানির প্রাদুর্ভাব বেড়ে যায়।

## কীভাবে প্রতিরোধ করবেন:
- **লোম সর্বদা শুকনা রাখুন:** বৃষ্টিতে ভিজলে বা বাইরে থেকে এলে তোয়ালে দিয়ে লোম এবং পায়ের আঙুলের ফাঁক ভালোভাবে মুছে দিন।
- **নিয়মিত ব্রাশ করা:** প্রতিদিন লোম ব্রাশ করলে জমে থাকা ধুলাবালি দূর হয় এবং ত্বকে স্বাভাবিক বাতাস চলাচল করতে পারে।
- **অ্যান্টি-ফাঙ্গাল শ্যাম্পু:** চিকিৎসকের পরামর্শ ছাড়া মানুষের কোনো সাবান বা অ্যান্টিসেপটিক ব্যবহার করবেন না। মাসে দুইবার পেট-সেফ অ্যান্টিফাঙ্গাল শ্যাম্পু দিয়ে গোসল করান।
- **লালচে ভাব বা দুর্গন্ধ:** ত্বকে চুলকানি, লোম ওঠা বা দুর্গন্ধ দেখা দিলে ঘরে চিকিৎসা না করে দ্রুত পশু চিকিৎসকের পরামর্শ নিন।`,
    body_en: `The humid monsoon season in Bangladesh creates an ideal environment for dermatophytes, yeast infections, and bacterial dermatitis in domestic pets.

## Prevention Essentials:
- **Dry thoroughly:** Dry coat and paw crevices completely after walking in rain.
- **Daily brushing:** Removes trapped dampness and promotes skin aeration.
- **Appropriate shampoo:** Use only vet-recommended antifungal wash; never use human soap or harsh antiseptics.
- **Early clinical signs:** Red circular lesions, persistent scratching, or bad odors warrant professional evaluation.`,
    excerpt_bn: 'বর্ষার আর্দ্র আবহাওয়ায় লোমশ বন্ধুদের ত্বকের ছত্রাক সংক্রমণ, রিংওয়ার্ম ও চুলকানি এড়ানোর উপায়।',
    excerpt_en: 'How to protect dogs and cats from dampness-induced fungal dermatitis and yeast infections during the rainy season.',
    category: 'health',
    species: ['dog', 'cat'],
    cover_url: null,
    read_time_minutes: 3,
    tags: ['skin', 'fungal', 'monsoon', 'grooming'],
    is_featured: false,
    author_name_bn: 'ডাঃ ফারিহা রহমান',
    author_name_en: 'Dr. Fariha Rahman',
    published_at: '2026-07-20T14:15:00.000Z',
    created_at: '2026-07-20T14:15:00.000Z',
  },
  {
    id: 'art-004-toxic-items',
    slug: 'toxic-household-items-pet-poisoning',
    title_bn: 'ঘরের বিষাক্ত উপাদান: পোষা প্রাণীর জন্য মারাত্মক যে খাবার ও জিনিস',
    title_en: 'Toxic Household Substances & Dangerous Human Foods for Pets',
    body_bn: `অনেক সাধারণ খাবার ও গৃহস্থালি পণ্য মানুষের জন্য নিরাপদ হলেও পোষা প্রাণীর জন্য অত্যন্ত বিষাক্ত এমনকি প্রাণঘাতী হতে পারে।

## কখনোই খাওয়াবেন না:
1. **চকলেট ও ক্যাফেইন:** থিওব্রোমিন উপাদান হৃদযন্ত্রের ছন্দ ব্যাহত করে।
2. **পেঁয়াজ ও রসুন:** লোহিত রক্তকণিকা ভেঙে ফেলে রক্তশূন্যতা ঘটায়।
3. **আঙুর ও কিশমিশ:** বিড়াল ও কুকুরের আকস্মিক কিডনি ফেইলিউর ঘটাতে পারে।
4. **প্যারাসিটামল ও মানুষের ব্যথানাশক:** বিড়ালের ক্ষেত্রে একটি প্যারাসিটামল ট্যাবলেট মৃত্যু ঘটাতে পারে।

## বিষক্রিয়া শনাক্ত হলে তাৎক্ষণিক করণীয়:
পোষা প্রাণী যদি বমি করে, মুখ দিয়ে ফেনা তোলে বা কাঁপতে থাকে—তবে ঘরে বসে দুধ বা স্যালাইন জোর করে খাওয়ানোর চেষ্টা করবেন না। অবিলম্বে প্রাণোরার জরুরি ম্যাপ দেখে নিকটস্থ ২৪/৭ জরুরি ভেটেরিনারি ক্লিনিকে নিয়ে যান।`,
    body_en: `Common kitchen staples and household cleaners can cause catastrophic poisoning in companion animals.

## Strictly Prohibited Items:
1. **Chocolate & Caffeine:** Theobromine causes severe cardiac arrhythmia.
2. **Onions & Garlic:** Causes oxidative damage to red blood cells, resulting in hemolytic anemia.
3. **Grapes & Raisins:** Can trigger sudden acute renal failure.
4. **Paracetamol / Acetaminophen:** Extremely lethal to felines even in microscopic doses.

## Emergency Response:
Never induce vomiting or force-feed milk without medical direction. Locate the nearest 24/7 veterinary hospital on the Pranora emergency map and transport immediately.`,
    excerpt_bn: 'পেঁয়াজ, চকলেট, আঙুর ও প্যারাসিটামলের মতো বিষাক্ত খাবার থেকে পোষা প্রাণীকে সুরক্ষিত রাখার নির্দেশিকা।',
    excerpt_en: 'Recognize toxic human foods and medications that present severe medical emergencies for dogs and cats.',
    category: 'first_aid',
    species: ['all'],
    cover_url: null,
    read_time_minutes: 4,
    tags: ['toxic', 'poison', 'first_aid', 'emergency'],
    is_featured: true,
    author_name_bn: 'প্রাণোরা জরুরি মেডিকেল সেল',
    author_name_en: 'Pranora Emergency Medical Cell',
    published_at: '2026-08-05T11:00:00.000Z',
    created_at: '2026-08-05T11:00:00.000Z',
  },
  {
    id: 'art-005-cat-scratching',
    slug: 'cat-scratching-furniture-solutions',
    title_bn: 'বিড়ালের ফার্নিচার আঁচড়ানো বন্ধ করার সহজ ও বিজ্ঞানসম্মত উপায়',
    title_en: 'Preventing Cats from Scratching Furniture Scientifically',
    body_bn: `বিড়ালের নখ আঁচড়ানো একটি প্রাকৃতিক ও সহজাত অভ্যাস। নখ ধারালো রাখা, মাংসপেশি প্রসারিত করা এবং গন্ধের মাধ্যমে নিজের এলাকা চিহ্নিত করতে তারা আঁচড়ায়।

## ফার্নিচার বাঁচানোর টিপস:
- **স্ক্র্যাচিং পোস্টের সঠিক অবস্থান:** যে সোফা বা খাটের কোণে বিড়াল আঁচড়ায়, ঠিক তার পাশেই মজবুত সিসাল রোপের তৈরি স্ক্র্যাচিং পোস্ট রাখুন।
- **ক্যাটনিপ ব্যবহার:** নতুন স্ক্র্যাচিং পোস্টে ক্যাটনিপ স্প্রে বা গুঁড়ো ছিটিয়ে দিলে বিড়াল সহজে আকৃষ্ট হয়।
- **নখ কাটার অভ্যাস:** প্রতি ২-৩ সপ্তাহে একবার বিশেষ পেট নেইল ক্লিপার দিয়ে নখের একদম ডগা সাবধানে কেটে দিন (কখনোই কুইক বা গোলাপি অংশ কাটবেন না)।`,
    body_en: `Scratching is a vital feline behavioral instinct. It sheds outer claw husks, stretches tendon groups, and deposits scent markings from paw glands.

## Effective Strategies:
- **Strategic Scratching Posts:** Place durable sisal rope scratchers directly adjacent to target furniture.
- **Catnip Attraction:** Rub dried organic catnip onto scratching boards to attract play.
- **Regular Trimming:** Clip claw tips every 2-3 weeks using designated pet trimmers, taking care to avoid the pink quick.`,
    excerpt_bn: 'বিড়ালের নখ আঁচড়ানোর প্রাকৃতিক অভ্যাস বুঝতে এবং সোফা-ফার্নিচার রক্ষা করার কার্যকর পদ্ধতি।',
    excerpt_en: 'Constructive behavioral tips to fulfill natural feline claw instincts without ruining home furniture.',
    category: 'grooming',
    species: ['cat'],
    cover_url: null,
    read_time_minutes: 3,
    tags: ['cat', 'behavior', 'grooming', 'scratching'],
    is_featured: false,
    author_name_bn: 'ডাঃ ফারহানা কবির',
    author_name_en: 'Dr. Farhana Kabir',
    published_at: '2026-08-18T16:20:00.000Z',
    created_at: '2026-08-18T16:20:00.000Z',
  },
];

// ── API Functions ────────────────────────────────────────────────────────────

/**
 * List published articles with optional filters for category, species, and text search.
 */
export async function listArticles(
  client?: TypedSupabaseClient | null,
  query?: ArticleListQuery
): Promise<{ data: Article[]; count?: number; error?: string }> {
  try {
    if (!client) {
      return filterMockArticles(query);
    }

    let q = client
      .from('articles' as never)
      .select('*', { count: 'exact' })
      .order('published_at', { ascending: false });

    if (query?.category && query.category !== 'all') {
      q = q.eq('category', query.category);
    }

    if (query?.featured != null) {
      q = q.eq('is_featured', query.featured);
    }

    if (query?.limit) {
      const from = query.offset ?? 0;
      const to = from + query.limit - 1;
      q = q.range(from, to);
    }

    const { data, count, error } = await q;

    if (error || !data || data.length === 0) {
      return filterMockArticles(query);
    }

    let results = (data as unknown as Article[]) ?? [];
    if (query?.search) {
      const s = query.search.toLowerCase();
      results = results.filter(
        (a) =>
          a.title_bn.toLowerCase().includes(s) ||
          a.title_en.toLowerCase().includes(s) ||
          (a.excerpt_bn && a.excerpt_bn.toLowerCase().includes(s)) ||
          (a.excerpt_en && a.excerpt_en.toLowerCase().includes(s))
      );
    }

    return { data: results, count: count ?? results.length };
  } catch {
    return filterMockArticles(query);
  }
}

/**
 * Fetch a single article by unique slug
 */
export async function getArticleBySlug(
  client?: TypedSupabaseClient | null,
  slug: string = ''
): Promise<{ data: Article | null; error?: string }> {
  try {
    if (!client) {
      const match = MOCK_ARTICLES.find((a) => a.slug === slug) ?? null;
      return { data: match };
    }

    const { data, error } = await client
      .from('articles' as never)
      .select('*')
      .eq('slug', slug)
      .single();

    if (error || !data) {
      const match = MOCK_ARTICLES.find((a) => a.slug === slug) ?? null;
      return { data: match };
    }

    return { data: data as unknown as Article };
  } catch {
    const match = MOCK_ARTICLES.find((a) => a.slug === slug) ?? null;
    return { data: match };
  }
}

/**
 * Fetch featured care articles for home screen carousel or banner
 */
export async function getFeaturedArticles(
  client?: TypedSupabaseClient | null,
  limit: number = 3
): Promise<{ data: Article[]; error?: string }> {
  const res = await listArticles(client, { featured: true, limit });
  if (res.data.length > 0) return { data: res.data };
  return { data: MOCK_ARTICLES.filter((a) => a.is_featured).slice(0, limit) };
}

/**
 * Fetch related articles by category, excluding current article ID
 */
export async function getRelatedArticles(
  client?: TypedSupabaseClient | null,
  currentSlug: string = '',
  category: string = 'diet',
  limit: number = 3
): Promise<{ data: Article[]; error?: string }> {
  const res = await listArticles(client, {
    category: category as Article['category'],
    limit: limit + 1,
  });

  const filtered = res.data.filter((a) => a.slug !== currentSlug).slice(0, limit);
  if (filtered.length > 0) return { data: filtered };

  return {
    data: MOCK_ARTICLES.filter((a) => a.slug !== currentSlug).slice(0, limit),
  };
}

// ── In-Memory Helper Filter ──────────────────────────────────────────────────

function filterMockArticles(query?: ArticleListQuery): {
  data: Article[];
  count: number;
} {
  let list = [...MOCK_ARTICLES];

  if (query?.category && query.category !== 'all') {
    list = list.filter((a) => a.category === query.category);
  }

  if (query?.species && query.species !== 'all') {
    list = list.filter(
      (a) => a.species.includes(query.species!) || a.species.includes('all')
    );
  }

  if (query?.featured != null) {
    list = list.filter((a) => a.is_featured === query.featured);
  }

  if (query?.search) {
    const s = query.search.toLowerCase();
    list = list.filter(
      (a) =>
        a.title_bn.toLowerCase().includes(s) ||
        a.title_en.toLowerCase().includes(s) ||
        (a.excerpt_bn && a.excerpt_bn.toLowerCase().includes(s)) ||
        (a.excerpt_en && a.excerpt_en.toLowerCase().includes(s))
    );
  }

  const offset = query?.offset ?? 0;
  const limit = query?.limit ?? 20;
  const paginated = list.slice(offset, offset + limit);

  return { data: paginated, count: list.length };
}
