import { Skeleton } from '@/components/ui/skeleton'
import { PageContainer, PageHeader } from '@/components/page-header'
import { UrlListSkeleton } from '@/components/urls/url-list-skeleton'

export default function DashboardLoading() {
  return (
    <PageContainer width="6xl">
      <PageHeader title="Your short links" action={<Skeleton className="h-8 w-36" />} />
      <UrlListSkeleton />
    </PageContainer>
  )
}
