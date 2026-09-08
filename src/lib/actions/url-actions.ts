'use client'

import { ApiError } from '@/lib/api/errors'
import { createUrl, updateUrl } from '@/lib/api/urls'
import { runFormAction, type FormState } from '@/lib/forms'
import { urlSchema } from '@/schemas/url'

export const createUrlAction = runFormAction(urlSchema, async ({ url }): Promise<FormState> => {
  await createUrl(url)
  return { success: true }
})

export function makeUpdateUrlAction(shortCode: string) {
  return runFormAction(urlSchema, async ({ url }): Promise<FormState> => {
    try {
      await updateUrl(shortCode, url)
    } catch (error) {
      // 404 = unknown code or not the owner — the link is gone from under us.
      if (error instanceof ApiError && error.status === 404) {
        return { error: 'This short link no longer exists. Head back to the dashboard.' }
      }
      throw error
    }
    return { success: true }
  })
}
