import { describe, expect, it } from 'vitest'

import { maskSecrets } from '@/lib/logger'

const JWT = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIn0.c2lnbmF0dXJl'

describe('maskSecrets', () => {
  it('redacts values under sensitive keys', () => {
    expect(
      maskSecrets({
        password: 'hunter22',
        accessToken: 'abc',
        Authorization: 'Bearer abc',
        cookie: 'refresh=abc',
        clientSecret: 'abc',
        status: 401,
      }),
    ).toEqual({
      password: '[redacted]',
      accessToken: '[redacted]',
      Authorization: '[redacted]',
      cookie: '[redacted]',
      clientSecret: '[redacted]',
      status: 401,
    })
  })

  it('masks JWTs, bearer tokens and secret query params inside strings', () => {
    expect(maskSecrets(`token ${JWT} end`)).toBe('token [redacted] end')
    expect(maskSecrets('header Bearer abc.def-ghi')).toBe('header Bearer [redacted]')
    expect(maskSecrets('/cb?code=xyz&state=ok')).toBe('/cb?code=[redacted]&state=ok')
    expect(maskSecrets('/r?refresh_token=xyz')).toBe('/r?refresh_token=[redacted]')
  })

  it('walks nested objects and arrays', () => {
    expect(maskSecrets({ req: { headers: { authorization: 'x' } }, items: [`Bearer ${JWT}`] })).toEqual({
      req: { headers: { authorization: '[redacted]' } },
      items: ['Bearer [redacted]'],
    })
  })

  it('serializes errors with masked message and stack', () => {
    const error = new Error(`failed with ${JWT}`)
    const masked = maskSecrets(error) as { name: string; message: string; stack?: string }

    expect(masked.name).toBe('Error')
    expect(masked.message).toBe('failed with [redacted]')
    expect(masked.stack).not.toContain(JWT)
  })

  it('handles circular references and deep nesting', () => {
    const circular: Record<string, unknown> = { a: 1 }
    circular.self = circular
    expect(maskSecrets(circular)).toEqual({ a: 1, self: '[circular]' })

    const deep = { l1: { l2: { l3: { l4: { l5: { l6: { l7: 1 } } } } } } }
    expect(JSON.stringify(maskSecrets(deep))).toContain('[truncated]')
  })

  it('passes primitives through', () => {
    expect(maskSecrets(42)).toBe(42)
    expect(maskSecrets(null)).toBeNull()
    expect(maskSecrets(undefined)).toBeUndefined()
    expect(maskSecrets(true)).toBe(true)
  })
})
