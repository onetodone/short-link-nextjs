import type { MetadataRoute } from 'next'
import { getSiteUrl } from '@/lib/site'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      // The more specific `allow` paths take precedence over `Disallow: /`; `/$` matches only the landing page.
      // Styles, scripts and icons stay crawlable so search engines render the pages as visitors see them.
      allow: [
        '/$',
        '/sitemap.xml',
        '/opengraph-image',
        '/login',
        '/register',
        '/terms-of-use',
        '/privacy-policy',
        '/_next/static/',
        '/_next/image',
        '/icon',
        '/apple-icon',
        '/manifest.webmanifest',
      ],
      disallow: '/',
    },
    sitemap: `${getSiteUrl()}/sitemap.xml`,
  }
}
