'use client'

import { useState } from 'react'
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

export function SignOutAllDialog({ onConfirm }: { onConfirm: () => void }) {
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)

  function confirm() {
    setPending(true)
    onConfirm()
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger render={<Button variant="outline" />}>Sign out everywhere</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Sign out on every device?</AlertDialogTitle>
          <AlertDialogDescription>
            Every active session is revoked on the server — this browser and any other device you&rsquo;re signed in on.
            You&rsquo;ll need to sign in again everywhere.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
          <Button variant="destructive" onClick={confirm} disabled={pending}>
            {pending ? 'Signing out...' : 'Sign out everywhere'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
