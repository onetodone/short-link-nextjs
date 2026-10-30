import { describe, expect, it } from 'vitest'
import type { UrlDisabledReason } from '@/lib/api/types'
import { disabledLinkCopy } from '@/lib/moderation'

describe('disabledLinkCopy', () => {
  it('lets the owner fix an unsafe destination without support', () => {
    const copy = disabledLinkCopy('UNSAFE_DESTINATION')
    expect(copy.contactSupport).toBe(false)
    expect(copy.remedy).toContain('Save a different, safe destination')
  })

  it.each(['MANUAL', 'ACCOUNT_SUSPENDED'] as const)('sends %s to support', (reason) => {
    expect(disabledLinkCopy(reason).contactSupport).toBe(true)
  })

  it('falls back to a neutral text for a missing or unknown reason', () => {
    expect(disabledLinkCopy(null).summary).toBe('This link is turned off.')
    expect(disabledLinkCopy('constructor' as UrlDisabledReason).summary).toBe('This link is turned off.')
  })
})
