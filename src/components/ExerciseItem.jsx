import { getYouTubeThumbnailUrl } from '../utils/youtube';

function ExerciseItem({ exercise, checked, onToggle, onPreview }) {
  const thumbnailUrl = getYouTubeThumbnailUrl(exercise.youtube_url);
  const hasVideo = Boolean(exercise.youtube_url);

  return (
    <li className="rounded-3xl border border-white/10 bg-slate-900/80 shadow-lg shadow-slate-950/15">
      <div className="flex items-stretch gap-3 p-3">
        <label className="flex min-w-11 items-center justify-center">
          <input
            type="checkbox"
            checked={checked}
            onChange={() => onToggle(exercise.id)}
            className="h-6 w-6 rounded border-slate-500 bg-slate-800 text-sky-400 focus:ring-sky-400"
            aria-label={`Mark ${exercise.title} complete`}
          />
        </label>

        <button
          type="button"
          onClick={() => onPreview(exercise)}
          className="flex min-h-24 flex-1 items-center gap-3 rounded-2xl text-left transition hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-sky-400/50"
        >
          <div className="h-20 w-24 shrink-0 overflow-hidden rounded-2xl bg-slate-800">
            {thumbnailUrl ? (
              <img
                src={thumbnailUrl}
                alt=""
                className="h-full w-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-slate-400">
                No preview
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span
                className={`rounded-full px-2 py-1 text-xs font-semibold ${
                  hasVideo
                    ? 'bg-sky-400/15 text-sky-200'
                    : 'bg-slate-700/70 text-slate-300'
                }`}
              >
                {hasVideo ? 'Video' : 'No video'}
              </span>
              {checked ? (
                <span className="rounded-full bg-emerald-400/15 px-2 py-1 text-xs font-semibold text-emerald-200">
                  Done
                </span>
              ) : null}
            </div>
            <h3 className="mt-2 text-base font-semibold text-white">{exercise.title}</h3>
            {exercise.details ? (
              <p className="mt-1 text-sm text-slate-300">{exercise.details}</p>
            ) : null}
            <p className="mt-1 text-sm text-slate-400">
              {hasVideo ? 'Tap to open exercise video' : 'Tap to view exercise details'}
            </p>
          </div>
        </button>
      </div>
    </li>
  );
}

export default ExerciseItem;
