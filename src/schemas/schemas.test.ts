import { describe, expect, it } from 'vitest'

import { forgotPasswordSchema, loginSchema, registerSchema, resetPasswordSchema } from '@/schemas/auth'
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

  it('trims an optional note and caps it at 200 characters', () => {
    const url = 'https://example.com'
    expect(urlSchema.parse({ url, note: '  launch post  ' })).toEqual({ url, note: 'launch post' })
    expect(urlSchema.parse({ url, note: '   ' })).toEqual({ url, note: '' })
    expect(urlSchema.safeParse({ url, note: ` ${'n'.repeat(200)} ` }).success).toBe(true)
    expect(firstMessage(urlSchema.safeParse({ url, note: 'n'.repeat(201) }))).toBe(
      'Note must be at most 200 characters.',
    )
  })
})

describe('forgotPasswordSchema', () => {
  it('normalizes the email', () => {
    expect(forgotPasswordSchema.parse({ email: ' Ann@Example.com ' })).toEqual({ email: 'ann@example.com' })
    expect(firstMessage(forgotPasswordSchema.safeParse({ email: 'nope' }))).toBe('Please enter a valid email address.')
  })
})

describe('resetPasswordSchema', () => {
  const valid = { token: 't0ken', password: 'password123', confirmPassword: 'password123' }

  it('accepts matching passwords', () => {
    expect(resetPasswordSchema.parse(valid)).toEqual(valid)
  })

  it('rejects a mismatch on confirmPassword', () => {
    const result = resetPasswordSchema.safeParse({ ...valid, confirmPassword: 'password124' })
    expect(result.error?.issues[0]).toMatchObject({ path: ['confirmPassword'], message: 'Passwords do not match.' })
  })

  it('requires the token and a long enough password', () => {
    expect(firstMessage(resetPasswordSchema.safeParse({ ...valid, token: '' }))).toBe(
      'This link is incomplete. Request a new one.',
    )
    expect(firstMessage(resetPasswordSchema.safeParse({ ...valid, password: 'short', confirmPassword: 'short' }))).toBe(
      'Password must be at least 8 characters.',
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
