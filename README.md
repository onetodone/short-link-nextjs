# Short URL — Frontend

A signed-in cabinet for the [`short-url`](https://github.com/onetodone/short-url-api) API: create, list, edit,
and delete your own short links and see per-link click counts. This is a
**frontend only** — a Next.js client. It has no database and no backend of its
own; it needs the `short-url` API running.

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router, Turbopack) + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com) on [Base UI](https://base-ui.com)
- [Zod](https://zod.dev) for form validation
- [next-themes](https://github.com/pacocoursey/next-themes) for light/dark
- Client-side auth against the API: a short-lived access JWT held **in browser
  memory only**, refreshed via an `HttpOnly` cookie. Every browser request is
  same-origin and reaches the API through a Next `rewrites()` proxy.

## Getting started

### Prerequisites

- Node.js 22+ (CI use 26)
- [pnpm](https://pnpm.io) — version pinned via `packageManager`; run
  `corepack enable` to pick it up automatically

### Setup

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Copy the environment template:

   ```bash
   cp .env.example .env
   ```

   | Variable                     | Description                                                              |
   | ---------------------------- | ---------------------------------------------------------------------- |
   | `PORT`                       | Port the dev/start server listens on (`3001`).                        |
   | `API_ORIGIN`                 | **Server-only** origin of the API for the rewrites proxy. Never `NEXT_PUBLIC_`. |
   | `NEXT_PUBLIC_APP_URL`        | Public base URL this app is served at (metadata).                     |
   | `NEXT_PUBLIC_SHORT_URL_BASE` | Public redirect origin the API builds `shortUrl` from.               |

3. Start the dev server:

   ```bash
   pnpm dev
   ```

   The app is at `http://localhost:3001`. Seeded API test account:
   `demo@user.loc` / `password123`.

## Environment invariant

The API sets the refresh cookie's `Secure` flag from its own `NODE_ENV`, which
can silently desync from this app's external scheme:

| This app external scheme  | API `NODE_ENV` | Result                                  |
| ------------------------- | -------------- | --------------------------------------- |
| `http://localhost:3001`   | `development`  | not `Secure` → works                    |
| `https://…` (prod)        | `production`   | `Secure` cookie on the https hop → works |
| `http://…` (misconfig)    | `production`   | browser **drops** the cookie → `/login` loop |

**Rule:** the API's `NODE_ENV` must match this app's external scheme. In
production also ensure the API's `SHORT_URL_BASE` is the *public* redirect
domain, or every copied short link will be wrong.

## Known gaps (API limitations)

- **No logout endpoint** — "Sign out" is client-only (drops the in-memory
  token); the path-scoped `HttpOnly` refresh cookie can't be cleared by JS and
  stays valid for up to 7 days.
- **No `GET /urls/:shortCode`** — the edit page hydrates from navigation state
  or a list fallback on a cold/deep-linked load.
- **Profile is read-only** — no name / email / password change, no verification.
- **No custom short codes** — `POST /urls` accepts only `{ url }`.
- **Click counts lag** the live value by up to ~5 s.
- **Auth throttle** — `/auth/{register,login,refresh}` are limited to 10 req/60 s
  per client, each route separately.

## Scripts

| Command          | Description                              |
| ---------------- | --------------------------------------- |
| `pnpm dev`       | Start the dev server (Turbopack, `:3001`). |
| `pnpm build`     | Production build.                       |
| `pnpm start`     | Start the production server.            |
| `pnpm lint`      | Run ESLint with autofix.                |
| `pnpm lint:ci`   | Run ESLint without autofix (as CI does). |
| `pnpm typecheck` | Type-check without emitting output.     |
| `pnpm format`    | Format the codebase with Prettier.     |

## License

[MIT](./LICENSE) © [Anton Holubeu](https://github.com/aholu)
