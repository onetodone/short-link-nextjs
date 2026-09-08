# Short Link — Frontend

A signed-in cabinet for the **short-link** API: create, list, edit, and delete
your own short links and see per-link click counts.

This is a **frontend only** — a Next.js client. It has **no database and no
backend of its own**; it talks to the separate `short-link` NestJS API. That API
must be running for this app to do anything useful.

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router, Turbopack) + React 19 + TypeScript (`strict`)
- [Tailwind CSS v4](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com) on [Base UI](https://base-ui.com) + [lucide-react](https://lucide.dev) + [sonner](https://sonner.emilkowal.ski)
- [Zod](https://zod.dev) for form + URL validation (lenient — the API's `400` is the source of truth)
- [next-themes](https://github.com/pacocoursey/next-themes) for light/dark
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
- **The `short-link` API running and reachable.** It needs PostgreSQL and Redis; see that
  project's README for how to start it. Quick check:

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

## Deployment — runtime environment

Set at runtime (not baked into the build):

| Variable              | Production value                                             |
| --------------------- | ------------------------------------------------------------ |
| `API_ORIGIN`          | The API's **internal** URL (the rewrite hop is server-side). |
| `PORT`                | The port the Node server binds.                              |
| `NEXT_PUBLIC_APP_URL` | The **public** URL this app is served at.                    |

Only `NEXT_PUBLIC_*` values are read at build time and inlined into the client
bundle, so `NEXT_PUBLIC_APP_URL` must be correct
when you run `pnpm build`. `API_ORIGIN` and `PORT` are read by the server
process at start.

`pnpm build` produces a standalone server (`output: 'standalone'`) unless
`VERCEL` is set. If `API_ORIGIN` is unset in a production build the config logs a
warning and falls back to `http://localhost:3000`.

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
- **No `GET /urls/:shortCode`** — the edit page hydrates the destination field
  from navigation state (`sessionStorage`), falling back to a bounded list scan
  on a cold / deep-linked load.
- **Profile is read-only** — no name / email / password change, no verification.
- **No custom short codes** — `POST /urls` accepts only `{ url }`; edit changes
  only the destination.
- **Click counts lag** the live value by up to ~5 s (`CLICKS_FLUSH_INTERVAL_MS`).
- **Auth throttle** — `/auth/{register,login,refresh}` are limited to 10 req/60 s
  per client, each route separately; surfaced with friendly copy.

## Scripts

| Command          | Description                              |
| ---------------- | ---------------------------------------- |
| `pnpm dev`       | Start the dev server (Turbopack).        |
| `pnpm build`     | Production build.                        |
| `pnpm start`     | Start the production server.             |
| `pnpm lint`      | Run ESLint with autofix.                 |
| `pnpm lint:ci`   | Run ESLint without autofix (as CI does). |
| `pnpm typecheck` | `next typegen` + `tsc --noEmit`.         |
| `pnpm format`    | Format the codebase with Prettier.       |

## Project structure

```
src/app/                 Routes (App Router). (app)/ = protected client group.
src/components/ui/        shadcn primitives
src/components/urls/      link-cabinet components
src/components/auth/      session-expiry listener
src/components/theme/     next-themes provider + toggle
src/lib/api/              typed API client (public / bearer / error mapping)
src/lib/auth/             token store, shared refresh, context, guard, jwt decode
src/lib/actions/          client useActionState actions (total, via runFormAction)
src/schemas/              lenient Zod mirrors of the API schemas
src/hooks/                use-api-query, use-urls, use-action-result
next.config.ts            rewrites proxy + security headers (CSP connect-src 'self')
```

CI (`.github/workflows/ci.yml`): install → `lint:ci` → `typecheck` → `build`.

## License

[MIT](./LICENSE) © 2026 Anton Holubeu
