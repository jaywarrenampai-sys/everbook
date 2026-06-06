"use client";

import { useEditorStore } from "@/lib/store/editorStore";

function spreadLabel(pageIndex: number, total: number): string {
  if (pageIndex === 0) return "ปก";
  if (pageIndex === 1) return "หน้า 1";
  const base = Math.floor((pageIndex - 2) / 2) * 2 + 2;
  return base + 1 < total ? `หน้า ${base}-${base + 1}` : `หน้า ${base}`;
}

export default function BottomBar() {
  const viewMode = useEditorStore((s) => s.viewMode);
  const setViewMode = useEditorStore((s) => s.setViewMode);
  const layout = useEditorStore((s) => s.layout);
  const goToPage = useEditorStore((s) => s.goToPage);

  const idx = layout.currentPageIndex;
  const total = layout.pages.length;

  return (
    <footer className="flex h-11 shrink-0 items-center justify-between border-t border-neutral-200 bg-white px-4">
      {/* View toggle */}
      <div className="flex items-center gap-0.5 rounded-md bg-neutral-100 p-0.5">
        <button
          onClick={() => setViewMode("single")}
          className={`flex items-center gap-1.5 rounded px-3 py-1 text-xs font-medium transition-colors ${viewMode === "single" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-800"}`}
        >
          หน้าเดียว
        </button>
        <button
          onClick={() => setViewMode("grid")}
          className={`flex items-center gap-1.5 rounded px-3 py-1 text-xs font-medium transition-colors ${viewMode === "grid" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-800"}`}
        >
          ทุกหน้า
        </button>
      </div>

      {/* Nav */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => goToPage(idx - 1)}
          disabled={idx <= 0}
          className="flex items-center gap-1 text-xs text-neutral-500 transition-colors hover:text-neutral-900 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <svg width="14" height="14" viewBox="0 0 14 14"><path d="M8.5 3L5 7l3.5 4" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
          ก่อนหน้า
        </button>
        <span className="min-w-[64px] text-center text-xs font-medium text-neutral-700">{spreadLabel(idx, total)}</span>
        <button
          onClick={() => goToPage(idx + 1)}
          disabled={idx >= total - 1}
          className="flex items-center gap-1 text-xs text-neutral-500 transition-colors hover:text-neutral-900 disabled:cursor-not-allowed disabled:opacity-30"
        >
          ถัดไป
          <svg width="14" height="14" viewBox="0 0 14 14"><path d="M5.5 3L9 7l-3.5 4" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      </div>
    </footer>
  );
}
