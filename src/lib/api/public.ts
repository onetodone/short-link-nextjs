import { networkError, parseApiError, readErrorBody } from '@/lib/api/problem'

export async function apiPublicFetch<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response
  try {
    res = await fetch(`/api/v1${path}`, {
      ...init,
      credentials: 'include',
      headers: { 'content-type': 'application/json', ...init?.headers },
    })
  } catch {
    throw networkError()
  }

  if (!res.ok) {
    throw parseApiError(res.status, await readErrorBody(res))
  }

  const text = await res.text()
  return text ? (JSON.parse(text) as T) : (undefined as T)
}
