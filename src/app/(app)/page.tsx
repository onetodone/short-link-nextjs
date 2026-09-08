'use client'

import { useAuth } from '@/lib/auth/context'
import { PageContainer, PageHeader } from '@/components/page-header'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function DashboardPage() {
  const { user } = useAuth()

  return (
    <PageContainer width="6xl">
      <PageHeader title="Your short links" description="Create, track, and manage your short links." />
      <Card>
        <CardHeader>
          <CardTitle>Signed in{user?.email ? ` as ${user.email}` : ''}</CardTitle>
          <CardDescription>The link cabinet and CRUD land in Sprint 2.</CardDescription>
        </CardHeader>
      </Card>
    </PageContainer>
  )
}
