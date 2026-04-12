import { useEffect, useState } from 'react';
import HistoryList from '../components/HistoryList';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { deleteWorkoutSession, getWorkoutHistory } from '../services/api';

function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [deletingSessionId, setDeletingSessionId] = useState(null);
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

  async function handleDelete(sessionId) {
    setDeletingSessionId(sessionId);

    try {
      await deleteWorkoutSession(sessionId);
      setHistory((current) => current.filter((session) => session.id !== sessionId));
      showToast('Workout day removed from history.', 'success');
    } catch (deleteError) {
      showToast(deleteError.message, 'error');
    } finally {
      setDeletingSessionId(null);
    }
  }

  return (
    <section>
      <div className="mb-5 rounded-3xl border border-white/10 bg-slate-900/70 p-5">
        <h2 className="text-lg font-semibold text-white">Workout history</h2>
        <p className="mt-2 text-sm text-slate-300">
          Sessions are grouped by date, newest first, so you can quickly review what you completed.
        </p>
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
          onDelete={handleDelete}
        />
      ) : null}
    </section>
  );
}

export default HistoryPage;
