import { describe, expect, it } from 'vitest'

import { loginSchema, registerSchema } from '@/schemas/auth'
import { SHORT_CODE_PATTERN, urlSchema } from '@/schemas/url'

function firstMessage(result: { success: boolean; error?: { issues: { message: string }[] } }): string | undefined {
  return result.error?.issues[0]?.message
}

describe('loginSchema', () => {
  it('trims and lowercases the email', () => {
    expect(loginSchema.parse({ email: '  Ann@Example.COM ', password: 'x' })).toEqual({
      email: 'ann@example.com',
      password: 'x',
    })
  })

  it('rejects an invalid email and an empty password', () => {
    expect(firstMessage(loginSchema.safeParse({ email: 'nope', password: 'x' }))).toBe(
      'Please enter a valid email address.',
    )
    expect(firstMessage(loginSchema.safeParse({ email: 'a@b.co', password: '' }))).toBe('Password is required.')
  })
})

describe('registerSchema', () => {
  it('enforces the password length bounds', () => {
    expect(firstMessage(registerSchema.safeParse({ email: 'a@b.co', password: 'short' }))).toBe(
      'Password must be at least 8 characters.',
    )
    expect(firstMessage(registerSchema.safeParse({ email: 'a@b.co', password: 'x'.repeat(129) }))).toBe(
      'Password must be at most 128 characters.',
    )
    expect(registerSchema.safeParse({ email: 'a@b.co', password: 'x'.repeat(128) }).success).toBe(true)
  })
})

describe('urlSchema', () => {
  it('accepts http and https URLs case-insensitively and trims them', () => {
    expect(urlSchema.parse({ url: '  https://example.com/a  ' })).toEqual({ url: 'https://example.com/a' })
    expect(urlSchema.safeParse({ url: 'HTTP://example.com' }).success).toBe(true)
  })

  it('rejects empty, non-http and overlong URLs', () => {
    expect(firstMessage(urlSchema.safeParse({ url: '   ' }))).toBe('Enter a URL to shorten.')
    expect(firstMessage(urlSchema.safeParse({ url: 'ftp://example.com' }))).toBe(
      'The URL must start with http:// or https://',
    )
    expect(firstMessage(urlSchema.safeParse({ url: 'javascript:alert(1)' }))).toBe(
      'The URL must start with http:// or https://',
    )
    expect(firstMessage(urlSchema.safeParse({ url: `https://e.co/${'a'.repeat(2048)}` }))).toBe(
      'URL must be at most 2048 characters.',
    )
  })
})

describe('SHORT_CODE_PATTERN', () => {
  it('matches 4–32 alphanumeric characters only', () => {
    expect(SHORT_CODE_PATTERN.test('aB3d')).toBe(true)
    expect(SHORT_CODE_PATTERN.test('a'.repeat(32))).toBe(true)
    expect(SHORT_CODE_PATTERN.test('abc')).toBe(false)
    expect(SHORT_CODE_PATTERN.test('a'.repeat(33))).toBe(false)
    expect(SHORT_CODE_PATTERN.test('ab-cd')).toBe(false)
    expect(SHORT_CODE_PATTERN.test('../x')).toBe(false)
  })
})
