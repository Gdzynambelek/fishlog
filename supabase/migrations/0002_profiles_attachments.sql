-- 0002 — profiles + trip attachments
-- Profiles: per-user metadata (display name, fishing license, permit links).
-- Trip attachments: PDFs (e.g. fishing permits) attached to a trip.

-- ============================================================================
-- profiles
-- ============================================================================
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  first_name text,
  last_name text,
  fishing_license text,
  permit_links jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_owner_select" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_owner_insert" on public.profiles
  for insert with check (auth.uid() = id);
create policy "profiles_owner_update" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "profiles_owner_delete" on public.profiles
  for delete using (auth.uid() = id);

-- Auto-create an empty profile row whenever a new auth user signs up.
-- Saves us from needing to upsert defensively in app code.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Backfill existing users (so the currently-logged-in user gets a profile row).
insert into public.profiles (id)
select id from auth.users
on conflict (id) do nothing;

-- Auto-update updated_at on row changes.
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute procedure public.touch_updated_at();

-- ============================================================================
-- trip_attachments  (PDFs attached to trips: fishing permits, etc.)
-- ============================================================================
create table public.trip_attachments (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  file_path text not null,        -- path inside the storage bucket
  file_name text not null,        -- original filename for display
  file_size bigint,
  mime_type text,
  created_at timestamptz not null default now()
);

create index trip_attachments_trip_idx
  on public.trip_attachments (trip_id, created_at desc);

alter table public.trip_attachments enable row level security;

create policy "trip_attachments_owner_select" on public.trip_attachments
  for select using (auth.uid() = user_id);
create policy "trip_attachments_owner_insert" on public.trip_attachments
  for insert with check (auth.uid() = user_id);
create policy "trip_attachments_owner_delete" on public.trip_attachments
  for delete using (auth.uid() = user_id);

-- ============================================================================
-- Storage bucket: trip-attachments  (private — signed URLs for download)
-- Path convention: {user_id}/{trip_id}/{uuid}.pdf
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('trip-attachments', 'trip-attachments', false)
on conflict (id) do nothing;

create policy "trip_attachments_owner_read" on storage.objects
  for select using (
    bucket_id = 'trip-attachments'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "trip_attachments_owner_insert" on storage.objects
  for insert with check (
    bucket_id = 'trip-attachments'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "trip_attachments_owner_delete" on storage.objects
  for delete using (
    bucket_id = 'trip-attachments'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
