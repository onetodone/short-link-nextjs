'use client'

import { createContext, useCallback, useContext, useEffect, useSyncExternalStore, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import type { AuthUser } from '@/lib/api/types'
import {
  ensureBooted,
  getServerSessionSnapshot,
  getSessionSnapshot,
  logout as sessionLogout,
  refreshIfStale,
  subscribeSession,
} from '@/lib/auth/session'

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'

interface AuthContextValue {
  status: AuthStatus
  user: AuthUser | null
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const { user, booted } = useSyncExternalStore(subscribeSession, getSessionSnapshot, getServerSessionSnapshot)

  useEffect(() => {
    void ensureBooted()

    const onFocus = () => {
      if (document.visibilityState === 'visible') refreshIfStale()
    }
    document.addEventListener('visibilitychange', onFocus)
    window.addEventListener('focus', onFocus)
    return () => {
      document.removeEventListener('visibilitychange', onFocus)
      window.removeEventListener('focus', onFocus)
    }
  }, [])

  const logout = useCallback(() => {
    sessionLogout()
    router.replace('/login')
  }, [router])

  const status: AuthStatus = !booted ? 'loading' : user ? 'authenticated' : 'unauthenticated'

  return <AuthContext value={{ status, user, logout }}>{children}</AuthContext>
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth must be used within <AuthProvider>')
  return value
}
