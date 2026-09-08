'use client'

import { useCallback } from 'react'
import { listUrls } from '@/lib/api/urls'
import { useApiQuery, type ApiQueryResult } from '@/hooks/use-api-query'
import type { UrlList } from '@/lib/api/types'

export function useUrls(page: number): ApiQueryResult<UrlList> {
  const fetcher = useCallback(() => listUrls(page), [page])
  return useApiQuery(`urls:${page}`, fetcher)
}
