import { afterEach, describe, expect, it, vi } from 'vitest'
import { getAnalyticsId, parseAnalyticsConsent, readAnalyticsConsent } from '@/lib/analytics'

describe('parseAnalyticsConsent', () => {
  it('accepts only granted and denied', () => {
    expect(parseAnalyticsConsent('granted')).toBe('granted')
    expect(parseAnalyticsConsent('denied')).toBe('denied')
    expect(parseAnalyticsConsent('yes')).toBeNull()
    expect(parseAnalyticsConsent(undefined)).toBeNull()
  })
})

describe('readAnalyticsConsent', () => {
  it('finds the consent cookie among others', () => {
    expect(readAnalyticsConsent('theme=dark; analytics-consent=granted; _ga=GA1.1.1')).toBe('granted')
    expect(readAnalyticsConsent('analytics-consent=denied')).toBe('denied')
  })

  it('returns null without a valid consent cookie', () => {
    expect(readAnalyticsConsent('')).toBeNull()
    expect(readAnalyticsConsent('theme=dark')).toBeNull()
    expect(readAnalyticsConsent('analytics-consent=maybe')).toBeNull()
    expect(readAnalyticsConsent('x-analytics-consent=granted')).toBeNull()
  })
})

describe('getAnalyticsId', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('returns the trimmed GATAG_ID', () => {
    vi.stubEnv('GATAG_ID', ' G-TEST123 ')
    expect(getAnalyticsId()).toBe('G-TEST123')
  })

  it('returns null when GATAG_ID is empty', () => {
    vi.stubEnv('GATAG_ID', '  ')
    expect(getAnalyticsId()).toBeNull()
  })
})
