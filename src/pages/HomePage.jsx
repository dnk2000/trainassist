import { useEffect, useMemo, useState } from 'react';
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

function HomePage() {
  const [exerciseLibrary, setExerciseLibrary] = useState([]);
  const [checkedIds, setCheckedIds] = useState([]);
  const [workoutDate, setWorkoutDate] = useState(() => getTodayDateString());
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

  useEffect(() => {
    let active = true;

    async function loadPageData() {
      try {
        const [libraryData, latestSavedWeight] = await Promise.all([
          getExerciseLibrary(),
          getLatestSavedWeight(user.id),
        ]);

        if (active) {
          setExerciseLibrary(libraryData);
          if (latestSavedWeight !== null) {
            setWeight(String(latestSavedWeight));
          }
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
  const scheduledWorkoutCode = useMemo(() => getScheduledWorkoutCode(), []);
  const isViewingScheduledWorkout = selectedWorkoutCode === scheduledWorkoutCode;
  const workout = useMemo(
    () => attachExerciseLibrary(getWorkoutByCode(selectedWorkoutCode), exerciseLibrary),
    [exerciseLibrary, selectedWorkoutCode],
  );
  const selectedSet = useMemo(() => new Set(checkedIds), [checkedIds]);
  const workoutItems = useMemo(
    () => workout?.sections.flatMap((section) => section.items) ?? [],
    [workout],
  );
  const selectedCount = checkedIds.length;
  const allSelected = workoutItems.length > 0 && checkedIds.length === workoutItems.length;

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
    setCheckedIds([]);
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

      setImageFiles([]);
      showToast(`Workout saved for ${formatWorkoutDate(workoutDate)}.`, 'success');
    } catch (saveError) {
      showToast(saveError.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <section className="mb-5 rounded-3xl border border-white/10 bg-slate-900/70 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-300/80">
          {trainingPlan.plan_name}
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-white">
          {isViewingScheduledWorkout
            ? workout?.isRestDay
              ? `${humanizeDayName(workout.dayName)} recovery day`
              : `${humanizeDayName(workout?.dayName ?? 'today')} workout`
            : workout?.isRestDay
              ? 'Recovery workout'
              : 'Workout preview'}
        </h2>
        <p className="mt-2 text-sm text-slate-300">
          {workout?.workoutCode ? `${workout.workoutCode} · ` : ''}
          {workout?.workoutName ?? 'No workout scheduled'}
          {workout?.estimatedDurationMin ? ` · about ${workout.estimatedDurationMin} min` : ''}
        </p>
      </section>

      <section className="mb-5">
        <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-2">
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
                      ? 'bg-sky-400 text-slate-950'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  {tab.label}
                  {isScheduled ? ' · Today' : ''}
                </button>
              );
            })}
          </div>
          {workout ? (
            <p className="px-2 pt-2 text-sm text-slate-400">
              {workout.workoutCode ? `${workout.workoutCode} · ` : ''}
              {workout.workoutName}
            </p>
          ) : null}
        </div>
      </section>

      {loading ? (
        <div className="rounded-3xl border border-white/10 bg-slate-900/70 px-5 py-10 text-center text-slate-300">
          Loading today&apos;s workout...
        </div>
      ) : null}

      {!loading && error ? (
        <div className="rounded-3xl border border-rose-400/20 bg-rose-950/40 px-5 py-10 text-center">
          <h2 className="text-lg font-semibold text-white">Could not load today&apos;s plan</h2>
          <p className="mt-2 text-sm text-rose-100/80">{error}</p>
        </div>
      ) : null}

      {!loading && !error && !workout ? (
        <div className="rounded-3xl border border-dashed border-white/15 bg-slate-900/50 px-5 py-10 text-center">
          <h2 className="text-lg font-semibold text-white">No workout scheduled</h2>
          <p className="mt-2 text-sm text-slate-400">
            Check `training-plan.json` and make sure today has a matching `workout_type`.
          </p>
        </div>
      ) : null}

      {!loading && !error && workout?.isRestDay ? (
        <div className="space-y-4">
          <div className="rounded-3xl border border-emerald-400/20 bg-emerald-950/30 p-5">
            <h3 className="text-lg font-semibold text-white">Take it easy today</h3>
            <p className="mt-2 text-sm text-emerald-50/85">
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
          selectedCount={selectedCount}
          totalCount={workoutItems.length}
          workoutDate={workoutDate}
          onWorkoutDateChange={setWorkoutDate}
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
