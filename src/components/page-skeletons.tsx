import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { PageContainer, PageHeader } from '@/components/page-header'
import { UrlListSkeleton } from '@/components/urls/url-list-skeleton'
import { UrlFormSkeleton } from '@/components/urls/url-form-skeleton'

export function DashboardBodySkeleton() {
  return (
    <PageContainer width="6xl">
      <PageHeader
        title="Your short links"
        description="Create, track, and manage your short links."
        action={<Skeleton className="h-9 w-36" />}
      />
      <UrlListSkeleton />
    </PageContainer>
  )
}

export function NewUrlBodySkeleton() {
  return (
    <PageContainer width="3xl">
      <PageHeader title="New short link" description="Paste a long URL and get a short one back." />
      <UrlFormSkeleton />
    </PageContainer>
  )
}

export function EditUrlBodySkeleton() {
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

export function ProfileCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-4 w-44" />
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="flex flex-col gap-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-4 w-56" />
          </div>
        ))}
        <Separator />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-3 w-full max-w-md" />
        </div>
      </CardContent>
    </Card>
  )
}

export function ProfileBodySkeleton() {
  return (
    <PageContainer width="2xl">
      <PageHeader title="Profile" description="Your account details." />
      <ProfileCardSkeleton />
    </PageContainer>
  )
}
