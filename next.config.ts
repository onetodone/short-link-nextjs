import type { NextConfig } from 'next'

const isDev = process.env.NODE_ENV !== 'production'
const selfHosted = !process.env.VERCEL

if (process.env.NODE_ENV === 'production' && !process.env.API_ORIGIN) {
  console.warn('[next.config] API_ORIGIN is not set — the /api/v1 proxy will fall back to http://localhost:3000')
}

const apiOrigin = process.env.API_ORIGIN ?? 'http://localhost:3000'

// Cloudflare Turnstile loads its script from this origin and renders the challenge in a frame from it.
const turnstileOrigin = 'https://challenges.cloudflare.com'

// Headers are fixed at build time, so GA needs GATAG_ID set for `pnpm build`. Origins from Google's
// CSP guide for GA4; Google Signals' regional domains go in CSP_CONNECT_SRC_EXTRA.
const analyticsEnabled = Boolean(process.env.GATAG_ID?.trim())
const analyticsScriptSrc = analyticsEnabled ? ' https://www.googletagmanager.com' : ''
const analyticsConnectSrc = analyticsEnabled
  ? ' https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com'
  : ''
const analyticsImgSrc = analyticsEnabled ? ' https://*.google-analytics.com https://*.googletagmanager.com' : ''
const connectSrcExtra = process.env.CSP_CONNECT_SRC_EXTRA?.trim()

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  `script-src 'self' 'unsafe-inline' ${turnstileOrigin}${analyticsScriptSrc}${isDev ? " 'unsafe-eval'" : ''}`,
  `frame-src ${turnstileOrigin}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob:${analyticsImgSrc}`,
  "font-src 'self' data:",
  `connect-src 'self'${analyticsConnectSrc}${connectSrcExtra ? ` ${connectSrcExtra}` : ''}${isDev ? ' ws:' : ''}`,
  "worker-src 'self' blob:",
].join('; ')

const securityHeaders = [
  { key: 'Content-Security-Policy', value: contentSecurityPolicy },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-DNS-Prefetch-Control', value: 'off' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()' },
  // HSTS pins the whole host regardless of port, so a dev server on https://localhost would force HTTPS on
  // every local app. No includeSubDomains: on an apex domain it would also cover unrelated subdomains.
  ...(isDev ? [] : [{ key: 'Strict-Transport-Security', value: 'max-age=63072000' }]),
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
