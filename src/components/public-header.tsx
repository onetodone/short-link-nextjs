'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/auth/context'
import { SITE_NAME } from '@/lib/site'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ThemeToggle } from '@/components/theme/theme-toggle'

export function PublicHeader() {
  const { status } = useAuth()

  return (
    <header className="border-b">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 p-4 sm:px-8">
        <Link href="/" className="text-lg font-semibold">
          {SITE_NAME}
        </Link>
        <nav aria-label="Main" className="flex flex-wrap items-center gap-1">
          <ThemeToggle />
          {status === 'loading' && (
            <>
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-24" />
            </>
          )}
          {status === 'authenticated' && (
            <Button nativeButton={false} render={<Link href="/urls" />}>
              Dashboard
            </Button>
          )}
          {status === 'unauthenticated' && (
            <>
              <Button variant="ghost" nativeButton={false} render={<Link href="/login" />}>
                Sign in
              </Button>
              <Button nativeButton={false} render={<Link href="/register" />}>
                Get started
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
