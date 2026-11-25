import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://pranora.com.bd';
  const locales = ['bn', 'en'];

  const coreRoutes = [
    '',
    '/map',
    '/emergency',
    '/clinics',
    '/adoption',
    '/rescue/report',
    '/services',
    '/tips',
    '/sitting',
    '/training',
    '/terms',
    '/privacy',
  ];

  const now = new Date();

  const entries: MetadataRoute.Sitemap = [];

  for (const route of coreRoutes) {
    for (const locale of locales) {
      entries.push({
        url: `${baseUrl}/${locale}${route}`,
        lastModified: now,
        changeFrequency: route === '/map' || route === '/emergency' ? 'daily' : 'weekly',
        priority: route === '' ? 1.0 : route === '/emergency' || route === '/map' ? 0.9 : 0.7,
      });
    }
  }

  return entries;
}
