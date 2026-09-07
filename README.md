# Pantry Planner

Pantry-first weekly meal planner. Vite + React + TypeScript SPA backed by Supabase.
See [`brief.md`](./brief.md) for the product spec and [`ARCHITECTURE.md`](./ARCHITECTURE.md)
for how the code is organized.

## Setup

```bash
npm install
cp .env.example .env      # fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
npm run dev
```

## Scripts

| Command             | What it does |
| ------------------- | ------------ |
| `npm run dev`       | Vite dev server (http://localhost:5173) |
| `npm run build`     | Type-check + production build to `dist/` |
| `npm run typecheck` | `tsc` only |
| `npm run lint`      | ESLint |
| `npm test`          | Vitest (unit + component) |
| `npm run seed`      | Load `data/` into Supabase (needs `SUPABASE_SERVICE_ROLE_KEY` in `.env`) |
| `npm run db:types`  | Regenerate `src/types/database.ts` from the linked project |

## Database

Schema lives in `supabase/migrations/`. With the Supabase CLI:

```bash
supabase start                 # local Postgres + Auth + Studio
supabase db reset              # apply migrations + supabase/seed.sql
npm run seed                   # then load the MealDB recipe dump
```

Authorization is entirely Row Level Security — there is no backend server.

## Layout

`src/features/<feature>/` is the unit of organization. Each feature has `api.ts`
(supabase calls), `queries.ts` / `mutations.ts` (TanStack Query hooks), a
`components/` folder, and a `routes/` folder. Shared pieces live in
`src/components/common/`. The suggestion algorithm is a pure function in
`src/features/discover/rank.ts`.
