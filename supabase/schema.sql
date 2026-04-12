create extension if not exists pgcrypto;

create table if not exists public.exercises (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  youtube_url text,
  sort_order integer not null default 0,
  is_active boolean not null default true
);

alter table public.exercises
  alter column youtube_url drop not null;

create table if not exists public.workout_sessions (
  id uuid primary key default gen_random_uuid(),
  workout_date date not null,
  current_weight numeric(5,1),
  workout_code text,
  workout_name text,
  created_at timestamptz not null default timezone('utc', now()),
  user_id uuid not null references auth.users (id) on delete cascade,
  unique (user_id, workout_date)
);

alter table public.workout_sessions
  add column if not exists current_weight numeric(5,1);

alter table public.workout_sessions
  add column if not exists workout_code text;

alter table public.workout_sessions
  add column if not exists workout_name text;

create table if not exists public.workout_session_exercises (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.workout_sessions (id) on delete cascade,
  exercise_id uuid references public.exercises (id) on delete set null,
  exercise_title text,
  exercise_details text,
  sort_order integer not null default 0
);

alter table public.workout_session_exercises
  alter column exercise_id drop not null;

alter table public.workout_session_exercises
  drop constraint if exists workout_session_exercises_session_id_exercise_id_key;

alter table public.workout_session_exercises
  add column if not exists exercise_title text;

alter table public.workout_session_exercises
  add column if not exists exercise_details text;

alter table public.workout_session_exercises
  add column if not exists sort_order integer not null default 0;

create index if not exists exercises_sort_order_idx
  on public.exercises (sort_order);

create index if not exists workout_sessions_user_date_idx
  on public.workout_sessions (user_id, workout_date desc);

create index if not exists workout_session_exercises_session_idx
  on public.workout_session_exercises (session_id);

create index if not exists workout_session_exercises_session_sort_idx
  on public.workout_session_exercises (session_id, sort_order);

alter table public.exercises enable row level security;
alter table public.workout_sessions enable row level security;
alter table public.workout_session_exercises enable row level security;

drop policy if exists "Authenticated users can read active exercises" on public.exercises;
create policy "Authenticated users can read active exercises"
on public.exercises
for select
to authenticated
using (is_active = true);

drop policy if exists "Users can read their own sessions" on public.workout_sessions;
create policy "Users can read their own sessions"
on public.workout_sessions
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can create their own sessions" on public.workout_sessions;
create policy "Users can create their own sessions"
on public.workout_sessions
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own sessions" on public.workout_sessions;
create policy "Users can update their own sessions"
on public.workout_sessions
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own sessions" on public.workout_sessions;
create policy "Users can delete their own sessions"
on public.workout_sessions
for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can read their own session exercises" on public.workout_session_exercises;
create policy "Users can read their own session exercises"
on public.workout_session_exercises
for select
to authenticated
using (
  exists (
    select 1
    from public.workout_sessions ws
    where ws.id = workout_session_exercises.session_id
      and ws.user_id = auth.uid()
  )
);

drop policy if exists "Users can create their own session exercises" on public.workout_session_exercises;
create policy "Users can create their own session exercises"
on public.workout_session_exercises
for insert
to authenticated
with check (
  exists (
    select 1
    from public.workout_sessions ws
    where ws.id = workout_session_exercises.session_id
      and ws.user_id = auth.uid()
  )
);

drop policy if exists "Users can delete their own session exercises" on public.workout_session_exercises;
create policy "Users can delete their own session exercises"
on public.workout_session_exercises
for delete
to authenticated
using (
  exists (
    select 1
    from public.workout_sessions ws
    where ws.id = workout_session_exercises.session_id
      and ws.user_id = auth.uid()
  )
);

insert into public.exercises (title, youtube_url, sort_order, is_active)
values
  ('Jumping Jacks', 'https://www.youtube.com/watch?v=c4DAnQ6DtF8', 1, true),
  ('Bodyweight Squats', 'https://www.youtube.com/watch?v=aclHkVaku9U', 2, true),
  ('Push-Ups', 'https://www.youtube.com/watch?v=IODxDxX7oi4', 3, true),
  ('Plank Hold', 'https://www.youtube.com/watch?v=pSHjTRCQxIw', 4, true),
  ('Reverse Lunges', 'https://www.youtube.com/watch?v=wrwwXE_x-pQ', 5, true)
on conflict do nothing;
