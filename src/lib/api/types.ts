export interface AuthUser {
  id: string
  email: string
  emailVerified: boolean
}

export interface AuthResponse {
  user: AuthUser
  accessToken: string
}

export interface Me {
  id: string
  email: string
  emailVerified: boolean
  createdAt: string
}

/** Why a link no longer redirects; `null` on an enabled link. */
export type UrlDisabledReason = 'UNSAFE_DESTINATION' | 'MANUAL' | 'ACCOUNT_SUSPENDED'

export interface UrlSummary {
  shortCode: string
  shortUrl: string
  originalUrl: string
  note: string | null
  clicks: number
  disabled: boolean
  disabledReason: UrlDisabledReason | null
  createdAt: string
  updatedAt: string
}

export interface CreatedUrl {
  shortCode: string
  shortUrl: string
  originalUrl: string
  note: string | null
  createdAt: string
  updatedAt: string
}

export interface UrlList {
  items: UrlSummary[]
  total: number
  limit: number
  offset: number
}
