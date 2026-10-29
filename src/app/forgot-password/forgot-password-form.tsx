'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { forgotPasswordAction } from '@/lib/actions/auth-actions'
import type { FormState } from '@/lib/forms'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldContent, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [state, action, pending] = useActionState<FormState, FormData>(forgotPasswordAction, undefined)

  if (state?.success) {
    return (
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Check your inbox</CardTitle>
          <CardDescription>
            If an account exists for <span className="font-medium break-all text-foreground">{email.trim()}</span>,
            we’ve sent it a link to reset the password. The link works for one hour.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" className="w-full" nativeButton={false} render={<Link href="/login" />}>
            Back to sign in
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Forgot your password?</CardTitle>
        <CardDescription>Enter your email and we’ll send you a link to set a new one.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action}>
          <FieldGroup>
            <Field data-invalid={Boolean(state?.fieldErrors?.email)}>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <FieldContent>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  autoComplete="email"
                  aria-invalid={Boolean(state?.fieldErrors?.email)}
                />
                {state?.fieldErrors?.email && <FieldError>{state.fieldErrors.email}</FieldError>}
              </FieldContent>
            </Field>
            {state?.error && !state.fieldErrors && <FieldError>{state.error}</FieldError>}
            <Button type="submit" disabled={pending} className="w-full">
              {pending ? 'Sending...' : 'Send reset link'}
            </Button>
          </FieldGroup>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Remembered it?{' '}
          <Link href="/login" className="underline underline-offset-4">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
