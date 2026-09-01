import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/siteConfig';

// Served automatically at /sitemap.xml by Next.js's file-convention route.
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    { url: `${SITE_URL}/`, lastModified, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/about`, lastModified, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/contact`, lastModified, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/privacy`, lastModified, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/developers`, lastModified, changeFrequency: 'monthly', priority: 0.4 },
  ];
}
