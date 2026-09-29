import rawTrainingPlan from '../../training-plan.json';
import { hasExerciseSettingValue, normalizeExerciseKey } from './exerciseSettings';

function normalizeKey(value) {
  return normalizeExerciseKey(value);
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
    exercise.notes ?? null,
  ]);
}

function getExerciseParameters(exercise) {
  return {
    sets: exercise.sets ? String(exercise.sets) : '',
    reps: exercise.reps ? String(exercise.reps) : '',
    repsMin: exercise.reps_min ? String(exercise.reps_min) : '',
    repsMax: exercise.reps_max ? String(exercise.reps_max) : '',
    repsPerSide: exercise.reps_per_side ? String(exercise.reps_per_side) : '',
    durationSeconds: exercise.duration_seconds ? String(exercise.duration_seconds) : '',
    durationSecondsMin: exercise.duration_seconds_min
      ? String(exercise.duration_seconds_min)
      : '',
    durationSecondsMax: exercise.duration_seconds_max
      ? String(exercise.duration_seconds_max)
      : '',
    repsRule: exercise.reps_rule ?? '',
    youtubeUrl: '',
    notes: exercise.notes ?? '',
  };
}

function mergeExerciseParameters(currentParameters = {}, nextParameters = {}) {
  return Object.entries(nextParameters).reduce(
    (mergedParameters, [field, value]) => ({
      ...mergedParameters,
      [field]: mergedParameters[field] || value,
    }),
    { ...currentParameters },
  );
}

function buildExerciseDetailsFromSettings(settings) {
  return joinParts([
    settings.sets ? `${settings.sets} set${settings.sets === '1' ? '' : 's'}` : null,
    settings.reps ? `${settings.reps} reps` : null,
    settings.repsMin && settings.repsMax ? `${settings.repsMin}-${settings.repsMax} reps` : null,
    settings.repsMin && !settings.repsMax ? `${settings.repsMin}+ reps` : null,
    settings.repsPerSide ? `${settings.repsPerSide}/side` : null,
    settings.durationSeconds ? `${settings.durationSeconds} sec` : null,
    settings.durationSecondsMin && settings.durationSecondsMax
      ? `${settings.durationSecondsMin}-${settings.durationSecondsMax} sec`
      : null,
    settings.durationSecondsMin && !settings.durationSecondsMax
      ? `${settings.durationSecondsMin}+ sec`
      : null,
    settings.repsRule ? humanize(settings.repsRule) : null,
    settings.notes ? settings.notes : null,
  ]);
}

function buildExerciseItem({ exercise, id, sortOrder }) {
  const parameters = getExerciseParameters(exercise);

  return {
    id,
    title: exercise.exercise,
    details: formatExerciseDetails(exercise),
    defaultDetails: formatExerciseDetails(exercise),
    parameters,
    normalizedTitle: normalizeKey(exercise.exercise),
    sortOrder,
    safeWithBrokenArm: exercise.safe_with_broken_arm === true,
    brokenArmModeOnly: exercise.broken_arm_mode_only === true,
  };
}

function shouldIncludeExercise(exercise, brokenArmMode) {
  if (brokenArmMode) {
    return exercise.safe_with_broken_arm === true;
  }

  return exercise.broken_arm_mode_only !== true;
}

function normalizeExerciseOption(option) {
  return typeof option === 'string' ? { exercise: option } : option;
}

function buildSharedWarmupSection(plan, brokenArmMode) {
  const warmup = plan.shared_warmup;
  const exercises = warmup.exercises.filter((exercise) =>
    shouldIncludeExercise(exercise, brokenArmMode),
  );

  return {
    id: 'shared-warmup',
    name: warmup.name,
    description: joinParts([
      warmup.estimated_duration_min ? `${warmup.estimated_duration_min} min` : null,
      'Start here',
    ]),
    items: exercises.map((exercise, index) =>
      buildExerciseItem({
        exercise,
        id: `shared-warmup-${index}-${normalizeKey(exercise.exercise)}`,
        sortOrder: index,
      }),
    ),
  };
}

function buildSection(plan, section, startIndex, brokenArmMode) {
  if (section.use_shared_warmup) {
    const warmupSection = buildSharedWarmupSection(plan, brokenArmMode);

    return {
      ...warmupSection,
      items: warmupSection.items.map((item, index) => ({
        ...item,
        sortOrder: startIndex + index,
      })),
    };
  }

  if (Array.isArray(section.exercises)) {
    const exercises = section.exercises.filter((exercise) =>
      shouldIncludeExercise(exercise, brokenArmMode),
    );

    return {
      id: section.section_name,
      name: humanize(section.section_name),
      description: joinParts([
        section.format ? humanize(section.format) : null,
        section.duration_min ? `${section.duration_min} min` : null,
        section.duration_max ? `up to ${section.duration_max} min` : null,
        formatRounds(section),
      ]),
      items: exercises.map((exercise, index) =>
        buildExerciseItem({
          exercise,
          id: `${section.section_name}-${index}-${normalizeKey(exercise.exercise)}`,
          sortOrder: startIndex + index,
        }),
      ),
    };
  }

  if (Array.isArray(section.exercise_options)) {
    const exerciseOptions = section.exercise_options
      .map(normalizeExerciseOption)
      .filter((exercise) => shouldIncludeExercise(exercise, brokenArmMode));
    const title = exerciseOptions.map((exercise) => exercise.exercise).join(' or ');

    return {
      id: section.section_name,
      name: humanize(section.section_name),
      description: joinParts([
        humanize(section.format ?? ''),
        section.duration_min ? `${section.duration_min} min` : null,
        section.duration_max ? `up to ${section.duration_max} min` : null,
      ]),
      items: exerciseOptions.length
        ? [{
          id: `${section.section_name}-options`,
          title,
          optionTitles: exerciseOptions.map((exercise) => exercise.exercise),
          details: joinParts([
            section.work_seconds ? `${section.work_seconds} sec work` : null,
            section.rest_seconds ? `${section.rest_seconds} sec rest` : null,
          ]),
          normalizedTitle: normalizeKey(title),
          sortOrder: startIndex,
          safeWithBrokenArm: exerciseOptions.every(
            (exercise) => exercise.safe_with_broken_arm === true,
          ),
        }]
        : [],
    };
  }

  if (section.target_steps_min || section.target_steps_max) {
    return {
      id: section.section_name,
      name: humanize(section.section_name),
      description: section.duration_min ? `${section.duration_min} min` : null,
      items: !brokenArmMode || section.safe_with_broken_arm === true
        ? [{
          id: `${section.section_name}-walk`,
          title: 'Walking',
          details: joinParts([
            section.target_steps_min && section.target_steps_max
              ? `${section.target_steps_min}-${section.target_steps_max} steps`
              : null,
            section.notes ?? null,
          ]),
          normalizedTitle: normalizeKey('Walking'),
          sortOrder: startIndex,
          safeWithBrokenArm: section.safe_with_broken_arm === true,
        }]
        : [],
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

function buildWorkout(workoutCode, date = new Date(), { brokenArmMode = false } = {}) {
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
  const sections = (workout.sections ?? [])
    .map((section) => {
      const builtSection = buildSection(plan, section, sortCursor, brokenArmMode);
      sortCursor += builtSection.items.length || 1;
      return builtSection;
    })
    .filter((section) => !brokenArmMode || section.items.length > 0);

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

export function getWorkoutByCode(workoutCode, date = new Date(), options = {}) {
  return buildWorkout(workoutCode, date, options);
}

export function getTodayWorkout(date = new Date(), options = {}) {
  return buildWorkout(getScheduledWorkoutCode(date), date, options);
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

export function getConfigurableExercises() {
  const plan = getTrainingPlan();
  const exercisesByKey = new Map();

  function addExercise(exercise, workoutName) {
    const normalizedExercise = normalizeExerciseOption(exercise);
    const key = normalizeKey(normalizedExercise.exercise);
    const existingExercise = exercisesByKey.get(key);
    const parameters = getExerciseParameters(normalizedExercise);

    exercisesByKey.set(key, {
      key,
      title: normalizedExercise.exercise,
      parameters: mergeExerciseParameters(existingExercise?.parameters, parameters),
      safeWithBrokenArm: normalizedExercise.safe_with_broken_arm === true,
      brokenArmModeOnly: normalizedExercise.broken_arm_mode_only === true,
      workoutNames: Array.from(
        new Set([...(existingExercise?.workoutNames ?? []), workoutName].filter(Boolean)),
      ),
    });
  }

  plan.shared_warmup.exercises.forEach((exercise) => addExercise(exercise, plan.shared_warmup.name));

  Object.values(plan.workouts).forEach((workout) => {
    workout.sections?.forEach((section) => {
      section.exercises?.forEach((exercise) => addExercise(exercise, workout.name));
      section.exercise_options?.forEach((exerciseOption) => {
        const normalizedOption = normalizeExerciseOption(exerciseOption);

        addExercise(
          {
            ...normalizedOption,
            duration_seconds: section.work_seconds,
          },
          workout.name,
        );
      });

      if (section.target_steps_min || section.target_steps_max) {
        addExercise(
          {
            exercise: 'Walking',
            safe_with_broken_arm: section.safe_with_broken_arm === true,
          },
          workout.name,
        );
      }
    });
  });

  return Array.from(exercisesByKey.values()).sort((left, right) =>
    left.title.localeCompare(right.title),
  );
}

export function attachExerciseLibrary(workout, exerciseLibrary, exerciseSettings = {}) {
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
        const settings = exerciseSettings[item.normalizedTitle] ?? {};
        const overrideDetails = hasExerciseSettingValue(settings)
          ? buildExerciseDetailsFromSettings({
              ...(item.parameters ?? {}),
              ...settings,
            })
          : '';
        const overrideYoutubeUrl = settings.youtubeUrl?.trim();

        return {
          ...item,
          details: overrideDetails || item.details,
          exerciseId: libraryEntry?.id ?? null,
          youtube_url: overrideYoutubeUrl || (libraryEntry?.youtube_url ?? null),
        };
      }),
    })),
  };
}
