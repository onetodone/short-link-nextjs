import { Skeleton } from '@/components/ui/skeleton'

export function SiteHeaderSkeleton() {
  return (
    <header className="border-b">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 p-4 sm:px-8">
        <Skeleton className="h-6 w-24" />
        <div className="flex flex-wrap items-center gap-1">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-20" />
          <Skeleton className="hidden h-4 w-40 sm:block" />
          <Skeleton className="size-8" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>
    </header>
  )
}
