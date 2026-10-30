import Link from 'next/link'
import { cn } from '@/lib/utils'

const LINK_CLASS = 'hover:text-foreground hover:underline underline-offset-4'

export function LegalLinks({ className }: { className?: string }) {
  return (
    <nav aria-label="Legal" className={cn('flex flex-wrap items-center gap-x-4 gap-y-1', className)}>
      <Link href="/terms-of-use" className={LINK_CLASS}>
        Terms of Use
      </Link>
      <Link href="/privacy-policy" className={LINK_CLASS}>
        Privacy Policy
      </Link>
    </nav>
  )
}
