import { Skeleton } from '@/components/ui/skeleton'
import { PageContainer, PageHeader } from '@/components/page-header'

export default function DashboardLoading() {
  return (
    <PageContainer width="6xl">
      <PageHeader title="Your short links" action={<Skeleton className="h-8 w-36" />} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} className="h-40 w-full rounded-xl" />
        ))}
      </div>
    </PageContainer>
  )
}
