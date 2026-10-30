import { BanIcon } from 'lucide-react'
import type { UrlDisabledReason } from '@/lib/api/types'
import { disabledLinkCopy } from '@/lib/moderation'

export function DisabledLinkNotice({
  reason,
  supportEmail,
}: {
  reason: UrlDisabledReason | null
  supportEmail: string | null
}) {
  const copy = disabledLinkCopy(reason)

  return (
    <div
      role="status"
      className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm"
    >
      <BanIcon className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden />
      <div className="flex flex-col gap-1">
        <p className="font-medium">This link is disabled</p>
        <p className="text-muted-foreground">
          Visitors see a “link disabled” page instead of the destination. {copy.remedy}
        </p>
        {copy.contactSupport && (
          <p className="text-muted-foreground">
            {supportEmail ? (
              <>
                Questions? Contact{' '}
                <a href={`mailto:${supportEmail}`} className="font-medium break-words text-foreground underline">
                  {supportEmail}
                </a>
                .
              </>
            ) : (
              'Contact support if you think this is a mistake.'
            )}
          </p>
        )}
      </div>
    </div>
  )
}
