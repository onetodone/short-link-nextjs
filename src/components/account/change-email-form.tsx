'use client'

import { useActionState, useState } from 'react'
import { MailCheckIcon } from 'lucide-react'
import { changeEmailAction } from '@/lib/actions/account-actions'
import type { FormState } from '@/lib/forms'
import { useActionResult } from '@/hooks/use-action-result'
import { AccountField } from '@/components/account/account-field'
import { FieldError, FieldGroup } from '@/components/ui/field'
import { SubmitButton } from '@/components/ui/submit-button'

export function ChangeEmailForm({ currentEmail }: { currentEmail: string }) {
  const [newEmail, setNewEmail] = useState('')
  const [password, setPassword] = useState('')
  const [sentTo, setSentTo] = useState<string | null>(null)
  const [state, action] = useActionState<FormState, FormData>(changeEmailAction, undefined)

  useActionResult(state, {
    onSuccess: () => {
      setSentTo(newEmail.trim().toLowerCase())
      setNewEmail('')
      setPassword('')
    },
  })

  return (
    <form action={action}>
      <FieldGroup>
        {sentTo && (
          <div role="status" className="flex gap-2 rounded-lg border bg-muted/50 p-3 text-sm">
            <MailCheckIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <p>
              Confirm the change from your new inbox: we sent a link to{' '}
              <span className="font-medium break-all">{sentTo}</span>. Until you open it, your address stays{' '}
              <span className="font-medium break-all">{currentEmail}</span>. The link works for 24 hours.
            </p>
          </div>
        )}
        <AccountField
          id="email-new"
          name="newEmail"
          label="New email address"
          type="email"
          autoComplete="email"
          required
          value={newEmail}
          onValueChange={setNewEmail}
          error={state?.fieldErrors?.newEmail}
        />
        <AccountField
          id="email-password"
          name="password"
          label="Current password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onValueChange={setPassword}
          error={state?.fieldErrors?.password}
        />
        {state?.error && !state.fieldErrors && <FieldError>{state.error}</FieldError>}
        <div>
          <SubmitButton pendingLabel="Sending...">Send confirmation link</SubmitButton>
        </div>
      </FieldGroup>
    </form>
  )
}
