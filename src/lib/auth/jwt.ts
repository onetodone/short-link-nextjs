export function decodeExp(token: string): number | null {
  const payload = token.split('.')[1]
  if (!payload) return null

  try {
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    const claims = JSON.parse(json) as { exp?: unknown }
    return typeof claims.exp === 'number' ? claims.exp : null
  } catch {
    return null
  }
}
