import { ApiError, type ApiIssue } from '@/lib/api/errors'

const THROTTLE_MESSAGE = 'Too many attempts. Please wait a minute and try again.'
const NETWORK_MESSAGE = 'Network error. Check your connection and try again.'
const DESTINATION_FALLBACK = 'This destination URL is not allowed.'

const DESTINATION_MESSAGES: Record<string, string> = {
  CREDENTIALS_IN_URL: 'Remove the username and password from the URL.',
  IP_ADDRESS: 'Use a domain name instead of an IP address.',
  LOCAL_HOST: 'Use a public domain — local and internal addresses are not allowed.',
  OWN_DOMAIN: 'This is already a short link. Use the address it points to instead.',
  URL_SHORTENER: 'Links to other URL shorteners or redirectors are not allowed. Use the final address instead.',
}

const CODE_MESSAGES: Record<string, string> = {
  EMAIL_NOT_VERIFIED: 'Confirm your email address to create or edit links.',
  INVALID_TOKEN: 'This link is invalid or has expired.',
}

const STATUS_FALLBACK: Record<number, string> = {
  400: 'The request was invalid.',
  401: 'You need to sign in to do that.',
  403: 'You do not have access to that.',
  404: 'Not found.',
  409: 'That conflicts with something that already exists.',
  500: 'The server hit an error. Please try again.',
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function joinPath(path: unknown): string {
  if (Array.isArray(path)) return path.map((segment) => String(segment)).join('.')
  return path == null ? '' : String(path)
}

function formatWait(seconds: number): string {
  const minutes = Math.max(1, Math.ceil(seconds / 60))
  if (minutes < 60) return minutes === 1 ? 'about a minute' : `about ${minutes} minutes`
  const hours = Math.round(minutes / 60)
  return hours === 1 ? 'about an hour' : `about ${hours} hours`
}

function quotaMessage(limit: unknown, retryAfter: unknown): string {
  const cap = typeof limit === 'number' && limit > 0 ? `${limit} new links` : 'new links'
  const wait =
    typeof retryAfter === 'number' && retryAfter > 0 ? `Try again in ${formatWait(retryAfter)}.` : 'Try again later.'
  return `You've reached the limit of ${cap} per 24 hours. ${wait}`
}

function positiveSeconds(value: unknown): number | undefined {
  return typeof value === 'number' && value > 0 ? value : undefined
}

function cooldownMessage(retryAfter: number | undefined): string {
  const wait = retryAfter ? `You can ask for another in ${formatWait(retryAfter)}.` : 'Please wait a minute.'
  return `We sent you an email recently. ${wait}`
}

export function networkError(): ApiError {
  return new ApiError(NETWORK_MESSAGE, { status: 0, code: 'NETWORK' })
}

export async function readErrorBody(res: Response): Promise<unknown> {
  try {
    const text = await res.text()
    return text ? (JSON.parse(text) as unknown) : null
  } catch {
    return null
  }
}

/**
 * Turns an API error response into an `ApiError`. `code` is the API's machine-readable `code` when
 * present (a rejected destination also becomes a `url` issue), otherwise Nest's `error` name.
 * `retryAfter` carries the API's wait in seconds for the quota and email cooldown errors.
 */
export function parseApiError(status: number, body: unknown): ApiError {
  const record = isRecord(body) ? body : {}
  const code = typeof record.code === 'string' ? record.code : undefined

  if (status === 429) {
    const retryAfter = positiveSeconds(record.retryAfter)
    if (code === 'CREATE_QUOTA_EXCEEDED') {
      return new ApiError(quotaMessage(record.limit, record.retryAfter), { status, code, retryAfter })
    }
    if (code === 'EMAIL_COOLDOWN') {
      return new ApiError(cooldownMessage(retryAfter), { status, code, retryAfter })
    }
    return new ApiError(THROTTLE_MESSAGE, { status, code: 'THROTTLED' })
  }

  if (code === 'DESTINATION_REJECTED') {
    const reason = typeof record.reason === 'string' ? record.reason : undefined
    const apiMessage = typeof record.message === 'string' ? record.message : DESTINATION_FALLBACK
    const message = reason && Object.hasOwn(DESTINATION_MESSAGES, reason) ? DESTINATION_MESSAGES[reason] : apiMessage
    return new ApiError(message, { status, code, issues: [{ path: 'url', message }] })
  }

  if (code && Object.hasOwn(CODE_MESSAGES, code)) {
    return new ApiError(CODE_MESSAGES[code], { status, code })
  }

  if (status === 400 && Array.isArray(record.errors)) {
    const issues: ApiIssue[] = record.errors.filter(isRecord).map((issue) => ({
      path: joinPath(issue.path),
      message: typeof issue.message === 'string' ? issue.message : 'Invalid value.',
    }))
    const message = issues[0]?.message ?? (typeof record.message === 'string' ? record.message : STATUS_FALLBACK[400])
    return new ApiError(message, { status, code: 'VALIDATION', issues })
  }

  const rawMessage = record.message
  const message =
    typeof rawMessage === 'string'
      ? rawMessage
      : Array.isArray(rawMessage) && typeof rawMessage[0] === 'string'
        ? rawMessage[0]
        : (STATUS_FALLBACK[status] ?? 'Something went wrong. Please try again.')

  return new ApiError(message, {
    status,
    code: code ?? (typeof record.error === 'string' ? record.error : undefined),
  })
}
