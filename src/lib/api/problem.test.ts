import { describe, expect, it } from 'vitest'

import { ApiError } from '@/lib/api/errors'
import { networkError, parseApiError, readErrorBody } from '@/lib/api/problem'

describe('parseApiError', () => {
  it('maps 429 to a throttle error regardless of the body', () => {
    const error = parseApiError(429, { message: 'ThrottlerException: Too Many Requests' })

    expect(error).toBeInstanceOf(ApiError)
    expect(error.status).toBe(429)
    expect(error.code).toBe('THROTTLED')
    expect(error.message).toBe('Too many attempts. Please wait a minute and try again.')
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
