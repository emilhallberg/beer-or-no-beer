alter table public.beers
add column if not exists "meta" jsonb not null default '{}'::jsonb;

drop view if exists public.random_beers;

create view public.random_beers as
select
  "abv",
  "brewery",
  "createdAt",
  "description",
  "id",
  "meta",
  "name",
  "real",
  "type"
from public.beers
order by random();
