import { useEffect, useRef } from 'react';

function ImageGalleryModal({ images, currentIndex, onClose, onNext, onPrevious }) {
  const touchStartXRef = useRef(0);
  const activeImage = images[currentIndex];

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose();
      }

      if (event.key === 'ArrowLeft') {
        onPrevious();
      }

      if (event.key === 'ArrowRight') {
        onNext();
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, onNext, onPrevious]);

  if (!activeImage) {
    return null;
  }

  function handleTouchStart(event) {
    touchStartXRef.current = event.touches[0]?.clientX ?? 0;
  }

  function handleTouchEnd(event) {
    const endX = event.changedTouches[0]?.clientX ?? 0;
    const deltaX = endX - touchStartXRef.current;

    if (Math.abs(deltaX) < 48) {
      return;
    }

    if (deltaX < 0) {
      onNext();
      return;
    }

    onPrevious();
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-white/95 p-3 backdrop-blur-sm">
      <div className="glass-panel w-full max-w-md rounded-[2rem] border border-slate-200 p-4 shadow-2xl">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-700">
              Image gallery
            </p>
            <h2 className="mt-2 text-lg font-semibold text-slate-950">{activeImage.title}</h2>
            <p className="mt-1 text-sm text-slate-500">
              {currentIndex + 1} of {images.length}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-11 rounded-full border border-slate-200 px-4 text-sm font-medium text-slate-800 transition hover:border-slate-300 hover:bg-slate-100/80"
          >
            Close
          </button>
        </div>

        <div
          className="overflow-hidden rounded-[1.6rem] border border-slate-200 bg-white"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <img
            src={activeImage.imageUrl}
            alt={activeImage.title}
            className="max-h-[78vh] w-full object-contain"
          />
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onPrevious}
            className="min-h-11 rounded-full border border-slate-200 px-4 text-sm font-medium text-slate-800 transition hover:border-slate-300 hover:bg-slate-100/80"
          >
            Previous
          </button>
          <p className="text-center text-xs text-slate-500">
            Swipe left or right to move between photos
          </p>
          <button
            type="button"
            onClick={onNext}
            className="min-h-11 rounded-full border border-slate-200 px-4 text-sm font-medium text-slate-800 transition hover:border-slate-300 hover:bg-slate-100/80"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default ImageGalleryModal;
