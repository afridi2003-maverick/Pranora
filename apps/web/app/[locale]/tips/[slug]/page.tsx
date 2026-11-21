'use client';

import React, { useEffect, useState } from 'react';
import { useParams, notFound } from 'next/navigation';
import { LanguageHeader } from '../../../../components/LanguageHeader';
import { ArticleDetail } from '../../../../features/tips';
import type { Article } from '@pranora/api';
import { getArticleBySlug, getRelatedArticles, MOCK_ARTICLES } from '@pranora/api';

export default function ArticleDetailPage() {
  const params = useParams();
  const slug = (params?.slug as string) ?? '';

  const [article, setArticle] = useState<Article | null>(() => {
    return MOCK_ARTICLES.find((a) => a.slug === slug) ?? null;
  });
  const [related, setRelated] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchArticle() {
      if (!slug) return;
      const res = await getArticleBySlug(null, slug);
      if (res.data) {
        setArticle(res.data);
        const relRes = await getRelatedArticles(null, slug, res.data.category, 3);
        setRelated(relRes.data);
      }
      setLoading(false);
    }
    fetchArticle();
  }, [slug]);

  if (!loading && !article) {
    notFound();
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-app-bg flex items-center justify-center">
        <span className="animate-spin inline-block w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app-bg">
      <LanguageHeader />
      <main className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
        <ArticleDetail article={article} relatedArticles={related} />
      </main>
    </div>
  );
}
