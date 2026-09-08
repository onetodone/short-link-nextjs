import { apiFetch } from '@/lib/api/client'
import { apiPublicFetch } from '@/lib/api/public'
import type { AuthResponse, Me } from '@/lib/api/types'
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
