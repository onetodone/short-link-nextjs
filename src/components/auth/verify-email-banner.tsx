'use client'

import { useEffect } from 'react'
import { MailWarningIcon } from 'lucide-react'
import { fetchMe } from '@/lib/api/auth'
import { useAuth } from '@/lib/auth/context'
import { updateSessionUser } from '@/lib/auth/session'
import { ResendVerificationButton } from '@/components/auth/resend-verification-button'

export function VerifyEmailBanner() {
  const { user } = useAuth()
  const unverified = user !== null && !user.emailVerified

  useEffect(() => {
    if (!unverified) return

    // The link may have been opened on another device; pick that up when the user comes back.
    const recheck = () => {
      if (document.visibilityState !== 'visible') return
      fetchMe().then(
        (me) => {
          if (me.emailVerified) updateSessionUser({ id: me.id, email: me.email, emailVerified: true })
        },
        () => {},
      )
    }
    document.addEventListener('visibilitychange', recheck)
    return () => document.removeEventListener('visibilitychange', recheck)
  }, [unverified])

  if (!unverified) return null

  return (
    <div role="status" className="border-b bg-muted/50">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-8">
        <div className="flex items-start gap-2 text-sm">
          <MailWarningIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
          <p>
            Confirm your email address to create and edit links. We sent a link to{' '}
            <span className="font-medium break-all">{user.email}</span>.
          </p>
        </div>
        <ResendVerificationButton email={user.email} />
      </div>
    </div>
  )
}
