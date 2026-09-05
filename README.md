# Epoch

## A daily ledger for the moments that matter.

Epoch is a deliberately constrained journaling PWA. Every day gets one page. That page holds three moments, each no longer than 80 characters. When the page is sealed, it becomes part of a private archive.

No endless feed. No algorithm. No pressure to write an essay.

## The Problem

Most journaling tools turn reflection into another open-ended task. Blank pages create friction, long-form prompts demand time, and unfinished drafts pile up without becoming a practice.

The result is predictable: people remember that they meant to reflect, then skip it.

## The Solution

Epoch makes reflection small enough to repeat and meaningful enough to keep.

- **Three moments.** A fixed daily limit creates focus.
- **80 characters each.** Short entries remove the pressure to perform.
- **One page per day.** A unique daily record makes the habit concrete.
- **Seal the page.** Completed entries are committed instead of endlessly edited.
- **Keep a token.** Attach an image when the day needs a visual marker, or continue text-only when it does not.
- **Build an archive.** Return to a dense record of past days, including the days left blank.

Epoch is designed to feel more like opening a ledger than opening another social app.

## How It Works

1. Authenticate with Supabase.
2. Open today’s ritual page.
3. Write three moments, saved locally as a draft while you work.
4. Optionally attach a token image. Images are compressed in the browser before upload.
5. Seal the entry.
6. Server-side validation checks the payload, session, daily uniqueness, and storage state.
7. The sealed entry is written to Supabase and appears in the archive.

The daily uniqueness constraint is enforced in the database, not just in the interface. A user cannot create two sealed entries for the same date.

## Architecture

Epoch is a Next.js App Router application with a small, explicit data path:

```text
Browser
  -> Next.js route groups and React components
  -> Server Actions
  -> Supabase Auth / Database / Private Storage
  -> Archive query and dense date-range view
```

### Application layer

- `src/app` owns routes, layouts, auth boundaries, and the dashboard shell.
- `src/components/features` owns the ritual, seal animation, token upload, share state, and archive UI.
- `src/actions` owns server mutations and archive reads.
- `src/lib/supabase` provides browser and server Supabase clients.
- `src/config` keeps product rules such as the three-moment, 80-character limit in one place.

### Data and security layer

- Supabase Auth provides the active user session.
- The `entries` table stores one row per user per day.
- Row Level Security limits reads and inserts to the authenticated owner.
- The `tokens` storage bucket is private; the database stores the storage path rather than a public URL.
- Zod validates the incoming server action payload before any write occurs.
- Failed token uploads fall back to a text-only entry instead of blocking the ritual.

## Tech Stack

- **Framework:** Next.js 14.2 with the App Router and Server Actions
- **Language:** TypeScript
- **UI:** React 18.3 and Tailwind CSS 3.4
- **Motion:** Framer Motion 11
- **Backend:** Supabase Auth, Postgres, Storage, and SSR helpers
- **Validation:** Zod
- **Client persistence:** `usehooks-ts` local storage helpers
- **Image handling:** `browser-image-compression`
- **PWA:** Web app manifest, standalone display mode, service worker, and iOS install gate
- **Tooling:** ESLint, PostCSS, Autoprefixer, and Supabase CLI

## Project Overview

```text
epoch/
├── public/
│   ├── icons/                  # PWA icons
│   ├── manifest.json           # Install metadata and standalone mode
│   └── sw.js                   # Service worker
├── src/
│   ├── actions/                # Authenticated server mutations and reads
│   ├── app/                    # App Router pages, layouts, and route handlers
│   │   ├── (auth)/login/       # Login experience
│   │   ├── (dashboard)/        # Ritual and archive routes
│   │   └── auth/callback/      # Auth callback route
│   ├── components/
│   │   └── features/           # Ritual and archive product components
│   ├── config/                 # Shared product constants
│   ├── hooks/                  # Client hooks, including iOS standalone detection
│   ├── lib/                    # Supabase clients, image compression, and utilities
│   └── types/                  # Database and application types
├── supabase/
│   ├── migrations/             # Schema and storage policies
│   ├── snippets/               # Useful local SQL snippets
│   └── seed.sql                # Seed data
├── next.config.mjs             # Next.js and security configuration
├── tailwind.config.ts          # Tailwind theme and content paths
└── package.json                # Scripts and dependencies
```

## Local Development

### Requirements

- Node.js 20 or newer
- A Supabase project
- npm

### Setup

```bash
git clone <repository-url>
cd Epoch
npm install
```

Create `.env.local` with the Supabase project values:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SKIP_INSTALL_GATE=false
```

Apply the SQL in `supabase/migrations` to the project, then start the app:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Commands

```bash
npm run dev      # Start the development server
npm run build    # Create a production build
npm run start    # Serve the production build
npm run lint     # Run Next.js lint checks
```

## Product Rules

- Exactly three moments are required for an entry.
- Each moment is capped at 80 characters.
- Each authenticated user can seal one entry per calendar day.
- Empty moments are rejected before submission.
- Entries are sealed immediately after a successful write.
- Token images are optional. If upload fails, the entry remains valid as text-only.
- Archive reads are scoped to the current authenticated user.

## Status

Epoch is an active MVP focused on one thing: making daily reflection brief, private, and repeatable.
