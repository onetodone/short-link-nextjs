import { ApiError, type ApiIssue } from '@/lib/api/errors'

const THROTTLE_MESSAGE = 'Too many attempts. Please wait a minute and try again.'
const NETWORK_MESSAGE = 'Network error. Check your connection and try again.'

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

export function parseApiError(status: number, body: unknown): ApiError {
  if (status === 429) {
    return new ApiError(THROTTLE_MESSAGE, { status, code: 'THROTTLED' })
  }

  const record = isRecord(body) ? body : {}

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
    code: typeof record.error === 'string' ? record.error : undefined,
  })
}
