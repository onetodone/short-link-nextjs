import type { Metadata } from 'next'
import { PageContainer, PageHeader } from '@/components/page-header'
import { UrlForm } from '@/components/urls/url-form'

export const metadata: Metadata = {
  title: 'New short link',
}

export default function NewUrlPage() {
  return (
    <PageContainer width="3xl">
      <PageHeader title="New short link" description="Paste a long URL and get a short one back." />
      <UrlForm mode="create" />
    </PageContainer>
  )
}
