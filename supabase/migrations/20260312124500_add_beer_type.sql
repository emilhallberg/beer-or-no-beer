alter table public.beers
add column if not exists "type" text not null default 'Unknown';

drop view if exists public.random_beers;

create view public.random_beers as
select
  "abv",
  "brewery",
  "createdAt",
  "description",
  "id",
  "name",
  "real",
  "type"
from public.beers
order by random();
