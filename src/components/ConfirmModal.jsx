function ConfirmModal({
  title,
  message,
  confirmLabel,
  cancelLabel = 'Cancel',
  isLoading,
  onConfirm,
  onCancel,
}) {
  return (
    <div className="fixed inset-0 z-40 flex items-end bg-white/80 p-3 backdrop-blur-sm sm:items-center sm:justify-center">
      <div className="glass-panel w-full max-w-md rounded-[2rem] border border-slate-200 p-5 shadow-2xl">
        <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">{message}</p>

        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="min-h-12 flex-1 rounded-2xl border border-slate-200 px-4 text-sm font-medium text-slate-800 transition hover:border-slate-300 hover:bg-slate-100/80 disabled:cursor-not-allowed disabled:text-slate-400"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="min-h-12 flex-1 rounded-2xl bg-rose-500 px-4 text-sm font-semibold text-white transition hover:bg-rose-400 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
          >
            {isLoading ? 'Removing...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
