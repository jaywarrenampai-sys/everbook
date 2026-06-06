"use client";

interface Props {
  projectTitle: string;
  saveState:    "idle" | "saving" | "saved" | "error";
  onSave:       () => void;
  onPreview:    () => void;
  onOrder:      () => void;
  onBack:       () => void;
}

export default function EditorTopBar({ projectTitle, saveState, onSave, onPreview, onOrder, onBack }: Props) {
  return (
    <header className="h-12 bg-white border-b border-neutral-200 flex items-center px-3 gap-2 shrink-0 z-20">
      {/* Left — back + actions */}
      <div className="flex items-center gap-1 min-w-0">
        <button
          onClick={onBack}
          className="flex items-center gap-1 px-2 py-1.5 rounded hover:bg-neutral-100 transition-colors text-neutral-600 hover:text-neutral-900"
          title="กลับหน้าหลัก"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <div className="w-px h-5 bg-neutral-200 mx-1" />

        {/* Undo */}
        <button className="flex flex-col items-center px-2 py-1 rounded hover:bg-neutral-100 transition-colors text-neutral-500 hover:text-neutral-800 opacity-40 cursor-not-allowed" title="เลิกทำ">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M3 7H10a4 4 0 0 1 0 8H6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            <path d="M3 7l3-3M3 7l3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
          <span className="text-[9px] mt-0.5 leading-none">Undo</span>
        </button>

        {/* Redo */}
        <button className="flex flex-col items-center px-2 py-1 rounded hover:bg-neutral-100 transition-colors text-neutral-500 hover:text-neutral-800 opacity-40 cursor-not-allowed" title="ทำซ้ำ">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M13 7H6a4 4 0 0 0 0 8h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            <path d="M13 7l-3-3M13 7l-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
          <span className="text-[9px] mt-0.5 leading-none">Redo</span>
        </button>

        {/* Project */}
        <button className="flex flex-col items-center px-2 py-1 rounded hover:bg-neutral-100 transition-colors text-neutral-500 hover:text-neutral-800">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4"/>
            <rect x="9" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4"/>
            <rect x="2" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4"/>
            <rect x="9" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4"/>
          </svg>
          <span className="text-[9px] mt-0.5 leading-none">Project</span>
        </button>
      </div>

      {/* Center — title */}
      <div className="flex-1 text-center">
        <span className="text-sm font-medium text-neutral-700 truncate hidden sm:inline">{projectTitle}</span>
      </div>

      {/* Right — Save / Preview / Order */}
      <div className="flex items-center gap-2">
        {/* Save */}
        <button
          onClick={onSave}
          className="flex flex-col items-center px-2 py-1 rounded hover:bg-neutral-100 transition-colors text-neutral-500 hover:text-neutral-800"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M13 10v2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-2M8 2v7M5 6l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-[9px] mt-0.5 leading-none">
            {saveState === "saving" ? "…" : saveState === "saved" ? "✓" : "Save"}
          </span>
        </button>

        {/* Preview */}
        <button
          onClick={onPreview}
          className="flex flex-col items-center px-2 py-1 rounded hover:bg-neutral-100 transition-colors text-neutral-500 hover:text-neutral-800"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M1 8s3-5 7-5 7 5 7 5-3 5-7 5-7-5-7-5z" stroke="currentColor" strokeWidth="1.4"/>
            <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.4"/>
          </svg>
          <span className="text-[9px] mt-0.5 leading-none">Preview</span>
        </button>

        {/* Order */}
        <button
          onClick={onOrder}
          className="flex items-center gap-2 bg-neutral-900 hover:bg-neutral-700 text-white text-sm font-semibold px-4 py-2 rounded-md transition-colors"
        >
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
            <path d="M2 2h2l2.5 7h5L14 5H5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="7" cy="13" r="1" fill="currentColor"/>
            <circle cx="12" cy="13" r="1" fill="currentColor"/>
          </svg>
          สั่งพิมพ์
        </button>
      </div>
    </header>
  );
}
