import { apiFetch } from '@/lib/api/client'
import type { CreatedUrl, UrlList, UrlSummary } from '@/lib/api/types'

export const URLS_PAGE_SIZE = 12

/** Fields sent when creating or editing a link; a `null` note clears it. */
export interface UrlChanges {
  url: string
  note: string | null
}

export function listUrls(page: number): Promise<UrlList> {
  const offset = Math.max(0, (page - 1) * URLS_PAGE_SIZE)
  const query = new URLSearchParams({ limit: String(URLS_PAGE_SIZE), offset: String(offset) })
  return apiFetch<UrlList>(`/urls?${query.toString()}`)
}

/** Loads one of the caller's links; `404` when it doesn't exist or belongs to someone else. */
export function getUrl(shortCode: string): Promise<UrlSummary> {
  return apiFetch<UrlSummary>(`/urls/${encodeURIComponent(shortCode)}`)
}

export function createUrl(changes: UrlChanges): Promise<CreatedUrl> {
  return apiFetch<CreatedUrl>('/urls', { method: 'POST', body: JSON.stringify(changes) })
}

export function updateUrl(shortCode: string, changes: UrlChanges): Promise<UrlSummary> {
  return apiFetch<UrlSummary>(`/urls/${encodeURIComponent(shortCode)}`, {
    method: 'PATCH',
    body: JSON.stringify(changes),
  })
}

export function deleteUrl(shortCode: string): Promise<void> {
  return apiFetch<void>(`/urls/${encodeURIComponent(shortCode)}`, { method: 'DELETE', body: '{}' })
}
