function SaveButton({
  disabled,
  isLoading,
  onClick,
  onReset,
  selectedCount,
  totalCount,
  workoutDate,
  onWorkoutDateChange,
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
      <div className="glass-panel w-full rounded-[2rem] border border-slate-100 p-3 shadow-sm shadow-slate-200/70">
        <div className="mb-3 flex items-center justify-between gap-3 rounded-[1.4rem] border border-slate-100 bg-white/80 shadow-sm shadow-slate-200/50 px-4 py-3">
          <p className="text-sm text-slate-600">
            {selectedCount} of {totalCount} selected
          </p>
          <button
            type="button"
            onClick={onToggleAll}
            className="min-h-11 rounded-full border border-slate-200 px-4 text-sm font-medium text-slate-800 transition hover:border-slate-300 hover:bg-slate-100/80"
          >
            {allSelected ? 'Clear all' : 'Select all'}
          </button>
        </div>
        <div className="mb-3 grid grid-cols-2 gap-3">
          <label className="block min-w-0">
            <span className="mb-2 block text-sm font-medium text-slate-700">Workout date</span>
            <input
              type="date"
              value={workoutDate}
              onChange={(event) => onWorkoutDateChange(event.target.value)}
              className="min-h-12 w-full min-w-0 rounded-[1.4rem] border border-slate-200 bg-white px-3 text-base text-slate-950 outline-none transition focus:border-slate-950 sm:px-4"
            />
          </label>
          <label className="block min-w-0">
            <span className="mb-2 block text-sm font-medium text-slate-700">Current weight</span>
            <div className="relative">
              <input
                type="number"
                inputMode="decimal"
                min="0"
                step="0.1"
                value={weight}
                onChange={(event) => onWeightChange(event.target.value)}
                placeholder="Weight"
                className="min-h-12 w-full min-w-0 rounded-[1.4rem] border border-slate-200 bg-white px-3 pr-10 text-base text-slate-950 outline-none transition focus:border-slate-950 sm:px-4 sm:pr-14"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-500 sm:right-4">
                kg
              </span>
            </div>
          </label>
        </div>
        <label className="mb-3 block">
          <span className="mb-2 block text-sm font-medium text-slate-700">Comment</span>
          <textarea
            value={comment}
            onChange={(event) => onCommentChange(event.target.value)}
            placeholder="Optional note about today’s workout"
            rows={3}
            className="min-h-24 w-full resize-none rounded-[1.4rem] border border-slate-200 bg-white px-4 py-3 text-base text-slate-950 outline-none transition focus:border-slate-950"
          />
        </label>
        <div className="mb-3">
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-slate-700">Photos</span>
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
              Up to 3
            </span>
          </div>
          <label className="flex min-h-12 cursor-pointer items-center justify-center rounded-[1.4rem] border border-dashed border-slate-300 bg-white/80 px-4 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-white/90">
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
                  className="relative overflow-hidden rounded-[1.4rem] border border-slate-200"
                >
                  <img
                    src={imagePreviewUrl}
                    alt={`Selected workout ${index + 1}`}
                    className="aspect-[3/4] w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => onImageRemove(index)}
                    className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-white/75 text-lg text-slate-950 transition hover:bg-white"
                    aria-label={`Remove selected photo ${index + 1}`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          ) : null}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onReset}
            disabled={isLoading}
            className="flex min-h-14 items-center justify-center rounded-[1.4rem] border border-slate-200 px-4 text-base font-semibold text-slate-800 transition hover:border-slate-300 hover:bg-slate-100/80 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
          >
            Reset
          </button>
          <button
            type="button"
            disabled={disabled || isLoading}
            onClick={onClick}
            className="flex min-h-14 items-center justify-center rounded-[1.4rem] bg-slate-950 px-4 text-base font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
          >
            {isLoading ? 'Saving workout...' : `Save ${selectedCount ? `(${selectedCount})` : ''}`}
          </button>
        </div>
      </div>
    </div>
  );
}

export default SaveButton;
