'use client'

import type { ReactNode } from 'react'
import { AuthGuard } from '@/lib/auth/guard'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { Skeleton } from '@/components/ui/skeleton'
import { PageContainer, PageHeader } from '@/components/page-header'

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard fallback={<AppShellSkeleton />}>
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </AuthGuard>
  )
}

function AppShellSkeleton() {
  return (
    <>
      <header className="border-b">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 p-4 sm:px-8">
          <Skeleton className="h-6 w-24" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="size-8" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      </header>
      <main className="flex-1">
        <PageContainer width="6xl">
          <PageHeader title="Your short links" action={<Skeleton className="h-8 w-36" />} />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }, (_, index) => (
              <Skeleton key={index} className="h-40 w-full rounded-xl" />
            ))}
          </div>
        </PageContainer>
      </main>
    </>
  )
}
