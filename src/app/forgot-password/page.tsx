import type { Metadata } from 'next'
import { AuthLayout } from '@/components/auth-card'
import { RedirectIfAuthenticated } from '@/lib/auth/guard'
import { ForgotPasswordForm } from './forgot-password-form'

export const metadata: Metadata = {
  title: 'Forgot password',
}

export default function ForgotPasswordPage() {
  return (
    <AuthLayout>
      <RedirectIfAuthenticated>
        <ForgotPasswordForm />
      </RedirectIfAuthenticated>
    </AuthLayout>
  )
}
