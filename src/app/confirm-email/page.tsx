import type { Metadata } from 'next'
import { ConfirmEmailView } from './confirm-email-view'

export const metadata: Metadata = {
  title: 'Confirm new email',
  referrer: 'no-referrer',
}

export default async function ConfirmEmailPage({ searchParams }: PageProps<'/confirm-email'>) {
  const { token } = await searchParams
  return <ConfirmEmailView token={typeof token === 'string' ? token : ''} />
}
