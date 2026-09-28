import { apiFetch } from '@/lib/api/client'
import type { CreatedUrl, UrlList, UrlSummary } from '@/lib/api/types'

export const URLS_PAGE_SIZE = 12

export function listUrls(page: number): Promise<UrlList> {
  const offset = Math.max(0, (page - 1) * URLS_PAGE_SIZE)
  const query = new URLSearchParams({ limit: String(URLS_PAGE_SIZE), offset: String(offset) })
  return apiFetch<UrlList>(`/urls?${query.toString()}`)
}

export function createUrl(url: string): Promise<CreatedUrl> {
  return apiFetch<CreatedUrl>('/urls', { method: 'POST', body: JSON.stringify({ url }) })
}

export function updateUrl(shortCode: string, url: string): Promise<UrlSummary> {
  return apiFetch<UrlSummary>(`/urls/${encodeURIComponent(shortCode)}`, {
    method: 'PATCH',
    body: JSON.stringify({ url }),
  })
}

export function deleteUrl(shortCode: string): Promise<void> {
  return apiFetch<void>(`/urls/${encodeURIComponent(shortCode)}`, { method: 'DELETE', body: '{}' })
}

export async function findOriginalUrl(shortCode: string, maxPages = 10): Promise<string | null> {
  for (let page = 1; page <= maxPages; page++) {
    const { items, total, limit, offset } = await listUrls(page)
    const hit = items.find((item) => item.shortCode === shortCode)
    if (hit) return hit.originalUrl
    if (items.length === 0 || offset + limit >= total) break
  }
  return null
}
