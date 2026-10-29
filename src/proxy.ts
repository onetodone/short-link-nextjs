import { NextResponse, type NextRequest } from 'next/server'

import { withClientIpHeaders } from '@/lib/client-ip'

export function proxy(request: NextRequest) {
  const secret = process.env.API_PROXY_SECRET
  if (!secret) return NextResponse.next()
  return NextResponse.next({ request: { headers: withClientIpHeaders(request.headers, secret) } })
}

export const config = {
  matcher: '/api/v1/:path*',
}
