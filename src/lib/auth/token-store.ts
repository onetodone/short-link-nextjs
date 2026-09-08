type Subscriber = (token: string | null) => void

let accessToken: string | null = null
const subscribers = new Set<Subscriber>()

export function getAccessToken(): string | null {
  return accessToken
}

export function setAccessToken(token: string | null): void {
  accessToken = token
  for (const notify of subscribers) notify(token)
}

export function subscribe(fn: Subscriber): () => void {
  subscribers.add(fn)
  return () => {
    subscribers.delete(fn)
  }
}
