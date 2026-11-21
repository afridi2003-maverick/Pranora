'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useLocale } from '@pranora/i18n';
import type { Article } from '@pranora/api';
import { MOCK_ARTICLES } from '@pranora/api';

export interface ArticleDetailProps {
  article: Article;
  relatedArticles?: Article[];
}

export function ArticleDetail({
  article,
  relatedArticles = [],
}: ArticleDetailProps) {
  const { t, isBangla } = useLocale();
  const params = useParams();
  const localeParam = (params?.locale as string) ?? 'bn';

  const [copied, setCopied] = useState(false);

  const title = isBangla ? article.title_bn : article.title_en;
  const body = isBangla ? article.body_bn : article.body_en;
  const author = isBangla ? article.author_name_bn : article.author_name_en;

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard?.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

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

  // Safe formatting for markdown headings and paragraphs
  const renderFormattedBody = (content: string) => {
    const paragraphs = content.split('\n\n');
    return paragraphs.map((para, idx) => {
      const trimmed = para.trim();
      if (!trimmed) return null;

      if (trimmed.startsWith('## ')) {
        return (
          <h2
            key={idx}
            className="text-lg sm:text-xl font-bold text-content-primary mt-6 mb-3 pt-2 border-t border-stroke-subtle"
          >
            {trimmed.replace('## ', '')}
          </h2>
        );
      }

      if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
        const items = trimmed.split('\n');
        return (
          <ul key={idx} className="list-disc list-inside space-y-1.5 my-3 text-content-primary/90 text-sm sm:text-base leading-relaxed">
            {items.map((it, i) => (
              <li key={i}>{it.replace(/^[-•]\s*/, '')}</li>
            ))}
          </ul>
        );
      }

      if (/^\d+\.\s/.test(trimmed)) {
        const items = trimmed.split('\n');
        return (
          <ol key={idx} className="list-decimal list-inside space-y-1.5 my-3 text-content-primary/90 text-sm sm:text-base leading-relaxed">
            {items.map((it, i) => (
              <li key={i}>{it.replace(/^\d+\.\s*/, '')}</li>
            ))}
          </ol>
        );
      }

      return (
        <p key={idx} className="text-content-primary/90 text-sm sm:text-base leading-relaxed my-3">
          {trimmed}
        </p>
      );
    });
  };

  const related =
    relatedArticles.length > 0
      ? relatedArticles
      : MOCK_ARTICLES.filter((a) => a.slug !== article.slug).slice(0, 3);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href={`/${localeParam}/tips`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
        >
          <span>←</span>
          <span>{t('tips:backToTips')}</span>
        </Link>

        <button
          type="button"
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-content-secondary text-xs font-semibold transition"
        >
          <span>🔗</span>
          <span>{copied ? t('tips:copiedLink') : t('tips:shareArticle')}</span>
        </button>
      </div>

      {/* Article Header */}
      <div className="space-y-4 bg-white dark:bg-zinc-800 border border-stroke-subtle rounded-3xl p-6 sm:p-10 shadow-xs">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-bold">
            {getCategoryLabel(article.category)}
          </span>
          <span className="px-3 py-1 rounded-full bg-gray-100 dark:bg-zinc-700 text-content-secondary font-medium">
            {getSpeciesBadge(article.species)}
          </span>
          <span className="text-content-secondary text-xs ml-auto">
            ⏱️ {article.read_time_minutes} {t('tips:readTimeMinutes')}
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-content-primary leading-tight">
          {title}
        </h1>

        <div className="flex items-center gap-3 pt-3 border-t border-stroke-subtle text-xs text-content-secondary">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
            👨‍⚕️
          </div>
          <div>
            <p className="font-bold text-content-primary">{author}</p>
            <p className="text-[11px] text-content-secondary">
              {t('tips:publishedOn')}: 2026
            </p>
          </div>
        </div>

        {/* Article Body */}
        <div className="pt-6 border-t border-stroke-subtle prose dark:prose-invert max-w-none">
          {renderFormattedBody(body)}
        </div>
      </div>

      {/* Urgent Vet Callout */}
      <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-base font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-2">
            <span>🏥</span> {t('tips:needVetHelp')}
          </h3>
          <p className="text-xs sm:text-sm text-emerald-800 dark:text-emerald-300/80 max-w-xl">
            {t('tips:disclaimerText')}
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Link
            href={`/${localeParam}/map`}
            className="px-4 py-2.5 rounded-xl bg-primary hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-xs transition"
          >
            🗺️ {t('tips:consultVetBtn')}
          </Link>
          <Link
            href={`/${localeParam}/assistant`}
            className="px-4 py-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-emerald-300 text-emerald-800 dark:text-emerald-300 font-bold text-xs sm:text-sm hover:bg-emerald-50 transition"
          >
            🤖 {isBangla ? 'এআই সহকারী' : 'AI Assistant'}
          </Link>
        </div>
      </div>

      {/* Related Articles */}
      {related.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-content-primary">
            📚 {t('tips:relatedArticles')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {related.map((rel) => {
              const relTitle = isBangla ? rel.title_bn : rel.title_en;
              const relExcerpt = isBangla ? rel.excerpt_bn : rel.excerpt_en;

              return (
                <Link
                  key={rel.id}
                  href={`/${localeParam}/tips/${rel.slug}`}
                  className="group bg-white dark:bg-zinc-800 border border-stroke-subtle hover:border-primary/50 rounded-2xl p-4 shadow-xs transition flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <span className="text-[11px] px-2 py-0.5 rounded bg-primary/10 text-primary font-semibold inline-block">
                      {getCategoryLabel(rel.category)}
                    </span>
                    <h4 className="text-sm font-bold text-content-primary group-hover:text-primary transition line-clamp-2">
                      {relTitle}
                    </h4>
                    {relExcerpt && (
                      <p className="text-xs text-content-secondary line-clamp-2">
                        {relExcerpt}
                      </p>
                    )}
                  </div>
                  <div className="mt-3 pt-2 border-t border-stroke-subtle text-[11px] text-content-secondary flex justify-between">
                    <span>⏱️ {rel.read_time_minutes} min</span>
                    <span className="text-primary font-semibold group-hover:translate-x-0.5 transition">
                      →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
