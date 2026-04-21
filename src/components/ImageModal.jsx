function ImageModal({ imageUrl, title, onClose }) {
  if (!imageUrl) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-white/90 p-3 backdrop-blur-sm">
      <div className="glass-panel w-full max-w-md rounded-[2rem] border border-slate-200 p-4 shadow-2xl">
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="min-h-11 rounded-full border border-slate-200 px-4 text-sm font-medium text-slate-800 transition hover:border-slate-300 hover:bg-slate-100/80"
          >
            Close
          </button>
        </div>
        <div className="overflow-hidden rounded-[1.6rem] border border-slate-200 bg-white">
          <img src={imageUrl} alt={title} className="max-h-[80vh] w-full object-contain" />
        </div>
      </div>
    </div>
  );
}

export default ImageModal;
