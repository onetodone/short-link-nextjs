'use client'

import { useCallback, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { verifyEmail } from '@/lib/api/auth'
import { ApiError } from '@/lib/api/errors'
import type { AuthUser } from '@/lib/api/types'
import { useAuth } from '@/lib/auth/context'
import { updateSessionUser } from '@/lib/auth/session'
import { useApiQuery } from '@/hooks/use-api-query'
import { AuthCard, AuthCardSkeleton } from '@/components/auth-card'
import { ResendVerificationButton } from '@/components/auth/resend-verification-button'
import { Button } from '@/components/ui/button'

const noToken = (): Promise<AuthUser> =>
  Promise.reject(new ApiError('This link is incomplete.', { status: 400, code: 'INVALID_TOKEN' }))

export function VerifyEmailView({ token }: { token: string }) {
  const router = useRouter()
  const { status, user } = useAuth()

  const confirm = useCallback(() => (token ? verifyEmail(token) : noToken()), [token])
  const { data: verified, error, loading, refetch } = useApiQuery(`verify-email:${token}`, confirm)

  useEffect(() => {
    if (!verified || status === 'loading') return
    if (status === 'authenticated') updateSessionUser(verified)
    toast.success('Email address confirmed.')
    router.replace(status === 'authenticated' ? '/' : '/login')
  }, [verified, status, router])

  if (loading || verified) return <AuthCardSkeleton />

  const invalidLink = error instanceof ApiError && error.code === 'INVALID_TOKEN'

  if (!invalidLink) {
    return (
      <AuthCard title="Couldn’t confirm your email" description={error?.message ?? 'Something went wrong.'}>
        <Button className="w-full" onClick={refetch}>
          Try again
        </Button>
      </AuthCard>
    )
  }

  if (status === 'loading') return <AuthCardSkeleton />

  if (user?.emailVerified) {
    return (
      <AuthCard
        title="Email already confirmed"
        description="Your email address is confirmed. This link is no longer needed."
      >
        <Button className="w-full" nativeButton={false} render={<Link href="/" />}>
          Go to your links
        </Button>
      </AuthCard>
    )
  }

  return (
    <AuthCard
      title="This link has expired"
      description="Confirmation links work once and expire after 24 hours. Ask for a new one below."
    >
      {user ? (
        <ResendVerificationButton email={user.email} variant="default" />
      ) : (
        <>
          <Button className="w-full" nativeButton={false} render={<Link href="/login" />}>
            Sign in to get a new link
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            After signing in, use “Resend email” at the top of the page.
          </p>
        </>
      )}
    </AuthCard>
  )
}
