'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AlertTriangleIcon, LinkIcon } from 'lucide-react'
import { useUrls } from '@/hooks/use-urls'
import { URLS_PAGE_SIZE } from '@/lib/api/urls'
import { UrlCard } from '@/components/urls/url-card'
import { UrlListSkeleton } from '@/components/urls/url-list-skeleton'
import { Pagination } from '@/components/urls/pagination'
import { Button } from '@/components/ui/button'

export function UrlList({ page }: { page: number }) {
  const router = useRouter()
  const { data, error, loading, refetch } = useUrls(page)

  if (loading) return <UrlListSkeleton />

  if (error) {
    return (
      <Panel icon={<AlertTriangleIcon className="text-destructive" />} title="Couldn’t load your short links">
        <p className="text-sm text-muted-foreground">{error.message}</p>
        <Button variant="outline" size="sm" onClick={refetch}>
          Try again
        </Button>
      </Panel>
    )
  }

  if (!data || data.items.length === 0) {
    if (page > 1) {
      return (
        <Panel icon={<LinkIcon />} title="Nothing on this page">
          <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/?page=1" />}>
            Back to the first page
          </Button>
        </Panel>
      )
    }
    return (
      <Panel icon={<LinkIcon />} title="No short links yet">
        <p className="text-sm text-muted-foreground">Create your first one to start tracking clicks.</p>
        <Button size="sm" nativeButton={false} render={<Link href="/urls/new" />}>
          Add short link
        </Button>
      </Panel>
    )
  }

  const onDeleted = () => {
    if (data.items.length === 1 && page > 1) {
      router.replace(`/?page=${page - 1}`)
    } else {
      refetch()
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.items.map((url) => (
          <UrlCard key={url.shortCode} url={url} onDeleted={onDeleted} />
        ))}
      </div>
      <Pagination page={page} total={data.total} pageSize={URLS_PAGE_SIZE} />
    </div>
  )
}

function Panel({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed p-12 text-center">
      <div className="flex size-10 items-center justify-center rounded-lg bg-muted [&_svg]:size-5">{icon}</div>
      <p className="font-medium">{title}</p>
      {children}
    </div>
  )
}
