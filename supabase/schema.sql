-- "Um die Ecke" — Datenbank-Schema
-- Diese Datei einmalig im Supabase SQL Editor ausführen.
-- (Ist idempotent: kann bei Bedarf mehrfach ausgeführt werden.)

-- 1. Profiles: ein Profil pro Nutzer, verknüpft mit dem Auth-Account
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  location text not null default '',
  bio text not null default '',
  created_at timestamptz not null default now()
);

-- 2. Posts: Hilfe-Gesuche und -Angebote
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('request', 'offer')),
  category text not null,
  title text not null,
  description text not null,
  location text not null,
  status text not null default 'open' check (status in ('open', 'closed')),
  created_at timestamptz not null default now()
);

-- PLZ + Koordinaten, für die "In meiner Nähe"-Suche im Feed
alter table public.posts add column if not exists postal_code text;
alter table public.posts add column if not exists lat double precision;
alter table public.posts add column if not exists lng double precision;

-- Zusätzliche Verknüpfung zu profiles, damit Supabase Autor-Namen direkt
-- mitladen kann (posts.user_id verweist bereits auf auth.users; profiles.id
-- tut das auch, aber PostgREST braucht eine direkte FK für den Join).
alter table public.posts drop constraint if exists posts_user_id_profiles_fkey;
alter table public.posts
  add constraint posts_user_id_profiles_fkey
  foreign key (user_id) references public.profiles(id) on delete cascade;

-- 3. Messages: Nachrichten zwischen zwei Nutzern zu einem Beitrag
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  recipient_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

-- Automatisch ein Profil anlegen, sobald sich jemand registriert
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Row Level Security aktivieren
alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.messages enable row level security;

-- Profiles: alle können Profile lesen (Namen neben Beiträgen anzeigen),
-- aber nur der Besitzer darf sein eigenes Profil ändern.
drop policy if exists "Profiles sind öffentlich lesbar" on public.profiles;
create policy "Profiles sind öffentlich lesbar"
  on public.profiles for select
  using (true);

drop policy if exists "Nutzer können nur ihr eigenes Profil bearbeiten" on public.profiles;
create policy "Nutzer können nur ihr eigenes Profil bearbeiten"
  on public.profiles for update
  using (auth.uid() = id);

-- Posts: alle können lesen, nur eingeloggte Nutzer können eigene Beiträge
-- erstellen/bearbeiten/löschen.
drop policy if exists "Beiträge sind öffentlich lesbar" on public.posts;
create policy "Beiträge sind öffentlich lesbar"
  on public.posts for select
  using (true);

drop policy if exists "Eingeloggte Nutzer können Beiträge erstellen" on public.posts;
create policy "Eingeloggte Nutzer können Beiträge erstellen"
  on public.posts for insert
  with check (auth.uid() = user_id);

drop policy if exists "Nutzer können nur eigene Beiträge bearbeiten" on public.posts;
create policy "Nutzer können nur eigene Beiträge bearbeiten"
  on public.posts for update
  using (auth.uid() = user_id);

drop policy if exists "Nutzer können nur eigene Beiträge löschen" on public.posts;
create policy "Nutzer können nur eigene Beiträge löschen"
  on public.posts for delete
  using (auth.uid() = user_id);

-- Messages: nur Absender und Empfänger dürfen eine Nachricht sehen.
drop policy if exists "Nur Beteiligte sehen ihre Nachrichten" on public.messages;
create policy "Nur Beteiligte sehen ihre Nachrichten"
  on public.messages for select
  using (auth.uid() = sender_id or auth.uid() = recipient_id);

drop policy if exists "Eingeloggte Nutzer können Nachrichten senden" on public.messages;
create policy "Eingeloggte Nutzer können Nachrichten senden"
  on public.messages for insert
  with check (auth.uid() = sender_id);
