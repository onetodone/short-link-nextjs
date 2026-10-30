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

/**
 * Posts a single-use emailed `token` at most once at a time: concurrent and repeated calls share one
 * request (React dev mode runs effects twice), and a failed request is forgotten so it can be retried.
 */
function postOnce(cache: Map<string, Promise<AuthUser>>, path: string, token: string): Promise<AuthUser> {
  const known = cache.get(token)
  if (known) return known

  const request = apiPublicFetch<{ user: AuthUser }>(path, {
    method: 'POST',
    body: JSON.stringify({ token }),
  }).then(
    (body) => body.user,
    (error: unknown) => {
      cache.delete(token)
      throw error
    },
  )
  cache.set(token, request)
  return request
}

const verifications = new Map<string, Promise<AuthUser>>()

/** Confirms the email address behind an emailed `token`; repeated calls with one token send it once. */
export function verifyEmail(token: string): Promise<AuthUser> {
  return postOnce(verifications, '/auth/verify-email', token)
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

/** Sets a new password for the signed-in account; the API keeps this session and revokes every other one. */
export function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  return apiFetch<void>('/auth/me/password', {
    method: 'PATCH',
    body: JSON.stringify({ currentPassword, newPassword }),
  })
}

/** Emails a confirmation link to `newEmail`; the account keeps its address until that link is opened. */
export function requestEmailChange(newEmail: string, password: string): Promise<void> {
  return apiFetch<void>('/auth/me/email', { method: 'POST', body: JSON.stringify({ newEmail, password }) })
}

const emailChanges = new Map<string, Promise<AuthUser>>()

/** Moves the account to the address behind an emailed `token`; repeated calls with one token send it once. */
export function confirmEmailChange(token: string): Promise<AuthUser> {
  return postOnce(emailChanges, '/auth/email/confirm', token)
}

/** Deletes the signed-in account and every link it owns. The API clears the refresh cookie. */
export function deleteAccount(password: string): Promise<void> {
  return apiFetch<void>('/auth/me', { method: 'DELETE', body: JSON.stringify({ password }) })
}
