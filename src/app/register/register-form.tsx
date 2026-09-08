'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { registerAction } from '@/lib/actions/auth-actions'
import type { FormState } from '@/lib/forms'
import { useActionResult } from '@/hooks/use-action-result'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldContent, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'

function safeInternalPath(value: string | null): string | null {
  return value && value.startsWith('/') && !value.startsWith('//') ? value : null
}

export function RegisterForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [state, action, pending] = useActionState<FormState, FormData>(registerAction, undefined)

  useActionResult(state, {
    onSuccess: () => {
      const next = safeInternalPath(new URLSearchParams(window.location.search).get('next'))
      router.replace(next ?? '/')
    },
  })

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>Register to manage your own short links.</CardDescription>
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
            <Field data-invalid={Boolean(state?.fieldErrors?.password)}>
              <FieldLabel htmlFor="password">Password</FieldLabel>
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
                {state?.fieldErrors?.password && <FieldError>{state.fieldErrors.password}</FieldError>}
              </FieldContent>
            </Field>
            {state?.error && !state.fieldErrors && <FieldError>{state.error}</FieldError>}
            <Button type="submit" disabled={pending} className="w-full">
              {pending ? 'Creating account...' : 'Create account'}
            </Button>
          </FieldGroup>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="underline underline-offset-4">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
