'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth/context'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme/theme-toggle'

const NAV = [
  { href: '/', label: 'Dashboard', match: (p: string) => p === '/' || p.startsWith('/urls') },
  { href: '/profile', label: 'Profile', match: (p: string) => p.startsWith('/profile') },
] as const

export function SiteHeader() {
  const { user, logout } = useAuth()
  const pathname = usePathname()

  return (
    <header className="border-b">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 p-4 sm:px-8">
        <Link href="/" className="text-lg font-semibold">
          Short Link
        </Link>
        <nav aria-label="Main" className="flex flex-wrap items-center gap-1">
          {NAV.map(({ href, label, match }) => {
            const active = match(pathname)
            return (
              <Button
                key={href}
                variant="ghost"
                nativeButton={false}
                aria-current={active ? 'page' : undefined}
                className={active ? 'bg-accent text-accent-foreground' : undefined}
                render={<Link href={href} />}
              >
                {label}
              </Button>
            )
          })}
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
