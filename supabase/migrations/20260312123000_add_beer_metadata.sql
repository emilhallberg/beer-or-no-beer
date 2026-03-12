alter table public.beers
add column if not exists "brewery" text not null default 'Unknown Brewery',
add column if not exists "abv" numeric(4, 1) not null default 0.0;

alter table public.beers
drop constraint if exists beers_abv_check;

alter table public.beers
add constraint beers_abv_check
check ("abv" >= 0.0 and "abv" <= 100.0);

drop view if exists public.random_beers;

create view public.random_beers as
select
  "abv",
  "brewery",
  "createdAt",
  "description",
  "id",
  "name",
  "real"
from public.beers
order by random();
