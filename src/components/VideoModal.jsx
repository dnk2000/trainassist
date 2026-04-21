import { getYouTubeEmbedUrl } from '../utils/youtube';

function VideoModal({ exercise, onClose }) {
  if (!exercise) {
    return null;
  }

  const embedUrl = getYouTubeEmbedUrl(exercise.youtube_url);

  return (
    <div className="fixed inset-0 z-40 flex items-end bg-white/80 p-3 backdrop-blur-sm sm:items-center sm:justify-center">
      <div className="glass-panel w-full max-w-2xl rounded-[2rem] border border-slate-200 p-4 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-700">
              Exercise video
            </p>
            <h2 className="mt-2 text-xl font-semibold text-slate-950">{exercise.title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-11 rounded-full border border-slate-200 px-4 text-sm font-medium text-slate-800 transition hover:border-slate-300 hover:bg-slate-100/80"
          >
            Close
          </button>
        </div>

        <div className="mt-4 overflow-hidden rounded-3xl bg-black">
          <div className="relative aspect-video w-full">
            {embedUrl ? (
              <iframe
                title={exercise.title}
                src={embedUrl}
                className="absolute inset-0 h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="flex h-full items-center justify-center px-6 text-center text-sm text-slate-600">
                This YouTube link could not be embedded. Update the saved URL in Supabase and try again.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default VideoModal;
