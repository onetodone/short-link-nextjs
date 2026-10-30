'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/auth/context'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

export function LandingCallToAction() {
  const { status } = useAuth()

  return (
    <div className="flex flex-wrap gap-2">
      {status === 'loading' && (
        <>
          <Skeleton className="h-9 w-28" />
          <Skeleton className="h-9 w-24" />
        </>
      )}
      {status === 'authenticated' && (
        <Button size="lg" nativeButton={false} render={<Link href="/urls" />}>
          My links
        </Button>
      )}
      {status === 'unauthenticated' && (
        <>
          <Button size="lg" nativeButton={false} render={<Link href="/register" />}>
            Get started
          </Button>
          <Button size="lg" variant="outline" nativeButton={false} render={<Link href="/login" />}>
            Sign in
          </Button>
        </>
      )}
    </div>
  )
}
