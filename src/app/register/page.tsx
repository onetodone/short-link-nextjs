import type { Metadata } from 'next'
import { AuthLayout } from '@/components/auth-card'
import { RedirectIfAuthenticated } from '@/lib/auth/guard'
import { RegisterForm } from './register-form'

export const metadata: Metadata = {
  title: 'Register',
}

export default function RegisterPage() {
  return (
    <AuthLayout>
      <RedirectIfAuthenticated>
        <RegisterForm />
      </RedirectIfAuthenticated>
    </AuthLayout>
  )
}
