import type { Metadata } from 'next'
import Link from 'next/link'
import { BanIcon } from 'lucide-react'
import { getSupportEmail } from '@/lib/support'
import { AuthLayout } from '@/components/auth-card'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Link disabled',
  robots: { index: false },
}

export default async function LinkDisabledPage() {
  const supportEmail = await getSupportEmail()

  return (
    <AuthLayout>
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
            <BanIcon className="size-5" aria-hidden />
          </div>
          <CardTitle>
            <h1>This link is disabled</h1>
          </CardTitle>
          <CardDescription>The short link you opened no longer leads anywhere.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-sm text-muted-foreground">
          <p>
            Links are turned off when their destination is reported as unsafe — phishing, malware or unwanted software —
            or when they break the rules of this service. We don’t show where a disabled link pointed.
          </p>
          {supportEmail && (
            <p>
              Think this is a mistake, or want to report a link? Contact{' '}
              <a href={`mailto:${supportEmail}`} className="font-medium break-words text-foreground underline">
                {supportEmail}
              </a>
              .
            </p>
          )}
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full" nativeButton={false} render={<Link href="/" />}>
            Go to ShortLink
          </Button>
        </CardFooter>
      </Card>
    </AuthLayout>
  )
}
