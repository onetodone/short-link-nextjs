import { PageContainer, PageHeader } from '@/components/page-header'
import { UrlFormSkeleton } from '@/components/urls/url-form-skeleton'

export default function NewUrlLoading() {
  return (
    <PageContainer width="3xl">
      <PageHeader title="New short link" description="Paste a long URL and get a short one back." />
      <UrlFormSkeleton />
    </PageContainer>
  )
}
