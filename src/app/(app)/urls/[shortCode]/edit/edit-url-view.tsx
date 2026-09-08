'use client'

import { useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { findOriginalUrl } from '@/lib/api/urls'
import { readStashedOriginalUrl } from '@/components/urls/url-nav-state'
import { useApiQuery } from '@/hooks/use-api-query'
import { PageContainer, PageHeader } from '@/components/page-header'
import { EditUrlBodySkeleton } from '@/components/page-skeletons'
import { UrlForm } from '@/components/urls/url-form'

const HEADER = {
  title: 'Edit short link',
  description: 'Change where this short link points. The short link itself stays the same.',
}

export function EditUrlView({ shortCode }: { shortCode: string }) {
  const router = useRouter()

  const resolve = useCallback(
    async () => readStashedOriginalUrl(shortCode) ?? (await findOriginalUrl(shortCode)),
    [shortCode],
  )
  const { data, error, loading } = useApiQuery<string | null>(`url-edit:${shortCode}`, resolve)

  const notFound = !loading && (Boolean(error) || data == null)

  useEffect(() => {
    if (!notFound) return
    toast.error('That short link was not found.')
    router.replace('/')
  }, [notFound, router])

  if (loading) return <EditUrlBodySkeleton />

  if (notFound || data == null) return null

  return (
    <PageContainer width="3xl">
      <PageHeader title={HEADER.title} description={HEADER.description} />
      <UrlForm mode="edit" shortCode={shortCode} defaultUrl={data} />
    </PageContainer>
  )
}
