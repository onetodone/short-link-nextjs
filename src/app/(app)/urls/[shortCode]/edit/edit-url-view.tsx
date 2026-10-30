'use client'

import { useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangleIcon } from 'lucide-react'
import { toast } from 'sonner'
import { ApiError } from '@/lib/api/errors'
import { getUrl } from '@/lib/api/urls'
import { useApiQuery } from '@/hooks/use-api-query'
import { PageContainer, PageHeader } from '@/components/page-header'
import { EDIT_URL_HEADER, EditUrlBodySkeleton } from '@/components/page-skeletons'
import { DisabledLinkNotice } from '@/components/urls/disabled-link-notice'
import { UrlForm } from '@/components/urls/url-form'
import { Button } from '@/components/ui/button'

export function EditUrlView({ shortCode, supportEmail }: { shortCode: string; supportEmail: string | null }) {
  const router = useRouter()

  const fetchUrl = useCallback(() => getUrl(shortCode), [shortCode])
  const { data, error, loading, refetch } = useApiQuery(`url:${shortCode}`, fetchUrl)

  const notFound = error instanceof ApiError && error.status === 404

  useEffect(() => {
    if (!notFound) return
    toast.error('That short link was not found.')
    router.replace('/')
  }, [notFound, router])

  if (loading) return <EditUrlBodySkeleton />

  if (notFound) return null

  return (
    <PageContainer width="3xl">
      <PageHeader title={EDIT_URL_HEADER.title} description={EDIT_URL_HEADER.description} />
      {data ? (
        <div className="flex flex-col gap-4">
          {data.disabled && <DisabledLinkNotice reason={data.disabledReason} supportEmail={supportEmail} />}
          <UrlForm mode="edit" shortCode={shortCode} defaultUrl={data.originalUrl} defaultNote={data.note ?? ''} />
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed p-12 text-center">
          <AlertTriangleIcon className="size-5 text-destructive" />
          <p className="font-medium">Couldn’t load this short link</p>
          {error && <p className="text-sm text-muted-foreground">{error.message}</p>}
          <Button variant="outline" size="sm" onClick={refetch}>
            Try again
          </Button>
        </div>
      )}
    </PageContainer>
  )
}
