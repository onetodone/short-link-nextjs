import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { ThemeProvider } from '@/components/theme/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3001'

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: 'Short URL',
    template: '%s | Short URL',
  },
  description: 'Create, track, and manage your short links.',
  robots: {
    index: false,
    follow: false,
  },
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
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
