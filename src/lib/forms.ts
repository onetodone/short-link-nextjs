import type * as z from 'zod'
import { ApiError, SessionExpiredError } from '@/lib/api/errors'

export type FormState = { error?: string; fieldErrors?: Record<string, string>; success?: boolean } | undefined

export function firstZodError(error: z.ZodError, fallback = 'Invalid input.'): string {
  return error.issues[0]?.message ?? fallback
}

export function zodFieldErrors(error: z.ZodError): Record<string, string> {
  const fields: Record<string, string> = {}
  for (const issue of error.issues) {
    const key = issue.path.map((segment) => String(segment)).join('.') || '_'
    if (!(key in fields)) fields[key] = issue.message
  }
  return fields
}

export function toFormState(error: unknown): FormState {
  if (error instanceof ApiError) {
    if (error.issues && error.issues.length > 0) {
      const fieldErrors: Record<string, string> = {}
      for (const issue of error.issues) {
        const key = issue.path || '_'
        if (!(key in fieldErrors)) fieldErrors[key] = issue.message
      }
      return { error: error.issues[0].message, fieldErrors }
    }
    return { error: error.message }
  }
  if (error instanceof SessionExpiredError) return { error: error.message }
  return { error: 'Something went wrong. Please try again.' }
}

export function runFormAction<Schema extends z.ZodType>(
  schema: Schema,
  handler: (values: z.output<Schema>) => Promise<FormState>,
): (prevState: FormState, formData: FormData) => Promise<FormState> {
  return async (_prevState, formData) => {
    const parsed = schema.safeParse(Object.fromEntries(formData))
    if (!parsed.success) {
      return { error: firstZodError(parsed.error), fieldErrors: zodFieldErrors(parsed.error) }
    }
    try {
      return await handler(parsed.data)
    } catch (error) {
      return toFormState(error)
    }
  }
}
