"use client";

import { useRef, useEffect, useState } from "react";
import { BookPage, UploadedPhoto } from "@/lib/editor/types";
import { PAGE_ASPECT_RATIO } from "@/lib/editor/layout";
import SinglePage from "./SinglePage";

interface Props {
  leftPage: BookPage;
  rightPage: BookPage | undefined;  // may not exist on last odd-numbered page
  photos: UploadedPhoto[];
  onLeftChange: (updated: BookPage) => void;
  onRightChange: (updated: BookPage) => void;
}

export default function BookSpread({
  leftPage,
  rightPage,
  photos,
  onLeftChange,
  onRightChange,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pagePx, setPagePx] = useState({ width: 0, height: 0 });

  useEffect(() => {
    function measure() {
      if (!containerRef.current) return;
      const cw = containerRef.current.clientWidth  - 64; // horizontal padding
      const ch = containerRef.current.clientHeight - 64; // vertical padding

      // Spread shows 2 pages side by side; each page = PAGE_ASPECT_RATIO wide
      // Total spread width / height = (2 * PAGE_ASPECT_RATIO) / 1
      const spreadAspect = PAGE_ASPECT_RATIO * 2;
      let spreadW = cw;
      let spreadH = spreadW / spreadAspect;
      if (spreadH > ch) {
        spreadH = ch;
        spreadW = spreadH * spreadAspect;
      }
      setPagePx({ width: Math.floor(spreadW / 2), height: Math.floor(spreadH) });
    }
    measure();
    const ro = new ResizeObserver(measure);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const { width: pageW, height: pageH } = pagePx;
  const spreadW = pageW * 2;

  return (
    <div
      ref={containerRef}
      className="flex-1 flex items-center justify-center bg-stone-300 overflow-hidden"
      style={{
        backgroundImage:
          "radial-gradient(circle at 50% 50%, #c5bfba 0%, #a8a29e 100%)",
      }}
    >
      {pageW === 0 ? (
        <div className="text-stone-400 text-sm animate-pulse">กำลังโหลด…</div>
      ) : (
        /* ── Book wrapper ── */
        <div
          style={{ width: spreadW, height: pageH }}
          className="relative flex"
          /* Multi-layer shadow to simulate a thick hardcover book */
          /* outer glow + bottom thickness + page stack */
        >
          {/* Bottom "thickness" layers — give depth */}
          {[6, 4, 2].map((offset) => (
            <div
              key={offset}
              style={{
                position: "absolute",
                top: offset,
                left: offset / 2,
                width: spreadW,
                height: pageH,
                background: "#e5ddd5",
                borderRadius: 2,
                zIndex: 0,
              }}
            />
          ))}

          {/* Book drop shadow */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              boxShadow:
                "0 20px 60px rgba(0,0,0,0.45), 0 8px 20px rgba(0,0,0,0.25)",
              borderRadius: 2,
              zIndex: 1,
              pointerEvents: "none",
            }}
          />

          {/* Left cover edge */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: 8,
              height: pageH,
              background: "linear-gradient(to right, #78523a, #5c3d28)",
              zIndex: 3,
              borderTopLeftRadius: 3,
              borderBottomLeftRadius: 3,
            }}
          />

          {/* Right cover edge */}
          <div
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: 8,
              height: pageH,
              background: "linear-gradient(to left, #78523a, #5c3d28)",
              zIndex: 3,
              borderTopRightRadius: 3,
              borderBottomRightRadius: 3,
            }}
          />

          {/* Left page */}
          <div style={{ position: "relative", zIndex: 2, marginLeft: 8 }}>
            <SinglePage
              page={leftPage}
              photos={photos}
              widthPx={pageW - 8}
              heightPx={pageH}
              side="left"
              onChange={onLeftChange}
            />
          </div>

          {/* Spine */}
          <div
            style={{
              width: 20,
              height: pageH,
              flexShrink: 0,
              position: "relative",
              zIndex: 2,
              background:
                "linear-gradient(to right, #d6cdc4 0%, #ede8e3 30%, #f5f0eb 50%, #ede8e3 70%, #c8bfb6 100%)",
              boxShadow:
                "inset 2px 0 6px rgba(0,0,0,0.12), inset -2px 0 6px rgba(0,0,0,0.12)",
            }}
          />

          {/* Right page */}
          <div style={{ position: "relative", zIndex: 2, marginRight: 8 }}>
            {rightPage ? (
              <SinglePage
                page={rightPage}
                photos={photos}
                widthPx={pageW - 8}
                heightPx={pageH}
                side="right"
                onChange={onRightChange}
              />
            ) : (
              // Last page has no right pair — show blank verso
              <div
                style={{ width: pageW - 8, height: pageH }}
                className="bg-white/60"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
