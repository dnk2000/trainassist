import { formatWorkoutDate } from '../utils/date';

function DateGroup({
  sessionId,
  date,
  exercises,
  currentWeight,
  workoutName,
  workoutCode,
  isDeleting,
  onDelete,
}) {
  return (
    <section className="rounded-3xl border border-white/10 bg-slate-900/80 p-4 shadow-lg shadow-slate-950/15">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white">{formatWorkoutDate(date)}</h3>
          {workoutName ? (
            <p className="mt-1 text-sm text-slate-300">
              {workoutCode ? `${workoutCode} · ` : ''}
              {workoutName}
            </p>
          ) : null}
          {currentWeight !== null && currentWeight !== undefined ? (
            <p className="mt-1 text-sm text-slate-400">Weight: {currentWeight} kg</p>
          ) : null}
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-300">
            {exercises.length} completed
          </span>
          <button
            type="button"
            onClick={() => onDelete(sessionId)}
            disabled={isDeleting}
            className="min-h-11 rounded-full border border-rose-400/20 px-4 text-sm font-medium text-rose-200 transition hover:border-rose-300/40 hover:bg-rose-500/10 disabled:cursor-not-allowed disabled:border-white/10 disabled:text-slate-500"
          >
            {isDeleting ? 'Removing...' : 'Delete day'}
          </button>
        </div>
      </div>
      <ul className="mt-4 space-y-2">
        {exercises.map((exercise) => (
          <li
            key={`${date}-${exercise.id}`}
            className="rounded-2xl border border-white/6 bg-slate-800/70 px-4 py-3 text-sm text-slate-100"
          >
            <p>{exercise.title}</p>
            {exercise.details ? <p className="mt-1 text-xs text-slate-400">{exercise.details}</p> : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default DateGroup;
