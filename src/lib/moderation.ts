import type { UrlDisabledReason } from '@/lib/api/types'

/** How a disabled link is explained to its owner. */
export interface DisabledLinkCopy {
  /** One line for the link card. */
  summary: string
  /** What the owner can do about it, for the edit page. */
  remedy: string
  /** Only the operator can turn the link back on. */
  contactSupport: boolean
}

const COPY: Record<UrlDisabledReason, DisabledLinkCopy> = {
  UNSAFE_DESTINATION: {
    summary: 'Destination flagged as unsafe.',
    remedy:
      'Its destination was flagged as unsafe (phishing, malware or unwanted software). Save a different, safe destination to turn the link back on.',
    contactSupport: false,
  },
  MANUAL: {
    summary: 'Turned off by a moderator.',
    remedy: 'A moderator turned this link off. Editing it won’t turn it back on.',
    contactSupport: true,
  },
  ACCOUNT_SUSPENDED: {
    summary: 'Turned off while the account is suspended.',
    remedy: 'Links of a suspended account stay off until the suspension is lifted.',
    contactSupport: true,
  },
}

const UNKNOWN: DisabledLinkCopy = {
  summary: 'This link is turned off.',
  remedy: 'This link is turned off and doesn’t redirect anyone.',
  contactSupport: true,
}

/** Copy for a disabled link; an unknown or missing reason gets a neutral text that points to support. */
export function disabledLinkCopy(reason: UrlDisabledReason | null): DisabledLinkCopy {
  return reason && Object.hasOwn(COPY, reason) ? COPY[reason] : UNKNOWN
}
