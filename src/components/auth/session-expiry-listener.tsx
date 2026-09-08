'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { onSessionExpired } from '@/lib/auth/session'

export function SessionExpiryListener() {
  const router = useRouter()

  useEffect(
    () =>
      onSessionExpired(() => {
        toast.error('Your session has ended. Please sign in again.')
        router.replace('/login')
      }),
    [router],
  )

  return null
}
