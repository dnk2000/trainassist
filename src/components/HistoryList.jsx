import DateGroup from './DateGroup';

function HistoryList({ sessions }) {
  if (!sessions.length) {
    return (
      <div className="rounded-3xl border border-dashed border-white/15 bg-slate-900/50 px-5 py-10 text-center">
        <h2 className="text-lg font-semibold text-white">No workout history yet</h2>
        <p className="mt-2 text-sm text-slate-400">
          Save your first workout on the Workout tab and it will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sessions.map((session) => (
        <DateGroup
          key={session.id}
          date={session.workout_date}
          exercises={session.exercises}
          currentWeight={session.current_weight}
          workoutName={session.workout_name}
          workoutCode={session.workout_code}
        />
      ))}
    </div>
  );
}

export default HistoryList;
