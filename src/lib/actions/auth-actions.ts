'use client'

import { login, register } from '@/lib/api/auth'
import { runFormAction, type FormState } from '@/lib/forms'
import { loginSchema, registerSchema } from '@/schemas/auth'

export const loginAction = runFormAction(loginSchema, async ({ email, password }): Promise<FormState> => {
  await login(email, password)
  return { success: true }
})

export const registerAction = runFormAction(registerSchema, async ({ email, password }): Promise<FormState> => {
  await register(email, password)
  return { success: true }
})
