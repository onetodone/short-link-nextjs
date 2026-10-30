'use client'

import Link from 'next/link'
import { BanIcon, ExternalLinkIcon, PencilIcon } from 'lucide-react'
import type { UrlSummary } from '@/lib/api/types'
import { formatDate, stripScheme } from '@/lib/format'
import { disabledLinkCopy } from '@/lib/moderation'
import { CopyButton } from '@/components/urls/copy-button'
import { DeleteUrlDialog } from '@/components/urls/delete-url-dialog'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

export function UrlCard({ url, onDeleted }: { url: UrlSummary; onDeleted: () => void }) {
  return (
    <Card className="gap-3 px-4">
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex min-w-0 items-center gap-2">
          <a
            href={url.shortUrl}
            target="_blank"
            rel="noreferrer"
            title={url.shortUrl}
            className="inline-flex min-w-0 items-center gap-1 truncate font-medium text-primary underline underline-offset-4"
          >
            <span className="truncate">{stripScheme(url.shortUrl)}</span>
            <ExternalLinkIcon className="size-3.5 shrink-0" />
          </a>
          {url.disabled && (
            <Badge variant="destructive">
              <BanIcon />
              Disabled
            </Badge>
          )}
        </div>
        <span className="truncate text-muted-foreground" title={url.originalUrl}>
          {url.originalUrl}
        </span>
        {url.disabled && <p className="text-sm text-destructive">{disabledLinkCopy(url.disabledReason).summary}</p>}
        {url.note && <p className="line-clamp-2 text-sm break-words whitespace-pre-line">{url.note}</p>}
        <span className="mt-auto pt-1 text-xs text-muted-foreground">
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
            aria-label="Edit short link"
            nativeButton={false}
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
