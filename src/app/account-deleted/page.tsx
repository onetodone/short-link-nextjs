import type { Metadata } from 'next'
import Link from 'next/link'
import { AuthCard } from '@/components/auth-card'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Account deleted',
}

export default function AccountDeletedPage() {
  return (
    <AuthCard
      title="Your account is deleted"
      description="Your account and all of its short links are gone, and every device is signed out. We sent a confirmation to your email address."
    >
      <Button className="w-full" nativeButton={false} render={<Link href="/register" />}>
        Create a new account
      </Button>
      <Button variant="ghost" className="w-full" nativeButton={false} render={<Link href="/login" />}>
        Sign in
      </Button>
    </AuthCard>
  )
}
