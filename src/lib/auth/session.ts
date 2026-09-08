import { decodeExp } from '@/lib/auth/jwt'
import { setAccessToken } from '@/lib/auth/token-store'
import { SessionExpiredError } from '@/lib/api/errors'
import type { AuthResponse, AuthUser } from '@/lib/api/types'

const CHANNEL_NAME = 'short-url-auth'
const REFRESH_PATH = '/api/v1/auth/refresh'
const PROACTIVE_SKEW_MS = 60_000

export interface SessionSnapshot {
  user: AuthUser | null
  booted: boolean
}

const SERVER_SNAPSHOT: SessionSnapshot = { user: null, booted: false }
let snapshot: SessionSnapshot = { user: null, booted: false }
const storeListeners = new Set<() => void>()

function setSnapshot(patch: Partial<SessionSnapshot>): void {
  snapshot = { ...snapshot, ...patch }
  for (const notify of storeListeners) notify()
}

export function subscribeSession(fn: () => void): () => void {
  storeListeners.add(fn)
  return () => {
    storeListeners.delete(fn)
  }
}

export function getSessionSnapshot(): SessionSnapshot {
  return snapshot
}

export function getServerSessionSnapshot(): SessionSnapshot {
  return SERVER_SNAPSHOT
}

const expiryListeners = new Set<() => void>()

export function onSessionExpired(fn: () => void): () => void {
  expiryListeners.add(fn)
  return () => {
    expiryListeners.delete(fn)
  }
}

function emitExpired(): void {
  for (const notify of expiryListeners) notify()
}

const channel: BroadcastChannel | null =
  typeof window !== 'undefined' && typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(CHANNEL_NAME) : null

type BroadcastMessage = { type: 'adopt' } | { type: 'clear' }

if (channel) {
  channel.onmessage = (event: MessageEvent<BroadcastMessage>) => {
    if (event.data?.type === 'clear') {
      if (snapshot.user) {
        applyClear()
        emitExpired()
      }
    } else if (event.data?.type === 'adopt') {
      void refreshAccessToken().catch(() => {})
    }
  }
}

let proactiveTimer: ReturnType<typeof setTimeout> | null = null

function clearProactiveTimer(): void {
  if (proactiveTimer) {
    clearTimeout(proactiveTimer)
    proactiveTimer = null
  }
}

function scheduleProactiveRefresh(accessToken: string): void {
  clearProactiveTimer()
  const exp = decodeExp(accessToken)
  if (exp === null) return

  const fireInMs = exp * 1000 - Date.now() - PROACTIVE_SKEW_MS
  if (fireInMs <= 0) return

  proactiveTimer = setTimeout(() => {
    void refreshAccessToken().catch(() => {})
  }, fireInMs)
}

export function adopt(response: AuthResponse, broadcast = true): string {
  setAccessToken(response.accessToken)
  setSnapshot({ user: response.user })
  scheduleProactiveRefresh(response.accessToken)
  if (broadcast) channel?.postMessage({ type: 'adopt' } satisfies BroadcastMessage)
  return response.accessToken
}

function applyClear(): void {
  setAccessToken(null)
  clearProactiveTimer()
  setSnapshot({ user: null })
}

export function logout(): void {
  applyClear()
  channel?.postMessage({ type: 'clear' } satisfies BroadcastMessage)
}

export function expireSession(): void {
  const hadSession = snapshot.user !== null
  applyClear()
  if (hadSession) emitExpired()
}

let refreshPromise: Promise<string> | null = null

export function refreshAccessToken(): Promise<string> {
  if (refreshPromise) return refreshPromise
  refreshPromise = doRefresh().finally(() => {
    refreshPromise = null
  })
  return refreshPromise
}

async function doRefresh(): Promise<string> {
  let res: Response
  try {
    res = await fetch(REFRESH_PATH, {
      method: 'POST',
      credentials: 'include',
      headers: { 'content-type': 'application/json' },
      body: '{}',
    })
  } catch {
    expireSession()
    throw new SessionExpiredError()
  }

  if (!res.ok) {
    expireSession()
    throw new SessionExpiredError()
  }

  let body: AuthResponse
  try {
    body = (await res.json()) as AuthResponse
  } catch {
    expireSession()
    throw new SessionExpiredError()
  }

  if (typeof body?.accessToken !== 'string' || !body.user) {
    expireSession()
    throw new SessionExpiredError()
  }

  return adopt(body)
}

let bootPromise: Promise<void> | null = null

export function ensureBooted(): Promise<void> {
  if (!bootPromise) {
    bootPromise = refreshAccessToken().then(
      () => setSnapshot({ booted: true }),
      () => setSnapshot({ booted: true }),
    )
  }
  return bootPromise
}
