'use client'

import { useActionState, useState } from 'react'
import { deleteAccountAction } from '@/lib/actions/account-actions'
import { leaveDeletedAccount } from '@/lib/auth/session'
import type { FormState } from '@/lib/forms'
import { DELETE_CONFIRMATION } from '@/schemas/auth'
import { useActionResult } from '@/hooks/use-action-result'
import { AccountField } from '@/components/account/account-field'
import { Button } from '@/components/ui/button'
import { FieldError, FieldGroup } from '@/components/ui/field'
import { SubmitButton } from '@/components/ui/submit-button'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

export function DeleteAccountDialog() {
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)

  return (
    <AlertDialog open={open} onOpenChange={(next) => !pending && setOpen(next)}>
      <AlertDialogTrigger render={<Button variant="destructive" />}>Delete account</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete your account?</AlertDialogTitle>
          <AlertDialogDescription>
            Your account and every short link you own are deleted for good — the links stop working at once.
            You&rsquo;re signed out on every device. This can&rsquo;t be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <DeleteAccountForm onPendingChange={setPending} />
      </AlertDialogContent>
    </AlertDialog>
  )
}

function DeleteAccountForm({ onPendingChange }: { onPendingChange: (pending: boolean) => void }) {
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [state, action, pending] = useActionState<FormState, FormData>(async (previous, formData) => {
    onPendingChange(true)
    const next = await deleteAccountAction(previous, formData)
    if (!next?.success) onPendingChange(false)
    return next
  }, undefined)

  useActionResult(state, { onSuccess: () => leaveDeletedAccount('/account-deleted') })

  const confirmed = confirmation.trim() === DELETE_CONFIRMATION

  return (
    <form action={action}>
      <FieldGroup>
        <AccountField
          id="delete-password"
          name="password"
          label="Current password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onValueChange={setPassword}
          error={state?.fieldErrors?.password}
        />
        <AccountField
          id="delete-confirmation"
          name="confirmation"
          label={`Type ${DELETE_CONFIRMATION} to confirm`}
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          required
          value={confirmation}
          onValueChange={setConfirmation}
          error={state?.fieldErrors?.confirmation}
        />
        {state?.error && !state.fieldErrors && <FieldError>{state.error}</FieldError>}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending || state?.success}>Cancel</AlertDialogCancel>
          <SubmitButton variant="destructive" disabled={!confirmed || state?.success} pendingLabel="Deleting...">
            Delete account
          </SubmitButton>
        </AlertDialogFooter>
      </FieldGroup>
    </form>
  )
}
