import { supabase } from './supabase';

const WORKOUT_IMAGES_BUCKET = 'workout-images';

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

export async function updateUserProfile({ firstName, lastName }) {
  const { error } = await supabase.auth.updateUser({
    data: {
      first_name: firstName,
      last_name: lastName,
    },
  });

  if (error) {
    throw error;
  }
}

export async function updateUserPassword({ password }) {
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    throw error;
  }
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
  comment,
  imagePaths,
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
    .select('id, image_paths')
    .eq('user_id', userId)
    .eq('workout_date', workoutDate)
    .maybeSingle();

  if (existingSessionError) {
    throw existingSessionError;
  }

  let sessionId = existingSession?.id;

  if (sessionId) {
    const updatePayload = {
      current_weight: currentWeight,
      comment,
      workout_code: workoutCode,
      workout_name: workoutName,
    };

    if (imagePaths !== undefined) {
      updatePayload.image_paths = imagePaths;
    }

    const { error: updateSessionError } = await supabase
      .from('workout_sessions')
      .update(updatePayload)
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
        comment,
        image_paths: imagePaths ?? [],
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

  if (imagePaths !== undefined) {
    const previousPaths = existingSession?.image_paths ?? [];
    const nextPaths = imagePaths ?? [];
    const stalePaths = previousPaths.filter((path) => !nextPaths.includes(path));

    if (stalePaths.length) {
      const { error: storageError } = await supabase.storage
        .from(WORKOUT_IMAGES_BUCKET)
        .remove(stalePaths);

      if (storageError) {
        console.error(storageError);
      }
    }
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
        comment,
        image_paths,
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

  const sessions = await Promise.all(
    (data ?? []).map(async (session) => ({
      ...session,
      images: await getWorkoutImageUrls(session.image_paths ?? []),
      exercises: (session.workout_session_exercises ?? [])
        .sort((left, right) => (left.sort_order ?? 0) - (right.sort_order ?? 0))
        .map((item) => ({
          id: item.id,
          title: item.exercise_title ?? item.exercise?.title ?? 'Untitled exercise',
          details: item.exercise_details ?? null,
        })),
    })),
  );

  return sessions;
}

export async function getWorkoutProgressSessions(userId) {
  if (!userId) {
    return [];
  }

  const { data, error } = await supabase
    .from('workout_sessions')
    .select('id, workout_date, created_at, current_weight')
    .eq('user_id', userId)
    .order('workout_date', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function uploadWorkoutImages({ userId, workoutDate, files }) {
  if (!userId || !workoutDate || !files?.length) {
    throw new Error('Missing image upload data.');
  }

  const uploadedPaths = [];

  for (const [index, file] of files.entries()) {
    const safeExtension = file.name?.split('.').pop()?.toLowerCase();
    const extension =
      safeExtension && /^[a-z0-9]+$/.test(safeExtension)
        ? safeExtension
        : file.type?.split('/').pop()?.toLowerCase() || 'jpg';
    const path = `${userId}/${workoutDate}/${Date.now()}-${index}.${extension}`;

    const { error } = await supabase.storage
      .from(WORKOUT_IMAGES_BUCKET)
      .upload(path, file, {
        upsert: false,
        contentType: file.type || undefined,
      });

    if (error) {
      if (uploadedPaths.length) {
        await supabase.storage.from(WORKOUT_IMAGES_BUCKET).remove(uploadedPaths);
      }
      throw error;
    }

    uploadedPaths.push(path);
  }

  return uploadedPaths;
}

export async function getWorkoutImageUrls(imagePaths) {
  if (!imagePaths?.length) {
    return [];
  }

  const { data, error } = await supabase.storage
    .from(WORKOUT_IMAGES_BUCKET)
    .createSignedUrls(imagePaths, 60 * 60);

  if (error) {
    throw error;
  }

  return (data ?? [])
    .map((item, index) => ({
      path: imagePaths[index],
      url: item?.signedUrl ?? null,
    }))
    .filter((item) => item.url);
}

export async function deleteWorkoutPhoto({ sessionId, imagePath }) {
  if (!sessionId || !imagePath) {
    throw new Error('Missing workout photo data.');
  }

  const { data: session, error: sessionError } = await supabase
    .from('workout_sessions')
    .select('image_paths')
    .eq('id', sessionId)
    .maybeSingle();

  if (sessionError) {
    throw sessionError;
  }

  const nextImagePaths = (session?.image_paths ?? []).filter((path) => path !== imagePath);

  const { error: updateError } = await supabase
    .from('workout_sessions')
    .update({ image_paths: nextImagePaths })
    .eq('id', sessionId);

  if (updateError) {
    throw updateError;
  }

  const { error: storageError } = await supabase.storage
    .from(WORKOUT_IMAGES_BUCKET)
    .remove([imagePath]);

  if (storageError) {
    console.error(storageError);
  }
}

export async function deleteWorkoutSession({ sessionId, imagePaths = [] }) {
  if (!sessionId) {
    throw new Error('Missing workout session id.');
  }

  const { error } = await supabase
    .from('workout_sessions')
    .delete()
    .eq('id', sessionId);

  if (error) {
    throw error;
  }

  if (imagePaths.length) {
    const { error: storageError } = await supabase.storage
      .from(WORKOUT_IMAGES_BUCKET)
      .remove(imagePaths);

    if (storageError) {
      console.error(storageError);
    }
  }
}
