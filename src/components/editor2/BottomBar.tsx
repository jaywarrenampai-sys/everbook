"use client";

import { BookOpen, ChevronLeft, ChevronRight, Grid2x2, Plus } from "lucide-react";
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
  const addPage = useEditorStore((s) => s.addPage);

  const idx = layout.currentPageIndex;
  const total = layout.pages.length;

  return (
    <footer className="sticky bottom-0 z-30 shrink-0 border-t border-border/60 bg-background/90 backdrop-blur-md">
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        {/* View toggle */}
        <div className="inline-flex rounded-full border-2 border-border bg-card p-1">
          <button
            onClick={() => setViewMode("single")}
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
              viewMode === "single" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
            }`}
          >
            <BookOpen className="size-4" />
            <span className="hidden sm:inline">หน้าเดียว</span>
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
              viewMode === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
            }`}
          >
            <Grid2x2 className="size-4" />
            <span className="hidden sm:inline">ทุกหน้า</span>
          </button>
        </div>

        {/* Add page */}
        <button
          onClick={addPage}
          className="inline-flex items-center gap-1.5 rounded-full bg-butter px-4 py-2 text-sm font-bold text-butter-foreground shadow-sm transition-transform hover:-translate-y-0.5"
        >
          <Plus className="size-4" />
          <span className="hidden sm:inline">เพิ่มหน้า</span>
        </button>

        {/* Nav */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => goToPage(idx - 1)}
            disabled={idx <= 0}
            className="inline-flex items-center gap-1.5 rounded-full border-2 border-border bg-card px-3.5 py-2 text-sm font-semibold text-foreground transition-transform hover:-translate-y-0.5 disabled:opacity-40 disabled:hover:translate-y-0"
          >
            <ChevronLeft className="size-4" />
            <span className="hidden sm:inline">ก่อนหน้า</span>
          </button>
          <span className="min-w-20 text-center text-sm font-semibold text-muted-foreground">{spreadLabel(idx, total)}</span>
          <button
            onClick={() => goToPage(idx + 1)}
            disabled={idx >= total - 1}
            className="inline-flex items-center gap-1.5 rounded-full border-2 border-border bg-card px-3.5 py-2 text-sm font-semibold text-foreground transition-transform hover:-translate-y-0.5 disabled:opacity-40 disabled:hover:translate-y-0"
          >
            <span className="hidden sm:inline">ถัดไป</span>
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
    </footer>
  );
}
