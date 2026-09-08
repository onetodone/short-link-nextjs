import type { NextConfig } from 'next'

const isDev = process.env.NODE_ENV !== 'production'

const selfHosted = !process.env.VERCEL

const apiOrigin = process.env.API_ORIGIN ?? 'http://localhost:3000'

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  `connect-src 'self'${isDev ? ' ws:' : ''}`,
  "worker-src 'self' blob:",
].join('; ')

const securityHeaders = [
  { key: 'Content-Security-Policy', value: contentSecurityPolicy },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-DNS-Prefetch-Control', value: 'off' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()' },
]

const standaloneConfig: NextConfig = selfHosted
  ? {
      output: 'standalone',
      outputFileTracingIncludes: {
        '/**/*': ['./node_modules/.pnpm/@swc+helpers@*/node_modules/@swc/helpers/**/*'],
      },
    }
  : {}

const nextConfig: NextConfig = {
  ...standaloneConfig,
  poweredByHeader: false,
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }]
  },
  async rewrites() {
    // The `source` must be exactly `/api/v1/:path*` — a shorter prefix or a
    // trailing-slash mismatch stops the refresh cookie's `Path=/api/v1/auth`
    // from matching.
    return [{ source: '/api/v1/:path*', destination: `${apiOrigin}/api/v1/:path*` }]
  },
}

export default nextConfig
