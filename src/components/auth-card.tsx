import type { ReactNode } from 'react'
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export function AuthLayout({ children }: { children: ReactNode }) {
  return <div className="flex min-h-svh items-center justify-center p-4">{children}</div>
}

export function AuthCard({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <AuthLayout>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardFooter className="flex-col gap-2">{children}</CardFooter>
      </Card>
    </AuthLayout>
  )
}
