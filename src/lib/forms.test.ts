import * as z from 'zod'
import { describe, expect, it, vi } from 'vitest'

import { ApiError, SessionExpiredError } from '@/lib/api/errors'
import { parseApiError } from '@/lib/api/problem'
import { runFormAction, toFormState } from '@/lib/forms'

const schema = z.object({
  name: z.string().min(1, { error: 'Name is required.' }),
  age: z.coerce.number().int({ error: 'Age must be a whole number.' }),
})

function formData(values: Record<string, string>): FormData {
  const data = new FormData()
  for (const [key, value] of Object.entries(values)) data.set(key, value)
  return data
}

describe('runFormAction', () => {
  it('passes parsed values to the handler and returns its state', async () => {
    const handler = vi.fn(async () => ({ success: true }))
    const action = runFormAction(schema, handler)

    expect(await action(undefined, formData({ name: 'Ann', age: '30' }))).toEqual({ success: true })
    expect(handler).toHaveBeenCalledWith({ name: 'Ann', age: 30 })
  })

  it('returns field errors without calling the handler on invalid input', async () => {
    const handler = vi.fn(async () => ({ success: true }))
    const action = runFormAction(schema, handler)

    const state = await action(undefined, formData({ name: '', age: '1.5' }))

    expect(handler).not.toHaveBeenCalled()
    expect(state).toEqual({
      error: 'Name is required.',
      fieldErrors: { name: 'Name is required.', age: 'Age must be a whole number.' },
    })
  })

  it.each([
    ['an ApiError', new ApiError('Email already registered', { status: 409 }), 'Email already registered'],
    ['a SessionExpiredError', new SessionExpiredError(), 'Your session has ended. Please sign in again.'],
    ['an unknown error', new TypeError('boom'), 'Something went wrong. Please try again.'],
    ['a non-Error value', 'boom', 'Something went wrong. Please try again.'],
  ])('resolves to a form state when the handler throws %s', async (_label, thrown, message) => {
    const action = runFormAction(schema, async () => {
      throw thrown
    })

    await expect(action(undefined, formData({ name: 'Ann', age: '30' }))).resolves.toEqual({ error: message })
  })
})

describe('toFormState', () => {
  it('carries the bot check flag so the sign-in form can show the widget', () => {
    const failed = parseApiError(401, { message: 'Invalid email or password', captchaRequired: true })

    expect(toFormState(failed)).toEqual({
      error: 'Invalid email or password',
      code: undefined,
      captchaRequired: true,
    })
    expect(toFormState(parseApiError(401, { message: 'Invalid email or password' }))).not.toHaveProperty(
      'captchaRequired',
    )
  })

  it('maps API validation issues to field errors, keeping the first per field', () => {
    const error = new ApiError('Invalid URL', {
      status: 400,
      code: 'VALIDATION',
      issues: [
        { path: 'url', message: 'Invalid URL' },
        { path: 'url', message: 'Too long' },
        { path: '', message: 'Body is invalid' },
      ],
    })

    expect(toFormState(error)).toEqual({
      error: 'Invalid URL',
      code: 'VALIDATION',
      fieldErrors: { url: 'Invalid URL', _: 'Body is invalid' },
    })
  })

  it('keeps the API code so a form can single out an error', () => {
    const suspended = parseApiError(403, { code: 'ACCOUNT_SUSPENDED', supportEmail: 'help@example.com' })
    expect(toFormState(suspended)).toEqual({ error: suspended.message, code: 'ACCOUNT_SUSPENDED' })
  })

  it('puts a rejected destination on the url field and the quota on the form', () => {
    const rejected = parseApiError(422, { code: 'DESTINATION_REJECTED', reason: 'IP_ADDRESS' })
    expect(toFormState(rejected)).toEqual({
      error: 'Use a domain name instead of an IP address.',
      code: 'DESTINATION_REJECTED',
      fieldErrors: { url: 'Use a domain name instead of an IP address.' },
    })

    const quota = parseApiError(429, { code: 'CREATE_QUOTA_EXCEEDED', limit: 10, retryAfter: 60 })
    expect(toFormState(quota)).toEqual({ error: quota.message, code: 'CREATE_QUOTA_EXCEEDED' })
  })
})
