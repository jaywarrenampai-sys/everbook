"use client";

import { useRef, useEffect, useState } from "react";
import { BookLayout, UploadedPhoto } from "@/lib/editor/types";
import SinglePage from "./SinglePage";

interface Props {
  layout:         BookLayout;
  pageIndex:      number;
  photos:         UploadedPhoto[];
  onUpdatePage:   (index: number, page: BookLayout["pages"][0]) => void;
}

// Portrait aspect: height = width * 1.414
const ASPECT = 1.414;

export default function EditorSingleView({ layout, pageIndex, photos, onUpdatePage }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pageW, setPageW] = useState(320);

  // ── Spread index calculation ──────────────────────────────────────────────
  // Mirror the buildSpreads logic: page 0 alone, page 1 alone, then pairs
  let spreadLeft: number | null  = null;
  let spreadRight: number | null = null;

  if (pageIndex === 0) {
    spreadLeft = 0;
  } else if (pageIndex === 1) {
    spreadRight = 1;
  } else {
    // pages 2,3 → spread 2-3; pages 4,5 → spread 4-5; etc.
    const spreadBase = Math.floor((pageIndex - 2) / 2) * 2 + 2;
    spreadLeft  = spreadBase;
    spreadRight = spreadBase + 1 < layout.pages.length ? spreadBase + 1 : null;
  }

  const leftPage  = spreadLeft  != null ? layout.pages[spreadLeft]  : null;
  const rightPage = spreadRight != null ? layout.pages[spreadRight] : null;

  // ── Responsive sizing ─────────────────────────────────────────────────────
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const resize = () => {
      const available = el.clientWidth - 96; // subtract padding
      const maxW = Math.min(420, available / 2);
      setPageW(Math.max(180, maxW));
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const pageH = Math.round(pageW * ASPECT);

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-auto bg-[#f2f2f2] flex items-start justify-center pt-10 pb-10"
    >
      <div className="flex flex-col items-center gap-3">
        {/* Spread */}
        <div className="flex shadow-xl rounded-sm overflow-hidden">
          {/* Left page (or blank) */}
          {leftPage ? (
            <SinglePage
              page={leftPage}
              photos={photos}
              widthPx={pageW}
              heightPx={pageH}
              side="left"
              onChange={(u) => spreadLeft != null && onUpdatePage(spreadLeft, u)}
            />
          ) : (
            <div style={{ width: pageW, height: pageH }} className="bg-neutral-50 border-r border-neutral-200" />
          )}

          {/* Spine */}
          <div
            className="shrink-0 bg-gradient-to-r from-neutral-300 to-neutral-200"
            style={{ width: 3, height: pageH }}
          />

          {/* Right page (or blank) */}
          {rightPage ? (
            <SinglePage
              page={rightPage}
              photos={photos}
              widthPx={pageW}
              heightPx={pageH}
              side="right"
              onChange={(u) => spreadRight != null && onUpdatePage(spreadRight, u)}
            />
          ) : (
            <div style={{ width: pageW, height: pageH }} className="bg-neutral-50" />
          )}
        </div>

        {/* Page label */}
        <span className="text-xs text-neutral-500 font-medium">
          {pageIndex === 0
            ? "Cover"
            : pageIndex === 1
            ? "Page 1"
            : `Page ${Math.floor((pageIndex - 2) / 2) * 2 + 2}-${Math.floor((pageIndex - 2) / 2) * 2 + 3}`}
        </span>

        {/* Drag hint */}
        {photos.length > 0 && (
          <p className="text-[11px] text-neutral-400 mt-1">
            ลากรูปจากแผงซ้ายมาวางบนหน้า
          </p>
        )}
      </div>
    </div>
  );
}
