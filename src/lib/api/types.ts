export interface AuthUser {
  id: string
  email: string
}

export interface AuthResponse {
  user: AuthUser
  accessToken: string
}

export interface Me {
  id: string
  email: string
  createdAt: string
}

export interface UrlSummary {
  shortCode: string
  shortUrl: string
  originalUrl: string
  clicks: number
  createdAt: string
  updatedAt: string
}

export interface CreatedUrl {
  shortCode: string
  shortUrl: string
  originalUrl: string
  createdAt: string
  updatedAt: string
}

export interface UrlList {
  items: UrlSummary[]
  total: number
  limit: number
  offset: number
}
