import { ThemeToggle } from '@/components/theme/theme-toggle'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-md flex-col items-center justify-center gap-6 p-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Short URL</CardTitle>
          <CardDescription>
            Frontend scaffold is up. Auth and the link cabinet land in the next sprints.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Theme</span>
          <ThemeToggle />
        </CardContent>
      </Card>
    </main>
  )
}
