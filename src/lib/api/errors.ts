export interface ApiIssue {
  path: string
  message: string
}

interface ApiErrorInit {
  status: number
  code?: string
  issues?: ApiIssue[]
}

export class ApiError extends Error {
  readonly status: number
  readonly code?: string
  readonly issues?: ApiIssue[]

  constructor(message: string, init: ApiErrorInit) {
    super(message)
    this.name = 'ApiError'
    this.status = init.status
    this.code = init.code
    this.issues = init.issues
  }
}

export class SessionExpiredError extends Error {
  constructor(message = 'Your session has ended. Please sign in again.') {
    super(message)
    this.name = 'SessionExpiredError'
  }
}
