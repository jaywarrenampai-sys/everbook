"use client";

import { useState, useEffect, useRef } from "react";
import { BookPage, UploadedPhoto } from "@/lib/editor/types";
import { PAGE_H_OVER_W } from "@/lib/editor/layout";
import PageCanvas from "@/components/editor2/PageCanvas";
import BookFrame from "@/components/editor2/BookFrame";

interface Props {
  left: BookPage | null;
  right: BookPage | null;
  photos: UploadedPhoto[];
  onPrev: () => void;
  onNext: () => void;
}

/**
 * Realistic photobook preview — renders the current spread using the SAME
 * BookFrame chrome as the editor (sharp corners, centre binding, depth).
 * Click page edges, swipe/drag, or arrow keys to turn pages.
 */
export default function BookViewer({ left, right, photos, onPrev, onNext }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const [pageWidth, setPageWidth] = useState(320);

  const ASPECT = PAGE_H_OVER_W; // 297/210
  const isSpread = !!left && !!right;

  // Fit the spread to the viewport while preserving the exact A4 ratio.
  useEffect(() => {
    const measure = () => {
      const el = containerRef.current;
      if (!el) return;
      const availW = el.clientWidth * 0.94;
      const availH = el.clientHeight * 0.86;
      const byW = isSpread ? (availW - 36) / 2 : availW;
      const byH = availH / ASPECT;
      setPageWidth(Math.max(140, Math.min(520, Math.floor(Math.min(byW, byH)))));
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (containerRef.current) ro.observe(containerRef.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [isSpread, ASPECT]);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") { e.preventDefault(); onPrev(); }
      else if (e.key === "ArrowRight") { e.preventDefault(); onNext(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onPrev, onNext]);

  const pageHeight = Math.round(pageWidth * ASPECT);

  const handleClick = (e: React.MouseEvent) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const relX = e.clientX - rect.left;
    if (relX < rect.width * 0.22) onPrev();
    else if (relX > rect.width * 0.78) onNext();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    dragStartRef.current = { x: e.clientX, y: e.clientY };
  };
  const handleMouseUp = (e: React.MouseEvent) => {
    if (!dragStartRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    if (Math.abs(dx) > 50) (dx > 0 ? onPrev : onNext)();
    dragStartRef.current = null;
  };

  return (
    <div
      ref={containerRef}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      className="flex h-full w-full cursor-pointer select-none items-center justify-center bg-gradient-to-b from-neutral-200 to-neutral-300"
      style={{ userSelect: "none" }}
    >
      <BookFrame
        width={pageWidth}
        height={pageHeight}
        left={left ? <PageCanvas page={left} photos={photos} width={pageWidth} height={pageHeight} /> : undefined}
        right={right ? <PageCanvas page={right} photos={photos} width={pageWidth} height={pageHeight} /> : undefined}
      />
    </div>
  );
}
