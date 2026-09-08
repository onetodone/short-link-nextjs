'use client'

import { useEffect, type ReactNode } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/context'

function safeInternalPath(value: string | null): string | null {
  return value && value.startsWith('/') && !value.startsWith('//') ? value : null
}

export function AuthGuard({ fallback, children }: { fallback: ReactNode; children: ReactNode }) {
  const { status } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (status !== 'unauthenticated') return
    const next = pathname && pathname !== '/' ? `?next=${encodeURIComponent(pathname)}` : ''
    router.replace(`/login${next}`)
  }, [status, pathname, router])

  if (status !== 'authenticated') return <>{fallback}</>
  return <>{children}</>
}

export function RedirectIfAuthenticated({ children }: { children: ReactNode }) {
  const { status } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (status !== 'authenticated') return
    const next = safeInternalPath(new URLSearchParams(window.location.search).get('next'))
    router.replace(next ?? '/')
  }, [status, router])

  if (status === 'authenticated') return null
  return <>{children}</>
}
