'use client'

import Link from 'next/link'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Pagination({ page, total, pageSize }: { page: number; total: number; pageSize: number }) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  if (pageCount <= 1) return null

  const from = (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)
  const atStart = page <= 1
  const atEnd = page >= pageCount

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
      <span>
        Showing {from}&ndash;{to} of {total}
      </span>
      <div className="flex gap-1">
        {atStart ? (
          <Button variant="outline" size="sm" disabled>
            <ChevronLeftIcon />
            Prev
          </Button>
        ) : (
          <Button variant="outline" size="sm" nativeButton={false} render={<Link href={`/?page=${page - 1}`} />}>
            <ChevronLeftIcon />
            Prev
          </Button>
        )}
        {atEnd ? (
          <Button variant="outline" size="sm" disabled>
            Next
            <ChevronRightIcon />
          </Button>
        ) : (
          <Button variant="outline" size="sm" nativeButton={false} render={<Link href={`/?page=${page + 1}`} />}>
            Next
            <ChevronRightIcon />
          </Button>
        )}
      </div>
    </div>
  )
}
