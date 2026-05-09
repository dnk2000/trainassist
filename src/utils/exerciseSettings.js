const STORAGE_KEY_PREFIX = 'trainassist:exercise-settings';

export const EXERCISE_SETTING_FIELDS = [
  'sets',
  'reps',
  'repsMin',
  'repsMax',
  'repsPerSide',
  'durationSeconds',
  'durationSecondsMin',
  'durationSecondsMax',
  'repsRule',
  'youtubeUrl',
  'notes',
];

export function normalizeExerciseKey(value) {
  return value.trim().toLowerCase();
}

export function getExerciseSettingsStorageKey(userId) {
  if (!userId) {
    return '';
  }

  return `${STORAGE_KEY_PREFIX}:${userId}`;
}

function sanitizeExerciseSettings(settings) {
  return EXERCISE_SETTING_FIELDS.reduce((cleanedSettings, field) => {
    const value = settings?.[field];

    cleanedSettings[field] = value === null || value === undefined ? '' : String(value);
    return cleanedSettings;
  }, {});
}

export function readExerciseSettings(userId) {
  const storageKey = getExerciseSettingsStorageKey(userId);

  if (!storageKey) {
    return {};
  }

  try {
    const savedSettings = window.localStorage.getItem(storageKey);
    const parsedSettings = savedSettings ? JSON.parse(savedSettings) : {};

    return Object.entries(parsedSettings).reduce((settingsByExercise, [exerciseKey, settings]) => {
      settingsByExercise[exerciseKey] = sanitizeExerciseSettings(settings);
      return settingsByExercise;
    }, {});
  } catch {
    return {};
  }
}

export function writeExerciseSettings(userId, settingsByExercise) {
  const storageKey = getExerciseSettingsStorageKey(userId);

  if (!storageKey) {
    return;
  }

  window.localStorage.setItem(storageKey, JSON.stringify(settingsByExercise));
}

export function clearExerciseSettings(userId) {
  const storageKey = getExerciseSettingsStorageKey(userId);

  if (storageKey) {
    window.localStorage.removeItem(storageKey);
  }
}

export function hasExerciseSettingValue(settings) {
  return EXERCISE_SETTING_FIELDS.some((field) => settings?.[field]?.trim());
}
