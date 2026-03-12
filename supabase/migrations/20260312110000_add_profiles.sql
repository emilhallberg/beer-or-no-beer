create table if not exists public.profiles (
  "id" text primary key,
  "displayName" text,
  "imageUrl" text,
  "createdAt" timestamptz not null default timezone('utc'::text, now()),
  "updatedAt" timestamptz not null default timezone('utc'::text, now())
);

insert into public.profiles ("id", "displayName")
select distinct on ("userId")
  "userId",
  "playerName"
from public.games
where "userId" is not null
order by "userId", "createdAt" desc
on conflict ("id") do update
set
  "displayName" = coalesce(excluded."displayName", public.profiles."displayName"),
  "updatedAt" = timezone('utc'::text, now());
