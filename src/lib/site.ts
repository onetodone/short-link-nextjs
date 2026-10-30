/** Product name shown in the UI, metadata and legal texts. */
export const SITE_NAME = 'ShortLink'

/**
 * Public base URL from `NEXT_PUBLIC_APP_URL`, without a trailing slash, for metadata, the sitemap
 * and robots.txt. Falls back to the local dev server so a build without it still succeeds.
 */
export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/+$/, '') || 'http://localhost:3001'
}
