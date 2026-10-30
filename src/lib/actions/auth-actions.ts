'use client'

import { login, register, requestPasswordReset, resetPassword } from '@/lib/api/auth'
import { clearLocalSession } from '@/lib/auth/session'
import { runFormAction, type FormState } from '@/lib/forms'
import { forgotPasswordSchema, loginSchema, registerSchema, resetPasswordSchema } from '@/schemas/auth'

export const loginAction = runFormAction(loginSchema, async ({ email, password, captchaToken }): Promise<FormState> => {
  await login(email, password, captchaToken)
  return { success: true }
})

export const registerAction = runFormAction(
  registerSchema,
  async ({ email, password, acceptTerms, captchaToken }): Promise<FormState> => {
    await register(email, password, acceptTerms, captchaToken)
    return { success: true }
  },
)

export const forgotPasswordAction = runFormAction(
  forgotPasswordSchema,
  async ({ email, captchaToken }): Promise<FormState> => {
    await requestPasswordReset(email, captchaToken)
    return { success: true }
  },
)

export const resetPasswordAction = runFormAction(
  resetPasswordSchema,
  async ({ token, password }): Promise<FormState> => {
    await resetPassword(token, password)
    // The API has revoked every session of the account, this browser's included.
    clearLocalSession()
    return { success: true }
  },
)
