import { beforeEach, describe, expect, it, vi } from 'vitest'

const fetchMock = vi.fn<typeof fetch>()

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })
}

const user = { id: 'u1', email: 'ann@example.com', emailVerified: true }

beforeEach(() => {
  vi.resetModules()
  fetchMock.mockReset()
  vi.stubGlobal('fetch', fetchMock)
})

describe('verifyEmail', () => {
  it('sends a single-use token once for repeated calls', async () => {
    const { verifyEmail } = await import('@/lib/api/auth')
    fetchMock.mockResolvedValue(json(200, { user }))

    const results = await Promise.all([verifyEmail('t1'), verifyEmail('t1')])
    await verifyEmail('t1')

    expect(results).toEqual([user, user])
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/auth/verify-email',
      expect.objectContaining({ method: 'POST', body: JSON.stringify({ token: 't1' }) }),
    )
  })

  it('forgets a failed attempt so it can be retried', async () => {
    const { verifyEmail } = await import('@/lib/api/auth')
    fetchMock.mockRejectedValueOnce(new TypeError('offline')).mockResolvedValueOnce(json(200, { user }))

    await expect(verifyEmail('t2')).rejects.toMatchObject({ code: 'NETWORK' })
    await expect(verifyEmail('t2')).resolves.toEqual(user)
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })
})
