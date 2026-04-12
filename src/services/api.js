import { supabase } from './supabase';

export async function getExerciseLibrary() {
  const { data, error } = await supabase
    .from('exercises')
    .select('id, title, youtube_url, sort_order')
    .eq('is_active', true)
    .order('sort_order', { ascending: true, nullsFirst: false })
    .order('title', { ascending: true });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function getLatestSavedWeight(userId) {
  if (!userId) {
    return null;
  }

  const { data, error } = await supabase
    .from('workout_sessions')
    .select('current_weight')
    .eq('user_id', userId)
    .not('current_weight', 'is', null)
    .order('workout_date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data?.current_weight ?? null;
}

export async function saveWorkoutSession({
  userId,
  workoutDate,
  items,
  currentWeight,
  workoutCode,
  workoutName,
}) {
  if (!userId) {
    throw new Error('You must be signed in to save a workout.');
  }

  if (!items.length) {
    throw new Error('Select at least one item before saving.');
  }

  const { data: existingSession, error: existingSessionError } = await supabase
    .from('workout_sessions')
    .select('id')
    .eq('user_id', userId)
    .eq('workout_date', workoutDate)
    .maybeSingle();

  if (existingSessionError) {
    throw existingSessionError;
  }

  let sessionId = existingSession?.id;

  if (sessionId) {
    const { error: updateSessionError } = await supabase
      .from('workout_sessions')
      .update({
        current_weight: currentWeight,
        workout_code: workoutCode,
        workout_name: workoutName,
      })
      .eq('id', sessionId);

    if (updateSessionError) {
      throw updateSessionError;
    }

    const { error: deletePreviousError } = await supabase
      .from('workout_session_exercises')
      .delete()
      .eq('session_id', sessionId);

    if (deletePreviousError) {
      throw deletePreviousError;
    }
  } else {
    const { data: createdSession, error: sessionError } = await supabase
      .from('workout_sessions')
      .insert({
        user_id: userId,
        workout_date: workoutDate,
        current_weight: currentWeight,
        workout_code: workoutCode,
        workout_name: workoutName,
      })
      .select('id')
      .single();

    if (sessionError) {
      throw sessionError;
    }

    sessionId = createdSession.id;
  }

  const rows = items.map((item, index) => ({
    session_id: sessionId,
    exercise_id: item.exerciseId ?? null,
    exercise_title: item.title,
    exercise_details: item.details ?? null,
    sort_order: item.sortOrder ?? index,
  }));

  const { error: exerciseError } = await supabase
    .from('workout_session_exercises')
    .insert(rows);

  if (exerciseError) {
    throw exerciseError;
  }

  return sessionId;
}

export async function getWorkoutHistory(userId) {
  if (!userId) {
    return [];
  }

  const { data, error } = await supabase
    .from('workout_sessions')
    .select(
      `
        id,
        workout_date,
        created_at,
        current_weight,
        workout_code,
        workout_name,
        workout_session_exercises (
          id,
          exercise_title,
          exercise_details,
          sort_order,
          exercise:exercises (
            id,
            title
          )
        )
      `,
    )
    .eq('user_id', userId)
    .order('workout_date', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((session) => ({
    ...session,
    exercises: (session.workout_session_exercises ?? [])
      .sort((left, right) => (left.sort_order ?? 0) - (right.sort_order ?? 0))
      .map((item) => ({
        id: item.id,
        title: item.exercise_title ?? item.exercise?.title ?? 'Untitled exercise',
        details: item.exercise_details ?? null,
      })),
  }));
}
