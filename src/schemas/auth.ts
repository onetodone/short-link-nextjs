import * as z from 'zod'

const email = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email({ error: 'Please enter a valid email address.' }))

export const loginSchema = z.object({
  email,
  password: z.string().min(1, { error: 'Password is required.' }),
})

const newPassword = z
  .string()
  .min(8, { error: 'Password must be at least 8 characters.' })
  .max(128, { error: 'Password must be at most 128 characters.' })

export const registerSchema = z.object({
  email,
  password: newPassword,
})

/** The forgot-password form: the address to send a reset link to. */
export const forgotPasswordSchema = z.object({ email })

/** The reset-password form: the emailed token plus the new password, typed twice. */
export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, { error: 'This link is incomplete. Request a new one.' }),
    password: newPassword,
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    error: 'Passwords do not match.',
    path: ['confirmPassword'],
  })

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
