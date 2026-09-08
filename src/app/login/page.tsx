import type { Metadata } from 'next'
import { AuthLayout } from '@/components/auth-card'
import { RedirectIfAuthenticated } from '@/lib/auth/guard'
import { LoginForm } from './login-form'

export const metadata: Metadata = {
  title: 'Sign in',
}

export default function LoginPage() {
  return (
    <AuthLayout>
      <RedirectIfAuthenticated>
        <LoginForm />
      </RedirectIfAuthenticated>
    </AuthLayout>
  )
}
