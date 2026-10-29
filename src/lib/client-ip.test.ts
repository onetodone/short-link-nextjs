import { describe, expect, it } from 'vitest'

import { CLIENT_IP_HEADER, PROXY_SECRET_HEADER, clientIpFrom, withClientIpHeaders } from '@/lib/client-ip'

describe('clientIpFrom', () => {
  it('prefers x-real-ip over x-forwarded-for', () => {
    const headers = new Headers({ 'x-real-ip': '198.51.100.7', 'x-forwarded-for': '203.0.113.9' })
    expect(clientIpFrom(headers)).toBe('198.51.100.7')
  })

  it('takes the first x-forwarded-for entry', () => {
    const headers = new Headers({ 'x-forwarded-for': ' 203.0.113.9 , 10.0.0.1' })
    expect(clientIpFrom(headers)).toBe('203.0.113.9')
  })

  it('falls back to x-forwarded-for when x-real-ip is blank', () => {
    const headers = new Headers({ 'x-real-ip': '  ', 'x-forwarded-for': '203.0.113.9' })
    expect(clientIpFrom(headers)).toBe('203.0.113.9')
  })

  it('returns undefined without an IP header', () => {
    expect(clientIpFrom(new Headers())).toBeUndefined()
    expect(clientIpFrom(new Headers({ 'x-forwarded-for': ' , 10.0.0.1' }))).toBeUndefined()
  })
})

describe('withClientIpHeaders', () => {
  it('replaces forged proxy headers with the secret and the edge-reported IP', () => {
    const incoming = new Headers({
      'x-real-ip': '198.51.100.7',
      [PROXY_SECRET_HEADER]: 'forged',
      [CLIENT_IP_HEADER]: '6.6.6.6',
      accept: 'application/json',
    })

    const forwarded = withClientIpHeaders(incoming, 'shared-secret')

    expect(forwarded.get(PROXY_SECRET_HEADER)).toBe('shared-secret')
    expect(forwarded.get(CLIENT_IP_HEADER)).toBe('198.51.100.7')
    expect(forwarded.get('accept')).toBe('application/json')
  })

  it('drops a forged x-client-ip when the edge reports no IP', () => {
    const incoming = new Headers({ [CLIENT_IP_HEADER]: '6.6.6.6' })

    const forwarded = withClientIpHeaders(incoming, 'shared-secret')

    expect(forwarded.has(CLIENT_IP_HEADER)).toBe(false)
    expect(forwarded.get(PROXY_SECRET_HEADER)).toBe('shared-secret')
  })

  it('leaves the incoming headers untouched', () => {
    const incoming = new Headers({ [PROXY_SECRET_HEADER]: 'forged' })

    withClientIpHeaders(incoming, 'shared-secret')

    expect(incoming.get(PROXY_SECRET_HEADER)).toBe('forged')
  })
})
