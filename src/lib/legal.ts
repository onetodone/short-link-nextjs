import { connection } from 'next/server'

/** Date the Terms of Use and Privacy Policy last changed. */
export const LEGAL_LAST_UPDATED = new Date('2026-10-30T00:00:00Z')

/**
 * Who runs this instance and how to reach them, for the Terms of Use and Privacy Policy. `null`
 * means not configured.
 */
export type LegalInfo = {
  operatorName: string | null
  jurisdiction: string | null
  supportEmail: string | null
  abuseEmail: string | null
  vercel: boolean
}

function envValue(name: string): string | null {
  return process.env[name]?.trim() || null
}

/**
 * Reads the server-only `LEGAL_OPERATOR_NAME`, `LEGAL_JURISDICTION`, `SUPPORT_EMAIL` and
 * `ABUSE_EMAIL` (falling back to `SUPPORT_EMAIL`) per request, so one build serves any
 * deployment. Never throws, so the legal pages render on an incomplete setup. Server components only.
 */
export async function getLegalInfo(): Promise<LegalInfo> {
  await connection()
  const supportEmail = envValue('SUPPORT_EMAIL')
  return {
    operatorName: envValue('LEGAL_OPERATOR_NAME'),
    jurisdiction: envValue('LEGAL_JURISDICTION'),
    supportEmail,
    abuseEmail: envValue('ABUSE_EMAIL') ?? supportEmail,
    vercel: Boolean(process.env.VERCEL),
  }
}
