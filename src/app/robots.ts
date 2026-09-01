import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/siteConfig';

// Served automatically at /robots.txt by Next.js's file-convention route.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
