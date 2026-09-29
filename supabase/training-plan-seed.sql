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
select 'Bodyweight Squats', null, 3, true
where not exists (
  select 1
  from public.exercises
  where lower(title) = lower('Bodyweight Squats')
);

insert into public.exercises (title, youtube_url, sort_order, is_active)
select 'Burpees', null, 4, true
where not exists (
  select 1
  from public.exercises
  where lower(title) = lower('Burpees')
);

insert into public.exercises (title, youtube_url, sort_order, is_active)
select 'Calf Raises', null, 5, true
where not exists (
  select 1
  from public.exercises
  where lower(title) = lower('Calf Raises')
);

insert into public.exercises (title, youtube_url, sort_order, is_active)
select 'Cat-Cow', null, 6, true
where not exists (
  select 1
  from public.exercises
  where lower(title) = lower('Cat-Cow')
);

insert into public.exercises (title, youtube_url, sort_order, is_active)
select 'Chest Stretch', null, 7, true
where not exists (
  select 1
  from public.exercises
  where lower(title) = lower('Chest Stretch')
);

insert into public.exercises (title, youtube_url, sort_order, is_active)
select 'Clamshell', null, 8, true
where not exists (
  select 1
  from public.exercises
  where lower(title) = lower('Clamshell')
);

insert into public.exercises (title, youtube_url, sort_order, is_active)
select 'Dead Bug', null, 9, true
where not exists (
  select 1
  from public.exercises
  where lower(title) = lower('Dead Bug')
);

insert into public.exercises (title, youtube_url, sort_order, is_active)
select 'Dead Bug (Arms Resting)', null, 10, true
where not exists (
  select 1
  from public.exercises
  where lower(title) = lower('Dead Bug (Arms Resting)')
);

insert into public.exercises (title, youtube_url, sort_order, is_active)
select 'Glute Bridge', null, 11, true
where not exists (
  select 1
  from public.exercises
  where lower(title) = lower('Glute Bridge')
);

insert into public.exercises (title, youtube_url, sort_order, is_active)
select 'Heel Slides', null, 12, true
where not exists (
  select 1
  from public.exercises
  where lower(title) = lower('Heel Slides')
);

insert into public.exercises (title, youtube_url, sort_order, is_active)
select 'High Knees', null, 13, true
where not exists (
  select 1
  from public.exercises
  where lower(title) = lower('High Knees')
);

insert into public.exercises (title, youtube_url, sort_order, is_active)
select 'Jump Squats', null, 14, true
where not exists (
  select 1
  from public.exercises
  where lower(title) = lower('Jump Squats')
);

insert into public.exercises (title, youtube_url, sort_order, is_active)
select 'Leg Raises', null, 15, true
where not exists (
  select 1
  from public.exercises
  where lower(title) = lower('Leg Raises')
);

insert into public.exercises (title, youtube_url, sort_order, is_active)
select 'Marching in Place', null, 16, true
where not exists (
  select 1
  from public.exercises
  where lower(title) = lower('Marching in Place')
);

insert into public.exercises (title, youtube_url, sort_order, is_active)
select 'Mountain Climbers', null, 17, true
where not exists (
  select 1
  from public.exercises
  where lower(title) = lower('Mountain Climbers')
);

insert into public.exercises (title, youtube_url, sort_order, is_active)
select 'Plank', null, 18, true
where not exists (
  select 1
  from public.exercises
  where lower(title) = lower('Plank')
);

insert into public.exercises (title, youtube_url, sort_order, is_active)
select 'Prone W Raise', null, 19, true
where not exists (
  select 1
  from public.exercises
  where lower(title) = lower('Prone W Raise')
);

insert into public.exercises (title, youtube_url, sort_order, is_active)
select 'Pull-Ups', null, 20, true
where not exists (
  select 1
  from public.exercises
  where lower(title) = lower('Pull-Ups')
);

insert into public.exercises (title, youtube_url, sort_order, is_active)
select 'Push-Ups', null, 21, true
where not exists (
  select 1
  from public.exercises
  where lower(title) = lower('Push-Ups')
);

insert into public.exercises (title, youtube_url, sort_order, is_active)
select 'Resistance Band Row', null, 22, true
where not exists (
  select 1
  from public.exercises
  where lower(title) = lower('Resistance Band Row')
);

insert into public.exercises (title, youtube_url, sort_order, is_active)
select 'Russian Twist', null, 23, true
where not exists (
  select 1
  from public.exercises
  where lower(title) = lower('Russian Twist')
);

insert into public.exercises (title, youtube_url, sort_order, is_active)
select 'Scapular Pull-Ups', null, 24, true
where not exists (
  select 1
  from public.exercises
  where lower(title) = lower('Scapular Pull-Ups')
);

insert into public.exercises (title, youtube_url, sort_order, is_active)
select 'Shoulder Blade Squeeze', null, 25, true
where not exists (
  select 1
  from public.exercises
  where lower(title) = lower('Shoulder Blade Squeeze')
);

insert into public.exercises (title, youtube_url, sort_order, is_active)
select 'Side-Lying Leg Raise', null, 26, true
where not exists (
  select 1
  from public.exercises
  where lower(title) = lower('Side-Lying Leg Raise')
);

insert into public.exercises (title, youtube_url, sort_order, is_active)
select 'Sit-to-Stand', null, 27, true
where not exists (
  select 1
  from public.exercises
  where lower(title) = lower('Sit-to-Stand')
);

insert into public.exercises (title, youtube_url, sort_order, is_active)
select 'Squats', null, 28, true
where not exists (
  select 1
  from public.exercises
  where lower(title) = lower('Squats')
);

insert into public.exercises (title, youtube_url, sort_order, is_active)
select 'Step Touch', null, 29, true
where not exists (
  select 1
  from public.exercises
  where lower(title) = lower('Step Touch')
);

insert into public.exercises (title, youtube_url, sort_order, is_active)
select 'Supine March', null, 30, true
where not exists (
  select 1
  from public.exercises
  where lower(title) = lower('Supine March')
);

insert into public.exercises (title, youtube_url, sort_order, is_active)
select 'Supine Pelvic Tilt', null, 31, true
where not exists (
  select 1
  from public.exercises
  where lower(title) = lower('Supine Pelvic Tilt')
);

insert into public.exercises (title, youtube_url, sort_order, is_active)
select 'Thoracic Rotation (Open Book)', null, 32, true
where not exists (
  select 1
  from public.exercises
  where lower(title) = lower('Thoracic Rotation (Open Book)')
);

insert into public.exercises (title, youtube_url, sort_order, is_active)
select 'Walking', null, 33, true
where not exists (
  select 1
  from public.exercises
  where lower(title) = lower('Walking')
);

insert into public.exercises (title, youtube_url, sort_order, is_active)
select 'Wall Sit', null, 34, true
where not exists (
  select 1
  from public.exercises
  where lower(title) = lower('Wall Sit')
);
