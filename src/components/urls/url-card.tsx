'use client'

import Link from 'next/link'
import { ExternalLinkIcon, PencilIcon } from 'lucide-react'
import type { UrlSummary } from '@/lib/api/types'
import { formatDate, stripScheme } from '@/lib/format'
import { stashOriginalUrl } from '@/components/urls/url-nav-state'
import { CopyButton } from '@/components/urls/copy-button'
import { DeleteUrlDialog } from '@/components/urls/delete-url-dialog'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

export function UrlCard({ url, onDeleted }: { url: UrlSummary; onDeleted: () => void }) {
  return (
    <Card className="gap-3 px-4">
      <div className="flex min-w-0 flex-col gap-1">
        <a
          href={url.shortUrl}
          target="_blank"
          rel="noreferrer"
          title={url.shortUrl}
          className="inline-flex items-center gap-1 truncate font-medium text-primary underline underline-offset-4"
        >
          <span className="truncate">{stripScheme(url.shortUrl)}</span>
          <ExternalLinkIcon className="size-3.5 shrink-0" />
        </a>
        <span className="truncate text-muted-foreground" title={url.originalUrl}>
          {url.originalUrl}
        </span>
        <span className="mt-1 text-xs text-muted-foreground">
          <strong className="text-foreground">{url.clicks}</strong> {url.clicks === 1 ? 'click' : 'clicks'}
          <span className="px-1">·</span>
          {formatDate(url.createdAt)}
        </span>
      </div>
      <Separator />
      <div className="flex items-center justify-between gap-2">
        <CopyButton value={url.shortUrl} />
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Edit destination"
            nativeButton={false}
            onClick={() => stashOriginalUrl(url.shortCode, url.originalUrl)}
            render={<Link href={`/urls/${url.shortCode}/edit`} />}
          >
            <PencilIcon />
          </Button>
          <DeleteUrlDialog shortCode={url.shortCode} shortUrl={url.shortUrl} onDeleted={onDeleted} />
        </div>
      </div>
    </Card>
  )
}
