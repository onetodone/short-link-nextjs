import type { Metadata, Viewport } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { ThemeProvider } from '@/components/theme/theme-provider'
import { AuthProvider } from '@/lib/auth/context'
import { SessionExpiryListener } from '@/components/auth/session-expiry-listener'
import { AnalyticsConsentProvider } from '@/components/analytics/analytics-consent'
import { Toaster } from '@/components/ui/sonner'
import { getSiteUrl, SITE_NAME } from '@/lib/site'
import { getAnalyticsId } from '@/lib/analytics'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  applicationName: SITE_NAME,
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: 'Create, track, and manage your short links.',
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <ThemeProvider>
          <AuthProvider>
            <AnalyticsConsentProvider gaId={getAnalyticsId()}>{children}</AnalyticsConsentProvider>
            <SessionExpiryListener />
          </AuthProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
