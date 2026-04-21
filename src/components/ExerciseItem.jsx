import { getYouTubeThumbnailUrl } from '../utils/youtube';

function getDetailParts(details) {
  return details?.split(' • ').filter(Boolean) ?? [];
}

function ExerciseItem({ exercise, checked, onToggle, onPreview }) {
  const thumbnailUrl = getYouTubeThumbnailUrl(exercise.youtube_url);
  const hasVideo = Boolean(exercise.youtube_url);
  const detailParts = getDetailParts(exercise.details);

  function handlePreviewClick(event) {
    event.stopPropagation();

    if (hasVideo) {
      onPreview(exercise);
    }
  }

  function handleKeyDown(event) {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }

    event.preventDefault();
    onToggle(exercise.id);
  }

  return (
    <li
      className="group relative cursor-pointer overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/90 shadow-lg shadow-slate-300/30 transition hover:border-slate-300 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-950/20"
      onClick={() => onToggle(exercise.id)}
      onKeyDown={handleKeyDown}
      role="checkbox"
      aria-checked={checked}
      tabIndex={0}
    >
      <div
        className={`absolute inset-y-0 left-0 w-1.5 ${
          checked ? 'bg-emerald-400' : 'bg-slate-950'
        }`}
      />
      <div className="flex min-h-24 items-center gap-3 py-4 pl-5 pr-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-semibold leading-tight text-slate-950">{exercise.title}</h3>
            </div>
          </div>

          {!checked && detailParts.length ? (
            <div className="mt-4 flex flex-wrap gap-x-8 gap-y-2 text-slate-700">
              {detailParts.map((detailPart) => {
                const [value, ...labelParts] = detailPart.split(' ');
                const label = labelParts.join(' ');
                const hasNumericValue = /^\d/.test(value);

                return (
                  <span key={detailPart} className="inline-flex items-baseline gap-1.5">
                    {hasNumericValue ? (
                      <>
                        <span className="text-2xl font-semibold leading-none tracking-normal text-slate-950">
                          {value}
                        </span>
                        {label ? <span className="text-sm text-slate-600">{label}</span> : null}
                      </>
                    ) : (
                      <span className="text-sm text-slate-600">{detailPart}</span>
                    )}
                  </span>
                );
              })}
            </div>
          ) : null}
        </div>

        {checked ? (
          <div className="flex h-16 w-20 shrink-0 items-center justify-center">
            <span className="rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-700">
              Done
            </span>
          </div>
        ) : (
          <div className="shrink-0">
            <button
              type="button"
              onClick={handlePreviewClick}
              disabled={!hasVideo}
              className="flex h-16 w-20 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white/90 text-slate-600 transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-slate-950/20 disabled:cursor-default disabled:hover:opacity-100"
              aria-label={hasVideo ? `Open video for ${exercise.title}` : undefined}
            >
              {thumbnailUrl ? (
                <img
                  src={thumbnailUrl}
                  alt=""
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-7 w-7"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                >
                  <path d="M4 6h16v12H4z" />
                  <path d="m10 9 5 3-5 3V9z" />
                </svg>
              )}
            </button>
          </div>
        )}
      </div>
    </li>
  );
}

export default ExerciseItem;
