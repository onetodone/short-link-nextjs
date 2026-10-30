import { SessionExpiredError } from '@/lib/api/errors'
import { networkError, parseApiError, readErrorBody } from '@/lib/api/problem'
import { getAccessToken } from '@/lib/auth/token-store'
import { expireSession, refreshAccessToken } from '@/lib/auth/session'

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  let token = getAccessToken() ?? (await refreshAccessToken())
  let retried = false

  for (;;) {
    let res: Response
    try {
      res = await fetch(`/api/v1${path}`, {
        ...init,
        credentials: 'include',
        headers: {
          'content-type': 'application/json',
          ...init?.headers,
          authorization: `Bearer ${token}`,
        },
      })
    } catch {
      throw networkError()
    }

    if (res.status === 401 && !retried) {
      retried = true
      token = await refreshAccessToken()
      continue
    }

    if (res.status === 401) {
      expireSession()
      throw new SessionExpiredError()
    }

    if (res.status === 204) return undefined as T

    if (!res.ok) {
      const error = parseApiError(res.status, await readErrorBody(res))
      // An access token issued before a suspension still passes the signature check until it expires.
      if (error.code === 'ACCOUNT_SUSPENDED') expireSession(error.message)
      throw error
    }

    const text = await res.text()
    return text ? (JSON.parse(text) as T) : (undefined as T)
  }
}
