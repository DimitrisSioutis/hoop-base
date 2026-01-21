-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Drop existing tables (in correct order due to foreign key constraints)
drop table if exists public.player_stats;
drop table if exists public.matches;
drop table if exists public.players;
drop table if exists public.users;

-- Create users table (auth accounts)
create table public.users (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  avatar_url text,
  is_admin boolean default false,
  player_id uuid,  -- Link to player profile (added after players table)
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create players table (basketball players, created by admin)
create table public.players (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  nickname text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add foreign key from users to players
alter table public.users
add constraint users_player_id_fkey
foreign key (player_id) references public.players(id) on delete set null;

-- Create matches table
create table public.matches (
  id uuid default uuid_generate_v4() primary key,
  description text,
  youtube_url text,
  match_date date not null,
  location text,
  created_by uuid references public.users(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create player_stats table (stats per player per match)
-- Only points is required, other stats are nullable and won't count toward averages if not tracked
create table public.player_stats (
  id uuid default uuid_generate_v4() primary key,
  match_id uuid references public.matches(id) on delete cascade not null,
  player_id uuid references public.players(id) on delete cascade not null,
  team text not null check (team in ('team_a', 'team_b')),
  points integer not null,
  rebounds integer,
  assists integer,
  steals integer,
  blocks integer,
  turnovers integer,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(match_id, player_id)
);

-- Enable Row Level Security
alter table public.users enable row level security;
alter table public.players enable row level security;
alter table public.matches enable row level security;
alter table public.player_stats enable row level security;

-- Users policies
create policy "Users are viewable by authenticated users" on public.users
  for select using (auth.role() = 'authenticated');

create policy "Users can update own record" on public.users
  for update using (auth.uid() = id);

create policy "Users can insert own record" on public.users
  for insert with check (auth.uid() = id);

create policy "Admins can update any user" on public.users
  for update using (
    exists (select 1 from public.users where id = auth.uid() and is_admin = true)
  );

-- Players policies
create policy "Players are viewable by authenticated users" on public.players
  for select using (auth.role() = 'authenticated');

create policy "Admins can insert players" on public.players
  for insert with check (
    exists (select 1 from public.users where id = auth.uid() and is_admin = true)
  );

create policy "Admins can update players" on public.players
  for update using (
    exists (select 1 from public.users where id = auth.uid() and is_admin = true)
  );

create policy "Admins can delete players" on public.players
  for delete using (
    exists (select 1 from public.users where id = auth.uid() and is_admin = true)
  );

-- Matches policies
create policy "Matches are viewable by authenticated users" on public.matches
  for select using (auth.role() = 'authenticated');

create policy "Admins can insert matches" on public.matches
  for insert with check (
    exists (select 1 from public.users where id = auth.uid() and is_admin = true)
  );

create policy "Admins can update matches" on public.matches
  for update using (
    exists (select 1 from public.users where id = auth.uid() and is_admin = true)
  );

create policy "Admins can delete matches" on public.matches
  for delete using (
    exists (select 1 from public.users where id = auth.uid() and is_admin = true)
  );

-- Player stats policies
create policy "Stats are viewable by authenticated users" on public.player_stats
  for select using (auth.role() = 'authenticated');

create policy "Admins can insert stats" on public.player_stats
  for insert with check (
    exists (select 1 from public.users where id = auth.uid() and is_admin = true)
  );

create policy "Admins can update stats" on public.player_stats
  for update using (
    exists (select 1 from public.users where id = auth.uid() and is_admin = true)
  );

create policy "Admins can delete stats" on public.player_stats
  for delete using (
    exists (select 1 from public.users where id = auth.uid() and is_admin = true)
  );

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
