-- Add slug column to players table
alter table public.players add column if not exists slug text;

-- Generate slugs for existing players from their names
update public.players
set slug = lower(
  regexp_replace(
    regexp_replace(
      trim(name),
      '[^a-zA-Z0-9\s-]', '', 'g'
    ),
    '\s+', '-', 'g'
  )
)
where slug is null;

-- Make slug required and unique going forward
alter table public.players alter column slug set not null;
alter table public.players add constraint players_slug_key unique (slug);
