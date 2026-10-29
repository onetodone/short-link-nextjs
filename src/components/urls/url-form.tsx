'use client'

import { useActionState, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import type { FormState } from '@/lib/forms'
import { useActionResult } from '@/hooks/use-action-result'
import { createUrlAction, makeUpdateUrlAction } from '@/lib/actions/url-actions'
import { MAX_NOTE_LENGTH } from '@/schemas/url'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'

interface UrlFormProps {
  mode: 'create' | 'edit'
  shortCode?: string
  defaultUrl?: string
  defaultNote?: string
}

export function UrlForm({ mode, shortCode, defaultUrl = '', defaultNote = '' }: UrlFormProps) {
  const router = useRouter()
  const [url, setUrl] = useState(defaultUrl)
  const [note, setNote] = useState(defaultNote)

  const action = useMemo(
    () => (mode === 'edit' ? makeUpdateUrlAction(shortCode ?? '') : createUrlAction),
    [mode, shortCode],
  )
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, undefined)

  useActionResult(state, {
    onSuccess: () => {
      toast.success(mode === 'create' ? 'Short link created.' : 'Short link updated.')
      router.push(mode === 'create' ? '/?page=1' : '/')
    },
  })

  const fieldError = state?.fieldErrors?.url
  const noteError = state?.fieldErrors?.note
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
            <Field data-invalid={Boolean(noteError)}>
              <FieldLabel htmlFor="note">Note (optional)</FieldLabel>
              <FieldContent>
                <Textarea
                  id="note"
                  name="note"
                  rows={2}
                  maxLength={MAX_NOTE_LENGTH}
                  placeholder="What this link is for"
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  aria-invalid={Boolean(noteError)}
                />
                <FieldDescription>
                  Only you see it. {note.length}/{MAX_NOTE_LENGTH}
                </FieldDescription>
                {noteError && <FieldError>{noteError}</FieldError>}
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
