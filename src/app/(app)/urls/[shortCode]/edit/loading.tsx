import { PageContainer, PageHeader } from '@/components/page-header'
import { UrlFormSkeleton } from '@/components/urls/url-form-skeleton'

export default function EditUrlLoading() {
  return (
    <PageContainer width="3xl">
      <PageHeader
        title="Edit short link"
        description="Change where this short link points. The short link itself stays the same."
      />
      <UrlFormSkeleton />
    </PageContainer>
  )
}
