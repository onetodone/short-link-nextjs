/** Header carrying the secret shared with the API's `FRONT_PROXY_SECRET`. */
export const PROXY_SECRET_HEADER = 'x-proxy-secret'

/** Header carrying the browser's IP; the API honors it only alongside a matching secret. */
export const CLIENT_IP_HEADER = 'x-client-ip'

/**
 * The browser's IP as reported by the hosting edge: `x-real-ip`, else the first `x-forwarded-for`
 * entry. Returns `undefined` when neither carries a value.
 */
export function clientIpFrom(headers: Headers): string | undefined {
  const realIp = headers.get('x-real-ip')?.trim()
  if (realIp) return realIp
  const firstForwarded = headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  return firstForwarded || undefined
}

/**
 * Copies the request headers for the `/api/v1` hop: any client-sent `x-proxy-secret` /
 * `x-client-ip` is dropped, then the shared secret and the browser's IP are set. The IP header
 * is left out when the edge reports no address, so the API falls back to its own resolution.
 */
export function withClientIpHeaders(headers: Headers, secret: string): Headers {
  const forwarded = new Headers(headers)
  forwarded.delete(PROXY_SECRET_HEADER)
  forwarded.delete(CLIENT_IP_HEADER)
  forwarded.set(PROXY_SECRET_HEADER, secret)
  const ip = clientIpFrom(headers)
  if (ip) forwarded.set(CLIENT_IP_HEADER, ip)
  return forwarded
}
