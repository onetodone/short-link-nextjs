import type { Metadata } from 'next'
import Link from 'next/link'
import { ChartColumnIcon, CopyIcon, PencilIcon, ShieldCheckIcon, StickyNoteIcon, TrashIcon } from 'lucide-react'
import { RedirectIfAuthenticated } from '@/lib/auth/guard'
import { getSiteUrl, SITE_NAME } from '@/lib/site'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PublicHeader } from '@/components/public-header'
import { SiteFooter } from '@/components/site-footer'

const DESCRIPTION =
  'Free link shortener: turn long links into short ones, change where they lead at any time, and see how many people opened each.'

export const metadata: Metadata = {
  title: { absolute: `Free Link Shortener with Click Counts | ${SITE_NAME}` },
  description: DESCRIPTION,
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
  {
    icon: StickyNoteIcon,
    title: 'Notes',
    description:
      'Add a note to each link, such as “newsletter, October issue”, to remember where you shared it and compare places by clicks.',
  },
  {
    icon: CopyIcon,
    title: 'Copy in one click',
    description: 'Every link in your list has a copy button, so sharing it takes a second.',
  },
  {
    icon: TrashIcon,
    title: 'Your data, your choice',
    description:
      'Clicks are counted without cookies and without recording who opened a link. Delete a link or your whole account at any time.',
  },
]

const USE_CASES = [
  'Social media bios and posts',
  'Newsletters and email campaigns',
  'Printed flyers, posters and business cards',
  'Messages and chats with a length limit',
  'Slides and presentations',
  'Links you plan to update later',
]

const FAQ = [
  {
    question: 'Is it free?',
    answer:
      'Yes. Creating an account, shortening links and counting clicks costs nothing. To prevent abuse, the number of links one account can create per day is limited.',
  },
  {
    question: 'Do I need an account?',
    answer:
      'Yes. Links and their click counts belong to your account, so only you can see, edit or delete them. Sign up with an email address and a password, and confirm the address to start creating links.',
  },
  {
    question: 'Can I change where a short link leads?',
    answer:
      'Yes. Edit the destination in your account and the same short link leads to the new address, including copies you already shared, printed or posted.',
  },
  {
    question: 'How are clicks counted?',
    answer:
      'Each time someone opens a short link, its counter goes up by one. Bots, link previews and browser prefetches are left out, no cookies are set, and who opened a link isn’t recorded.',
  },
  {
    question: 'Which links can I shorten?',
    answer:
      'Any http:// or https:// address up to 2,048 characters. Destinations that hide where a link leads, such as other link shorteners, bare IP addresses or addresses with a password in them, are refused, and destinations reported as harmful are blocked.',
  },
  {
    question: 'What happens when I delete a link?',
    answer:
      'The short link stops working right away, and its click count is deleted with it. Deleting your account deletes all your links.',
  },
]

export default function HomePage() {
  const siteUrl = getSiteUrl()
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        name: SITE_NAME,
        url: `${siteUrl}/`,
        description: DESCRIPTION,
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Any',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      },
      {
        '@type': 'FAQPage',
        mainEntity: FAQ.map(({ question, answer }) => ({
          '@type': 'Question',
          name: question,
          acceptedAnswer: { '@type': 'Answer', text: answer },
        })),
      },
    ],
  }

  const callToAction = (
    <div className="flex flex-wrap gap-2">
      <Button size="lg" nativeButton={false} render={<Link href="/register" />}>
        Get started
      </Button>
      <Button size="lg" variant="outline" nativeButton={false} render={<Link href="/login" />}>
        Sign in
      </Button>
    </div>
  )

  return (
    <RedirectIfAuthenticated>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <PublicHeader />
      <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
        <section className="mx-auto flex w-full max-w-6xl flex-col items-start gap-6 px-4 py-12 sm:px-8 sm:py-20">
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            Short links that count their clicks
          </h1>
          <p className="max-w-xl text-lg text-pretty text-muted-foreground">
            A free link shortener. Turn a long link into a short one, share it anywhere, change where it leads later,
            and see how many people opened it.
          </p>
          {callToAction}
        </section>
        <section className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 pb-12 sm:px-8 sm:pb-20">
          <h2 className="text-2xl font-semibold">What you get</h2>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
        <section className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 pb-12 sm:px-8 sm:pb-20">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-semibold">Where to use them</h2>
            <p className="max-w-3xl text-pretty text-muted-foreground">
              Use a separate short link for each place you share it and add a note to it. The click counts show which
              places bring visitors.
            </p>
          </div>
          <ul className="grid list-disc gap-x-8 gap-y-2 pl-5 sm:grid-cols-2 lg:grid-cols-3">
            {USE_CASES.map((useCase) => (
              <li key={useCase}>{useCase}</li>
            ))}
          </ul>
        </section>
        <section className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 pb-12 sm:px-8 sm:pb-20">
          <h2 className="text-2xl font-semibold">Frequently asked questions</h2>
          <dl className="grid gap-6 md:grid-cols-2">
            {FAQ.map(({ question, answer }) => (
              <div key={question} className="flex flex-col gap-2">
                <dt className="font-medium">{question}</dt>
                <dd className="text-sm text-pretty text-muted-foreground">{answer}</dd>
              </div>
            ))}
          </dl>
        </section>
        <section className="mx-auto flex w-full max-w-6xl flex-col items-start gap-4 px-4 pb-12 sm:px-8 sm:pb-20">
          <h2 className="text-2xl font-semibold">Shorten your first link</h2>
          <p className="max-w-3xl text-pretty text-muted-foreground">
            It’s free and takes a minute: create an account, paste a link and share the short one.
          </p>
          {callToAction}
        </section>
      </main>
      <SiteFooter />
    </RedirectIfAuthenticated>
  )
}
