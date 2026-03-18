# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Commands

### Frontend (Next.js) — run from project root
```bash
npm run dev        # Start dev server on :3000
npm run build      # Production build
npm run lint       # ESLint (zero warnings enforced)
npm run lint:fix   # Auto-fix lint issues
npm run types      # TypeScript type check (no emit)
```

### Backend (Express/Socket.io) — run from `backend/`
```bash
npm run dev    # ts-node-dev watch mode on :3001
npm run build  # tsc compile to dist/
npm start      # Run compiled dist/index.js
```

## Architecture

This is a **"Beer or No Beer?"** quiz game — players guess whether a beer name is real or fake, with 3 lives and a leaderboard.

### Frontend: Next.js 16 App Router

**Route structure:**
- `src/app/(start)/` — Home/start screen with parallel slot `@leaderboard` (intercepted layout). Uses Clerk auth to show sign-in and user button.
- `src/app/play/` — Game screen with two parallel slots: `@game` (active gameplay) and `@result` (game-over screen). Both slots share state via `GameProvider`.
- `src/app/challenge/` — Landing page for challenge links (`?from=name&score=N`).

**Game state (`src/app/play/_/game-provider.tsx`):**
A `useReducer`-based context provider (`GameContext`) holds all game state. It:
- Receives `beerPromise` and `userEntryPromise` (passed from the layout as unsettled Promises — React 19 `use()` pattern).
- Persists game-over state to `localStorage` under key `"beer-storage"` so the result screen survives refresh.
- Dispatches `GUESS`, `RESET`, `HINT`, and `INIT` actions.
- Automatically shows a hint after 15 seconds per beer via `setTimeout`.
- Calls `updateLeaderboard` on game over if the user is signed in and beat their high score.

**Data layer:**
- `src/utils/beer.ts` — Server Action that queries Supabase view `random_beers` for up to 100 beers.
- `src/utils/leaderboard.tsx` — Server Actions for reading/writing the `leaderboard` Supabase table (keyed by Clerk `userId`).
- `src/utils/supabase/` — Supabase client helpers for server and client contexts.
- `src/proxy.ts` — Clerk middleware applied to all routes.

**Key conventions:**
- Private/internal components for a route go in a `_/` subfolder (e.g., `src/app/play/_/`).
- Server Actions use `"use server"` directive; client components use `"use client"`.
- React Compiler is enabled (`reactCompiler: true` in `next.config.ts`).
- Typed routes are enabled (`typedRoutes: true`).
- Tailwind CSS v4 with PostCSS.

### Backend: Express + Socket.io (multiplayer, WIP)

Located in `backend/`, this is a separate Node.js service for real-time multiplayer games. It uses:
- **Socket.io** for real-time communication (CORS restricted to `beerornobeer.com` in production).
- **Prisma + SQLite** for game state persistence.
- `gameManager.ts` handles game lifecycle: `createGame`, `joinGame`, `startGame`, `submitAnswer`, `disconnectPlayer`.

The backend runs independently on port 3001 and is **not integrated** into the Next.js app yet.

### External Services
- **Supabase** — database (`random_beers` view, `leaderboard` table)
- **Clerk** — authentication (sign-in, user identity for leaderboard)
- **Vercel Blob** — listed as dependency (likely for assets)
- **`src/assets/systembolaget.json`** — static beer data used by the `BeerDatabaseGenerator` C# tool in `backend/Tools/`
