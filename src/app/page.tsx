import type { Metadata } from 'next'
import Link from 'next/link'
import { ChartColumnIcon, PencilIcon, ShieldCheckIcon } from 'lucide-react'
import { RedirectIfAuthenticated } from '@/lib/auth/guard'
import { SITE_NAME } from '@/lib/site'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PublicHeader } from '@/components/public-header'
import { SiteFooter } from '@/components/site-footer'

export const metadata: Metadata = {
  title: { absolute: `${SITE_NAME} — short links that count their clicks` },
  description:
    'Turn long links into short ones, change where they lead at any time, and see how many people opened each.',
  alternates: { canonical: '/' },
}

const FEATURES = [
  {
    icon: PencilIcon,
    title: 'Change the destination',
    description:
      'Point a short link somewhere else at any time. Links you already shared, printed or posted follow the change.',
  },
  {
    icon: ChartColumnIcon,
    title: 'Count real clicks',
    description:
      'See how many people opened each link. Bots, link previews and browser prefetches are left out of the count.',
  },
  {
    icon: ShieldCheckIcon,
    title: 'Safe for the people who click',
    description:
      'Destinations that hide where a link leads are refused, and links reported as harmful are switched off.',
  },
]

export default function HomePage() {
  return (
    <RedirectIfAuthenticated>
      <PublicHeader />
      <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
        <section className="mx-auto flex w-full max-w-6xl flex-col items-start gap-6 px-4 py-12 sm:px-8 sm:py-20">
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            Short links that count their clicks
          </h1>
          <p className="max-w-xl text-lg text-pretty text-muted-foreground">
            Turn a long link into a short one, share it anywhere, change where it leads later, and see how many people
            opened it.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button size="lg" nativeButton={false} render={<Link href="/register" />}>
              Get started
            </Button>
            <Button size="lg" variant="outline" nativeButton={false} render={<Link href="/login" />}>
              Sign in
            </Button>
          </div>
        </section>
        <section className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 pb-12 sm:px-8 sm:pb-20">
          <h2 className="text-2xl font-semibold">What you get</h2>
          <ul className="grid gap-4 md:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <li key={title} className="flex">
                <Card className="w-full">
                  <CardHeader>
                    <Icon className="mb-2 size-6 text-muted-foreground" aria-hidden />
                    <CardTitle>
                      <h3>{title}</h3>
                    </CardTitle>
                    <CardDescription>{description}</CardDescription>
                  </CardHeader>
                </Card>
              </li>
            ))}
          </ul>
        </section>
      </main>
      <SiteFooter />
    </RedirectIfAuthenticated>
  )
}
