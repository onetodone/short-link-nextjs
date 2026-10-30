import { apiPublicFetch } from '@/lib/api/public'
import type { PublicConfig } from '@/lib/api/types'

let configPromise: Promise<PublicConfig> | null = null

/** The API's public settings, fetched once per page load; a failed request is forgotten so the next call retries. */
export function fetchPublicConfig(): Promise<PublicConfig> {
  configPromise ??= apiPublicFetch<PublicConfig>('/config').catch((error: unknown) => {
    configPromise = null
    throw error
  })
  return configPromise
}
