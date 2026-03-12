alter table public.games
add column if not exists "beerIds" integer[] not null default '{}';

