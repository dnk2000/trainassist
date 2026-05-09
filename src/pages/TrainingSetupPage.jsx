import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { getExerciseLibrary } from '../services/api';
import {
  clearExerciseSettings,
  hasExerciseSettingValue,
  normalizeExerciseKey,
  readExerciseSettings,
  writeExerciseSettings,
} from '../utils/exerciseSettings';
import { getConfigurableExercises } from '../utils/trainingPlan';

const FIELD_GROUPS = [
  [
    { key: 'sets', label: 'Sets', inputMode: 'numeric' },
    { key: 'reps', label: 'Reps', inputMode: 'numeric' },
    { key: 'repsPerSide', label: 'Per side', inputMode: 'numeric' },
  ],
  [
    { key: 'repsMin', label: 'Min reps', inputMode: 'numeric' },
    { key: 'repsMax', label: 'Max reps', inputMode: 'numeric' },
    { key: 'durationSeconds', label: 'Sec', inputMode: 'numeric' },
  ],
  [
    { key: 'durationSecondsMin', label: 'Min sec', inputMode: 'numeric' },
    { key: 'durationSecondsMax', label: 'Max sec', inputMode: 'numeric' },
    { key: 'repsRule', label: 'Rule' },
  ],
];

function mergeExercisesWithLibrary(exercises, exerciseLibrary) {
  const libraryMap = new Map(
    exerciseLibrary.map((exercise) => [normalizeExerciseKey(exercise.title), exercise]),
  );

  return exercises.map((exercise) => {
    const libraryEntry = libraryMap.get(exercise.key);

    return {
      ...exercise,
      parameters: {
        ...exercise.parameters,
        youtubeUrl: libraryEntry?.youtube_url ?? '',
      },
    };
  });
}

function getFieldValue(settingsByExercise, exerciseKey, field) {
  return settingsByExercise[exerciseKey]?.[field] ?? '';
}

function getEditedCount(settingsByExercise) {
  return Object.values(settingsByExercise).filter(hasExerciseSettingValue).length;
}

function TrainingSetupPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [exerciseLibrary, setExerciseLibrary] = useState([]);
  const [settingsByExercise, setSettingsByExercise] = useState(() =>
    readExerciseSettings(user.id),
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const configurableExercises = useMemo(() => getConfigurableExercises(), []);
  const exercises = useMemo(
    () => mergeExercisesWithLibrary(configurableExercises, exerciseLibrary),
    [configurableExercises, exerciseLibrary],
  );
  const editedCount = getEditedCount(settingsByExercise);

  useEffect(() => {
    setSettingsByExercise(readExerciseSettings(user.id));
  }, [user.id]);

  useEffect(() => {
    let active = true;

    async function loadExerciseLibrary() {
      try {
        const libraryData = await getExerciseLibrary();

        if (active) {
          setExerciseLibrary(libraryData);
          setError('');
        }
      } catch (loadError) {
        if (active) {
          setError(loadError.message);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadExerciseLibrary();

    return () => {
      active = false;
    };
  }, []);

  function updateExerciseField(exerciseKey, field, value) {
    setSettingsByExercise((currentSettings) => ({
      ...currentSettings,
      [exerciseKey]: {
        ...(currentSettings[exerciseKey] ?? {}),
        [field]: value,
      },
    }));
  }

  function resetExercise(exerciseKey) {
    setSettingsByExercise((currentSettings) => {
      const nextSettings = { ...currentSettings };
      delete nextSettings[exerciseKey];
      return nextSettings;
    });
  }

  function handleSave() {
    writeExerciseSettings(user.id, settingsByExercise);
    showToast('Training setup saved.', 'success');
  }

  function handleResetAll() {
    clearExerciseSettings(user.id);
    setSettingsByExercise({});
    showToast('Training setup reset.', 'success');
  }

  return (
    <section className="space-y-5">
      <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm shadow-slate-200/70">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-700">
          Adjustments
        </p>
        <div className="mt-2 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-950">Training setup</h2>
            <p className="mt-2 text-sm text-slate-600">
              Tune reps, seconds, rules, notes, and video links for each exercise.
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">
            {editedCount} edited
          </span>
        </div>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-slate-100 bg-white px-5 py-10 text-center text-slate-600 shadow-sm shadow-slate-200/70">
          Loading exercises...
        </div>
      ) : null}

      {!loading && error ? (
        <div className="rounded-3xl border border-amber-300/40 bg-amber-50 px-5 py-4 text-sm text-amber-800">
          Videos could not be loaded: {error}. You can still edit plan parameters.
        </div>
      ) : null}

      {!loading ? (
        <div className="space-y-4">
          {exercises.map((exercise) => (
            <article
              key={exercise.key}
              className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm shadow-slate-200/60"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold leading-tight text-slate-950">
                    {exercise.title}
                  </h3>
                  {exercise.workoutNames.length ? (
                    <p className="mt-1 text-xs text-slate-500">
                      {exercise.workoutNames.join(' · ')}
                    </p>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => resetExercise(exercise.key)}
                  className="min-h-9 shrink-0 rounded-full bg-slate-100 px-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-200"
                >
                  Reset
                </button>
              </div>

              <div className="mt-4 space-y-3">
                {FIELD_GROUPS.map((fields) => (
                  <div key={fields.map((field) => field.key).join('-')} className="grid grid-cols-3 gap-2">
                    {fields.map((field) => (
                      <label key={field.key} className="block">
                        <span className="text-xs font-medium text-slate-500">{field.label}</span>
                        <input
                          type="text"
                          inputMode={field.inputMode}
                          value={getFieldValue(settingsByExercise, exercise.key, field.key)}
                          placeholder={exercise.parameters[field.key]}
                          onChange={(event) =>
                            updateExerciseField(exercise.key, field.key, event.target.value)
                          }
                          className="mt-1 h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-950 focus:bg-white"
                        />
                      </label>
                    ))}
                  </div>
                ))}

                <label className="block">
                  <span className="text-xs font-medium text-slate-500">Video URL</span>
                  <input
                    type="url"
                    value={getFieldValue(settingsByExercise, exercise.key, 'youtubeUrl')}
                    placeholder={exercise.parameters.youtubeUrl || 'https://youtube.com/...'}
                    onChange={(event) =>
                      updateExerciseField(exercise.key, 'youtubeUrl', event.target.value)
                    }
                    className="mt-1 h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-950 focus:bg-white"
                  />
                </label>

                <label className="block">
                  <span className="text-xs font-medium text-slate-500">Notes</span>
                  <input
                    type="text"
                    value={getFieldValue(settingsByExercise, exercise.key, 'notes')}
                    placeholder="Tempo, equipment, easier variation..."
                    onChange={(event) =>
                      updateExerciseField(exercise.key, 'notes', event.target.value)
                    }
                    className="mt-1 h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-950 focus:bg-white"
                  />
                </label>
              </div>
            </article>
          ))}
        </div>
      ) : null}

      <div className="sticky bottom-24 z-20 rounded-3xl border border-slate-200 bg-white/95 p-3 shadow-lg shadow-slate-200/80 backdrop-blur-xl">
        <div className="grid grid-cols-[1fr_auto] gap-2">
          <button
            type="button"
            onClick={handleSave}
            className="min-h-12 rounded-2xl bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Save setup
          </button>
          <button
            type="button"
            onClick={handleResetAll}
            className="min-h-12 rounded-2xl bg-slate-100 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
          >
            Reset all
          </button>
        </div>
      </div>
    </section>
  );
}

export default TrainingSetupPage;
