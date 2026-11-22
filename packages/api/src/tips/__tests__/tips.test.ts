import {
  listArticles,
  getArticleBySlug,
  getFeaturedArticles,
  getRelatedArticles,
  MOCK_ARTICLES,
} from '../index';

describe('SVC-TIPS: Pet Care Tips & Educational Guides', () => {
  it('loads seeded articles with fallback', async () => {
    const articles = await listArticles();
    expect(articles.length).toBeGreaterThanOrEqual(5);
  });

  it('filters articles by category', async () => {
    const dietArticles = await listArticles(null, { category: 'diet' });
    expect(dietArticles.length).toBeGreaterThan(0);
    expect(dietArticles.every((a) => a.category === 'diet')).toBe(true);
  });

  it('filters articles by species', async () => {
    const catArticles = await listArticles(null, { species: 'cat' });
    expect(catArticles.length).toBeGreaterThan(0);
    expect(catArticles.every((a) => a.species === 'cat' || a.species === 'all')).toBe(true);
  });

  it('fetches featured articles', async () => {
    const featured = await getFeaturedArticles();
    expect(featured.length).toBeGreaterThan(0);
    expect(featured.every((a) => a.is_featured)).toBe(true);
  });

  it('retrieves article by slug in Bangla and English', async () => {
    const article = await getArticleBySlug(null, 'cat-toxic-foods-bangladesh');
    expect(article).not.toBeNull();
    expect(article?.title_bn).toContain('বিড়ালকে ভুলেও যেসব খাবার দেবেন না');
    expect(article?.author_name_bn).toContain('ডা. ফারহানা চৌধুরী');
  });

  it('retrieves related articles', async () => {
    const current = MOCK_ARTICLES[0]!;
    const related = await getRelatedArticles(null, current.id, current.category);
    expect(related.every((r) => r.id !== current.id)).toBe(true);
  });
});
