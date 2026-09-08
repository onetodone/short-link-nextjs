'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/auth/context'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme/theme-toggle'

export function SiteHeader() {
  const { user, logout } = useAuth()

  return (
    <header className="border-b">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 p-4 sm:px-8">
        <Link href="/" className="text-lg font-semibold">
          Short URL
        </Link>
        <nav className="flex flex-wrap items-center gap-1">
          <Button variant="ghost" nativeButton={false} render={<Link href="/" />}>
            Dashboard
          </Button>
          <Button variant="ghost" nativeButton={false} render={<Link href="/profile" />}>
            Profile
          </Button>
          {user?.email && <span className="hidden px-2 text-sm text-muted-foreground sm:inline">{user.email}</span>}
          <ThemeToggle />
          <Button variant="outline" onClick={logout}>
            Sign out
          </Button>
        </nav>
      </div>
    </header>
  )
}
