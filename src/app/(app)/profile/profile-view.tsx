'use client'

import { AlertTriangleIcon } from 'lucide-react'
import { fetchMe } from '@/lib/api/auth'
import { useAuth } from '@/lib/auth/context'
import { useApiQuery } from '@/hooks/use-api-query'
import { formatDate } from '@/lib/format'
import { PageContainer, PageHeader } from '@/components/page-header'
import { ProfileCardsSkeleton } from '@/components/page-skeletons'
import { SignOutAllDialog } from '@/components/auth/sign-out-all-dialog'
import { ChangeEmailForm } from '@/components/account/change-email-form'
import { ChangePasswordForm } from '@/components/account/change-password-form'
import { DeleteAccountDialog } from '@/components/account/delete-account-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

const HEADER = { title: 'Profile', description: 'Your account details and settings.' }

export function ProfileView() {
  const { user, logout, logoutAll } = useAuth()
  const { data, error, loading, refetch } = useApiQuery('me', fetchMe)

  const email = data?.email ?? user?.email ?? '—'

  return (
    <PageContainer width="2xl">
      <PageHeader title={HEADER.title} description={HEADER.description} />

      {loading ? (
        <ProfileCardsSkeleton />
      ) : error ? (
        <Card>
          <CardContent className="flex flex-col items-start gap-3">
            <div className="flex items-center gap-2 font-medium">
              <AlertTriangleIcon className="size-4 text-destructive" />
              Couldn’t load your account
            </div>
            <p className="text-sm text-muted-foreground">{error.message}</p>
            <Button variant="outline" size="sm" onClick={refetch}>
              Try again
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <dl className="flex flex-col gap-4">
              <Row label="Email" value={email} />
              <Row
                label="Email status"
                value={(data?.emailVerified ?? user?.emailVerified) ? 'Confirmed' : 'Not confirmed yet'}
              />
              <Row label="Member since" value={data ? formatDate(data.createdAt) : '—'} />
              <Row label="Account ID" value={data?.id ?? '—'} mono />
            </dl>
            <Separator />
            <section className="flex flex-col gap-3" aria-labelledby="sessions-heading">
              <div className="flex flex-col gap-1">
                <h2 id="sessions-heading" className="text-sm font-medium">
                  Sessions
                </h2>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={logout}>
                  Sign out
                </Button>
                <SignOutAllDialog onConfirm={logoutAll} />
              </div>
              <p className="text-xs text-muted-foreground">
                “Sign out” ends this session. “Sign out everywhere” revokes every session on all your devices and
                returns you to the login page.
              </p>
            </section>
          </CardContent>
        </Card>
      )}
      {data && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Password</CardTitle>
              <CardDescription>Change the password you sign in with.</CardDescription>
            </CardHeader>
            <CardContent>
              <ChangePasswordForm />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Email address</CardTitle>
              <CardDescription>We send a confirmation link to the new address before switching to it.</CardDescription>
            </CardHeader>
            <CardContent>
              <ChangeEmailForm currentEmail={data.email} />
            </CardContent>
          </Card>
          <Card className="ring-destructive/30">
            <CardHeader>
              <CardTitle>Delete account</CardTitle>
              <CardDescription>
                Permanently deletes your account and every short link you own. The links stop working at once.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DeleteAccountDialog />
            </CardContent>
          </Card>
        </>
      )}
    </PageContainer>
  )
}

function Row({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</dt>
      <dd className={mono ? 'font-mono text-sm break-all' : 'text-sm break-all'}>{value}</dd>
    </div>
  )
}
