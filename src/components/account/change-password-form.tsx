'use client'

import { useActionState, useState } from 'react'
import { toast } from 'sonner'
import { changePasswordAction } from '@/lib/actions/account-actions'
import type { FormState } from '@/lib/forms'
import { useActionResult } from '@/hooks/use-action-result'
import { AccountField } from '@/components/account/account-field'
import { FieldError, FieldGroup } from '@/components/ui/field'
import { SubmitButton } from '@/components/ui/submit-button'

export function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [state, action] = useActionState<FormState, FormData>(changePasswordAction, undefined)

  useActionResult(state, {
    onSuccess: () => {
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      toast.success('Password changed. Your other devices were signed out.')
    },
  })

  return (
    <form action={action}>
      <FieldGroup>
        <AccountField
          id="password-current"
          name="currentPassword"
          label="Current password"
          type="password"
          autoComplete="current-password"
          required
          value={currentPassword}
          onValueChange={setCurrentPassword}
          error={state?.fieldErrors?.currentPassword}
        />
        <AccountField
          id="password-new"
          name="newPassword"
          label="New password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          description="At least 8 characters."
          value={newPassword}
          onValueChange={setNewPassword}
          error={state?.fieldErrors?.newPassword}
        />
        <AccountField
          id="password-confirm"
          name="confirmPassword"
          label="Repeat new password"
          type="password"
          autoComplete="new-password"
          required
          value={confirmPassword}
          onValueChange={setConfirmPassword}
          error={state?.fieldErrors?.confirmPassword}
        />
        {state?.error && !state.fieldErrors && <FieldError>{state.error}</FieldError>}
        <p className="text-xs text-muted-foreground">
          You stay signed in here. Every other device is signed out and needs the new password.
        </p>
        <div>
          <SubmitButton pendingLabel="Saving...">Change password</SubmitButton>
        </div>
      </FieldGroup>
    </form>
  )
}
