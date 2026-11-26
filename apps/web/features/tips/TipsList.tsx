'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useLocale } from '@pranora/i18n';
import type { Article, ArticleCategory } from '@pranora/api';
import { listArticles, MOCK_ARTICLES } from '@pranora/api';
import { useSession } from '../../hooks/useSession';

export interface TipsListProps {
  initialArticles?: Article[];
}

export function TipsList({ initialArticles }: TipsListProps) {
  const { t, isBangla } = useLocale();
  const params = useParams();
  const localeParam = (params?.locale as string) ?? 'bn';
  const { supabase, isConfigured } = useSession();

  const [articles, setArticles] = useState<Article[]>(() => initialArticles ?? MOCK_ARTICLES);

  useEffect(() => {
    if (!isConfigured || initialArticles) return;
    let active = true;
    listArticles(supabase)
      .then((res) => {
        if (active && res.data && res.data.length > 0) setArticles(res.data);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [isConfigured, initialArticles, supabase]);
  const [selectedCategory, setSelectedCategory] = useState<ArticleCategory>('all');
  const [selectedSpecies, setSelectedSpecies] = useState<'all' | 'cat' | 'dog'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories: { key: ArticleCategory; label: string; icon: string }[] = [
    { key: 'all', label: t('tips:categoryAll'), icon: '📚' },
    { key: 'diet', label: t('tips:categoryDiet'), icon: '🥩' },
    { key: 'vaccine', label: t('tips:categoryVaccine'), icon: '💉' },
    { key: 'health', label: t('tips:categoryHealth'), icon: '🩺' },
    { key: 'grooming', label: t('tips:categoryGrooming'), icon: '✂️' },
    { key: 'first_aid', label: t('tips:categoryFirstAid'), icon: '🩹' },
  ];

  const filteredArticles = useMemo(() => {
    return articles.filter((a) => {
      // Category filter
      if (selectedCategory !== 'all' && a.category !== selectedCategory) {
        return false;
      }
      // Species filter
      if (
        selectedSpecies !== 'all' &&
        !a.species.includes(selectedSpecies) &&
        !a.species.includes('all')
      ) {
        return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const title = (isBangla ? a.title_bn : a.title_en).toLowerCase();
        const excerpt = (
          isBangla ? a.excerpt_bn ?? '' : a.excerpt_en ?? ''
        ).toLowerCase();
        const body = (isBangla ? a.body_bn : a.body_en).toLowerCase();
        return (
          title.includes(query) || excerpt.includes(query) || body.includes(query)
        );
      }
      return true;
    });
  }, [articles, selectedCategory, selectedSpecies, searchQuery, isBangla]);

  const featuredArticle = useMemo(() => {
    return articles.find((a) => a.is_featured) ?? articles[0];
  }, [articles]);

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'diet':
        return t('tips:categoryDiet');
      case 'vaccine':
        return t('tips:categoryVaccine');
      case 'health':
        return t('tips:categoryHealth');
      case 'grooming':
        return t('tips:categoryGrooming');
      case 'first_aid':
        return t('tips:categoryFirstAid');
      default:
        return t('tips:categoryAll');
    }
  };

  const getSpeciesBadge = (sp: string[]) => {
    if (sp.includes('all')) return isBangla ? '🐾 সকল প্রাণী' : '🐾 All Pets';
    if (sp.includes('cat') && sp.includes('dog'))
      return isBangla ? '🐱 বিড়াল ও 🐶 কুকুর' : '🐱 Cats & 🐶 Dogs';
    if (sp.includes('cat')) return isBangla ? '🐱 বিড়াল' : '🐱 Cats';
    if (sp.includes('dog')) return isBangla ? '🐶 কুকুর' : '🐶 Dogs';
    return isBangla ? '🐾 পোষা প্রাণী' : '🐾 Pets';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
          <span>🐾</span>
          <span>{isBangla ? 'প্রাণোরা গাইড' : 'Pranora Guide'}</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-content-primary tracking-tight">
          {t('tips:pageTitle')}
        </h1>
        <p className="text-sm sm:text-base text-content-secondary">
          {t('tips:pageSubtitle')}
        </p>
      </div>

      {/* Search Bar */}
      <div className="max-w-xl mx-auto relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
          🔍
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('tips:searchPlaceholder')}
          className="w-full bg-white dark:bg-zinc-800 border border-stroke-subtle rounded-2xl pl-11 pr-4 py-3 text-sm text-content-primary placeholder:text-content-secondary shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            ✕
          </button>
        )}
      </div>

      {/* Category Pills & Species Switcher */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-stroke-subtle pb-4">
        {/* Categories */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.key}
              type="button"
              onClick={() => setSelectedCategory(cat.key)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition flex items-center gap-1.5 ${
                selectedCategory === cat.key
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-white dark:bg-zinc-800 text-content-secondary hover:bg-gray-100 dark:hover:bg-zinc-700 border border-stroke-subtle'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Species Filter */}
        <div className="flex items-center gap-1 self-start sm:self-center bg-gray-100 dark:bg-zinc-800 p-1 rounded-xl shrink-0 text-xs">
          <button
            type="button"
            onClick={() => setSelectedSpecies('all')}
            className={`px-3 py-1 rounded-lg font-medium transition ${
              selectedSpecies === 'all'
                ? 'bg-white dark:bg-zinc-700 text-content-primary shadow-xs'
                : 'text-content-secondary'
            }`}
          >
            {isBangla ? 'সকল' : 'All'}
          </button>
          <button
            type="button"
            onClick={() => setSelectedSpecies('cat')}
            className={`px-3 py-1 rounded-lg font-medium transition ${
              selectedSpecies === 'cat'
                ? 'bg-white dark:bg-zinc-700 text-content-primary shadow-xs'
                : 'text-content-secondary'
            }`}
          >
            🐱 {isBangla ? 'বিড়াল' : 'Cats'}
          </button>
          <button
            type="button"
            onClick={() => setSelectedSpecies('dog')}
            className={`px-3 py-1 rounded-lg font-medium transition ${
              selectedSpecies === 'dog'
                ? 'bg-white dark:bg-zinc-700 text-content-primary shadow-xs'
                : 'text-content-secondary'
            }`}
          >
            🐶 {isBangla ? 'কুকুর' : 'Dogs'}
          </button>
        </div>
      </div>

      {/* Featured Article Card (Shown when on 'all' without search query) */}
      {!searchQuery && selectedCategory === 'all' && featuredArticle && (
        <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-emerald-800 via-green-800 to-teal-900 text-white p-6 sm:p-10 shadow-md">
          <div className="max-w-2xl space-y-3 relative z-10">
            <div className="flex items-center gap-2">
              <span className="bg-amber-400 text-zinc-900 text-[11px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                ⭐ {t('tips:featuredTitle')}
              </span>
              <span className="bg-white/20 text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-full backdrop-blur-xs">
                {getCategoryLabel(featuredArticle.category)}
              </span>
              <span className="text-white/80 text-xs">
                ⏱️ {featuredArticle.read_time_minutes} {t('tips:readTimeMinutes')}
              </span>
            </div>

            <h2 className="text-xl sm:text-3xl font-extrabold leading-snug">
              {isBangla ? featuredArticle.title_bn : featuredArticle.title_en}
            </h2>

            <p className="text-white/90 text-sm sm:text-base leading-relaxed line-clamp-2">
              {isBangla ? featuredArticle.excerpt_bn : featuredArticle.excerpt_en}
            </p>

            <div className="pt-2">
              <Link
                href={`/${localeParam}/tips/${featuredArticle.slug}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-emerald-900 font-bold text-sm hover:bg-emerald-50 transition shadow"
              >
                <span>📖 {isBangla ? 'পুরো নিবন্ধটি পড়ুন' : 'Read Full Article'}</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Articles Grid */}
      {filteredArticles.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-zinc-800 rounded-3xl border border-stroke-subtle p-8">
          <span className="text-4xl">🔍</span>
          <h3 className="text-base font-bold text-content-primary mt-3">
            {t('tips:emptySearch')}
          </h3>
          <p className="text-xs text-content-secondary mt-1">
            {isBangla
              ? 'অন্য কোনো শব্দ বা ক্যাটাগরি নির্বাচন করে চেষ্টা করুন।'
              : 'Try searching with different keywords or clearing filters.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((article) => {
            const title = isBangla ? article.title_bn : article.title_en;
            const excerpt = isBangla ? article.excerpt_bn : article.excerpt_en;
            const author = isBangla
              ? article.author_name_bn
              : article.author_name_en;

            return (
              <Link
                key={article.id}
                href={`/${localeParam}/tips/${article.slug}`}
                className="group flex flex-col justify-between bg-white dark:bg-zinc-800 border border-stroke-subtle hover:border-primary/50 rounded-2xl p-5 shadow-xs hover:shadow-md transition"
              >
                <div className="space-y-3">
                  {/* Badges */}
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="inline-block px-2.5 py-0.5 rounded-md bg-primary/10 text-primary font-semibold">
                      {getCategoryLabel(article.category)}
                    </span>
                    <span className="text-content-secondary text-[11px]">
                      ⏱️ {article.read_time_minutes} {t('tips:readTimeMinutes')}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold text-content-primary group-hover:text-primary transition line-clamp-2 leading-snug">
                    {title}
                  </h3>

                  {/* Excerpt */}
                  {excerpt && (
                    <p className="text-xs text-content-secondary leading-relaxed line-clamp-3">
                      {excerpt}
                    </p>
                  )}
                </div>

                {/* Footer Info */}
                <div className="mt-4 pt-3 border-t border-stroke-subtle flex items-center justify-between text-[11px] text-content-secondary">
                  <span>{getSpeciesBadge(article.species)}</span>
                  <span className="font-medium truncate max-w-[140px]">
                    {author}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Medical Disclaimer Banner */}
      <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
            <span>🛡️</span> {t('tips:disclaimerTitle')}
          </p>
          <p className="text-xs text-amber-800 dark:text-amber-300/80 leading-relaxed max-w-3xl">
            {t('tips:disclaimerText')}
          </p>
        </div>
        <Link
          href={`/${localeParam}/map`}
          className="shrink-0 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
        >
          🏥 {t('tips:consultVetBtn')}
        </Link>
      </div>
    </div>
  );
}
