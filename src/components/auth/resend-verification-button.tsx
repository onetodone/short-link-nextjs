'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { resendVerification } from '@/lib/api/auth'
import { ApiError } from '@/lib/api/errors'
import { Button } from '@/components/ui/button'

// Mirrors the API's per-account cooldown between confirmation emails.
const COOLDOWN_SECONDS = 60

// Module scope, so the countdown survives moving between pages.
let cooldownUntil = 0

function secondsLeft(): number {
  return Math.max(0, Math.ceil((cooldownUntil - Date.now()) / 1000))
}

export function ResendVerificationButton({
  email,
  variant = 'outline',
}: {
  email: string
  variant?: 'default' | 'outline'
}) {
  const [pending, setPending] = useState(false)
  const [remaining, setRemaining] = useState(secondsLeft)

  useEffect(() => {
    if (remaining <= 0) return
    const timer = setTimeout(() => setRemaining(secondsLeft()), 1000)
    return () => clearTimeout(timer)
  }, [remaining])

  const startCooldown = (seconds: number) => {
    cooldownUntil = Date.now() + seconds * 1000
    setRemaining(secondsLeft())
  }

  const resend = async () => {
    setPending(true)
    try {
      await resendVerification()
      toast.success(`We sent a new confirmation link to ${email}.`)
      startCooldown(COOLDOWN_SECONDS)
    } catch (error) {
      if (error instanceof ApiError && error.code === 'EMAIL_COOLDOWN') {
        startCooldown(error.retryAfter ?? COOLDOWN_SECONDS)
      }
      toast.error(error instanceof Error ? error.message : 'Something went wrong. Please try again.')
    } finally {
      setPending(false)
    }
  }

  return (
    <Button variant={variant} size="sm" onClick={resend} disabled={pending || remaining > 0}>
      {pending ? 'Sending...' : remaining > 0 ? `Resend in ${remaining}s` : 'Resend email'}
    </Button>
  )
}
