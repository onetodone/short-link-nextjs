import type { Metadata } from 'next'
import Link from 'next/link'
import { getLegalInfo } from '@/lib/legal'
import { SITE_NAME } from '@/lib/site'
import { EmailLink, LegalPage, UNNAMED_OPERATOR } from '@/components/legal/legal-page'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: `What personal data ${SITE_NAME} processes, why, who receives it, and your rights.`,
  alternates: { canonical: '/privacy-policy' },
}

export default async function PrivacyPolicyPage() {
  const { operatorName, supportEmail, vercel } = await getLegalInfo()
  const support = <EmailLink email={supportEmail} />

  return (
    <LegalPage title="Privacy Policy">
      <p>
        This policy explains what personal data {SITE_NAME} (the “Service”) processes, why, who receives it, and what
        rights you have. It covers people with an account and people who open a short link created with the Service.
        Terms we use here are explained in the <Link href="/terms-of-use">Terms of Use</Link>.
      </p>

      <h2>Who is responsible</h2>
      <p>
        The Service is operated by {operatorName ?? UNNAMED_OPERATOR} (“we”, “us”), who is responsible for your personal
        data (the “controller”). You can reach us at {support}.
      </p>

      <h2>What we process</h2>

      <h3>Your account</h3>
      <ul>
        <li>Your email address, and a new address while you confirm a change of email.</li>
        <li>Your password, stored only as a bcrypt hash. We can’t read your password.</li>
        <li>
          When your account was created, when you confirmed your email address, when you last changed your password,
          when you agreed to the Terms of Use, and when your account was suspended, if it was.
        </li>
        <li>
          For each device you are signed in on: the browser’s user agent, the IP address it signed in from, and when the
          session expires. You can end all your sessions with “Sign out everywhere” in your profile.
        </li>
        <li>
          Single-use links we email you to confirm an address or reset your password. We store only a hash of each link;
          it stops working after 24 hours (confirmation) or 1 hour (password reset).
        </li>
      </ul>

      <h3>Your links</h3>
      <p>
        For each link: its destination, note, short code, number of clicks, when it was created and changed, when its
        destination was set and last checked, and whether and why it is disabled.
      </p>

      <h3>People who open a short link</h3>
      <p>When someone opens a short link, we:</p>
      <ul>
        <li>receive their IP address and the details of the request, as every website does;</li>
        <li>
          check the browser’s user agent and prefetch headers to leave bots and link previews out of the count, without
          storing them;
        </li>
        <li>add one to the link’s total number of clicks.</li>
      </ul>
      <p>
        We set no cookies on short links and don’t record who opened a link; its owner sees only the total number. The
        destination is run by the link’s owner or someone else, and its own privacy practices apply there.
      </p>

      <h3>Security and abuse prevention</h3>
      <ul>
        <li>
          We limit how many requests one IP address can make, and count failed sign-ins per IP address and per email
          address for 15 minutes, to stop password guessing.
        </li>
        <li>We count how many links each account creates per day, to enforce the daily limit.</li>
      </ul>

      <h3>Server logs</h3>
      <p>
        For every request to the Service we log the time, method, address of the page, IP address, response time, and
        your user ID if you are signed in. Passwords, tokens and other secrets are masked before anything is logged. We
        use logs to keep the Service secure, investigate abuse and fix errors.
      </p>

      <h3>Emails</h3>
      <p>
        We send only the emails your account needs: confirming your email address, resetting your password, notices
        about changes to your password or email address (a password change notice includes the IP address the change
        came from), notices when one of your links is disabled or enabled again or your account is suspended or
        restored, and a notice when your account is deleted. We don’t send newsletters or marketing.
      </p>

      <h3>Cookies and local storage</h3>
      <p>We use only what the Service can’t work without:</p>
      <ul>
        <li>
          <code>refresh_token</code>: keeps you signed in for up to 7 days after your last visit. It can’t be read by
          scripts and is sent only to the sign-in endpoints of the Service.
        </li>
        <li>
          <code>theme</code>, in your browser’s local storage: remembers whether you chose the light or dark theme. It
          never leaves your browser.
        </li>
      </ul>
      <p>We don’t use analytics or advertising cookies.</p>

      <h3>Google Safe Browsing</h3>
      <p>
        To protect the people who open links, we may check destinations with Google Safe Browsing when a link is saved
        and again after it is opened. We send Google the destination address only, not who created the link or who
        opened it. See{' '}
        <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
          Google’s Privacy Policy
        </a>
        .
      </p>

      <h3>Cloudflare Turnstile</h3>
      <p>
        To keep bots away from registration, password reset and repeated failed sign-ins, these forms may use Cloudflare
        Turnstile, provided by Cloudflare, Inc. It checks your browser in the background and only rarely asks you to
        click. For this, Cloudflare receives your IP address and technical details of your browser and device; we
        receive only whether the check passed. Turnstile doesn’t use the data for advertising. See{' '}
        <a href="https://www.cloudflare.com/turnstile-privacy-policy/" target="_blank" rel="noopener noreferrer">
          Cloudflare’s Turnstile Privacy Addendum
        </a>
        .
      </p>

      <h2>Why we process it</h2>
      <ul>
        <li>
          To provide the Service you signed up for: your account, links, click counts and account emails (performance of
          a contract).
        </li>
        <li>
          To keep the Service and the people who open links safe: sessions, server logs, rate limits, bot checks,
          destination checks, handling abuse reports, and keeping records about links and accounts disabled for abuse
          (our legitimate interests in security and in preventing abuse).
        </li>
        <li>To comply with legal obligations, such as answering lawful requests from authorities.</li>
      </ul>

      <h2>Who receives it</h2>
      <p>
        We don’t sell your data or use it for advertising. We share it only with providers that run parts of the Service
        for us and process the data on our behalf:
      </p>
      <ul>
        <li>
          {vercel ? 'Vercel Inc. (United States), which hosts this website' : 'the provider that hosts this website'};
        </li>
        <li>the providers that host the Service’s servers, database and cache, and keep its server logs;</li>
        <li>our email provider, which delivers account emails;</li>
        <li>Cloudflare, Inc. (United States) and Google, as described above.</li>
      </ul>
      <p>
        We may also disclose data where the law requires it, to answer valid legal requests, or to protect the rights,
        safety and property of our users, the public or the Service, for example when handling an abuse report. If the
        Service passes to a new operator, your data passes with it and this policy continues to apply.
      </p>

      <h2>Transfers outside your country</h2>
      <p>
        Our providers may process data in countries other than yours, including the United States. Where the law
        requires it, these transfers rely on safeguards such as the European Commission’s Standard Contractual Clauses
        or the EU–US Data Privacy Framework.
      </p>

      <h2>How long we keep it</h2>
      <ul>
        <li>Account data and links, with their click counts: until you delete them or your account.</li>
        <li>Sessions: until you sign out or they expire, at most 7 days after your last visit.</li>
        <li>Failed sign-in counts: 15 minutes. Daily link counts: 24 hours.</li>
        <li>Server logs: for a limited time, usually no longer than 30 days.</li>
        <li>Confirmation and reset links: deleted when they expire, are used, or your account is deleted.</li>
        <li>
          Records about links and accounts disabled for abuse, and emails about abuse reports or your requests: as long
          as needed to handle them and to prevent repeated abuse.
        </li>
      </ul>

      <h2>Your rights</h2>
      <p>Depending on where you live, for example under the GDPR, you have the right to:</p>
      <ul>
        <li>get a copy of the personal data we hold about you, also in a portable format;</li>
        <li>have it corrected; you can change your email address in your profile;</li>
        <li>
          have it deleted; deleting your account in your profile removes your account, links and click counts at once;
        </li>
        <li>object to processing based on our legitimate interests, or ask us to restrict it;</li>
        <li>complain to a data protection authority, for example in the country where you live or work.</li>
      </ul>
      <p>To use these rights, write to {support} from the email address of your account. We answer within one month.</p>

      <h2>Security</h2>
      <p>
        Passwords are stored only as bcrypt hashes, sign-in tokens are kept out of scripts’ reach or only in memory,
        sign-in and other sensitive actions are rate-limited, and secrets are masked in logs. No system is perfectly
        secure; if you notice a security problem, tell us at {support}.
      </p>

      <h2>Children</h2>
      <p>
        The Service is not for anyone under 16, and we don’t knowingly collect personal data from them. If you believe a
        child has created an account, tell us and we will delete it.
      </p>

      <h2>Changes to this policy</h2>
      <p>
        We may change this policy. The date at the top shows when it last changed, and we will tell you about
        significant changes by email or on the site.
      </p>

      <h2>Contact</h2>
      <p>Questions about this policy or your data: {support}.</p>
    </LegalPage>
  )
}
