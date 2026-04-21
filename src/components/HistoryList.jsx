import DateGroup from './DateGroup';

function HistoryList({
  sessions,
  deletingSessionId,
  deletingImagePath,
  onDelete,
  onDeletePhoto,
  onImageOpen,
}) {
  if (!sessions.length) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-white/75 px-5 py-10 text-center">
        <h2 className="text-lg font-semibold text-slate-950">No progress yet</h2>
        <p className="mt-2 text-sm text-slate-500">
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
          createdAt={session.created_at}
          exercises={session.exercises}
          currentWeight={session.current_weight}
          comment={session.comment}
          images={session.images}
          sessionId={session.id}
          deletingImagePath={deletingImagePath}
          onImageOpen={onImageOpen}
          onDeletePhoto={onDeletePhoto}
          workoutName={session.workout_name}
          workoutCode={session.workout_code}
          isDeleting={deletingSessionId === session.id}
          onDelete={() => onDelete(session)}
        />
      ))}
    </div>
  );
}

export default HistoryList;
