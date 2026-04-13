import { useEffect, useMemo, useState } from 'react';
import ConfirmModal from '../components/ConfirmModal';
import HistoryList from '../components/HistoryList';
import ImageModal from '../components/ImageModal';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import {
  deleteWorkoutPhoto,
  deleteWorkoutSession,
  getWorkoutHistory,
} from '../services/api';
import { formatWorkoutDate } from '../utils/date';

function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [pendingDeleteSession, setPendingDeleteSession] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
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

  const summary = useMemo(() => {
    const totalDays = history.length;
    const totalCompleted = history.reduce(
      (sum, session) => sum + (session.exercises?.length ?? 0),
      0,
    );
    const latestSession = history[0] ?? null;
    const latestWeight =
      history.find((session) => session.current_weight !== null && session.current_weight !== undefined)
        ?.current_weight ?? null;

    return {
      totalDays,
      totalCompleted,
      latestSessionDate: latestSession?.workout_date ?? null,
      latestWeight,
    };
  }, [history]);

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
      if (selectedImage?.imagePath === imagePath) {
        setSelectedImage(null);
      }
      showToast('Photo removed from workout.', 'success');
    } catch (deleteError) {
      showToast(deleteError.message, 'error');
    } finally {
      setDeletingImagePath(null);
    }
  }

  return (
    <section>
      <div className="mb-5 rounded-3xl border border-white/10 bg-slate-900/70 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-300/80">
          Summary
        </p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-white/8 bg-slate-800/70 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Saved days</p>
            <p className="mt-2 text-2xl font-semibold text-white">{summary.totalDays}</p>
          </div>
          <div className="rounded-2xl border border-white/8 bg-slate-800/70 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Completed items</p>
            <p className="mt-2 text-2xl font-semibold text-white">{summary.totalCompleted}</p>
          </div>
          <div className="rounded-2xl border border-white/8 bg-slate-800/70 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Latest weight</p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {summary.latestWeight !== null ? `${summary.latestWeight} kg` : 'No data'}
            </p>
          </div>
          <div className="rounded-2xl border border-white/8 bg-slate-800/70 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Last session</p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {summary.latestSessionDate ? formatWorkoutDate(summary.latestSessionDate) : 'No data'}
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-white/10 bg-slate-900/70 px-5 py-10 text-center text-slate-300">
          Loading history...
        </div>
      ) : null}

      {!loading && error ? (
        <div className="rounded-3xl border border-rose-400/20 bg-rose-950/40 px-5 py-10 text-center">
          <h2 className="text-lg font-semibold text-white">Could not load history</h2>
          <p className="mt-2 text-sm text-rose-100/80">{error}</p>
        </div>
      ) : null}

      {!loading && !error ? (
        <HistoryList
          sessions={history}
          deletingSessionId={deletingSessionId}
          deletingImagePath={deletingImagePath}
          onDelete={(session) => setPendingDeleteSession(session)}
          onDeletePhoto={handleDeletePhoto}
          onImageOpen={setSelectedImage}
        />
      ) : null}

      {selectedImage ? (
        <ImageModal
          imageUrl={selectedImage.imageUrl}
          title={selectedImage.title}
          onClose={() => setSelectedImage(null)}
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
