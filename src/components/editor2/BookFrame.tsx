"use client";

import React from "react";

/**
 * Shared "physical photobook" rendering chrome — used by BOTH the editor
 * (SingleSpreadView) and the preview (BookViewer) so they look identical.
 *
 * Provides: sharp 90° page corners, a realistic centre binding (gutter shadow
 * + crease), spine shading on inner page edges, a subtle page-stack depth and
 * a soft book drop-shadow. Purely presentational — it renders whatever page
 * nodes you pass in (interactive EditablePage, or read-only PageCanvas).
 */
export default function BookFrame({
  width,
  height,
  left,
  right,
  single = false,
}: {
  width: number; // single page width in px
  height: number; // page height in px
  left?: React.ReactNode;
  right?: React.ReactNode;
  single?: boolean;
}) {
  const showLeft = !!left;
  const showRight = !!right;
  const isSpread = showLeft && showRight && !single;
  const gutterW = Math.min(34, Math.max(12, Math.round(width * 0.05)));

  return (
    <div className="relative inline-block">
      {/* page-stack depth — thin paper edges peeking bottom-right (very subtle) */}
      <div aria-hidden className="pointer-events-none absolute inset-0 translate-x-[2px] translate-y-[3px] bg-[#d7d0c4]" />
      <div aria-hidden className="pointer-events-none absolute inset-0 translate-x-[4px] translate-y-[6px] bg-[#c5bdae]" />

      {/* book body + soft drop shadow */}
      <div className="relative flex shadow-[0_22px_50px_-18px_rgba(40,32,24,0.45)]">
        {showLeft && (
          <div className="relative shrink-0" style={{ width, height }}>
            {left}
            {isSpread && <SpineShade side="left" />}
          </div>
        )}
        {showRight && (
          <div className="relative shrink-0" style={{ width, height }}>
            {right}
            {isSpread && <SpineShade side="right" />}
          </div>
        )}

        {/* Centre binding: gutter shadow + crease line */}
        {isSpread && (
          <div
            aria-hidden
            className="pointer-events-none absolute top-0 z-10"
            style={{ left: width, height, width: gutterW, transform: "translateX(-50%)" }}
          >
            <div
              className="h-full w-full"
              style={{
                background:
                  "linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,0.10) 32%, rgba(0,0,0,0.22) 50%, rgba(0,0,0,0.10) 68%, rgba(0,0,0,0) 100%)",
              }}
            />
            {/* crease: thin dark line + faint highlight */}
            <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-black/35" />
            <div className="absolute inset-y-0 left-1/2 w-px translate-x-[0.5px] bg-white/30" />
          </div>
        )}
      </div>
    </div>
  );
}

/** Soft darkening toward the spine on the inner edge of a page. */
function SpineShade({ side }: { side: "left" | "right" }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={{
        background:
          side === "left"
            ? "linear-gradient(to right, rgba(0,0,0,0) 82%, rgba(0,0,0,0.13) 100%)"
            : "linear-gradient(to left, rgba(0,0,0,0) 82%, rgba(0,0,0,0.13) 100%)",
      }}
    />
  );
}
