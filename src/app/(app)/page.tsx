import type { Metadata } from 'next'
import Link from 'next/link'
import { PlusIcon } from 'lucide-react'
import { PageContainer, PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { UrlList } from '@/components/urls/url-list'

export const metadata: Metadata = {
  title: 'Dashboard',
}

function parsePage(value: string | string[] | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value
  const parsed = Number.parseInt(raw ?? '1', 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const page = parsePage((await searchParams).page)

  return (
    <PageContainer width="6xl">
      <PageHeader
        title="Your short links"
        description="Create, track, and manage your short links."
        action={
          <Button nativeButton={false} render={<Link href="/urls/new" />}>
            <PlusIcon />
            Add short link
          </Button>
        }
      />
      <UrlList page={page} />
    </PageContainer>
  )
}
