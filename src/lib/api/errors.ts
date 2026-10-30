export interface ApiIssue {
  path: string
  message: string
}

interface ApiErrorInit {
  status: number
  code?: string
  issues?: ApiIssue[]
  retryAfter?: number
  captchaRequired?: boolean
}

export class ApiError extends Error {
  readonly status: number
  readonly code?: string
  readonly issues?: ApiIssue[]
  /** Seconds until the action may be tried again, when the API says so. */
  readonly retryAfter?: number
  /** The next attempt needs a Turnstile token. */
  readonly captchaRequired?: boolean

  constructor(message: string, init: ApiErrorInit) {
    super(message)
    this.name = 'ApiError'
    this.status = init.status
    this.code = init.code
    this.issues = init.issues
    this.retryAfter = init.retryAfter
    this.captchaRequired = init.captchaRequired
  }
}

export class SessionExpiredError extends Error {
  constructor(message = 'Your session has ended. Please sign in again.') {
    super(message)
    this.name = 'SessionExpiredError'
  }
}
