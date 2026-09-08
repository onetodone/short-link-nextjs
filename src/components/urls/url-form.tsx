'use client'

import { useActionState, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import type { FormState } from '@/lib/forms'
import { useActionResult } from '@/hooks/use-action-result'
import { clearStashedOriginalUrl } from '@/components/urls/url-nav-state'
import { createUrlAction, makeUpdateUrlAction } from '@/lib/actions/url-actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'

interface UrlFormProps {
  mode: 'create' | 'edit'
  shortCode?: string
  defaultUrl?: string
}

export function UrlForm({ mode, shortCode, defaultUrl = '' }: UrlFormProps) {
  const router = useRouter()
  const [url, setUrl] = useState(defaultUrl)

  const action = useMemo(
    () => (mode === 'edit' ? makeUpdateUrlAction(shortCode ?? '') : createUrlAction),
    [mode, shortCode],
  )
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, undefined)

  useActionResult(state, {
    onSuccess: () => {
      if (mode === 'edit' && shortCode) clearStashedOriginalUrl(shortCode)
      toast.success(mode === 'create' ? 'Short link created.' : 'Destination updated.')
      router.push(mode === 'create' ? '/?page=1' : '/')
    },
  })

  const fieldError = state?.fieldErrors?.url
  const submitLabel = mode === 'create' ? 'Create short link' : 'Save changes'
  const pendingLabel = mode === 'create' ? 'Creating...' : 'Saving...'

  return (
    <Card>
      <CardContent>
        <form action={formAction}>
          <FieldGroup>
            <Field data-invalid={Boolean(fieldError)}>
              <FieldLabel htmlFor="url">Destination URL</FieldLabel>
              <FieldContent>
                <Input
                  id="url"
                  name="url"
                  type="url"
                  inputMode="url"
                  autoComplete="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  placeholder="https://example.com/a/very/long/path"
                  value={url}
                  onChange={(event) => setUrl(event.target.value)}
                  required
                  aria-invalid={Boolean(fieldError)}
                />
                <FieldDescription>
                  {mode === 'create'
                    ? 'We generate a short code for this link automatically.'
                    : 'The short link stays the same — only where it points changes.'}
                </FieldDescription>
                {fieldError && <FieldError>{fieldError}</FieldError>}
              </FieldContent>
            </Field>
            {state?.error && !state.fieldErrors && <FieldError>{state.error}</FieldError>}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" nativeButton={false} render={<Link href="/" />}>
                Cancel
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? pendingLabel : submitLabel}
              </Button>
            </div>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
