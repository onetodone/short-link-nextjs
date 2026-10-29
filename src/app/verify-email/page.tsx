import type { Metadata } from 'next'
import { VerifyEmailView } from './verify-email-view'

export const metadata: Metadata = {
  title: 'Confirm email',
  referrer: 'no-referrer',
}

export default async function VerifyEmailPage({ searchParams }: PageProps<'/verify-email'>) {
  const { token } = await searchParams
  return <VerifyEmailView token={typeof token === 'string' ? token : ''} />
}
