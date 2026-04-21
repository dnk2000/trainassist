import rawTrainingPlan from '../../training-plan.json';

function normalizeKey(value) {
  return value.trim().toLowerCase();
}

function humanize(value) {
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function joinParts(parts) {
  return parts.filter(Boolean).join(' • ');
}

function formatRounds(section) {
  if (section.rounds && section.rounds_max && section.rounds !== section.rounds_max) {
    return `${section.rounds}-${section.rounds_max} rounds`;
  }

  if (section.rounds_max) {
    return `1-${section.rounds_max} rounds`;
  }

  return section.rounds ? `${section.rounds} rounds` : null;
}

function formatExerciseDetails(exercise) {
  return joinParts([
    exercise.sets ? `${exercise.sets} set${exercise.sets === 1 ? '' : 's'}` : null,
    exercise.reps ? `${exercise.reps} reps` : null,
    exercise.reps_min && exercise.reps_max ? `${exercise.reps_min}-${exercise.reps_max} reps` : null,
    exercise.reps_min && !exercise.reps_max ? `${exercise.reps_min}+ reps` : null,
    exercise.reps_per_side ? `${exercise.reps_per_side}/side` : null,
    exercise.duration_seconds ? `${exercise.duration_seconds} sec` : null,
    exercise.duration_seconds_min && exercise.duration_seconds_max
      ? `${exercise.duration_seconds_min}-${exercise.duration_seconds_max} sec`
      : null,
    exercise.duration_seconds_min && !exercise.duration_seconds_max
      ? `${exercise.duration_seconds_min}+ sec`
      : null,
    exercise.reps_rule ? humanize(exercise.reps_rule) : null,
  ]);
}

function buildSharedWarmupSection(plan) {
  const warmup = plan.shared_warmup;

  return {
    id: 'shared-warmup',
    name: warmup.name,
    description: joinParts([
      warmup.estimated_duration_min ? `${warmup.estimated_duration_min} min` : null,
      'Start here',
    ]),
    items: warmup.exercises.map((exercise, index) => ({
      id: `shared-warmup-${index}-${normalizeKey(exercise.exercise)}`,
      title: exercise.exercise,
      details: formatExerciseDetails(exercise),
      normalizedTitle: normalizeKey(exercise.exercise),
      sortOrder: index,
    })),
  };
}

function buildSection(plan, section, startIndex) {
  if (section.use_shared_warmup) {
    const warmupSection = buildSharedWarmupSection(plan);

    return {
      ...warmupSection,
      items: warmupSection.items.map((item, index) => ({
        ...item,
        sortOrder: startIndex + index,
      })),
    };
  }

  if (Array.isArray(section.exercises)) {
    return {
      id: section.section_name,
      name: humanize(section.section_name),
      description: joinParts([
        section.format ? humanize(section.format) : null,
        section.duration_min ? `${section.duration_min} min` : null,
        section.duration_max ? `up to ${section.duration_max} min` : null,
        formatRounds(section),
      ]),
      items: section.exercises.map((exercise, index) => ({
        id: `${section.section_name}-${index}-${normalizeKey(exercise.exercise)}`,
        title: exercise.exercise,
        details: formatExerciseDetails(exercise),
        normalizedTitle: normalizeKey(exercise.exercise),
        sortOrder: startIndex + index,
      })),
    };
  }

  if (Array.isArray(section.exercise_options)) {
    const title = section.exercise_options.join(' or ');

    return {
      id: section.section_name,
      name: humanize(section.section_name),
      description: joinParts([
        humanize(section.format ?? ''),
        section.duration_min ? `${section.duration_min} min` : null,
        section.duration_max ? `up to ${section.duration_max} min` : null,
      ]),
      items: [
        {
          id: `${section.section_name}-options`,
          title,
          optionTitles: section.exercise_options,
          details: joinParts([
            section.work_seconds ? `${section.work_seconds} sec work` : null,
            section.rest_seconds ? `${section.rest_seconds} sec rest` : null,
          ]),
          normalizedTitle: normalizeKey(title),
          sortOrder: startIndex,
        },
      ],
    };
  }

  if (section.target_steps_min || section.target_steps_max) {
    return {
      id: section.section_name,
      name: humanize(section.section_name),
      description: section.duration_min ? `${section.duration_min} min` : null,
      items: [
        {
          id: `${section.section_name}-walk`,
          title: 'Walking',
          details: joinParts([
            section.target_steps_min && section.target_steps_max
              ? `${section.target_steps_min}-${section.target_steps_max} steps`
              : null,
          ]),
          normalizedTitle: normalizeKey('Walking'),
          sortOrder: startIndex,
        },
      ],
    };
  }

  return {
    id: section.section_name,
    name: humanize(section.section_name),
    description: null,
    items: [],
  };
}

export function getTrainingPlan() {
  return rawTrainingPlan;
}

export function getScheduledWorkoutCode(date = new Date()) {
  const plan = getTrainingPlan();
  const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const scheduleEntry = plan.weekly_schedule.find((entry) => entry.day === dayName);
  return scheduleEntry?.workout_type ?? null;
}

function buildWorkout(workoutCode, date = new Date()) {
  const plan = getTrainingPlan();
  const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const workout = workoutCode ? plan.workouts[workoutCode] : null;

  if (!workout) {
    return null;
  }

  if (workoutCode === 'rest') {
    return {
      dayName,
      workoutCode,
      workoutName: workout.name,
      estimatedDurationMin: null,
      sections: [],
      instructions: workout.instructions?.map(humanize) ?? [],
      isRestDay: true,
    };
  }

  let sortCursor = 0;
  const sections = (workout.sections ?? []).map((section) => {
    const builtSection = buildSection(plan, section, sortCursor);
    sortCursor += builtSection.items.length || 1;
    return builtSection;
  });

  return {
    dayName,
    workoutCode,
    workoutName: workout.name,
    estimatedDurationMin: workout.estimated_duration_min ?? null,
    sections,
    instructions: [],
    isRestDay: false,
  };
}

export function getWorkoutByCode(workoutCode, date = new Date()) {
  return buildWorkout(workoutCode, date);
}

export function getTodayWorkout(date = new Date()) {
  return buildWorkout(getScheduledWorkoutCode(date), date);
}

export function getWorkoutTabs() {
  const plan = getTrainingPlan();
  const seen = new Set();
  const tabs = [];

  for (const entry of plan.weekly_schedule) {
    if (seen.has(entry.workout_type)) {
      continue;
    }

    const workout = plan.workouts[entry.workout_type];

    if (!workout) {
      continue;
    }

    seen.add(entry.workout_type);
    tabs.push({
      code: entry.workout_type,
      label: entry.workout_type === 'light_activity' ? 'Light' : humanize(entry.workout_type),
      name: workout.name,
    });
  }

  return tabs;
}

export function attachExerciseLibrary(workout, exerciseLibrary) {
  if (!workout) {
    return null;
  }

  const libraryMap = new Map(
    exerciseLibrary.map((exercise) => [normalizeKey(exercise.title), exercise]),
  );

  return {
    ...workout,
    sections: workout.sections.map((section) => ({
      ...section,
      items: section.items.map((item) => {
        const directMatch = libraryMap.get(item.normalizedTitle) ?? null;
        const fallbackMatch =
          item.optionTitles
            ?.map((title) => libraryMap.get(normalizeKey(title)))
            .find(Boolean) ?? null;
        const libraryEntry = directMatch ?? fallbackMatch;

        return {
          ...item,
          exerciseId: libraryEntry?.id ?? null,
          youtube_url: libraryEntry?.youtube_url ?? null,
        };
      }),
    })),
  };
}
