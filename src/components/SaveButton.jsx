function SaveButton({
  disabled,
  isLoading,
  onClick,
  selectedCount,
  totalCount,
  weight,
  onWeightChange,
  comment,
  onCommentChange,
  onToggleAll,
  allSelected,
  imagePreviewUrls,
  onImageChange,
  onImageRemove,
}) {
  return (
    <div className="mt-4">
      <div className="glass-panel w-full rounded-[2rem] border border-white/10 p-3 shadow-2xl shadow-slate-950/30">
        <div className="mb-3 flex items-center justify-between gap-3 rounded-[1.4rem] border border-white/10 bg-slate-900/50 px-4 py-3">
          <p className="text-sm text-slate-300">
            {selectedCount} of {totalCount} selected
          </p>
          <button
            type="button"
            onClick={onToggleAll}
            className="min-h-11 rounded-full border border-white/10 px-4 text-sm font-medium text-slate-100 transition hover:border-white/20 hover:bg-white/5"
          >
            {allSelected ? 'Clear all' : 'Select all'}
          </button>
        </div>
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
        <label className="mb-3 block">
          <span className="mb-2 block text-sm font-medium text-slate-200">Comment</span>
          <textarea
            value={comment}
            onChange={(event) => onCommentChange(event.target.value)}
            placeholder="Optional note about today’s workout"
            rows={3}
            className="min-h-24 w-full resize-none rounded-[1.4rem] border border-white/10 bg-slate-900/80 px-4 py-3 text-base text-white outline-none transition focus:border-sky-400"
          />
        </label>
        <div className="mb-3">
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-slate-200">Photos</span>
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
              Up to 3
            </span>
          </div>
          <label className="flex min-h-12 cursor-pointer items-center justify-center rounded-[1.4rem] border border-dashed border-white/15 bg-slate-900/60 px-4 text-sm font-medium text-slate-200 transition hover:border-white/25 hover:bg-slate-900/80">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={onImageChange}
              className="hidden"
            />
            {imagePreviewUrls.length ? 'Add more photos' : 'Add photos'}
          </label>
          {imagePreviewUrls.length ? (
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {imagePreviewUrls.map((imagePreviewUrl, index) => (
                <div
                  key={imagePreviewUrl}
                  className="relative overflow-hidden rounded-[1.4rem] border border-white/10"
                >
                  <img
                    src={imagePreviewUrl}
                    alt={`Selected workout ${index + 1}`}
                    className="aspect-[3/4] w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => onImageRemove(index)}
                    className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-slate-950/75 text-lg text-white transition hover:bg-slate-900"
                    aria-label={`Remove selected photo ${index + 1}`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          ) : null}
        </div>
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
