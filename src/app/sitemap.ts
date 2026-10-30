import type { MetadataRoute } from 'next'
import { getSiteUrl } from '@/lib/site'

const PUBLIC_PAGES: { path: string; changeFrequency: 'monthly' | 'yearly'; priority: number }[] = [
  { path: '/', changeFrequency: 'monthly', priority: 1 },
  { path: '/register', changeFrequency: 'yearly', priority: 0.8 },
  { path: '/login', changeFrequency: 'yearly', priority: 0.8 },
  { path: '/terms-of-use', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/privacy-policy', changeFrequency: 'yearly', priority: 0.3 },
]

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl()
  return PUBLIC_PAGES.map(({ path, changeFrequency, priority }) => ({
    url: `${siteUrl}${path}`,
    changeFrequency,
    priority,
  }))
}
