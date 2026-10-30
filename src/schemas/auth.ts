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

const currentPassword = z.string().min(1, { error: 'Enter your current password.' })

/** The change-password form: the current password plus the new one, typed twice. */
export const changePasswordSchema = z
  .object({
    currentPassword,
    newPassword: newPassword,
    confirmPassword: z.string(),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    error: 'Passwords do not match.',
    path: ['confirmPassword'],
  })

/** The change-email form: the new address and the current password. */
export const changeEmailSchema = z.object({ newEmail: email, password: currentPassword })

/** The word a user types to confirm deleting their account. */
export const DELETE_CONFIRMATION = 'DELETE'

/** The delete-account form: the current password and the typed {@link DELETE_CONFIRMATION}. */
export const deleteAccountSchema = z.object({
  password: currentPassword,
  confirmation: z
    .string()
    .trim()
    .refine((value) => value === DELETE_CONFIRMATION, { error: `Type ${DELETE_CONFIRMATION} to confirm.` }),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
export type ChangeEmailInput = z.infer<typeof changeEmailSchema>
export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>
