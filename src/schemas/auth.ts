import * as z from 'zod'

const email = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email({ error: 'Please enter a valid email address.' }))

export const loginSchema = z.object({
  email,
  password: z.string().min(1, { error: 'Password is required.' }),
})

export const registerSchema = z.object({
  email,
  password: z
    .string()
    .min(8, { error: 'Password must be at least 8 characters.' })
    .max(128, { error: 'Password must be at most 128 characters.' }),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
