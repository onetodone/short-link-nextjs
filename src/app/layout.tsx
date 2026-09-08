import type { Metadata, Viewport } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { ThemeProvider } from '@/components/theme/theme-provider'
import { AuthProvider } from '@/lib/auth/context'
import { SessionExpiryListener } from '@/components/auth/session-expiry-listener'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3001'

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  applicationName: 'Short Link',
  title: {
    default: 'Short Link',
    template: '%s | Short Link',
  },
  description: 'Create, track, and manage your short links.',
  robots: {
    index: false,
    follow: false,
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
            {children}
            <SessionExpiryListener />
          </AuthProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
