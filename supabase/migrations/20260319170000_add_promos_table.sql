create table if not exists public.promos (
  "id" text primary key,
  "title" text not null,
  "body" text not null,
  "ctaLabel" text not null,
  "href" text not null,
  "kind" text not null check ("kind" in ('internal', 'affiliate', 'sponsor')),
  "placement" text not null check ("placement" in ('challenge', 'summary')),
  "label" text,
  "disclaimer" text,
  "imageSrc" text,
  "sortOrder" integer not null default 0 check ("sortOrder" >= 0),
  "isActive" boolean not null default true,
  "activeFrom" timestamptz,
  "activeTo" timestamptz,
  "createdAt" timestamptz not null default timezone('utc'::text, now()),
  "updatedAt" timestamptz not null default timezone('utc'::text, now())
);

create index if not exists "promos_placement_isActive_idx"
  on public.promos ("placement", "isActive", "sortOrder");
