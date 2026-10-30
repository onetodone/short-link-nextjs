import { connection } from 'next/server'

/**
 * The operator's support address from the server-only `SUPPORT_EMAIL`, read per request so one
 * build serves any deployment. `null` when unset. Server components only.
 */
export async function getSupportEmail(): Promise<string | null> {
  await connection()
  return process.env.SUPPORT_EMAIL?.trim() || null
}
