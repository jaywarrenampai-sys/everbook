"use client";

import { ChevronLeft, ChevronRight, ImageIcon, Plus, Palette, Grid2x2 } from "lucide-react";
import { useEditorStore } from "@/lib/store/editorStore";

function spreadLabel(pageIndex: number, total: number): string {
  if (pageIndex === 0) return "ปก";
  if (pageIndex === 1) return "หน้า 1";
  const base = Math.floor((pageIndex - 2) / 2) * 2 + 2;
  return base + 1 < total ? `หน้า ${base}-${base + 1}` : `หน้า ${base}`;
}

/**
 * Simplified mobile bottom navigation: page nav row + Photos / Add / Design.
 * Mobile-only — desktop keeps the full BottomBar.
 */
export default function MobileNav({
  onPhotos,
  onAdd,
  onDesign,
}: {
  onPhotos: () => void;
  onAdd: () => void;
  onDesign: () => void;
}) {
  const layout = useEditorStore((s) => s.layout);
  const goToPage = useEditorStore((s) => s.goToPage);
  const viewMode = useEditorStore((s) => s.viewMode);
  const setViewMode = useEditorStore((s) => s.setViewMode);

  const idx = layout.currentPageIndex;
  const total = layout.pages.length;

  return (
    <div className="sticky bottom-0 z-30 border-t border-border/60 bg-background/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)] md:hidden">
      {/* page nav row */}
      <div className="flex items-center justify-center gap-3 border-b border-border/40 py-1.5">
        <button onClick={() => goToPage(idx - 1)} disabled={idx <= 0}
          className="inline-flex size-8 items-center justify-center rounded-full bg-muted text-foreground disabled:opacity-40">
          <ChevronLeft className="size-4" />
        </button>
        <span className="min-w-20 text-center text-xs font-semibold text-muted-foreground">{spreadLabel(idx, total)}</span>
        <button onClick={() => goToPage(idx + 1)} disabled={idx >= total - 1}
          className="inline-flex size-8 items-center justify-center rounded-full bg-muted text-foreground disabled:opacity-40">
          <ChevronRight className="size-4" />
        </button>
        <button
          onClick={() => setViewMode(viewMode === "grid" ? "single" : "grid")}
          className={`ml-2 inline-flex size-8 items-center justify-center rounded-full ${viewMode === "grid" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}
          aria-label="ทุกหน้า"
        >
          <Grid2x2 className="size-4" />
        </button>
      </div>

      {/* main nav */}
      <div className="grid grid-cols-3 items-end px-4 py-2">
        <NavBtn icon={<ImageIcon className="size-5" />} label="รูปภาพ" onClick={onPhotos} />
        <button onClick={onAdd} className="mx-auto -mt-4 flex size-14 flex-col items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform active:scale-95">
          <Plus className="size-7" />
        </button>
        <NavBtn icon={<Palette className="size-5" />} label="ดีไซน์" onClick={onDesign} />
      </div>
    </div>
  );
}

function NavBtn({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-0.5 text-muted-foreground">
      {icon}
      <span className="text-[11px] font-semibold">{label}</span>
    </button>
  );
}
