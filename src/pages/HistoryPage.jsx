import { useEffect, useMemo, useState } from 'react';
import ConfirmModal from '../components/ConfirmModal';
import HistoryList from '../components/HistoryList';
import ImageGalleryModal from '../components/ImageGalleryModal';
import WeightChart from '../components/WeightChart';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import {
  deleteWorkoutPhoto,
  deleteWorkoutSession,
  getWorkoutHistory,
} from '../services/api';
import { formatWorkoutDate } from '../utils/date';
import { getWorkoutProgressSummary } from '../utils/progress';

function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [pendingDeleteSession, setPendingDeleteSession] = useState(null);
  const [galleryIndex, setGalleryIndex] = useState(null);
  const [deletingSessionId, setDeletingSessionId] = useState(null);
  const [deletingImagePath, setDeletingImagePath] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    let active = true;

    async function loadHistory() {
      try {
        const sessions = await getWorkoutHistory(user.id);

        if (active) {
          setHistory(sessions);
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

    loadHistory();

    return () => {
      active = false;
    };
  }, [user.id]);

  const summary = useMemo(() => getWorkoutProgressSummary(history), [history]);

  const weightPoints = useMemo(
    () =>
      [...history]
        .filter(
          (session) =>
            session.current_weight !== null && session.current_weight !== undefined,
        )
        .sort((left, right) => left.workout_date.localeCompare(right.workout_date))
        .map((session) => ({
          date: session.workout_date,
          weight: Number(session.current_weight),
        })),
    [history],
  );

  const galleryImages = useMemo(
    () =>
      [...history]
        .sort((left, right) => {
          const dateCompare = left.workout_date.localeCompare(right.workout_date);

          if (dateCompare !== 0) {
            return dateCompare;
          }

          return left.created_at.localeCompare(right.created_at);
        })
        .flatMap((session) =>
          (session.images ?? []).map((image, index) => ({
            imagePath: image.path,
            imageUrl: image.url,
            title: `${formatWorkoutDate(session.workout_date)} · Photo ${index + 1}`,
            workoutDate: session.workout_date,
          })),
        ),
    [history],
  );

  async function confirmDelete() {
    if (!pendingDeleteSession) {
      return;
    }

    const sessionId = pendingDeleteSession.id;
    setDeletingSessionId(sessionId);

    try {
      await deleteWorkoutSession({
        sessionId,
        imagePaths: pendingDeleteSession.image_paths ?? [],
      });
      setHistory((current) => current.filter((session) => session.id !== sessionId));
      showToast('Workout day removed from history.', 'success');
      setPendingDeleteSession(null);
    } catch (deleteError) {
      showToast(deleteError.message, 'error');
    } finally {
      setDeletingSessionId(null);
    }
  }

  async function handleDeletePhoto({ sessionId, imagePath }) {
    setDeletingImagePath(imagePath);

    try {
      await deleteWorkoutPhoto({ sessionId, imagePath });
      setHistory((current) =>
        current.map((session) =>
          session.id === sessionId
            ? {
                ...session,
                image_paths: (session.image_paths ?? []).filter((path) => path !== imagePath),
                images: (session.images ?? []).filter((image) => image.path !== imagePath),
              }
            : session,
        ),
      );
      if (galleryIndex !== null && galleryImages[galleryIndex]?.imagePath === imagePath) {
        setGalleryIndex(null);
      }
      showToast('Photo removed from workout.', 'success');
    } catch (deleteError) {
      showToast(deleteError.message, 'error');
    } finally {
      setDeletingImagePath(null);
    }
  }

  function openGalleryAtImage(imagePath) {
    const nextIndex = galleryImages.findIndex((image) => image.imagePath === imagePath);

    if (nextIndex >= 0) {
      setGalleryIndex(nextIndex);
    }
  }

  function handleNextGalleryImage() {
    if (!galleryImages.length) {
      return;
    }

    setGalleryIndex((current) => {
      if (current === null) {
        return 0;
      }

      return (current + 1) % galleryImages.length;
    });
  }

  function handlePreviousGalleryImage() {
    if (!galleryImages.length) {
      return;
    }

    setGalleryIndex((current) => {
      if (current === null) {
        return 0;
      }

      return (current - 1 + galleryImages.length) % galleryImages.length;
    });
  }

  return (
    <section>
      <div className="mb-5 rounded-3xl border border-slate-200 bg-white/85 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-700">
          Progress
        </p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Current streak</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">{summary.currentStreak} days</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Best streak</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">{summary.bestStreak} days</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Total days</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">{summary.totalDays} days</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Latest weight</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">
              {summary.latestWeight !== null ? `${summary.latestWeight} kg` : 'No data'}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Exercises done</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">{summary.totalCompleted}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Last session</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">
              {summary.latestSessionDate ? formatWorkoutDate(summary.latestSessionDate) : 'No data'}
            </p>
          </div>
        </div>
      </div>

      {!loading && !error && weightPoints.length ? <WeightChart points={weightPoints} /> : null}

      {!loading && !error && galleryImages.length ? (
        <div className="mb-5">
          <button
            type="button"
            onClick={() => setGalleryIndex(0)}
            className="min-h-11 rounded-full bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Open image gallery ({galleryImages.length})
          </button>
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white/85 px-5 py-10 text-center text-slate-600">
          Loading progress...
        </div>
      ) : null}

      {!loading && error ? (
        <div className="rounded-3xl border border-rose-400/20 bg-rose-50 px-5 py-10 text-center">
          <h2 className="text-lg font-semibold text-slate-950">Could not load progress</h2>
          <p className="mt-2 text-sm text-rose-700">{error}</p>
        </div>
      ) : null}

      {!loading && !error ? (
        <HistoryList
          sessions={history}
          deletingSessionId={deletingSessionId}
          deletingImagePath={deletingImagePath}
          onDelete={(session) => setPendingDeleteSession(session)}
          onDeletePhoto={handleDeletePhoto}
          onImageOpen={({ imagePath }) => openGalleryAtImage(imagePath)}
        />
      ) : null}

      {galleryIndex !== null ? (
        <ImageGalleryModal
          images={galleryImages}
          currentIndex={galleryIndex}
          onClose={() => setGalleryIndex(null)}
          onNext={handleNextGalleryImage}
          onPrevious={handlePreviousGalleryImage}
        />
      ) : null}

      {pendingDeleteSession ? (
        <ConfirmModal
          title="Delete this day?"
          message={`This will permanently remove the workout saved for ${formatWorkoutDate(
            pendingDeleteSession.workout_date,
          )}.`}
          confirmLabel="Delete day"
          isLoading={deletingSessionId === pendingDeleteSession.id}
          onConfirm={confirmDelete}
          onCancel={() => {
            if (!deletingSessionId) {
              setPendingDeleteSession(null);
            }
          }}
        />
      ) : null}
    </section>
  );
}

export default HistoryPage;
