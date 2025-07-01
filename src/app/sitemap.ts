import { MetadataRoute } from 'next'
 
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://sagepostai.com';

  const staticRoutes = [
    '/',
    '/about-team',
    '/contact',
    '/cookie-policy',
    '/disclaimer',
    '/privacy-policy',
    '/refund-policy',
    '/terms-of-service',
    '/login',
    '/dashboard',
    '/quick-post',
    '/visual-post',
    '/smart-campaign',
    '/trends'
  ];

  const sitemapEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '/' ? 'weekly' : 'monthly',
    priority: route === '/' ? 1 : 0.8,
  }));

  return sitemapEntries;
}
