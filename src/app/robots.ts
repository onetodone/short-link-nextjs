import type { MetadataRoute } from 'next'
import { getSiteUrl } from '@/lib/site'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      // The more specific `allow` paths take precedence over `Disallow: /`; `/$` matches only the landing page.
      allow: ['/$', '/sitemap.xml', '/opengraph-image', '/login', '/register', '/terms-of-use', '/privacy-policy'],
      disallow: '/',
    },
    sitemap: `${getSiteUrl()}/sitemap.xml`,
  }
}
