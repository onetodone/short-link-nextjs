'use client'

import { login, register, requestPasswordReset, resetPassword } from '@/lib/api/auth'
import { clearLocalSession } from '@/lib/auth/session'
import { runFormAction, type FormState } from '@/lib/forms'
import { forgotPasswordSchema, loginSchema, registerSchema, resetPasswordSchema } from '@/schemas/auth'

export const loginAction = runFormAction(loginSchema, async ({ email, password }): Promise<FormState> => {
  await login(email, password)
  return { success: true }
})

export const registerAction = runFormAction(registerSchema, async ({ email, password }): Promise<FormState> => {
  await register(email, password)
  return { success: true }
})

export const forgotPasswordAction = runFormAction(forgotPasswordSchema, async ({ email }): Promise<FormState> => {
  await requestPasswordReset(email)
  return { success: true }
})

export const resetPasswordAction = runFormAction(
  resetPasswordSchema,
  async ({ token, password }): Promise<FormState> => {
    await resetPassword(token, password)
    // The API has revoked every session of the account, this browser's included.
    clearLocalSession()
    return { success: true }
  },
)
