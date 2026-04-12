const toneStyles = {
  info: 'border-sky-400/30 bg-slate-900/90 text-slate-50',
  success: 'border-emerald-400/30 bg-emerald-950/90 text-emerald-50',
  error: 'border-rose-400/30 bg-rose-950/90 text-rose-50',
};

function ToastViewport({ toasts, onDismiss }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4">
      <div className="flex w-full max-w-sm flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto page-enter rounded-2xl border px-4 py-3 shadow-xl ${toneStyles[toast.tone]}`}
          >
            <div className="flex items-start gap-3">
              <p className="flex-1 text-sm font-medium">{toast.message}</p>
              <button
                type="button"
                onClick={() => onDismiss(toast.id)}
                className="min-h-11 min-w-11 rounded-full text-sm text-slate-300 transition hover:text-white"
                aria-label="Dismiss notification"
              >
                Close
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ToastViewport;
