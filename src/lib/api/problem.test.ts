import { describe, expect, it } from 'vitest'

import { ApiError } from '@/lib/api/errors'
import { networkError, parseApiError, readErrorBody } from '@/lib/api/problem'

describe('parseApiError', () => {
  it('maps a 429 EMAIL_COOLDOWN to a wait message and keeps retryAfter', () => {
    const error = parseApiError(429, { code: 'EMAIL_COOLDOWN', retryAfter: 42, message: 'An email was sent recently' })

    expect(error.code).toBe('EMAIL_COOLDOWN')
    expect(error.retryAfter).toBe(42)
    expect(error.message).toBe('We sent you an email recently. You can ask for another in about a minute.')
    expect(parseApiError(429, { code: 'EMAIL_COOLDOWN' }).message).toBe(
      'We sent you an email recently. Please wait a minute.',
    )
  })

  it('maps verification codes to front-owned messages', () => {
    const notVerified = parseApiError(403, { code: 'EMAIL_NOT_VERIFIED', message: 'Confirm your email address' })
    expect(notVerified.code).toBe('EMAIL_NOT_VERIFIED')
    expect(notVerified.message).toBe('Confirm your email address to create or edit links.')

    const invalid = parseApiError(400, { code: 'INVALID_TOKEN', message: 'This link is invalid or has expired' })
    expect(invalid.code).toBe('INVALID_TOKEN')
    expect(invalid.message).toBe('This link is invalid or has expired.')
    expect(invalid.issues).toBeUndefined()
  })

  it('maps a wrong confirming password to its own code, not a session error', () => {
    const error = parseApiError(403, { code: 'INVALID_PASSWORD', message: 'Password is incorrect' })

    expect(error.status).toBe(403)
    expect(error.code).toBe('INVALID_PASSWORD')
    expect(error.message).toBe('Your password is incorrect.')
  })

  it('maps 429 to a throttle error regardless of the body', () => {
    const error = parseApiError(429, { message: 'ThrottlerException: Too Many Requests' })

    expect(error).toBeInstanceOf(ApiError)
    expect(error.status).toBe(429)
    expect(error.code).toBe('THROTTLED')
    expect(error.message).toBe('Too many attempts. Please wait a minute and try again.')
  })

  it('maps a 429 CREATE_QUOTA_EXCEEDED to a quota message with the limit and wait', () => {
    const error = parseApiError(429, {
      message: 'You can create at most 10 links per 24 hours',
      code: 'CREATE_QUOTA_EXCEEDED',
      limit: 10,
      retryAfter: 3 * 3600 - 100,
    })

    expect(error.code).toBe('CREATE_QUOTA_EXCEEDED')
    expect(error.message).toBe("You've reached the limit of 10 new links per 24 hours. Try again in about 3 hours.")
    expect(error.issues).toBeUndefined()
  })

  it('formats the quota wait in minutes and tolerates missing fields', () => {
    const body = { code: 'CREATE_QUOTA_EXCEEDED', limit: 10 }

    expect(parseApiError(429, { ...body, retryAfter: 30 }).message).toContain('Try again in about a minute.')
    expect(parseApiError(429, { ...body, retryAfter: 1500 }).message).toContain('Try again in about 25 minutes.')
    expect(parseApiError(429, { ...body, retryAfter: 3600 }).message).toContain('Try again in about an hour.')
    expect(parseApiError(429, { code: 'CREATE_QUOTA_EXCEEDED' }).message).toBe(
      "You've reached the limit of new links per 24 hours. Try again later.",
    )
  })

  it.each([
    ['CREDENTIALS_IN_URL', 'Remove the username and password from the URL.'],
    ['IP_ADDRESS', 'Use a domain name instead of an IP address.'],
    ['LOCAL_HOST', 'Use a public domain — local and internal addresses are not allowed.'],
    ['OWN_DOMAIN', 'This is already a short link. Use the address it points to instead.'],
    ['URL_SHORTENER', 'Links to other URL shorteners or redirectors are not allowed. Use the final address instead.'],
  ])('maps a 422 DESTINATION_REJECTED %s to a url issue', (reason, message) => {
    const error = parseApiError(422, { message: 'API copy', code: 'DESTINATION_REJECTED', reason })

    expect(error.status).toBe(422)
    expect(error.code).toBe('DESTINATION_REJECTED')
    expect(error.message).toBe(message)
    expect(error.issues).toEqual([{ path: 'url', message }])
  })

  it('falls back to the API message for an unknown destination reason', () => {
    const error = parseApiError(422, { message: 'API copy', code: 'DESTINATION_REJECTED', reason: 'constructor' })
    expect(error.issues).toEqual([{ path: 'url', message: 'API copy' }])

    expect(parseApiError(422, { code: 'DESTINATION_REJECTED' }).message).toBe('This destination URL is not allowed.')
  })

  it('prefers the API code over the error name', () => {
    expect(parseApiError(403, { message: 'x', error: 'Forbidden', code: 'SOME_CODE' }).code).toBe('SOME_CODE')
  })

  it('maps a 400 with errors[] to validation issues', () => {
    const error = parseApiError(400, {
      message: 'Validation failed',
      errors: [{ path: ['url'], message: 'Invalid URL' }, { path: 'nested.field', message: 42 }, 'not-an-issue'],
    })

    expect(error.code).toBe('VALIDATION')
    expect(error.message).toBe('Invalid URL')
    expect(error.issues).toEqual([
      { path: 'url', message: 'Invalid URL' },
      { path: 'nested.field', message: 'Invalid value.' },
    ])
  })

  it('falls back to the body message for a 400 with an empty errors[]', () => {
    expect(parseApiError(400, { message: 'Bad input', errors: [] }).message).toBe('Bad input')
    expect(parseApiError(400, { errors: [] }).message).toBe('The request was invalid.')
  })

  it('uses a string or the first array message and the error code', () => {
    const conflict = parseApiError(409, { message: 'Email already registered', error: 'Conflict' })
    expect(conflict.message).toBe('Email already registered')
    expect(conflict.code).toBe('Conflict')
    expect(conflict.issues).toBeUndefined()

    expect(parseApiError(400, { message: ['first', 'second'] }).message).toBe('first')
  })

  it('falls back to a status message for an unusable body', () => {
    expect(parseApiError(404, null).message).toBe('Not found.')
    expect(parseApiError(500, 'Internal Server Error').message).toBe('The server hit an error. Please try again.')
    expect(parseApiError(418, { message: 7 }).message).toBe('Something went wrong. Please try again.')
    expect(parseApiError(404, null).code).toBeUndefined()
  })
})

describe('networkError', () => {
  it('has status 0 and code NETWORK', () => {
    const error = networkError()
    expect(error.status).toBe(0)
    expect(error.code).toBe('NETWORK')
  })
})

describe('readErrorBody', () => {
  it('parses JSON and tolerates empty or invalid bodies', async () => {
    expect(await readErrorBody(new Response('{"message":"x"}'))).toEqual({ message: 'x' })
    expect(await readErrorBody(new Response(''))).toBeNull()
    expect(await readErrorBody(new Response('<html>'))).toBeNull()
  })
})
