import { useState } from 'react';
import { formatWarsawTime, formatWorkoutDate } from '../utils/date';

function DateGroup({
  date,
  createdAt,
  sessionId,
  exercises,
  currentWeight,
  comment,
  images,
  deletingImagePath,
  onImageOpen,
  onDeletePhoto,
  workoutName,
  workoutCode,
  isDeleting,
  onDelete,
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className="rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-lg shadow-slate-300/30">
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          className="min-h-11 flex-1 text-left"
        >
          <h3 className="text-lg font-semibold text-slate-950">{formatWorkoutDate(date)}</h3>
          {createdAt ? (
            <p className="mt-1 text-sm text-slate-500">
              Added at {formatWarsawTime(createdAt)} Warsaw
            </p>
          ) : null}
          {workoutName ? (
            <p className="mt-1 text-sm text-slate-600">
              {workoutCode ? `${workoutCode} · ` : ''}
              {workoutName}
            </p>
          ) : null}
          {currentWeight !== null && currentWeight !== undefined ? (
            <p className="mt-1 text-sm text-slate-500">Weight: {currentWeight} kg</p>
          ) : null}
        </button>
        <div className="flex flex-col items-end gap-2">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            {exercises.length} completed
          </span>
          <button
            type="button"
            onClick={() => setIsOpen((current) => !current)}
            className="flex min-h-11 min-w-11 items-center justify-center rounded-full border border-slate-200 px-0 text-lg font-medium text-slate-800 transition hover:border-slate-300 hover:bg-slate-100/80"
            aria-label={isOpen ? 'Collapse workout day' : 'Expand workout day'}
          >
            {isOpen ? '▴' : '▾'}
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={isDeleting}
            className="min-h-11 rounded-full border border-rose-400/20 px-4 text-sm font-medium text-rose-700 transition hover:border-rose-300/40 hover:bg-rose-500/10 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
          >
            {isDeleting ? 'Removing...' : 'Delete day'}
          </button>
        </div>
      </div>
      {isOpen ? (
        <>
          {comment ? <p className="mt-4 text-sm text-slate-600">{comment}</p> : null}
          {images?.length ? (
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {images.map((image, index) => (
                <div
                  key={image.path}
                  className="relative overflow-hidden rounded-2xl border border-slate-200"
                >
                  <button
                    type="button"
                    onClick={() =>
                      onImageOpen({
                        imageUrl: image.url,
                        imagePath: image.path,
                        title: `${formatWorkoutDate(date)} · Photo ${index + 1}`,
                      })
                    }
                    className="block w-full"
                  >
                    <img
                      src={image.url}
                      alt={`Workout from ${formatWorkoutDate(date)} photo ${index + 1}`}
                      className="aspect-[3/4] w-full object-cover"
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeletePhoto({ sessionId, imagePath: image.path })}
                    disabled={deletingImagePath === image.path}
                    className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-white/75 text-lg text-slate-950 transition hover:bg-white disabled:cursor-not-allowed disabled:bg-white/75 disabled:text-slate-400"
                    aria-label={`Delete photo ${index + 1}`}
                  >
                    {deletingImagePath === image.path ? '…' : '×'}
                  </button>
                </div>
              ))}
            </div>
          ) : null}
          <ul className="mt-4 space-y-2">
            {exercises.map((exercise) => (
              <li
                key={`${date}-${exercise.id}`}
                className="rounded-2xl border border-slate-200 bg-slate-50/90 px-4 py-3 text-sm text-slate-800"
              >
                <p>{exercise.title}</p>
                {exercise.details ? (
                  <p className="mt-1 text-xs text-slate-500">{exercise.details}</p>
                ) : null}
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </section>
  );
}

export default DateGroup;
