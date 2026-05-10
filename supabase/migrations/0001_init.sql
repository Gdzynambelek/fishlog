-- FishLog initial schema
-- Trips (wyjazdy wędkarskie) + catches (połowy) + photo storage bucket.
-- All tables have RLS enabled; users can only see/modify their own rows.

-- ============================================================================
-- trips
-- ============================================================================
create table public.trips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  location_name text,
  latitude double precision,
  longitude double precision,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  notes text,
  weather text,
  created_at timestamptz not null default now()
);

create index trips_user_started_idx
  on public.trips (user_id, started_at desc);

-- ============================================================================
-- catches
-- ============================================================================
create table public.catches (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  species text not null,
  weight_kg double precision,
  length_cm double precision,
  caught_at timestamptz not null default now(),
  latitude double precision,
  longitude double precision,
  photo_url text,
  notes text,
  released boolean not null default false,
  created_at timestamptz not null default now()
);

create index catches_user_caught_idx
  on public.catches (user_id, caught_at desc);
create index catches_trip_idx on public.catches (trip_id);
create index catches_user_species_idx on public.catches (user_id, species);

-- ============================================================================
-- Row Level Security
-- ============================================================================
alter table public.trips enable row level security;
alter table public.catches enable row level security;

-- Trips: owner has full CRUD.
create policy "trips_owner_select" on public.trips
  for select using (auth.uid() = user_id);
create policy "trips_owner_insert" on public.trips
  for insert with check (auth.uid() = user_id);
create policy "trips_owner_update" on public.trips
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "trips_owner_delete" on public.trips
  for delete using (auth.uid() = user_id);

-- Catches: owner has full CRUD.
create policy "catches_owner_select" on public.catches
  for select using (auth.uid() = user_id);
create policy "catches_owner_insert" on public.catches
  for insert with check (auth.uid() = user_id);
create policy "catches_owner_update" on public.catches
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "catches_owner_delete" on public.catches
  for delete using (auth.uid() = user_id);

-- ============================================================================
-- Storage bucket for catch photos
-- Path convention: {user_id}/{trip_id}/{uuid}.jpg
-- Public read so we can serve via Supabase public URLs without signing.
-- Writes restricted to authenticated users uploading under their own user_id.
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('catches-photos', 'catches-photos', true)
on conflict (id) do nothing;

create policy "catches_photos_public_read" on storage.objects
  for select using (bucket_id = 'catches-photos');

create policy "catches_photos_owner_insert" on storage.objects
  for insert with check (
    bucket_id = 'catches-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "catches_photos_owner_update" on storage.objects
  for update using (
    bucket_id = 'catches-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "catches_photos_owner_delete" on storage.objects
  for delete using (
    bucket_id = 'catches-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
