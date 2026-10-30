import { beforeEach, describe, expect, it, vi } from 'vitest'

const fetchMock = vi.fn<typeof fetch>()

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })
}

beforeEach(() => {
  vi.resetModules()
  fetchMock.mockReset()
  vi.stubGlobal('fetch', fetchMock)
})

describe('fetchPublicConfig', () => {
  it('loads the public config once for every caller', async () => {
    const { fetchPublicConfig } = await import('@/lib/api/config')
    fetchMock.mockResolvedValue(json(200, { turnstileSiteKey: 'site-key', oauthProviders: [] }))

    const results = await Promise.all([fetchPublicConfig(), fetchPublicConfig()])
    await fetchPublicConfig()

    expect(results[0].turnstileSiteKey).toBe('site-key')
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledWith('/api/v1/config', expect.anything())
  })

  it('forgets a failed load so the next call retries', async () => {
    const { fetchPublicConfig } = await import('@/lib/api/config')
    fetchMock.mockResolvedValueOnce(json(502, {})).mockResolvedValueOnce(json(200, { turnstileSiteKey: null }))

    await expect(fetchPublicConfig()).rejects.toMatchObject({ status: 502 })
    await expect(fetchPublicConfig()).resolves.toEqual({ turnstileSiteKey: null })
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })
})
