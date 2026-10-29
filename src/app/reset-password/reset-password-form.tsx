'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { resetPasswordAction } from '@/lib/actions/auth-actions'
import type { FormState } from '@/lib/forms'
import { useActionResult } from '@/hooks/use-action-result'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [state, action, pending] = useActionState<FormState, FormData>(resetPasswordAction, undefined)

  useActionResult(state, {
    onSuccess: () => {
      toast.success('Password changed. Sign in with your new password.')
      router.replace('/login')
    },
  })

  if (!token) {
    return (
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>This link is incomplete</CardTitle>
          <CardDescription>Open the link from the email again, or ask for a new one.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full" nativeButton={false} render={<Link href="/forgot-password" />}>
            Get a new link
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Set a new password</CardTitle>
        <CardDescription>You’ll be signed out on every device and can sign in with the new password.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action}>
          <input type="hidden" name="token" value={token} />
          <FieldGroup>
            <Field data-invalid={Boolean(state?.fieldErrors?.password)}>
              <FieldLabel htmlFor="password">New password</FieldLabel>
              <FieldContent>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  aria-invalid={Boolean(state?.fieldErrors?.password)}
                />
                <FieldDescription>At least 8 characters.</FieldDescription>
                {state?.fieldErrors?.password && <FieldError>{state.fieldErrors.password}</FieldError>}
              </FieldContent>
            </Field>
            <Field data-invalid={Boolean(state?.fieldErrors?.confirmPassword)}>
              <FieldLabel htmlFor="confirmPassword">Repeat new password</FieldLabel>
              <FieldContent>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                  autoComplete="new-password"
                  aria-invalid={Boolean(state?.fieldErrors?.confirmPassword)}
                />
                {state?.fieldErrors?.confirmPassword && <FieldError>{state.fieldErrors.confirmPassword}</FieldError>}
              </FieldContent>
            </Field>
            {state?.error && (state.fieldErrors?.token || !state.fieldErrors) && <FieldError>{state.error}</FieldError>}
            <Button type="submit" disabled={pending} className="w-full">
              {pending ? 'Saving...' : 'Set new password'}
            </Button>
          </FieldGroup>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Link expired?{' '}
          <Link href="/forgot-password" className="underline underline-offset-4">
            Get a new one
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
