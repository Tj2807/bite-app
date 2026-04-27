# Bite — Project Context for Claude

Bite is a personal AI nutrition coach app built by Tejas. It lets him log meals via a conversational AI (Gemini), tracks daily macros, and shows trends over time. It's deployed at **mindyourbite.vercel.app**.

---

## Tech Stack

- **Framework**: Next.js (App Router, Turbopack) — v16.2.4
- **Styling**: Tailwind CSS v4 with custom design tokens in `globals.css`
- **Database + Auth**: Supabase (Postgres + Row-Level Security + Google OAuth)
- **AI**: Google Gemini API (`gemini-2.0-flash`) via `/api/chat`
- **Fonts**: `next/font/google` in `layout.tsx` — NOT `@import url()` in CSS (Turbopack doesn't handle it reliably)
- **Deployment**: Vercel

---

## Key File Map

```
src/
  app/
    page.tsx                  # Landing page (Google OAuth + guest CTA)
    layout.tsx                # Root layout — loads fonts via next/font/google
    globals.css               # Design tokens, typography scale, animations
    proxy.ts                  # Next.js middleware (replaces middleware.ts in v16)
    (app)/
      layout.tsx              # Sidebar layout wrapper for /log
      log/page.tsx            # Daily log — chat + today's macros
    trends/page.tsx           # Trends screen (uses AppShell directly)
    settings/page.tsx         # Goals settings (uses AppShell directly)
    auth/callback/route.ts    # Supabase OAuth callback (PKCE exchange)
    api/
      chat/route.ts           # Gemini AI chat endpoint
      chat/history/route.ts   # Today's chat messages
      meals/route.ts          # CRUD for meals
      trends/route.ts         # Returns raw meals for client-side aggregation
      auth/guest/route.ts     # Sets bite_guest cookie for recruiter demo access
      auth/signout/route.ts   # Clears bite_guest cookie on logout
  components/
    layout/
      Sidebar.tsx             # Desktop sidebar + BottomNav (mobile)
      AppShell.tsx            # Wraps pages outside (app) route group
    daily-log/
      ChatPanel.tsx           # AI chat interface
      TodayPanel.tsx          # Today's macro summary + meal list
  lib/
    supabase.ts               # Browser-safe client (createBrowserClient from @supabase/ssr)
    supabase-server.ts        # Server-only: getAuthUser() — checks guest cookie too
    goals.ts                  # localStorage-based goals (no DB)
```

---

## Architecture Decisions

### Route Groups
- `/log` lives in `(app)/` route group → gets sidebar via `(app)/layout.tsx`
- `/trends` and `/settings` live outside the group → use `<AppShell>` component directly
- `/` (landing) has no sidebar

### Authentication
- Google OAuth via Supabase. Uses `@supabase/ssr` with `createBrowserClient` (cookie-based, not localStorage) so the PKCE verifier is accessible server-side at `/auth/callback`
- `getAuthUser(req)` in `supabase-server.ts` reads session from request cookies
- **Guest mode**: a `bite_guest` httpOnly cookie grants access using Tejas's own user ID. Set by `/api/auth/guest`, cleared by `/api/auth/signout`. Configured via `GUEST_SECRET` and `GUEST_USER_ID` env vars. Guest sees Tejas's real data — intentional.

### Proxy (middleware)
- File is `proxy.ts` (not `middleware.ts` — renamed in Next.js v16)
- Export function must be named `proxy`
- Matcher excludes `.*\\..*` (all file extensions) to prevent proxy running on static assets like `/logo.png` — **do not remove this exclusion or images will break**

### Images
- Use plain `<img>` tags everywhere, NOT `next/image` `<Image>`
- The proxy was intercepting static file requests and breaking image loading for unauthenticated users. Plain `<img>` bypasses Next.js image optimization and avoids the issue entirely.
- `logo.png` in `/public` is 400×400px (resized from original 2048×2048 to avoid 5MB load)

### Fonts
- Loaded via `next/font/google` in `layout.tsx`, injected as CSS variables on `<html>`
- `--font-sans`: Plus Jakarta Sans | `--font-serif`: Noto Serif | `--font-playfair`: Playfair Display
- `globals.css` defines typography utility classes (`text-headline-lg`, `text-body-md`, etc.) that use these variables

---

## Critical Gotchas

### Timezone Bug (SOLVED)
`daily_summaries` in Supabase is keyed by **UTC date** (computed by a DB trigger). A meal logged at 10pm CT appears in the next UTC day's summary. **Never use `daily_summaries` for the trends chart or averages** — it causes cross-day data contamination for non-UTC users.

**Fix applied**: Trends API returns raw meals. Client groups them by local date using `new Date(logged_at).toLocaleDateString('en-CA')` in `groupByLocalDate()` in `trends/page.tsx`. This is timezone-correct by definition.

Similarly, `TodayPanel` and `ChatPanel` send UTC boundaries of the *local* midnight — `new Date(year, month, day, 0,0,0,0).toISOString()` — not UTC date strings, to the meals and chat history APIs.

### Per-User Data Isolation
All tables have `user_id` (Supabase auth UID). The service role client bypasses RLS, so **all queries must explicitly filter `.eq('user_id', user.id)`**. The guest user resolves to Tejas's real user ID, so guests read/write Tejas's data — this is intentional.

### Supabase Client Split
- `supabase.ts` — browser-safe, no `next/headers` import. Used in client components.
- `supabase-server.ts` — server-only. Used in API routes and proxy. Never import in client components or files used by them.

---

## Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Gemini AI
GEMINI_API_KEY=

# Guest access (recruiter demo)
GUEST_SECRET=           # any string, must match in proxy.ts and API route
GUEST_USER_ID=          # Tejas's Supabase user UUID (Auth > Users in dashboard)
```

All five vars must be set in both `.env.local` (local dev) and Vercel dashboard (production).

---

## Database Tables

- `meals` — `id, user_id, logged_at (timestamptz), meal_name, calories, nutrition (jsonb), notes, is_cheat_day`
- `chat_messages` — `id, user_id, role, content, created_at`
- `daily_summaries` — UTC-date-keyed aggregates. Used only as a historical reference; **do not use for timezone-sensitive calculations**
- `user_goals` — per-user macro targets (currently not used in queries; goals are in localStorage via `lib/goals.ts`)

---

## Design System

Colors, spacing, and typography all live in `globals.css` under `@theme {}`. Key colors:
- Primary: `#153526` (dark green) | Surface: `#FAF9F5` (warm white) | Secondary: `#566342`

Nav labels: **Chat** (`/log`), **Trends** (`/trends`), **Goals** (`/settings`). Custom tooltip component in `Sidebar.tsx` — do not use browser `title` attribute.

---

## Running Locally

```bash
cd bite-app
npm run dev        # must run from bite-app/, not project root
```

Vercel auto-deploys from the `main` branch. Supabase redirect URLs configured for both `localhost:3000` and `mindyourbite.vercel.app`.
