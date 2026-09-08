import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export function UrlListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }, (_, index) => (
        <Card key={index} className="gap-3 px-4">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <Skeleton className="h-7 w-20" />
            <div className="flex gap-1">
              <Skeleton className="size-7" />
              <Skeleton className="size-7" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
