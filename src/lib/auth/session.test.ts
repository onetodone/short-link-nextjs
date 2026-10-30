import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { AuthResponse } from '@/lib/api/types'

class FakeBroadcastChannel {
  static instances: FakeBroadcastChannel[] = []
  readonly posted: unknown[] = []
  onmessage: ((event: MessageEvent) => void) | null = null

  constructor(readonly name: string) {
    FakeBroadcastChannel.instances.push(this)
  }

  postMessage(message: unknown): void {
    this.posted.push(message)
  }

  receive(data: unknown): void {
    this.onmessage?.({ data } as MessageEvent)
  }
}

// A token without an `exp` claim, so no proactive refresh timer is scheduled.
function token(name: string): string {
  return `${name}.e30.sig`
}

const user = { id: 'u1', email: 'ann@example.com', emailVerified: false }

function json(status: number, body: unknown, headers?: Record<string, string>): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', ...headers } })
}

function authResponse(name: string): AuthResponse {
  return { accessToken: token(name), user }
}

function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((r) => (resolve = r))
  return { promise, resolve }
}

const fetchMock = vi.fn<typeof fetch>()

function callsTo(path: string) {
  return fetchMock.mock.calls.filter(([input]) => String(input) === path)
}

async function load() {
  const session = await import('@/lib/auth/session')
  const tokenStore = await import('@/lib/auth/token-store')
  const client = await import('@/lib/api/client')
  const errors = await import('@/lib/api/errors')
  const channel = FakeBroadcastChannel.instances[0]
  return { session, tokenStore, client, errors, channel }
}

beforeEach(() => {
  vi.resetModules()
  FakeBroadcastChannel.instances = []
  fetchMock.mockReset()
  vi.stubGlobal('window', globalThis)
  vi.stubGlobal('BroadcastChannel', FakeBroadcastChannel)
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
  vi.useRealTimers()
})

describe('refreshAccessToken', () => {
  it('shares one in-flight refresh between concurrent callers', async () => {
    const { session } = await load()
    const response = deferred<Response>()
    fetchMock.mockReturnValueOnce(response.promise)

    const calls = [session.refreshAccessToken(), session.refreshAccessToken(), session.refreshAccessToken()]
    response.resolve(json(200, authResponse('fresh')))

    await expect(Promise.all(calls)).resolves.toEqual([token('fresh'), token('fresh'), token('fresh')])
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('starts a new refresh once the previous one settled', async () => {
    const { session } = await load()
    fetchMock.mockResolvedValueOnce(json(200, authResponse('first')))
    fetchMock.mockResolvedValueOnce(json(200, authResponse('second')))

    await expect(session.refreshAccessToken()).resolves.toBe(token('first'))
    await expect(session.refreshAccessToken()).resolves.toBe(token('second'))
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('posts to /auth/refresh with credentials and adopts the result', async () => {
    const { session, tokenStore, channel } = await load()
    fetchMock.mockResolvedValueOnce(json(200, authResponse('fresh')))

    await session.refreshAccessToken()

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/auth/refresh',
      expect.objectContaining({ method: 'POST', credentials: 'include' }),
    )
    expect(tokenStore.getAccessToken()).toBe(token('fresh'))
    expect(session.getSessionSnapshot().user).toEqual(user)
    expect(channel.posted).toEqual([{ type: 'token', accessToken: token('fresh'), user }])
  })

  it('expires the session on 401 and notifies expiry listeners', async () => {
    const { session, tokenStore, errors } = await load()
    session.adopt(authResponse('old'), false)
    const onExpired = vi.fn()
    session.onSessionExpired(onExpired)
    fetchMock.mockResolvedValueOnce(json(401, { message: 'Unauthorized' }))

    await expect(session.refreshAccessToken()).rejects.toBeInstanceOf(errors.SessionExpiredError)
    expect(tokenStore.getAccessToken()).toBeNull()
    expect(session.getSessionSnapshot().user).toBeNull()
    expect(onExpired).toHaveBeenCalledTimes(1)
  })

  it('keeps the session on a network failure', async () => {
    const { session, tokenStore, errors } = await load()
    session.adopt(authResponse('old'), false)
    fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch'))

    const error = await session.refreshAccessToken().catch((e: unknown) => e)

    expect(error).toBeInstanceOf(errors.ApiError)
    expect((error as InstanceType<typeof errors.ApiError>).code).toBe('NETWORK')
    expect(tokenStore.getAccessToken()).toBe(token('old'))
  })

  it('expires the session on a malformed success body', async () => {
    const { session, errors } = await load()
    fetchMock.mockResolvedValueOnce(json(200, { accessToken: 42 }))

    await expect(session.refreshAccessToken()).rejects.toBeInstanceOf(errors.SessionExpiredError)
  })
})

describe('429 backoff', () => {
  it('waits Retry-After seconds, then retries', async () => {
    vi.useFakeTimers()
    const { session } = await load()
    fetchMock.mockResolvedValueOnce(json(429, {}, { 'retry-after': '2' }))
    fetchMock.mockResolvedValueOnce(json(200, authResponse('fresh')))

    const result = session.refreshAccessToken()

    await vi.advanceTimersByTimeAsync(1_999)
    expect(fetchMock).toHaveBeenCalledTimes(1)
    await vi.advanceTimersByTimeAsync(1)
    await expect(result).resolves.toBe(token('fresh'))
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('caps the wait at 5 s and defaults to 1 s without Retry-After', async () => {
    vi.useFakeTimers()
    const { session } = await load()
    fetchMock.mockResolvedValueOnce(json(429, {}, { 'retry-after': '60' }))
    fetchMock.mockResolvedValueOnce(json(429, {}))
    fetchMock.mockResolvedValueOnce(json(200, authResponse('fresh')))

    const result = session.refreshAccessToken()

    await vi.advanceTimersByTimeAsync(5_000)
    expect(fetchMock).toHaveBeenCalledTimes(2)
    await vi.advanceTimersByTimeAsync(1_000)
    await expect(result).resolves.toBe(token('fresh'))
    expect(fetchMock).toHaveBeenCalledTimes(3)
  })

  it('gives up after two retries without ending the session', async () => {
    vi.useFakeTimers()
    const { session, tokenStore } = await load()
    session.adopt(authResponse('old'), false)
    fetchMock.mockResolvedValue(json(429, {}, { 'retry-after': '1' }))

    const result = session.refreshAccessToken().catch((e: unknown) => e)
    await vi.advanceTimersByTimeAsync(10_000)

    expect(await result).toMatchObject({ status: 0, code: 'NETWORK' })
    expect(fetchMock).toHaveBeenCalledTimes(3)
    expect(tokenStore.getAccessToken()).toBe(token('old'))
  })
})

describe('apiFetch', () => {
  it('refreshes exactly once for concurrent 401s and retries each request', async () => {
    const { session, client } = await load()
    session.adopt(authResponse('stale'), false)
    const refresh = deferred<Response>()

    fetchMock.mockImplementation(async (input, init) => {
      if (String(input) === '/api/v1/auth/refresh') return refresh.promise
      const authorization = (init?.headers as Record<string, string>).authorization
      return authorization === `Bearer ${token('fresh')}` ? json(200, { path: String(input) }) : json(401, {})
    })

    const requests = [client.apiFetch('/urls'), client.apiFetch('/auth/me'), client.apiFetch('/urls?offset=12')]
    await vi.waitFor(() => {
      expect(callsTo('/api/v1/auth/refresh')).toHaveLength(1)
      expect(fetchMock).toHaveBeenCalledTimes(4)
    })
    refresh.resolve(json(200, authResponse('fresh')))

    await expect(Promise.all(requests)).resolves.toEqual([
      { path: '/api/v1/urls' },
      { path: '/api/v1/auth/me' },
      { path: '/api/v1/urls?offset=12' },
    ])
    expect(callsTo('/api/v1/auth/refresh')).toHaveLength(1)
  })

  it('retries only once and expires the session on a second 401', async () => {
    const { session, client, tokenStore, errors } = await load()
    session.adopt(authResponse('stale'), false)
    fetchMock.mockImplementation(async (input) =>
      String(input) === '/api/v1/auth/refresh' ? json(200, authResponse('fresh')) : json(401, {}),
    )

    await expect(client.apiFetch('/urls')).rejects.toBeInstanceOf(errors.SessionExpiredError)
    expect(callsTo('/api/v1/auth/refresh')).toHaveLength(1)
    expect(callsTo('/api/v1/urls')).toHaveLength(2)
    expect(tokenStore.getAccessToken()).toBeNull()
  })

  it('refreshes first when there is no access token in memory', async () => {
    const { client } = await load()
    fetchMock.mockImplementation(async (input) =>
      String(input) === '/api/v1/auth/refresh' ? json(200, authResponse('fresh')) : json(200, { ok: true }),
    )

    await expect(client.apiFetch('/auth/me')).resolves.toEqual({ ok: true })
    expect(fetchMock.mock.calls.map(([input]) => String(input))).toEqual(['/api/v1/auth/refresh', '/api/v1/auth/me'])
  })
})

describe('cross-tab broadcast', () => {
  it('logout revokes on the server, clears memory and broadcasts clear', async () => {
    const { session, tokenStore, channel } = await load()
    session.adopt(authResponse('live'), false)
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }))

    session.logout()

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/auth/logout',
      expect.objectContaining({ method: 'POST', headers: { Authorization: `Bearer ${token('live')}` } }),
    )
    expect(tokenStore.getAccessToken()).toBeNull()
    expect(session.getSessionSnapshot().user).toBeNull()
    expect(channel.posted).toEqual([{ type: 'clear' }])
  })

  it('logoutAll revokes every session and broadcasts clear', async () => {
    const { session, channel } = await load()
    session.adopt(authResponse('live'), false)
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }))

    session.logoutAll()

    expect(callsTo('/api/v1/auth/logout-all')).toHaveLength(1)
    expect(channel.posted).toEqual([{ type: 'clear' }])
  })

  it('a clear from another tab ends this session and notifies once', async () => {
    const { session, tokenStore, channel } = await load()
    session.adopt(authResponse('live'), false)
    const onExpired = vi.fn()
    session.onSessionExpired(onExpired)

    channel.receive({ type: 'clear' })
    channel.receive({ type: 'clear' })

    expect(tokenStore.getAccessToken()).toBeNull()
    expect(onExpired).toHaveBeenCalledTimes(1)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('a token from another tab is adopted without re-broadcasting', async () => {
    const { session, tokenStore, channel } = await load()

    channel.receive({ type: 'token', accessToken: token('other'), user })

    expect(tokenStore.getAccessToken()).toBe(token('other'))
    expect(session.getSessionSnapshot().user).toEqual(user)
    expect(channel.posted).toEqual([])
  })

  it('clearLocalSession clears memory and broadcasts without calling the API', async () => {
    const { session, tokenStore, channel } = await load()
    session.adopt(authResponse('live'), false)

    session.clearLocalSession()

    expect(tokenStore.getAccessToken()).toBeNull()
    expect(session.getSessionSnapshot().user).toBeNull()
    expect(channel.posted).toEqual([{ type: 'clear' }])
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('leaveDeletedAccount drops the token, broadcasts and loads the page fresh', async () => {
    const replace = vi.fn()
    vi.stubGlobal('location', { replace })
    const { session, tokenStore, channel } = await load()
    session.adopt(authResponse('live'), false)

    session.leaveDeletedAccount('/account-deleted')

    expect(tokenStore.getAccessToken()).toBeNull()
    expect(channel.posted).toEqual([{ type: 'clear' }])
    expect(replace).toHaveBeenCalledWith('/account-deleted')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('updateSessionUser replaces the signed-in user and broadcasts it', async () => {
    const { session, tokenStore, channel } = await load()
    session.adopt(authResponse('live'), false)
    const verified = { ...user, emailVerified: true }

    session.updateSessionUser(verified)

    expect(session.getSessionSnapshot().user).toEqual(verified)
    expect(tokenStore.getAccessToken()).toBe(token('live'))
    expect(channel.posted).toEqual([{ type: 'user', user: verified }])
  })

  it('updateSessionUser ignores another account and a signed-out tab', async () => {
    const { session, channel } = await load()

    session.updateSessionUser({ ...user, emailVerified: true })
    expect(session.getSessionSnapshot().user).toBeNull()

    session.adopt(authResponse('live'), false)
    session.updateSessionUser({ id: 'u2', email: 'bob@example.com', emailVerified: true })

    expect(session.getSessionSnapshot().user).toEqual(user)
    expect(channel.posted).toEqual([])
  })

  it('a user update from another tab applies only to the same account', async () => {
    const { session, channel } = await load()
    session.adopt(authResponse('live'), false)

    channel.receive({ type: 'user', user: { id: 'u2', email: 'bob@example.com', emailVerified: true } })
    expect(session.getSessionSnapshot().user).toEqual(user)

    channel.receive({ type: 'user', user: { ...user, emailVerified: true } })
    expect(session.getSessionSnapshot().user).toEqual({ ...user, emailVerified: true })
    expect(channel.posted).toEqual([])
  })
})
