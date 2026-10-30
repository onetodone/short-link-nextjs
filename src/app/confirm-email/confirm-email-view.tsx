'use client'

import { useCallback, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { confirmEmailChange } from '@/lib/api/auth'
import { ApiError } from '@/lib/api/errors'
import type { AuthUser } from '@/lib/api/types'
import { useAuth } from '@/lib/auth/context'
import { updateSessionUser } from '@/lib/auth/session'
import { useApiQuery } from '@/hooks/use-api-query'
import { AuthCard, AuthCardSkeleton } from '@/components/auth-card'
import { Button } from '@/components/ui/button'

const noToken = (): Promise<AuthUser> =>
  Promise.reject(new ApiError('This link is incomplete.', { status: 400, code: 'INVALID_TOKEN' }))

export function ConfirmEmailView({ token }: { token: string }) {
  const router = useRouter()
  const { status } = useAuth()

  const confirm = useCallback(() => (token ? confirmEmailChange(token) : noToken()), [token])
  const { data: changed, error, loading, refetch } = useApiQuery(`confirm-email:${token}`, confirm)

  useEffect(() => {
    if (!changed || status === 'loading') return
    if (status === 'authenticated') updateSessionUser(changed)
    toast.success(`Your email address is now ${changed.email}.`)
    router.replace(status === 'authenticated' ? '/profile' : '/login')
  }, [changed, status, router])

  if (loading || changed) return <AuthCardSkeleton />

  if (status === 'loading') return <AuthCardSkeleton />

  const next = status === 'authenticated' ? { href: '/profile', label: 'Go to your profile' } : null

  if (error instanceof ApiError && error.code === 'INVALID_TOKEN') {
    return (
      <AuthCard
        title="This link has expired"
        description="Email change links work once and expire after 24 hours. Ask for the change again from your profile."
      >
        <Button className="w-full" nativeButton={false} render={<Link href={next?.href ?? '/login'} />}>
          {next?.label ?? 'Sign in'}
        </Button>
      </AuthCard>
    )
  }

  if (error instanceof ApiError && error.status === 409) {
    return (
      <AuthCard
        title="That address is taken"
        description="Another account uses this email address now, so your address was not changed."
      >
        <Button className="w-full" nativeButton={false} render={<Link href={next?.href ?? '/login'} />}>
          {next?.label ?? 'Sign in'}
        </Button>
      </AuthCard>
    )
  }

  return (
    <AuthCard title="Couldn’t change your email" description={error?.message ?? 'Something went wrong.'}>
      <Button className="w-full" onClick={refetch}>
        Try again
      </Button>
    </AuthCard>
  )
}
