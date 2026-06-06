"use client";

import { useEffect, useState, useCallback } from "react";
import { BookLayout, UploadedPhoto } from "@/lib/editor/types";
import { PAGE_ASPECT_RATIO } from "@/lib/editor/layout";
import { getTemplate } from "@/lib/editor/templates";

interface Props {
  layout: BookLayout;
  photos: UploadedPhoto[];
  onClose: () => void;
}

export default function BookPreview({ layout, photos, onClose }: Props) {
  // Spreads: pairs of pages [0,1], [2,3], …
  const spreads: [number, number | null][] = [];
  for (let i = 0; i < layout.pages.length; i += 2) {
    spreads.push([i, i + 1 < layout.pages.length ? i + 1 : null]);
  }

  const [spreadIdx, setSpreadIdx] = useState(0);
  const [animDir, setAnimDir] = useState<"next" | "prev" | null>(null);

  const prev = useCallback(() => {
    if (spreadIdx === 0) return;
    setAnimDir("prev");
    setTimeout(() => { setSpreadIdx((i) => i - 1); setAnimDir(null); }, 200);
  }, [spreadIdx]);

  const next = useCallback(() => {
    if (spreadIdx >= spreads.length - 1) return;
    setAnimDir("next");
    setTimeout(() => { setSpreadIdx((i) => i + 1); setAnimDir(null); }, 200);
  }, [spreadIdx, spreads.length]);

  // Keyboard navigation
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") next();
      if (e.key === "ArrowLeft"  || e.key === "ArrowUp")   prev();
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, onClose]);

  const [leftIdx, rightIdx] = spreads[spreadIdx];
  const leftPage  = layout.pages[leftIdx];
  const rightPage = rightIdx !== null ? layout.pages[rightIdx] : null;

  function getPhoto(photoId: string): UploadedPhoto | undefined {
    return photos.find((p) => p.id === photoId);
  }

  function renderPage(pageIndex: number | null, side: "left" | "right") {
    if (pageIndex === null) {
      return <div className="w-full h-full bg-white/50" />;
    }
    const page = layout.pages[pageIndex];
    const template = getTemplate(page.templateId);

    const spineClass =
      side === "left"
        ? "shadow-[inset_-8px_0_16px_-8px_rgba(0,0,0,0.18)]"
        : "shadow-[inset_8px_0_16px_-8px_rgba(0,0,0,0.18)]";

    return (
      <div className={`relative w-full h-full bg-white overflow-hidden ${spineClass}`}>
        {/* Template slots */}
        {template.slots.map((slot) => {
          const photoId = page.slotFills[slot.id];
          const photo   = photoId ? getPhoto(photoId) : undefined;
          return (
            <div
              key={slot.id}
              style={{
                position: "absolute",
                left:   `${slot.x * 100}%`,
                top:    `${slot.y * 100}%`,
                width:  `${slot.width * 100}%`,
                height: `${slot.height * 100}%`,
              }}
              className="overflow-hidden bg-stone-100"
            >
              {photo && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photo.previewUrl}
                  alt=""
                  className="w-full h-full object-cover"
                  draggable={false}
                />
              )}
            </div>
          );
        })}

        {/* Free placements (blank template) */}
        {page.templateId === "blank" &&
          page.placements.map((placement) => {
            const photo = getPhoto(placement.photoId);
            if (!photo) return null;
            return (
              <div
                key={placement.id}
                style={{
                  position: "absolute",
                  left:   `${placement.x * 100}%`,
                  top:    `${placement.y * 100}%`,
                  width:  `${placement.width * 100}%`,
                  height: `${placement.height * 100}%`,
                }}
                className="overflow-hidden"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.previewUrl}
                  alt=""
                  className="w-full h-full object-cover"
                  draggable={false}
                />
              </div>
            );
          })}

        {/* Page number */}
        <div className="absolute bottom-2 left-0 right-0 text-center text-[10px] text-stone-300 select-none">
          {pageIndex + 1}
        </div>
      </div>
    );
  }

  // Compute book size (same math as BookSpread)
  const spreadAspect = PAGE_ASPECT_RATIO * 2;
  const maxW = typeof window !== "undefined" ? window.innerWidth  * 0.82 : 900;
  const maxH = typeof window !== "undefined" ? window.innerHeight * 0.80 : 600;
  let spreadW = maxW;
  let spreadH = spreadW / spreadAspect;
  if (spreadH > maxH) { spreadH = maxH; spreadW = spreadH * spreadAspect; }
  const pageW = Math.floor(spreadW / 2);
  const pageH = Math.floor(spreadH);

  const translateClass =
    animDir === "next" ? "-translate-x-4 opacity-0"
    : animDir === "prev" ? "translate-x-4 opacity-0"
    : "translate-x-0 opacity-100";

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center">
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-4 right-5 text-white/60 hover:text-white text-2xl transition-colors z-10"
      >
        ×
      </button>

      {/* Spread counter */}
      <div className="text-white/40 text-xs mb-5 tracking-widest uppercase">
        แผ่นที่ {spreadIdx + 1} / {spreads.length}
      </div>

      {/* Book spread */}
      <div
        className={`relative flex transition-all duration-200 ease-in-out ${translateClass}`}
        style={{ width: spreadW, height: pageH }}
      >
        {/* Depth layers */}
        {[6, 4, 2].map((o) => (
          <div key={o} style={{ position:"absolute", top: o, left: o/2,
            width: spreadW, height: pageH, background:"#e5ddd5", borderRadius:2, zIndex:0 }} />
        ))}

        {/* Shadow */}
        <div style={{ position:"absolute", inset:0, zIndex:1, pointerEvents:"none",
          boxShadow:"0 20px 60px rgba(0,0,0,0.7), 0 8px 20px rgba(0,0,0,0.4)", borderRadius:2 }} />

        {/* Left cover edge */}
        <div style={{ position:"absolute", top:0, left:0, width:8, height:pageH, zIndex:3,
          background:"linear-gradient(to right,#78523a,#5c3d28)",
          borderTopLeftRadius:3, borderBottomLeftRadius:3 }} />

        {/* Right cover edge */}
        <div style={{ position:"absolute", top:0, right:0, width:8, height:pageH, zIndex:3,
          background:"linear-gradient(to left,#78523a,#5c3d28)",
          borderTopRightRadius:3, borderBottomRightRadius:3 }} />

        {/* Left page */}
        <div style={{ position:"relative", zIndex:2, marginLeft:8, width: pageW - 8, height: pageH, flexShrink:0 }}>
          {renderPage(leftIdx, "left")}
        </div>

        {/* Spine */}
        <div style={{ width:20, height:pageH, flexShrink:0, position:"relative", zIndex:2,
          background:"linear-gradient(to right,#d6cdc4 0%,#ede8e3 30%,#f5f0eb 50%,#ede8e3 70%,#c8bfb6 100%)",
          boxShadow:"inset 2px 0 6px rgba(0,0,0,0.12),inset -2px 0 6px rgba(0,0,0,0.12)" }} />

        {/* Right page */}
        <div style={{ position:"relative", zIndex:2, marginRight:8, width: pageW - 8, height: pageH, flexShrink:0 }}>
          {renderPage(rightIdx, "right")}
        </div>
      </div>

      {/* Navigation arrows */}
      <div className="flex items-center gap-8 mt-8">
        <button
          onClick={prev}
          disabled={spreadIdx === 0}
          className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-20 disabled:cursor-not-allowed text-white text-xl transition-colors flex items-center justify-center"
        >
          ←
        </button>

        {/* Dot indicators */}
        <div className="flex gap-2">
          {spreads.map((_, i) => (
            <button
              key={i}
              onClick={() => setSpreadIdx(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                i === spreadIdx ? "bg-amber-400 w-4" : "bg-white/30 hover:bg-white/50"
              }`}
            />
          ))}
        </div>

        <button
          onClick={next}
          disabled={spreadIdx >= spreads.length - 1}
          className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-20 disabled:cursor-not-allowed text-white text-xl transition-colors flex items-center justify-center"
        >
          →
        </button>
      </div>

      <p className="text-white/20 text-xs mt-4">กด ← → หรือ Esc เพื่อปิด</p>
    </div>
  );
}
