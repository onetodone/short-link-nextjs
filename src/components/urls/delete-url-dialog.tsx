'use client'

import { useState } from 'react'
import { Trash2Icon } from 'lucide-react'
import { toast } from 'sonner'
import { deleteUrl } from '@/lib/api/urls'
import { toFormState } from '@/lib/forms'
import { stripScheme } from '@/lib/format'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

export function DeleteUrlDialog({
  shortCode,
  shortUrl,
  onDeleted,
}: {
  shortCode: string
  shortUrl: string
  onDeleted: () => void
}) {
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)

  async function confirm() {
    setPending(true)
    try {
      await deleteUrl(shortCode)
      toast.success('Short link deleted.')
      setOpen(false)
      onDeleted()
    } catch (error) {
      toast.error(toFormState(error)?.error ?? 'Could not delete the short link.')
    } finally {
      setPending(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger render={<Button variant="ghost" size="icon-sm" aria-label="Delete short link" />}>
        <Trash2Icon />
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this short link?</AlertDialogTitle>
          <AlertDialogDescription>
            <span className="font-medium text-foreground">{stripScheme(shortUrl)}</span> will stop resolving — anyone
            who follows it afterwards gets a 404. This can&rsquo;t be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
          <Button variant="destructive" onClick={confirm} disabled={pending}>
            {pending ? 'Deleting...' : 'Delete'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
