import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SHORT_CODE_PATTERN } from '@/schemas/url'
import { EditUrlView } from '@/app/(app)/urls/[shortCode]/edit/edit-url-view'

export const metadata: Metadata = {
  title: 'Edit short link',
}

export default async function EditUrlPage({ params }: { params: Promise<{ shortCode: string }> }) {
  const { shortCode } = await params
  if (!SHORT_CODE_PATTERN.test(shortCode)) notFound()

  return <EditUrlView shortCode={shortCode} />
}
