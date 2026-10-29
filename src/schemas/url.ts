import * as z from 'zod'

const MAX_URL_LENGTH = 2048
/** Longest note the API accepts on a link. */
export const MAX_NOTE_LENGTH = 200

/** Create / edit form values; an empty `note` means "no note". */
export const urlSchema = z.object({
  url: z
    .string()
    .trim()
    .min(1, { error: 'Enter a URL to shorten.' })
    .max(MAX_URL_LENGTH, { error: `URL must be at most ${MAX_URL_LENGTH} characters.` })
    .refine((value) => /^https?:\/\//i.test(value), {
      error: 'The URL must start with http:// or https://',
    }),
  note: z
    .string()
    .trim()
    .max(MAX_NOTE_LENGTH, { error: `Note must be at most ${MAX_NOTE_LENGTH} characters.` })
    .optional(),
})

export type UrlInput = z.infer<typeof urlSchema>

export const SHORT_CODE_PATTERN = /^[0-9A-Za-z]{4,32}$/
