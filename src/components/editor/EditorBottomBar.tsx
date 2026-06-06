"use client";

type View = "grid" | "single";

interface Props {
  view:           View;
  onViewChange:   (v: View) => void;
  currentLabel:   string;
  onPrev:         () => void;
  onNext:         () => void;
  canPrev:        boolean;
  canNext:        boolean;
}

export default function EditorBottomBar({ view, onViewChange, currentLabel, onPrev, onNext, canPrev, canNext }: Props) {
  return (
    <footer className="h-11 bg-white border-t border-neutral-200 flex items-center justify-between px-4 shrink-0 z-20">
      {/* View toggle */}
      <div className="flex items-center gap-1 bg-neutral-100 rounded-md p-0.5">
        <button
          onClick={() => onViewChange("single")}
          className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-colors ${
            view === "single" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-800"
          }`}
        >
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
            <rect x="1" y="1" width="12" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
          </svg>
          One page
        </button>
        <button
          onClick={() => onViewChange("grid")}
          className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-colors ${
            view === "grid" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-800"
          }`}
        >
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
            <rect x="1" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3"/>
            <rect x="8" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3"/>
            <rect x="1" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3"/>
            <rect x="8" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3"/>
          </svg>
          All pages
        </button>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-3">
        <button
          onClick={onPrev}
          disabled={!canPrev}
          className="flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M8.5 3L5 7l3.5 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Previous page
        </button>

        <span className="text-xs font-medium text-neutral-700 min-w-[60px] text-center">
          {currentLabel}
        </span>

        <button
          onClick={onNext}
          disabled={!canNext}
          className="flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          Next page
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M5.5 3L9 7l-3.5 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </footer>
  );
}
