-- Generated from training-plan.json
-- Run this in Supabase after the main schema to seed the exercise video library.

insert into public.exercises (title, youtube_url, sort_order, is_active)
select 'Band Pull-Apart', null, 1, true
where not exists (
  select 1
  from public.exercises
  where lower(title) = lower('Band Pull-Apart')
);

insert into public.exercises (title, youtube_url, sort_order, is_active)
select 'Bird Dog', null, 2, true
where not exists (
  select 1
  from public.exercises
  where lower(title) = lower('Bird Dog')
);

insert into public.exercises (title, youtube_url, sort_order, is_active)
select 'Burpees', null, 3, true
where not exists (
  select 1
  from public.exercises
  where lower(title) = lower('Burpees')
);

insert into public.exercises (title, youtube_url, sort_order, is_active)
select 'Cat-Cow', null, 4, true
where not exists (
  select 1
  from public.exercises
  where lower(title) = lower('Cat-Cow')
);

insert into public.exercises (title, youtube_url, sort_order, is_active)
select 'Chest Stretch', null, 5, true
where not exists (
  select 1
  from public.exercises
  where lower(title) = lower('Chest Stretch')
);

insert into public.exercises (title, youtube_url, sort_order, is_active)
select 'Dead Bug', null, 6, true
where not exists (
  select 1
  from public.exercises
  where lower(title) = lower('Dead Bug')
);

insert into public.exercises (title, youtube_url, sort_order, is_active)
select 'Glute Bridge', null, 7, true
where not exists (
  select 1
  from public.exercises
  where lower(title) = lower('Glute Bridge')
);

insert into public.exercises (title, youtube_url, sort_order, is_active)
select 'High Knees', null, 8, true
where not exists (
  select 1
  from public.exercises
  where lower(title) = lower('High Knees')
);

insert into public.exercises (title, youtube_url, sort_order, is_active)
select 'Jump Squats', null, 9, true
where not exists (
  select 1
  from public.exercises
  where lower(title) = lower('Jump Squats')
);

insert into public.exercises (title, youtube_url, sort_order, is_active)
select 'Leg Raises', null, 10, true
where not exists (
  select 1
  from public.exercises
  where lower(title) = lower('Leg Raises')
);

insert into public.exercises (title, youtube_url, sort_order, is_active)
select 'Mountain Climbers', null, 11, true
where not exists (
  select 1
  from public.exercises
  where lower(title) = lower('Mountain Climbers')
);

insert into public.exercises (title, youtube_url, sort_order, is_active)
select 'Plank', null, 12, true
where not exists (
  select 1
  from public.exercises
  where lower(title) = lower('Plank')
);

insert into public.exercises (title, youtube_url, sort_order, is_active)
select 'Prone W Raise', null, 13, true
where not exists (
  select 1
  from public.exercises
  where lower(title) = lower('Prone W Raise')
);

insert into public.exercises (title, youtube_url, sort_order, is_active)
select 'Pull-Ups', null, 14, true
where not exists (
  select 1
  from public.exercises
  where lower(title) = lower('Pull-Ups')
);

insert into public.exercises (title, youtube_url, sort_order, is_active)
select 'Push-Ups', null, 15, true
where not exists (
  select 1
  from public.exercises
  where lower(title) = lower('Push-Ups')
);

insert into public.exercises (title, youtube_url, sort_order, is_active)
select 'Resistance Band Row', null, 16, true
where not exists (
  select 1
  from public.exercises
  where lower(title) = lower('Resistance Band Row')
);

insert into public.exercises (title, youtube_url, sort_order, is_active)
select 'Russian Twist', null, 17, true
where not exists (
  select 1
  from public.exercises
  where lower(title) = lower('Russian Twist')
);

insert into public.exercises (title, youtube_url, sort_order, is_active)
select 'Scapular Pull-Ups', null, 18, true
where not exists (
  select 1
  from public.exercises
  where lower(title) = lower('Scapular Pull-Ups')
);

insert into public.exercises (title, youtube_url, sort_order, is_active)
select 'Squats', null, 19, true
where not exists (
  select 1
  from public.exercises
  where lower(title) = lower('Squats')
);

insert into public.exercises (title, youtube_url, sort_order, is_active)
select 'Thoracic Rotation (Open Book)', null, 20, true
where not exists (
  select 1
  from public.exercises
  where lower(title) = lower('Thoracic Rotation (Open Book)')
);

insert into public.exercises (title, youtube_url, sort_order, is_active)
select 'Walking', null, 21, true
where not exists (
  select 1
  from public.exercises
  where lower(title) = lower('Walking')
);
