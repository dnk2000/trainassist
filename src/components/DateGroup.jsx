import { formatWorkoutDate } from '../utils/date';

function DateGroup({ date, exercises, currentWeight, workoutName, workoutCode }) {
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
        <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-300">
          {exercises.length} completed
        </span>
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
