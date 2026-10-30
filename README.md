# Short Link — Frontend

A signed-in cabinet for the **short-link-api** API: create, list, edit, and delete
your own short links, keep a private note on each, and see per-link click counts
(bots and link previews excluded). Signed-out visitors get a public landing page, the
Terms of Use and the Privacy Policy.

This is a **frontend only** — a Next.js client. It has **no database and no
backend of its own**; it talks to the separate `short-link-api` NestJS API. That API
must be running for this app to do anything useful.

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router, Turbopack) + React 19 + TypeScript (`strict`)
- [Tailwind CSS v4](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com) on [Base UI](https://base-ui.com) + [lucide-react](https://lucide.dev) + [sonner](https://sonner.emilkowal.ski)
- [Zod](https://zod.dev) for form + URL validation (lenient — the API's `400` is the source of truth)
- [next-themes](https://github.com/pacocoursey/next-themes) for light/dark
- [Vitest](https://vitest.dev) unit tests, colocated as `src/**/*.test.ts`
- **Client-side auth against the API** — a short-lived access JWT held **in
  browser memory only** (never `localStorage` / `sessionStorage` / a
  JS-readable cookie), renewed via an `HttpOnly` refresh cookie. Every browser
  request is same-origin and reaches the API through a Next `rewrites()` proxy.

No Prisma, no Auth.js, no Docker — state is an in-memory token + React context +
local component state.

## Getting started

### Prerequisites

- Node.js 22+ (CI runs on 26)
- [pnpm](https://pnpm.io) — the version is pinned via `packageManager`; run
  `corepack enable` to have it picked up automatically
- **The `short-link-api` API (1.8.0 or newer; 1.9.0 or newer for bot protection) running and
  reachable.** It needs PostgreSQL and Redis; see that project's README for how to start it. Quick check:

  ```bash
  curl -i http://localhost:3000/api/v1/auth/me   # expect 401 (unauthenticated)
  ```

### Setup

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Copy the environment template:

   ```bash
   cp .env.example .env
   ```

   | Variable              | Description                                                                                                                                                   |
   | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
   | `PORT`                | Port the dev/start server listens on. Preloaded via `dotenv-cli` in `dev`/`start`.                                                                            |
   | `API_ORIGIN`          | **Server-only** origin of the API for the rewrites proxy. Never `NEXT_PUBLIC_`. The proxy hop is server-side; in production this is the API's _internal_ URL. |
   | `NEXT_PUBLIC_APP_URL` | Public base URL this app is served at (`metadataBase`).                                                                                                       |
   | `API_PROXY_SECRET`    | **Server-only**, optional. Same value as the API's `FRONT_PROXY_SECRET`; lets the API see the browser's IP (see "Client IP"). Empty = off.                    |
   | `SUPPORT_EMAIL`       | **Server-only**, optional. Contact address shown on `/link-disabled`, on disabled links and in the legal texts; use the API's `SUPPORT_EMAIL`. Read per request. Empty = hidden. |
   | `ABUSE_EMAIL`         | **Server-only**, optional. Where the Terms of Use send abuse reports. Read per request. Empty = `SUPPORT_EMAIL`.                                              |
   | `LEGAL_OPERATOR_NAME` | **Server-only**, optional. Person or organization that runs the instance, named in the legal texts. Read per request. Empty = a generic phrase.             |
   | `LEGAL_JURISDICTION`  | **Server-only**, optional. Governing law and courts in the Terms of Use, e.g. `the Republic of Poland`. Read per request. Empty = section left out.         |
   | `GATAG_ID`            | **Server-only**, optional. Google Analytics measurement ID; loads only after a visitor accepts analytics cookies. Read at build time. Empty = off.          |
   | `CSP_CONNECT_SRC_EXTRA` | **Server-only**, optional. Extra space-separated origins for the CSP's `connect-src`. Read at build time. Never the API's origin.                        |

   `.env` is git-ignored and wins over the code-level fallbacks. If a value is
   unset, `next.config.ts` falls back to `http://localhost:3000` for
   `API_ORIGIN` and the dev/start scripts fall back to port `3001`.

3. Start the dev server:

   ```bash
   pnpm dev
   ```

   The app is at `http://localhost:3001`.
   Seeded API test account: `demo@user.loc` / `password123`.

## How auth works (and why there's no `middleware.ts`)

The API issues a ~15-minute access JWT in the response body plus a refresh token
in an `HttpOnly; SameSite=Strict; Path=/api/v1/auth` cookie.

- The access token lives **only in a module-scoped variable** in the browser
  (`src/lib/auth/token-store.ts`). It is lost on reload and restored by a silent
  `POST /api/v1/auth/refresh` on boot.
- Exactly **one** in-flight `refreshPromise` is shared across boot, the
  null-token path, and the 401→refresh→retry (one-shot per request). The API
  throttles `/auth/refresh` to **10 requests / 60 s per client**, so a refresh
  storm would 429-lock the user — the dedupe is non-negotiable.
- Protected pages are **client components** behind `<AuthGuard>`, which renders a
  layout-shaped skeleton while the boot refresh is in flight. A Next middleware
  could see neither the in-memory token nor the path-scoped refresh cookie, so
  there is no `proxy.ts` / `middleware.ts` auth check.
- Multi-tab logout/login propagates over `BroadcastChannel('short-link-auth')`.
- "Sign out" is server-side: it best-effort calls `POST /api/v1/auth/logout`
  (the profile also offers "Sign out everywhere" → `POST /api/v1/auth/logout-all`)
  and then always drops the in-memory token and redirects to `/login`.

### Email verification and password reset

The API emails links to `/verify-email?token=…` and `/reset-password?token=…` on this app
(the API's `APP_URL`). Both pages are public and send `Referrer-Policy: no-referrer`.

- New accounts can sign in at once but can't create or edit links until the address is confirmed
  (`403 EMAIL_NOT_VERIFIED`). The cabinet shows a banner with "Resend email" (one email per
  minute, `429 EMAIL_COOLDOWN`) and disables the link form's submit button.
- `/verify-email` posts the token once and goes to the cabinet (signed in) or `/login`. An
  expired or used link offers a new one. Other open tabs pick up the confirmation over the
  `BroadcastChannel`; a tab returning to the foreground re-checks `GET /auth/me`.
- `/forgot-password` always answers "check your inbox", so it doesn't reveal which emails have
  accounts. `/reset-password` sets the new password; the API revokes every session, so the app
  clears the local session in all tabs and sends you to `/login`.

### Account settings

Every change on `/profile` asks for the current password; a wrong one (`403 INVALID_PASSWORD`)
is shown on the password field and never treated as an expired session.

- **Password** — the API keeps this session and revokes every other one, so other devices need
  the new password.
- **Email** — the API emails a link to `/confirm-email?token=…` at the new address; the account
  keeps its address until that page posts the token. A used or expired link (`INVALID_TOKEN`) and
  an address another account took meanwhile (`409`) each get their own message. Open tabs pick up
  the new address over the `BroadcastChannel`.
- **Delete account** — a dialog asks for the password and the typed word `DELETE`. After the API
  deletes the account (and clears the refresh cookie) the app drops the session in every tab and
  loads `/account-deleted` as a fresh page.

### Disabled links and suspended accounts

The API's operator can turn a link off or suspend an account.

- A disabled short link redirects visitors to the public `/link-disabled` page, which explains
  why links get disabled and shows `SUPPORT_EMAIL` when it is set.
- The owner sees a "Disabled" badge on the link card and a notice on its edit page.
  `UNSAFE_DESTINATION` (flagged by Google Safe Browsing or the operator) is lifted by saving a
  different destination; `MANUAL` and `ACCOUNT_SUSPENDED` only by the operator, so the notice
  points to support.
- A suspended account gets a dedicated "Account suspended" notice on `/login`
  (`403 ACCOUNT_SUSPENDED`, with the API's support address). A session that was open at the time
  ends at the next refresh or link change, with the same message.
- Saving a destination flagged by Safe Browsing is refused with `422 DESTINATION_REJECTED`
  (`UNSAFE_DESTINATION`), shown on the URL field.

### Bot protection

When the API has Cloudflare Turnstile keys, its public `GET /api/v1/config` returns
`turnstileSiteKey`; the app loads it once per page load and needs no env variable of its own.

- Register and forgot-password always show the widget; sign-in shows it once the API answers a
  failed attempt with `captchaRequired: true` (or `CAPTCHA_REQUIRED` / `CAPTCHA_FAILED`).
- The token goes to the API as `captchaToken`. Tokens are single-use, so the widget fetches a new
  one after every submit; the submit button waits for it.
- The widget is invisible unless Cloudflare needs the visitor to interact.
- With `turnstileSiteKey: null` (or an API without `/config`) the forms work without the widget.
- The CSP allows `https://challenges.cloudflare.com` in `script-src` and `frame-src` only;
  Turnstile adds nothing to `connect-src`.

### Public site and legal pages

- `/` is a public landing page. It renders on the server for visitors and crawlers; once the boot
  refresh finds a session it sends signed-in users to the dashboard at `/urls`.
- `/terms-of-use` and `/privacy-policy` render per request from the server-only `LEGAL_*`,
  `SUPPORT_EMAIL` and `ABUSE_EMAIL` variables, so one build serves any operator. Unset values fall
  back to neutral wording; the governing-law section appears only with `LEGAL_JURISDICTION`.
  The texts describe what the API stores and logs, Google Safe Browsing and Cloudflare Turnstile;
  update them, and `LEGAL_LAST_UPDATED` in `src/lib/legal.ts`, when that changes.
- Registration requires the "I agree to the Terms of Use" checkbox and sends `acceptTerms: true`
  (required by `short-link-api` 2.0.0; older APIs ignore it).
- The footer and the auth pages link to both legal pages.
- With `GATAG_ID` set, a consent banner asks every visitor about Google Analytics cookies and
  stores the answer in the `analytics-consent` cookie for 180 days; GA4 loads only after "Accept"
  and, once the boot refresh is done, sends the signed-in user's internal id as `user_id`.
  "Cookie settings" in the footer reopens the banner; declining after accepting deletes the `_ga`
  cookies and reloads the page. The privacy policy gains its Google Analytics sections only
  when `GATAG_ID` is set. The CSP adds Google's GA4 origins to `script-src`, `img-src` and
  `connect-src` only then; `CSP_CONNECT_SRC_EXTRA` adds more `connect-src` origins (e.g. Google
  Signals' regional domains). Both are read at build time, like every security header.
- `robots.txt` allows only the public pages (`/`, `/login`, `/register`, the legal pages, the Open
  Graph image); `sitemap.xml` lists them. Both use `NEXT_PUBLIC_APP_URL`. `/opengraph-image` is a
  generated 1200×630 PNG.

## Deployment — runtime environment

Set at runtime (not baked into the build):

| Variable              | Production value                                             |
| --------------------- | ------------------------------------------------------------ |
| `API_ORIGIN`          | The API's **internal** URL (the rewrite hop is server-side). |
| `PORT`                | The port the Node server binds.                              |
| `NEXT_PUBLIC_APP_URL` | The **public** URL this app is served at.                    |
| `API_PROXY_SECRET`    | Same value as the API's `FRONT_PROXY_SECRET` (see below).    |
| `SUPPORT_EMAIL`       | Support address on `/link-disabled` and the legal pages.     |
| `ABUSE_EMAIL`         | Abuse-report address in the Terms of Use; optional.          |
| `LEGAL_OPERATOR_NAME` | Operator named in the legal texts; set it for a public site. |
| `LEGAL_JURISDICTION`  | Governing law in the Terms of Use; optional.                 |

Only `NEXT_PUBLIC_*` values are read at build time and inlined into the client
bundle, so `NEXT_PUBLIC_APP_URL` must be correct
when you run `pnpm build`. `API_ORIGIN` and `PORT` are read by the server
process at start.

`SUPPORT_EMAIL`, `ABUSE_EMAIL`, `LEGAL_OPERATOR_NAME` and `LEGAL_JURISDICTION` are read per
request as well, so changing them needs a restart, not a rebuild.

`GATAG_ID` and `CSP_CONNECT_SRC_EXTRA` must be set when you run `pnpm build`: the security headers
in `next.config.ts` are fixed at build time, and static pages read `GATAG_ID` while prerendering.

`pnpm build` produces a standalone server (`output: 'standalone'`) unless
`VERCEL` is set. If `API_ORIGIN` is unset in a production build the config logs a
warning and falls back to `http://localhost:3000`.

### Client IP

The `/api/v1` hop reaches the API from the host's egress address, so on its own the
API would rate-limit every user as one client. With `API_PROXY_SECRET` set,
`src/proxy.ts` (`/api/v1/:path*` only, no auth logic) drops any client-sent
`x-proxy-secret` / `x-client-ip`, then sends the secret in `x-proxy-secret` and the
browser's IP (`x-real-ip`, else the first `X-Forwarded-For` entry) in `x-client-ip`.
The API trusts `x-client-ip` only when the secret matches.

On Vercel, set `API_PROXY_SECRET` to the value of the API's `FRONT_PROXY_SECRET`
(`openssl rand -hex 32`) after the API has it, then redeploy. Vercel overwrites
client-sent `X-Forwarded-For` / `X-Real-IP`, so the browser can't forge its address.
Production responses also send `Strict-Transport-Security: max-age=63072000`.

### Environment invariant

The API sets the refresh cookie's `Secure` flag from **its own `NODE_ENV`**,
which can silently desync from this app's external scheme:

| This app external scheme | API `NODE_ENV` | Result                                              |
| ------------------------ | -------------- | --------------------------------------------------- |
| `http://localhost:3001`  | `development`  | not `Secure` → works                                |
| `https://…` (prod)       | `production`   | `Secure` cookie on the https hop → works            |
| `https://…`              | `development`  | non-`Secure` cookie over https — works, downgrade   |
| `http://…` (misconfig)   | `production`   | browser **drops** the cookie → silent `/login` loop |

**Rule:** the API's `NODE_ENV` must match this app's external scheme. In
production also ensure the API's `SHORT_URL_BASE` is the _public_ redirect
domain, or every copied short link will be wrong.

## Known gaps (API limitations)

- **No per-session list** — the API exposes `POST /auth/logout` (revoke this
  session) and `POST /auth/logout-all` (revoke every session), but nothing to
  enumerate a user's active sessions, so the profile can only offer "Sign out"
  and "Sign out everywhere", not a device list. "Sign out" is best-effort: it
  fires the server call with the in-memory access token and always clears the
  local session, so a network failure (or a dropped access token) still signs
  you out locally while leaving the server session to expire on its own.
- **No custom short codes** — `POST /urls` accepts only `{ url, note }`; edit
  changes the destination and the note, never the code.
- **Auth throttle** — `/auth/{register,login}` and the verification and password
  routes are limited to 10 req/60 s per client, each route separately; surfaced
  with friendly copy.
- **Destination rules and daily quota** — the API rejects destinations with
  credentials, IP addresses, local hosts, other short links, URL shorteners or
  destinations flagged as unsafe (`422 DESTINATION_REJECTED`, shown on the URL field), and caps each account
  at a number of new links per 24 h (`429 CREATE_QUOTA_EXCEEDED`, 10 by
  default, shown with the wait time). The form doesn't pre-check either.

## Scripts

| Command          | Description                              |
| ---------------- | ---------------------------------------- |
| `pnpm dev`       | Start the dev server (Turbopack).        |
| `pnpm build`     | Production build.                        |
| `pnpm start`     | Start the production server.             |
| `pnpm lint`      | Run ESLint with autofix.                 |
| `pnpm lint:ci`   | Run ESLint without autofix (as CI does). |
| `pnpm typecheck` | `next typegen` + `tsc --noEmit`.         |
| `pnpm test`      | Run the Vitest unit tests once.          |
| `pnpm format`    | Format the codebase with Prettier.       |

## Project structure

```
src/app/                 Routes (App Router). (app)/ = protected client group.
src/components/ui/        shadcn primitives
src/components/urls/      link-cabinet components
src/components/auth/      session-expiry listener, verification banner, Turnstile widget
src/components/account/   profile settings: password, email, account deletion
src/components/theme/     next-themes provider + toggle
src/components/legal/     legal page layout and footer links
src/components/analytics/ consent banner, cookie settings, Google Analytics loader
src/lib/api/              typed API client (public / bearer / error mapping)
src/lib/auth/             token store, shared refresh, context, guard, jwt decode
src/lib/actions/          client useActionState actions (total, via runFormAction)
src/schemas/              lenient Zod mirrors of the API schemas
src/hooks/                use-api-query, use-urls, use-action-result, use-captcha-site-key
next.config.ts            rewrites proxy + security headers (CSP, Turnstile frame, optional GA origins)
src/proxy.ts              adds the client-IP headers to the /api/v1 hop
```

CI (`.github/workflows/ci.yml`): install → `format:check` → `lint:ci` → `typecheck` → `test` → `build`.

## License

[MIT](./LICENSE) © 2026 Anton Holubeu
