"use client";

import Link from "next/link";
import { BookLayout } from "@/lib/editor/types";

interface Props {
  layout: BookLayout;
  lastSaved: Date | null;
  isExporting: boolean;
  projectId: string | null;
  onClearPage: () => void;
  onSave: () => void;
  onPreview: () => void;
  onExportPDF: () => void;
}

export default function EditorToolbar({
  layout,
  lastSaved,
  isExporting,
  projectId,
  onClearPage,
  onSave,
  onPreview,
  onExportPDF,
}: Props) {
  const page = layout.pages[layout.currentPageIndex];
  const photoCount =
    Object.keys(page?.slotFills ?? {}).length + (page?.placements.length ?? 0);

  const spreadLabel = `แผ่นที่ ${Math.floor(layout.currentPageIndex / 2) + 1} / ${Math.ceil(layout.pages.length / 2)}`;

  const savedLabel = lastSaved
    ? `บันทึกแล้ว ${lastSaved.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}`
    : null;

  return (
    <div className="h-12 bg-stone-900 border-b border-stone-700 flex items-center justify-between px-4 flex-shrink-0">
      {/* Left */}
      <div className="flex items-center gap-4">
        <Link href="/" className="text-stone-400 hover:text-stone-200 transition-colors text-sm">
          ← Everbook
        </Link>
        <span className="text-stone-600">|</span>
        <span className="text-stone-300 text-sm font-medium">
          หน้า {layout.currentPageIndex + 1}
        </span>
        <span className="text-xs text-stone-500 bg-stone-800 px-2 py-0.5 rounded-full">
          {spreadLabel}
        </span>
        {savedLabel && (
          <span className="text-xs text-green-500/70">✓ {savedLabel}</span>
        )}
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        {photoCount > 0 && (
          <button
            onClick={onClearPage}
            className="text-xs text-stone-500 hover:text-red-400 transition-colors"
          >
            ล้างหน้านี้
          </button>
        )}

        {/* Preview */}
        <button
          onClick={onPreview}
          className="bg-stone-700 hover:bg-stone-600 text-stone-200 text-xs font-medium px-4 py-1.5 rounded-full transition-colors"
        >
          👁 ดูตัวอย่าง
        </button>

        {/* Save */}
        <button
          onClick={onSave}
          className="bg-amber-700 hover:bg-amber-600 text-white text-xs font-semibold px-4 py-1.5 rounded-full transition-colors"
        >
          บันทึก
        </button>

        {/* Export PDF */}
        <button
          onClick={onExportPDF}
          disabled={isExporting}
          className="bg-stone-700 hover:bg-stone-600 disabled:opacity-50 disabled:cursor-wait text-stone-200 text-xs font-medium px-4 py-1.5 rounded-full transition-colors flex items-center gap-1.5"
        >
          {isExporting ? (
            <><span className="animate-spin">⏳</span> กำลังสร้าง PDF…</>
          ) : (
            <>📄 PDF</>
          )}
        </button>

        {/* Order / checkout */}
        <Link
          href={
            projectId
              ? `/checkout?projectId=${projectId}&pages=${layout.pages.length}`
              : `/checkout?pages=${layout.pages.length}`
          }
          className="bg-amber-500 hover:bg-amber-400 text-white text-xs font-bold px-4 py-1.5 rounded-full transition-colors"
        >
          🛒 สั่งพิมพ์
        </Link>
      </div>
    </div>
  );
}
