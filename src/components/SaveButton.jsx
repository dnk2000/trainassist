import { useEffect, useRef } from 'react';

function SaveButton({
  disabled,
  isLoading,
  onClick,
  selectedCount,
  weight,
  onWeightChange,
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    function updateHeight() {
      const height = containerRef.current?.offsetHeight ?? 0;
      document.documentElement.style.setProperty('--sticky-save-height', `${height}px`);
    }

    updateHeight();

    const observer = new ResizeObserver(() => {
      updateHeight();
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    window.addEventListener('resize', updateHeight);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateHeight);
      document.documentElement.style.removeProperty('--sticky-save-height');
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 mx-auto flex w-full max-w-3xl justify-center px-4 pb-4 sm:px-6">
      <div
        ref={containerRef}
        className="glass-panel pointer-events-auto w-full rounded-[2rem] border border-white/10 p-3 shadow-2xl shadow-slate-950/30"
      >
        <label className="mb-3 block">
          <span className="mb-2 block text-sm font-medium text-slate-200">Current weight</span>
          <div className="relative">
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              value={weight}
              onChange={(event) => onWeightChange(event.target.value)}
              placeholder="Enter weight"
              className="min-h-12 w-full rounded-[1.4rem] border border-white/10 bg-slate-900/80 px-4 pr-14 text-base text-white outline-none transition focus:border-sky-400"
            />
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400">
              kg
            </span>
          </div>
        </label>
        <button
          type="button"
          disabled={disabled || isLoading}
          onClick={onClick}
          className="flex min-h-14 w-full items-center justify-center rounded-[1.4rem] bg-sky-400 px-4 text-base font-semibold text-slate-950 transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
        >
          {isLoading ? 'Saving workout...' : `Save ${selectedCount ? `(${selectedCount})` : ''}`}
        </button>
      </div>
    </div>
  );
}

export default SaveButton;
