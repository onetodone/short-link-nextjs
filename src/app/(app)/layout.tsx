'use client'

import type { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { AuthGuard } from '@/lib/auth/guard'
import { SiteHeader } from '@/components/site-header'
import { SiteHeaderSkeleton } from '@/components/site-header-skeleton'
import { SiteFooter } from '@/components/site-footer'
import {
  DashboardBodySkeleton,
  EditUrlBodySkeleton,
  NewUrlBodySkeleton,
  ProfileBodySkeleton,
} from '@/components/page-skeletons'

const MAIN_CLASS = 'flex-1 outline-none'

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard fallback={<AppShellSkeleton />}>
      <a
        href="#main-content"
        className="sr-only rounded-md bg-background px-3 py-2 text-sm font-medium shadow focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50"
      >
        Skip to content
      </a>
      <SiteHeader />
      <main id="main-content" tabIndex={-1} className={MAIN_CLASS}>
        {children}
      </main>
      <SiteFooter />
    </AuthGuard>
  )
}

function AppShellSkeleton() {
  const pathname = usePathname()

  return (
    <>
      <SiteHeaderSkeleton />
      <main className={MAIN_CLASS}>{pickBodySkeleton(pathname)}</main>
      <SiteFooter />
    </>
  )
}

function pickBodySkeleton(pathname: string): ReactNode {
  if (pathname === '/profile') return <ProfileBodySkeleton />
  if (pathname === '/urls/new') return <NewUrlBodySkeleton />
  if (pathname.startsWith('/urls/') && pathname.endsWith('/edit')) return <EditUrlBodySkeleton />
  return <DashboardBodySkeleton />
}
