import { decodeExp } from '@/lib/auth/jwt'
import { getAccessToken, setAccessToken } from '@/lib/auth/token-store'
import { SessionExpiredError } from '@/lib/api/errors'
import { networkError } from '@/lib/api/problem'
import type { AuthResponse, AuthUser } from '@/lib/api/types'

const CHANNEL_NAME = 'short-link-auth'
const REFRESH_PATH = '/api/v1/auth/refresh'
const LOGOUT_PATH = '/api/v1/auth/logout'
const LOGOUT_ALL_PATH = '/api/v1/auth/logout-all'
const PROACTIVE_SKEW_MS = 60_000
const FOCUS_REFRESH_WINDOW_MS = 120_000

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

type BroadcastMessage = { type: 'token'; accessToken: string; user: AuthUser } | { type: 'clear' }

if (channel) {
  channel.onmessage = (event: MessageEvent<BroadcastMessage>) => {
    const message = event.data
    if (message?.type === 'clear') {
      if (snapshot.user) {
        applyClear()
        emitExpired()
      }
    } else if (message?.type === 'token') {
      setAccessToken(message.accessToken)
      setSnapshot({ user: message.user })
      scheduleProactiveRefresh(message.accessToken)
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
  if (broadcast) {
    channel?.postMessage({
      type: 'token',
      accessToken: response.accessToken,
      user: response.user,
    } satisfies BroadcastMessage)
  }
  return response.accessToken
}

function applyClear(): void {
  setAccessToken(null)
  clearProactiveTimer()
  setSnapshot({ user: null })
}

function revokeOnServer(path: string, accessToken: string | null): void {
  if (!accessToken) return
  void fetch(path, {
    method: 'POST',
    credentials: 'include',
    headers: { Authorization: `Bearer ${accessToken}` },
    keepalive: true,
  }).catch(() => {})
}

export function logout(): void {
  revokeOnServer(LOGOUT_PATH, getAccessToken())
  applyClear()
  channel?.postMessage({ type: 'clear' } satisfies BroadcastMessage)
}

export function logoutAll(): void {
  revokeOnServer(LOGOUT_ALL_PATH, getAccessToken())
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

async function doRefresh(attempt = 0): Promise<string> {
  let res: Response
  try {
    res = await fetch(REFRESH_PATH, {
      method: 'POST',
      credentials: 'include',
      headers: { 'content-type': 'application/json' },
      body: '{}',
    })
  } catch {
    // Network failure, not an auth failure: keep the session, let the caller retry.
    throw networkError()
  }

  if (res.status === 429 && attempt < 2) {
    const retryAfter = Number(res.headers.get('retry-after'))
    const delayMs = (Number.isFinite(retryAfter) && retryAfter > 0 ? Math.min(retryAfter, 5) : 1) * 1000
    await new Promise((resolve) => setTimeout(resolve, delayMs))
    return doRefresh(attempt + 1)
  }

  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      expireSession()
      throw new SessionExpiredError()
    }
    throw networkError()
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

export function refreshIfStale(): void {
  if (!snapshot.user) return

  const token = getAccessToken()
  if (token === null) {
    void refreshAccessToken().catch(() => {})
    return
  }

  const exp = decodeExp(token)
  if (exp === null) return
  if (exp * 1000 - Date.now() <= FOCUS_REFRESH_WINDOW_MS) {
    void refreshAccessToken().catch(() => {})
  }
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
