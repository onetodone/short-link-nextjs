const KEY_PREFIX = 'short-link:edit:'

export function stashOriginalUrl(shortCode: string, originalUrl: string): void {
  try {
    sessionStorage.setItem(KEY_PREFIX + shortCode, originalUrl)
  } catch {}
}

export function readStashedOriginalUrl(shortCode: string): string | null {
  try {
    return sessionStorage.getItem(KEY_PREFIX + shortCode)
  } catch {
    return null
  }
}

export function clearStashedOriginalUrl(shortCode: string): void {
  try {
    sessionStorage.removeItem(KEY_PREFIX + shortCode)
  } catch {
    // ignore
  }
}
