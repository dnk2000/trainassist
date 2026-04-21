import { useEffect, useMemo, useRef, useState } from 'react';
import SaveButton from '../components/SaveButton';
import VideoModal from '../components/VideoModal';
import WorkoutSection from '../components/WorkoutSection';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import {
  getExerciseLibrary,
  getLatestSavedWeight,
  saveWorkoutSession,
  uploadWorkoutImages,
} from '../services/api';
import { formatWorkoutDate, getTodayDateString, humanizeDayName } from '../utils/date';
import {
  attachExerciseLibrary,
  getScheduledWorkoutCode,
  getTrainingPlan,
  getWorkoutByCode,
  getWorkoutTabs,
} from '../utils/trainingPlan';

function parseLocalDate(dateString) {
  return dateString ? new Date(`${dateString}T00:00:00`) : new Date();
}

function getWorkoutDraftStorageKey(userId, workoutCode) {
  if (!userId || !workoutCode) {
    return '';
  }

  return `trainassist:workout-draft:${userId}:${workoutCode}`;
}

function getWorkoutFormStorageKey(userId) {
  if (!userId) {
    return '';
  }

  return `trainassist:workout-form:${userId}`;
}

function readWorkoutFormDraft(userId) {
  const storageKey = getWorkoutFormStorageKey(userId);

  if (!storageKey) {
    return null;
  }

  try {
    const savedDraft = window.localStorage.getItem(storageKey);
    return savedDraft ? JSON.parse(savedDraft) : null;
  } catch {
    return null;
  }
}

function HomePage() {
  const [exerciseLibrary, setExerciseLibrary] = useState([]);
  const [checkedIds, setCheckedIds] = useState([]);
  const [workoutDate, setWorkoutDate] = useState(() => getTodayDateString());
  const [latestWeightDefault, setLatestWeightDefault] = useState('');
  const [weight, setWeight] = useState('');
  const [comment, setComment] = useState('');
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [selectedWorkoutCode, setSelectedWorkoutCode] = useState(() => getScheduledWorkoutCode());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const { showToast } = useToast();
  const hasHydratedFormDraftRef = useRef(false);
  const skipNextFormDraftPersistRef = useRef(false);
  const hasHydratedCheckedDraftRef = useRef(false);
  const skipNextCheckedDraftPersistRef = useRef(false);

  useEffect(() => {
    let active = true;

    async function loadPageData() {
      try {
        const [libraryData, latestSavedWeight] = await Promise.all([
          getExerciseLibrary(),
          getLatestSavedWeight(user.id),
        ]);
        const formDraft = readWorkoutFormDraft(user.id);

        if (active) {
          setExerciseLibrary(libraryData);
          if (formDraft?.workoutDate) {
            setWorkoutDate(formDraft.workoutDate);
            setSelectedWorkoutCode(getScheduledWorkoutCode(parseLocalDate(formDraft.workoutDate)));
          }
          if (typeof formDraft?.weight === 'string') {
            setWeight(formDraft.weight);
          } else if (latestSavedWeight !== null) {
            setWeight(String(latestSavedWeight));
          }
          setLatestWeightDefault(latestSavedWeight !== null ? String(latestSavedWeight) : '');
          if (typeof formDraft?.comment === 'string') {
            setComment(formDraft.comment);
          }
          hasHydratedFormDraftRef.current = true;
          skipNextFormDraftPersistRef.current = true;
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

    loadPageData();

    return () => {
      active = false;
    };
  }, [user.id]);

  useEffect(() => {
    if (!imageFiles.length) {
      setImagePreviewUrls([]);
      return undefined;
    }

    const objectUrls = imageFiles.map((file) => URL.createObjectURL(file));
    setImagePreviewUrls(objectUrls);

    return () => {
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imageFiles]);

  const trainingPlan = getTrainingPlan();
  const workoutTabs = useMemo(() => getWorkoutTabs(), []);
  const todayDate = getTodayDateString();
  const scheduledWorkoutCode = useMemo(
    () => getScheduledWorkoutCode(parseLocalDate(workoutDate)),
    [workoutDate],
  );
  const scheduledTabLabel = workoutDate === todayDate ? 'Today' : 'Planned';
  const isViewingScheduledWorkout = selectedWorkoutCode === scheduledWorkoutCode;
  const workout = useMemo(
    () =>
      attachExerciseLibrary(
        getWorkoutByCode(selectedWorkoutCode, parseLocalDate(workoutDate)),
        exerciseLibrary,
      ),
    [exerciseLibrary, selectedWorkoutCode, workoutDate],
  );
  const selectedSet = useMemo(() => new Set(checkedIds), [checkedIds]);
  const workoutItems = useMemo(
    () => workout?.sections.flatMap((section) => section.items) ?? [],
    [workout],
  );
  const formDraftStorageKey = useMemo(() => getWorkoutFormStorageKey(user.id), [user.id]);
  const draftStorageKey = useMemo(
    () => getWorkoutDraftStorageKey(user.id, selectedWorkoutCode),
    [selectedWorkoutCode, user.id],
  );
  const selectedCount = checkedIds.length;
  const allSelected = workoutItems.length > 0 && checkedIds.length === workoutItems.length;

  useEffect(() => {
    if (!draftStorageKey) {
      hasHydratedCheckedDraftRef.current = false;
      setCheckedIds([]);
      return;
    }

    try {
      const savedDraft = window.localStorage.getItem(draftStorageKey);
      const parsedDraft = savedDraft ? JSON.parse(savedDraft) : [];
      const validItemIds = new Set(workoutItems.map((item) => item.id));
      const nextCheckedIds = Array.isArray(parsedDraft)
        ? parsedDraft.filter((itemId) => validItemIds.has(itemId))
        : [];

      hasHydratedCheckedDraftRef.current = true;
      skipNextCheckedDraftPersistRef.current = true;
      setCheckedIds(nextCheckedIds);
    } catch {
      hasHydratedCheckedDraftRef.current = true;
      skipNextCheckedDraftPersistRef.current = true;
      setCheckedIds([]);
    }
  }, [draftStorageKey, workoutItems]);

  useEffect(() => {
    if (!draftStorageKey || !hasHydratedCheckedDraftRef.current) {
      return;
    }

    if (skipNextCheckedDraftPersistRef.current) {
      skipNextCheckedDraftPersistRef.current = false;
      return;
    }

    try {
      window.localStorage.setItem(draftStorageKey, JSON.stringify(checkedIds));
    } catch {
      // Ignore localStorage write failures and keep the in-memory state working.
    }
  }, [checkedIds, draftStorageKey]);

  useEffect(() => {
    if (!formDraftStorageKey || !hasHydratedFormDraftRef.current) {
      return;
    }

    if (skipNextFormDraftPersistRef.current) {
      skipNextFormDraftPersistRef.current = false;
      return;
    }

    try {
      window.localStorage.setItem(
        formDraftStorageKey,
        JSON.stringify({
          workoutDate,
          weight,
          comment,
        }),
      );
    } catch {
      // Ignore localStorage write failures and keep the in-memory state working.
    }
  }, [comment, formDraftStorageKey, weight, workoutDate]);

  function handleToggle(itemId) {
    setCheckedIds((current) =>
      current.includes(itemId) ? current.filter((id) => id !== itemId) : [...current, itemId],
    );
  }

  function handleToggleAll() {
    if (allSelected) {
      setCheckedIds([]);
      return;
    }

    setCheckedIds(workoutItems.map((item) => item.id));
  }

  function handleWorkoutTabChange(workoutCode) {
    setSelectedWorkoutCode(workoutCode);
    setSelectedExercise(null);
  }

  function handleWorkoutDateChange(nextWorkoutDate) {
    setWorkoutDate(nextWorkoutDate);
    setSelectedWorkoutCode(getScheduledWorkoutCode(parseLocalDate(nextWorkoutDate)));
    setSelectedExercise(null);
  }

  function handleImageChange(event) {
    const nextFiles = Array.from(event.target.files ?? []);
    if (!nextFiles.length) {
      return;
    }

    setImageFiles((current) => {
      const combinedFiles = [...current, ...nextFiles].slice(0, 3);

      if (current.length + nextFiles.length > 3) {
        showToast('You can add up to 3 photos per workout.', 'error');
      }

      return combinedFiles;
    });
    event.target.value = '';
  }

  function resetFormToDefaults() {
    if (draftStorageKey) {
      window.localStorage.removeItem(draftStorageKey);
    }
    if (formDraftStorageKey) {
      window.localStorage.removeItem(formDraftStorageKey);
    }

    setCheckedIds([]);
    setWorkoutDate(getTodayDateString());
    setSelectedWorkoutCode(getScheduledWorkoutCode());
    setWeight(latestWeightDefault);
    setComment('');
    setImageFiles([]);
    setSelectedExercise(null);
  }

  async function handleSave() {
    setSaving(true);

    try {
      const parsedWeight = weight.trim() ? Number.parseFloat(weight) : null;

      if (parsedWeight !== null && Number.isNaN(parsedWeight)) {
        throw new Error('Enter a valid weight before saving.');
      }

      const selectedItems = workoutItems.filter((item) => selectedSet.has(item.id));
      let uploadedImagePaths;

      if (imageFiles.length) {
        uploadedImagePaths = await uploadWorkoutImages({
          userId: user.id,
          workoutDate,
          files: imageFiles,
        });
      }

      await saveWorkoutSession({
        userId: user.id,
        workoutDate,
        items: selectedItems,
        currentWeight: parsedWeight,
        comment: comment.trim() || null,
        imagePaths: uploadedImagePaths,
        workoutCode: workout?.workoutCode ?? null,
        workoutName: workout?.workoutName ?? null,
      });

      const nextDefaultWeight =
        parsedWeight !== null ? String(parsedWeight) : latestWeightDefault;

      setLatestWeightDefault(nextDefaultWeight);
      if (draftStorageKey) {
        window.localStorage.removeItem(draftStorageKey);
      }
      if (formDraftStorageKey) {
        window.localStorage.removeItem(formDraftStorageKey);
      }
      setCheckedIds([]);
      setWorkoutDate(getTodayDateString());
      setSelectedWorkoutCode(getScheduledWorkoutCode());
      setWeight(nextDefaultWeight);
      setComment('');
      setImageFiles([]);
      setSelectedExercise(null);
      showToast(`Workout saved for ${formatWorkoutDate(workoutDate)}.`, 'success');
    } catch (saveError) {
      showToast(saveError.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <section className="mb-5 rounded-3xl border border-slate-100 bg-white shadow-sm shadow-slate-200/70 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-700">
          {trainingPlan.plan_name}
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-950">
          {isViewingScheduledWorkout
            ? workout?.isRestDay
              ? `${humanizeDayName(workout.dayName)} recovery day`
              : `${humanizeDayName(workout?.dayName ?? 'today')} workout`
            : workout?.isRestDay
              ? 'Recovery workout'
              : 'Workout preview'}
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          {workout?.workoutCode ? `${workout.workoutCode} · ` : ''}
          {workout?.workoutName ?? 'No workout scheduled'}
          {workout?.estimatedDurationMin ? ` · about ${workout.estimatedDurationMin} min` : ''}
        </p>
      </section>

      <section className="mb-5">
        <div className="rounded-3xl border border-slate-100 bg-white shadow-sm shadow-slate-200/70 p-2">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {workoutTabs.map((tab) => {
              const isActive = tab.code === selectedWorkoutCode;
              const isScheduled = tab.code === scheduledWorkoutCode;

              return (
                <button
                  key={tab.code}
                  type="button"
                  onClick={() => handleWorkoutTabChange(tab.code)}
                  className={`min-h-11 shrink-0 rounded-2xl px-4 text-sm font-medium transition ${
                    isActive
                      ? 'bg-slate-950 text-white'
                      : 'bg-slate-50/90 text-slate-600 hover:bg-slate-200 hover:text-slate-950'
                  }`}
                >
                  {tab.label}
                  {isScheduled ? ` · ${scheduledTabLabel}` : ''}
                </button>
              );
            })}
          </div>
          {workout ? (
            <p className="px-2 pt-2 text-sm text-slate-500">
              {workout.workoutCode ? `${workout.workoutCode} · ` : ''}
              {workout.workoutName}
            </p>
          ) : null}
        </div>
      </section>

      {loading ? (
        <div className="rounded-3xl border border-slate-100 bg-white shadow-sm shadow-slate-200/70 px-5 py-10 text-center text-slate-600">
          Loading today&apos;s workout...
        </div>
      ) : null}

      {!loading && error ? (
        <div className="rounded-3xl border border-rose-400/20 bg-rose-50 px-5 py-10 text-center">
          <h2 className="text-lg font-semibold text-slate-950">Could not load today&apos;s plan</h2>
          <p className="mt-2 text-sm text-rose-700">{error}</p>
        </div>
      ) : null}

      {!loading && !error && !workout ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white/75 px-5 py-10 text-center">
          <h2 className="text-lg font-semibold text-slate-950">No workout scheduled</h2>
          <p className="mt-2 text-sm text-slate-500">
            Check `training-plan.json` and make sure today has a matching `workout_type`.
          </p>
        </div>
      ) : null}

      {!loading && !error && workout?.isRestDay ? (
        <div className="space-y-4">
          <div className="rounded-3xl border border-emerald-400/20 bg-emerald-50 p-5">
            <h3 className="text-lg font-semibold text-slate-950">Take it easy today</h3>
            <p className="mt-2 text-sm text-emerald-700/85">
              {workout.instructions.join(' · ') || 'Rest or go for a light walk.'}
            </p>
          </div>
        </div>
      ) : null}

      {!loading && !error && workout && !workout.isRestDay ? (
        <div className="space-y-4">
          {workout.sections.map((section) => (
            <WorkoutSection
              key={section.id}
              section={section}
              checkedIds={selectedSet}
              onToggle={handleToggle}
              onPreview={setSelectedExercise}
            />
          ))}
        </div>
      ) : null}

      <VideoModal exercise={selectedExercise} onClose={() => setSelectedExercise(null)} />
      {workout && !workout.isRestDay ? (
        <SaveButton
          disabled={!selectedCount}
          isLoading={saving}
          onClick={handleSave}
          onReset={resetFormToDefaults}
          selectedCount={selectedCount}
          totalCount={workoutItems.length}
          workoutDate={workoutDate}
          onWorkoutDateChange={handleWorkoutDateChange}
          weight={weight}
          onWeightChange={setWeight}
          comment={comment}
          onCommentChange={setComment}
          onToggleAll={handleToggleAll}
          allSelected={allSelected}
          imagePreviewUrls={imagePreviewUrls}
          onImageChange={handleImageChange}
          onImageRemove={(index) =>
            setImageFiles((current) => current.filter((_, currentIndex) => currentIndex !== index))
          }
        />
      ) : null}
    </>
  );
}

export default HomePage;
