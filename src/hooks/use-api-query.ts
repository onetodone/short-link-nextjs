'use client'

import { useCallback, useEffect, useState } from 'react'

interface Settled<T> {
  key: string
  data?: T
  error?: Error
}

export interface ApiQueryResult<T> {
  data: T | undefined
  error: Error | undefined
  loading: boolean
  refetch: () => void
}

export function useApiQuery<T>(key: string, fetcher: () => Promise<T>): ApiQueryResult<T> {
  const [settled, setSettled] = useState<Settled<T> | null>(null)
  const [nonce, setNonce] = useState(0)

  const refetch = useCallback(() => setNonce((value) => value + 1), [])

  useEffect(() => {
    let cancelled = false
    fetcher().then(
      (data) => {
        if (!cancelled) setSettled({ key, data })
      },
      (error: unknown) => {
        if (!cancelled) {
          setSettled({ key, error: error instanceof Error ? error : new Error(String(error)) })
        }
      },
    )
    return () => {
      cancelled = true
    }
  }, [key, nonce, fetcher])

  const current = settled?.key === key ? settled : null
  return { data: current?.data, error: current?.error, loading: current === null, refetch }
}
