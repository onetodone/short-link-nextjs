/** Cookie holding the visitor's analytics choice. Not `HttpOnly`: the consent banner sets it in the browser. */
export const ANALYTICS_CONSENT_COOKIE = 'analytics-consent'

/** How long a choice is remembered before the banner asks again. */
export const ANALYTICS_CONSENT_MAX_AGE_SECONDS = 180 * 24 * 60 * 60

/** A visitor's answer to the analytics consent banner. */
export type AnalyticsConsent = 'granted' | 'denied'

/** The stored choice, or `null` when the visitor hasn't chosen yet. */
export function parseAnalyticsConsent(value: string | undefined): AnalyticsConsent | null {
  return value === 'granted' || value === 'denied' ? value : null
}

/** The choice stored in a `document.cookie`-style string, or `null` when there is none. */
export function readAnalyticsConsent(cookieHeader: string): AnalyticsConsent | null {
  for (const cookie of cookieHeader.split(';')) {
    const [name, value] = cookie.split('=', 2)
    if (name?.trim() === ANALYTICS_CONSENT_COOKIE) return parseAnalyticsConsent(value?.trim())
  }
  return null
}

/**
 * GA4 measurement ID from the server-only `GATAG_ID`; `null` turns analytics and its consent banner
 * off. Server only. Static pages read it at build time, like the CSP that allows Google Analytics.
 */
export function getAnalyticsId(): string | null {
  return process.env.GATAG_ID?.trim() || null
}
