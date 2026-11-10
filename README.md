This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Supabase Database

The repo now includes a local Supabase schema and seed flow for the tables the app expects:

- `public.beers`
- `public.games`
- `public.game_guesses`
- `public.profiles`
- `public.random_beers`

`supabase/seed.sql` seeds the beer catalog and restores the current local leaderboard so `db reset` keeps the visible standings.

The local stack uses ports `553xx` (API: `http://127.0.0.1:55321`) to avoid conflicts with other projects. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in `.env.development.local` to this stack’s URL and publishable key from `npx supabase status`.

### Reset the local database

1. Start Supabase locally if it is not already running:

```bash
npx supabase start
```

2. Reset the database and re-run migrations + seed:

```bash
npx supabase db reset
```

After reset, the local database will contain the app schema, the seeded beers, and the preserved leaderboard entries from `supabase/seed.sql`.

## Getting Started

Use Node.js 22.13 or later. The app uses Next.js 16 (Active LTS), React 19,
and Supabase client libraries that require Node.js 22 or later.

TypeScript stays on 6.x and ESLint on 9.x to satisfy the peer dependencies of
the current Next.js lint plugins. Update these together when the plugins support
TypeScript 7 and ESLint 10.

Supabase CLI 3 targets the local stack by default. Hosted database commands need
`--remote`, and hosted changes in unattended scripts also need `--yes`.

Run `npm test` for gesture physics and sharing regression checks.

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/layout.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
