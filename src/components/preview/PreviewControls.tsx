"use client";

interface Props {
  currentPage: number;
  totalPages: number;
  onPrevious: () => void;
  onNext: () => void;
}

/**
 * Controls for the book preview viewer.
 * Displays page navigation buttons and page counter.
 */
export default function PreviewControls({
  currentPage,
  totalPages,
  onPrevious,
  onNext,
}: Props) {
  const canGoBack = currentPage > 0;
  const canGoNext = currentPage < totalPages - 1;

  return (
    <div className="flex items-center justify-between rounded-lg bg-white px-6 py-3 shadow-lg">
      <button
        onClick={onPrevious}
        disabled={!canGoBack}
        className={`rounded-lg px-4 py-2 font-medium transition-colors ${
          canGoBack
            ? "bg-neutral-900 text-white hover:bg-neutral-800"
            : "bg-neutral-100 text-neutral-400 cursor-not-allowed"
        }`}
      >
        ← ก่อนหน้า
      </button>

      <div className="text-center text-sm text-neutral-600">
        <span className="font-semibold">{currentPage + 1}</span>
        <span> / {totalPages}</span>
      </div>

      <button
        onClick={onNext}
        disabled={!canGoNext}
        className={`rounded-lg px-4 py-2 font-medium transition-colors ${
          canGoNext
            ? "bg-neutral-900 text-white hover:bg-neutral-800"
            : "bg-neutral-100 text-neutral-400 cursor-not-allowed"
        }`}
      >
        ถัดไป →
      </button>
    </div>
  );
}
