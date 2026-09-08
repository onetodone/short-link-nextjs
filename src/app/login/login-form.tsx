'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { loginAction } from '@/lib/actions/auth-actions'
import type { FormState } from '@/lib/forms'
import { useActionResult } from '@/hooks/use-action-result'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldContent, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'

function safeInternalPath(value: string | null): string | null {
  return value && value.startsWith('/') && !value.startsWith('//') ? value : null
}

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [state, action, pending] = useActionState<FormState, FormData>(loginAction, undefined)

  useActionResult(state, {
    onSuccess: () => {
      const next = safeInternalPath(new URLSearchParams(window.location.search).get('next'))
      router.replace(next ?? '/')
    },
  })

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>Access your short links dashboard.</CardDescription>
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
                  autoComplete="current-password"
                  aria-invalid={Boolean(state?.fieldErrors?.password)}
                />
                {state?.fieldErrors?.password && <FieldError>{state.fieldErrors.password}</FieldError>}
              </FieldContent>
            </Field>
            {state?.error && !state.fieldErrors && <FieldError>{state.error}</FieldError>}
            <Button type="submit" disabled={pending} className="w-full">
              {pending ? 'Signing in...' : 'Sign in'}
            </Button>
          </FieldGroup>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          No account?{' '}
          <Link href="/register" className="underline underline-offset-4">
            Register
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
