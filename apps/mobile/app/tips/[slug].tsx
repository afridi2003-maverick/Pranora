import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ArticleDetailScreen } from '../../features/tips';
import type { Article } from '@pranora/api';
import { getArticleBySlug, getRelatedArticles, MOCK_ARTICLES } from '@pranora/api';

export default function ArticleDetailRoute() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const [article, setArticle] = useState<Article | null>(() => {
    return MOCK_ARTICLES.find((a) => a.slug === slug) ?? null;
  });
  const [related, setRelated] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!slug) return;
      const res = await getArticleBySlug(null, slug);
      if (res.data) {
        setArticle(res.data);
        const relRes = await getRelatedArticles(null, slug, res.data.category, 3);
        setRelated(relRes.data);
      }
      setLoading(false);
    }
    loadData();
  }, [slug]);

  if (loading && !article) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
  }

  if (!article) {
    return null;
  }

  return <ArticleDetailScreen article={article} relatedArticles={related} />;
}
