'use client'

import { changePassword, deleteAccount, requestEmailChange } from '@/lib/api/auth'
import { ApiError } from '@/lib/api/errors'
import { runFormAction, type FormState } from '@/lib/forms'
import { changeEmailSchema, changePasswordSchema, deleteAccountSchema } from '@/schemas/auth'

async function confirmedBy(field: string, request: () => Promise<void>): Promise<FormState> {
  try {
    await request()
    return { success: true }
  } catch (error) {
    if (error instanceof ApiError && error.code === 'INVALID_PASSWORD') {
      return { error: error.message, fieldErrors: { [field]: error.message } }
    }
    throw error
  }
}

/** Changes the password; a wrong current password is reported on `currentPassword`. */
export const changePasswordAction = runFormAction(changePasswordSchema, ({ currentPassword, newPassword }) =>
  confirmedBy('currentPassword', () => changePassword(currentPassword, newPassword)),
)

/** Asks for an email change; a wrong password is reported on `password`. */
export const changeEmailAction = runFormAction(changeEmailSchema, ({ newEmail, password }) =>
  confirmedBy('password', () => requestEmailChange(newEmail, password)),
)

/** Deletes the account; the caller ends the local session on success. */
export const deleteAccountAction = runFormAction(deleteAccountSchema, ({ password }) =>
  confirmedBy('password', () => deleteAccount(password)),
)
