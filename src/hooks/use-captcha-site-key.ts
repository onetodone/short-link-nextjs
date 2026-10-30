'use client'

import { fetchPublicConfig } from '@/lib/api/config'
import { useApiQuery } from '@/hooks/use-api-query'

/**
 * The Turnstile site key from the API's public config: `undefined` while it loads, `null` when the
 * bot check is off or the config couldn't be loaded (the API then reports a missing token itself).
 */
export function useCaptchaSiteKey(): string | null | undefined {
  const { data, loading } = useApiQuery('public-config', fetchPublicConfig)
  if (loading) return undefined
  return data?.turnstileSiteKey || null
}
