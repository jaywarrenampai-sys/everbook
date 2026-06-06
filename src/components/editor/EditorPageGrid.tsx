"use client";

import { BookLayout, BookPage, UploadedPhoto } from "@/lib/editor/types";
import EditorSpreadCard, { SpreadItem } from "./EditorSpreadCard";

interface Props {
  layout:         BookLayout;
  photos:         UploadedPhoto[];
  activePageIndex: number;
  onEditPage:     (pageIndex: number) => void;
  onDuplicatePage:(pageIndex: number) => void;
  onAddPage:      () => void;
}

/** Convert flat pages array into spread items for the grid */
function buildSpreads(pages: BookPage[]): SpreadItem[] {
  const spreads: SpreadItem[] = [];

  // Cover — first page alone
  if (pages[0]) {
    spreads.push({
      label:      "Cover",
      leftPage:   pages[0],
      rightPage:  null,
      leftIndex:  0,
      rightIndex: null,
    });
  }

  // Page 1 — second page alone (inside front cover)
  if (pages[1]) {
    spreads.push({
      label:      "Page 1",
      leftPage:   null,
      rightPage:  pages[1],
      leftIndex:  null,
      rightIndex: 1,
    });
  }

  // Content spreads — pairs of pages
  for (let i = 2; i < pages.length; i += 2) {
    const pn = i; // page number
    spreads.push({
      label:      pages[i + 1] ? `Page ${pn}-${pn + 1}` : `Page ${pn}`,
      leftPage:   pages[i],
      rightPage:  pages[i + 1] ?? null,
      leftIndex:  i,
      rightIndex: pages[i + 1] ? i + 1 : null,
    });
  }

  return spreads;
}

export default function EditorPageGrid({
  layout,
  photos,
  activePageIndex,
  onEditPage,
  onDuplicatePage,
  onAddPage,
}: Props) {
  const spreads = buildSpreads(layout.pages);

  function isSpreadActive(spread: SpreadItem): boolean {
    return (
      spread.leftIndex  === activePageIndex ||
      spread.rightIndex === activePageIndex
    );
  }

  function getEditIndex(spread: SpreadItem): number {
    // Prefer right page if left is blank, otherwise left
    return spread.leftIndex ?? spread.rightIndex ?? 0;
  }

  function getDupIndex(spread: SpreadItem): number {
    return spread.rightIndex ?? spread.leftIndex ?? 0;
  }

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div
        className="grid gap-x-5 gap-y-8"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(228px, 1fr))" }}
      >
        {spreads.map((spread, i) => (
          <EditorSpreadCard
            key={i}
            spread={spread}
            photos={photos}
            isActive={isSpreadActive(spread)}
            onEdit={() => onEditPage(getEditIndex(spread))}
            onDuplicate={() => onDuplicatePage(getDupIndex(spread))}
          />
        ))}

        {/* Add page card */}
        <div className="flex flex-col items-center gap-1.5">
          <button
            onClick={onAddPage}
            className="flex items-center justify-center rounded-sm border-2 border-dashed border-neutral-300 hover:border-neutral-500 hover:bg-neutral-50 transition-all duration-150 group"
            style={{ width: 226, height: 160 }}
            title="เพิ่มหน้า"
          >
            <div className="flex flex-col items-center gap-1 text-neutral-400 group-hover:text-neutral-600 transition-colors">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
          </button>
          <span className="text-[11px] text-neutral-400 font-medium">Add page</span>
        </div>
      </div>
    </div>
  );
}
