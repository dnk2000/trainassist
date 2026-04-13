function ImageModal({ imageUrl, title, onClose }) {
  if (!imageUrl) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/90 p-3 backdrop-blur-sm">
      <div className="glass-panel w-full max-w-md rounded-[2rem] border border-white/10 p-4 shadow-2xl">
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="min-h-11 rounded-full border border-white/10 px-4 text-sm font-medium text-slate-100 transition hover:border-white/20 hover:bg-white/5"
          >
            Close
          </button>
        </div>
        <div className="overflow-hidden rounded-[1.6rem] border border-white/10 bg-slate-900">
          <img src={imageUrl} alt={title} className="max-h-[80vh] w-full object-contain" />
        </div>
      </div>
    </div>
  );
}

export default ImageModal;
