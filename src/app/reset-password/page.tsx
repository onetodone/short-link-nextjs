import type { Metadata } from 'next'
import { AuthLayout } from '@/components/auth-card'
import { ResetPasswordForm } from './reset-password-form'

export const metadata: Metadata = {
  title: 'Reset password',
  referrer: 'no-referrer',
}

export default async function ResetPasswordPage({ searchParams }: PageProps<'/reset-password'>) {
  const { token } = await searchParams
  return (
    <AuthLayout>
      <ResetPasswordForm token={typeof token === 'string' ? token : ''} />
    </AuthLayout>
  )
}
