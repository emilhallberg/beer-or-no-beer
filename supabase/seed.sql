truncate table public.game_guesses restart identity cascade;
truncate table public.games restart identity cascade;
truncate table public.profiles restart identity cascade;
truncate table public.beers restart identity cascade;

-- Preserve the current leaderboard across local db resets.
--
-- The legacy export only contains user/name/score, while the current app renders
-- leaderboard rows from completed games plus profiles. Seed matching profiles and
-- synthetic completed games so reset keeps the visible ranking intact.
--
-- Interpret the legacy score as "correct answers" and convert it to the current
-- points scale without applying any streak bonus.
with seeded_leaderboard (
  "createdAt",
  "name",
  "score",
  "userId"
) as (
  values
    ('2026-01-29 20:48:22.515945+00'::timestamptz, 'Emil Chugberg', 70, 'user_38SufKl4CTiNHxRAEqfbp4jm3BY'),
    ('2026-01-30 15:39:10.220603+00'::timestamptz, 'John Eriksson', 13, 'user_38TH3PM1dtIQCzNc0t12Z8eESEZ'),
    ('2026-01-30 15:47:03.861704+00'::timestamptz, 'Linus', 8, 'user_38z2EP9apOsTtL0qqbAP30FZTmc'),
    ('2026-01-30 16:11:43.819418+00'::timestamptz, 'Debbie Katten', 5, 'user_38z5LF13xjaxxRfYBtynhGuEW8d'),
    ('2026-01-30 16:13:30.766037+00'::timestamptz, 'Joseph', 10, 'user_38TUNQr12ChkgYyd1YvWziavFbt'),
    ('2026-01-30 16:13:38.792308+00'::timestamptz, 'Jonas Westman', 5, 'user_38z5X7MBdJVFXCgBevlmyFn0F7K'),
    ('2026-01-31 19:45:11.973491+00'::timestamptz, 'Tobias Lindgren', 18, 'user_392KQXwGSrXjpF9p1hOELJa1Bdl'),
    ('2026-02-20 15:45:13.912007+00'::timestamptz, 'Emil Hallberg', 5, 'user_38QQr5MxJqxlkQHd1PuD99RMX0J')
)
insert into public.profiles ("id", "displayName")
select
  "userId",
  "name"
from seeded_leaderboard
on conflict ("id") do update
set
  "displayName" = excluded."displayName",
  "updatedAt" = timezone('utc'::text, now());

with seeded_leaderboard (
  "createdAt",
  "name",
  "score",
  "userId"
) as (
  values
    ('2026-01-29 20:48:22.515945+00'::timestamptz, 'Emil Chugberg', 70, 'user_38SufKl4CTiNHxRAEqfbp4jm3BY'),
    ('2026-01-30 15:39:10.220603+00'::timestamptz, 'John Eriksson', 13, 'user_38TH3PM1dtIQCzNc0t12Z8eESEZ'),
    ('2026-01-30 15:47:03.861704+00'::timestamptz, 'Linus', 8, 'user_38z2EP9apOsTtL0qqbAP30FZTmc'),
    ('2026-01-30 16:11:43.819418+00'::timestamptz, 'Debbie Katten', 5, 'user_38z5LF13xjaxxRfYBtynhGuEW8d'),
    ('2026-01-30 16:13:30.766037+00'::timestamptz, 'Joseph', 10, 'user_38TUNQr12ChkgYyd1YvWziavFbt'),
    ('2026-01-30 16:13:38.792308+00'::timestamptz, 'Jonas Westman', 5, 'user_38z5X7MBdJVFXCgBevlmyFn0F7K'),
    ('2026-01-31 19:45:11.973491+00'::timestamptz, 'Tobias Lindgren', 18, 'user_392KQXwGSrXjpF9p1hOELJa1Bdl'),
    ('2026-02-20 15:45:13.912007+00'::timestamptz, 'Emil Hallberg', 5, 'user_38QQr5MxJqxlkQHd1PuD99RMX0J')
)
insert into public.games (
  "userId",
  "playerName",
  "score",
  "bestStreak",
  "correctGuesses",
  "totalGuesses",
  "startingLives",
  "livesRemaining",
  "endedAt",
  "endReason",
  "createdAt"
)
select
  "userId",
  "name",
  "score" * 100,
  "score",
  "score",
  "score" + 3,
  3,
  0,
  "createdAt",
  'lives_exhausted',
  "createdAt"
from seeded_leaderboard;
