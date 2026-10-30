'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { BanIcon } from 'lucide-react'
import { loginAction } from '@/lib/actions/auth-actions'
import type { FormState } from '@/lib/forms'
import { useActionResult } from '@/hooks/use-action-result'
import { useCaptchaSiteKey } from '@/hooks/use-captcha-site-key'
import { Turnstile } from '@/components/auth/turnstile'
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
  const [captchaReady, setCaptchaReady] = useState(false)
  const [captchaNeeded, setCaptchaNeeded] = useState(false)
  const [state, action, pending] = useActionState<FormState, FormData>(loginAction, undefined)
  const captchaSiteKey = useCaptchaSiteKey()
  // Once the API asks for the check, it stays until the page is left: a later client-side
  // validation error must not drop the widget.
  if (state?.captchaRequired && !captchaNeeded) setCaptchaNeeded(true)
  const loginCaptchaSiteKey = captchaNeeded ? captchaSiteKey : null

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
              <div className="flex items-center justify-between gap-2">
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Link
                  href="/forgot-password"
                  className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
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
            {loginCaptchaSiteKey && (
              <Turnstile
                siteKey={loginCaptchaSiteKey}
                action="login"
                resetKey={state}
                onReadyChange={setCaptchaReady}
              />
            )}
            {state?.code === 'ACCOUNT_SUSPENDED' ? (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm"
              >
                <BanIcon className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden />
                <div className="flex flex-col gap-1">
                  <p className="font-medium">Account suspended</p>
                  <p className="break-words text-muted-foreground">{state.error}</p>
                </div>
              </div>
            ) : (
              state?.error && !state.fieldErrors && <FieldError>{state.error}</FieldError>
            )}
            <Button
              type="submit"
              disabled={pending || (Boolean(loginCaptchaSiteKey) && !captchaReady)}
              className="w-full"
            >
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
