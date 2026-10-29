import { apiFetch } from '@/lib/api/client'
import { apiPublicFetch } from '@/lib/api/public'
import type { AuthResponse, AuthUser, Me } from '@/lib/api/types'
import { adopt } from '@/lib/auth/session'

export async function login(email: string, password: string): Promise<void> {
  const body = await apiPublicFetch<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  adopt(body)
}

export async function register(email: string, password: string): Promise<void> {
  const body = await apiPublicFetch<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  adopt(body)
}

export function fetchMe(): Promise<Me> {
  return apiFetch<Me>('/auth/me')
}

const verifications = new Map<string, Promise<AuthUser>>()

/**
 * Confirms the email address behind an emailed `token`. The token is single-use, so concurrent and
 * repeated calls with the same token share one request; a failed request is forgotten so it can be retried.
 */
export function verifyEmail(token: string): Promise<AuthUser> {
  const known = verifications.get(token)
  if (known) return known

  const request = apiPublicFetch<{ user: AuthUser }>('/auth/verify-email', {
    method: 'POST',
    body: JSON.stringify({ token }),
  }).then(
    (body) => body.user,
    (error: unknown) => {
      verifications.delete(token)
      throw error
    },
  )
  verifications.set(token, request)
  return request
}

/** Emails the signed-in user a new confirmation link; `429 EMAIL_COOLDOWN` while the last one is fresh. */
export function resendVerification(): Promise<void> {
  return apiFetch<void>('/auth/verify-email/resend', { method: 'POST', body: '{}' })
}

/** Asks for a password reset link. Succeeds whether or not an account exists for `email`. */
export function requestPasswordReset(email: string): Promise<void> {
  return apiPublicFetch<void>('/auth/password/forgot', { method: 'POST', body: JSON.stringify({ email }) })
}

/** Sets a new password from an emailed `token`; the API signs the account out everywhere. */
export function resetPassword(token: string, password: string): Promise<void> {
  return apiPublicFetch<void>('/auth/password/reset', { method: 'POST', body: JSON.stringify({ token, password }) })
}
