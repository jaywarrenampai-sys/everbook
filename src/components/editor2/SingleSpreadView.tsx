"use client";

import { useEffect, useRef, useState } from "react";
import { useEditorStore } from "@/lib/store/editorStore";
import { useIsMobile } from "@/lib/useIsMobile";
import { BookPage, UploadedPhoto } from "@/lib/editor/types";
import { getTemplate } from "@/lib/editor/templates";
import { clampPlacement, clamp } from "@/lib/editor/layout";

const ASPECT = 1 / 0.77; // height / width (portrait 8.5:11)

// ── Spread index math (mirrors PageGrid.buildSpreads) ──
function spreadFor(pageIndex: number, total: number) {
  if (pageIndex === 0) return { left: 0, right: null as number | null, label: "ปก" };
  if (pageIndex === 1) return { left: null as number | null, right: 1, label: "หน้า 1" };
  const base = Math.floor((pageIndex - 2) / 2) * 2 + 2;
  const right = base + 1 < total ? base + 1 : null;
  return { left: base, right, label: right ? `หน้า ${base}-${base + 1}` : `หน้า ${base}` };
}

export default function SingleSpreadView() {
  const layout = useEditorStore((s) => s.layout);
  const photos = useEditorStore((s) => s.photos);
  const isMobile = useIsMobile();
  const containerRef = useRef<HTMLDivElement>(null);
  const [pageW, setPageW] = useState(340);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const resize = () => {
      const avail = el.clientWidth - (isMobile ? 28 : 96);
      // One page on mobile, two-page spread on desktop
      const target = isMobile ? avail : avail / 2;
      setPageW(Math.max(160, Math.min(440, target)));
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    return () => ro.disconnect();
  }, [isMobile]);

  const pageH = Math.round(pageW * ASPECT);
  const sp = spreadFor(layout.currentPageIndex, layout.pages.length);
  const leftPage = sp.left != null ? layout.pages[sp.left] : null;
  const rightPage = sp.right != null ? layout.pages[sp.right] : null;

  // On mobile: show just the page the user is on (the non-null side of the spread)
  const mobilePage = layout.pages[layout.currentPageIndex] ?? leftPage ?? rightPage;

  return (
    <div ref={containerRef} className="scroll-touch flex flex-1 flex-col items-center overflow-auto bg-[#f2f2f2] px-3 pt-5 pb-28 md:pt-8 md:pb-24">
      <Toolbar />

      {isMobile ? (
        <div className="mt-5 overflow-hidden rounded-sm shadow-xl">
          {mobilePage && (
            <EditablePage page={mobilePage} photos={photos} width={pageW} height={pageH} side="right" />
          )}
        </div>
      ) : (
        <div className="mt-6 flex overflow-hidden rounded-sm shadow-xl">
          {leftPage ? (
            <EditablePage page={leftPage} photos={photos} width={pageW} height={pageH} side="left" />
          ) : (
            <div style={{ width: pageW, height: pageH }} className="border-r border-neutral-200 bg-neutral-50" />
          )}
          <div className="w-[3px] shrink-0 bg-gradient-to-r from-neutral-300 to-neutral-200" style={{ height: pageH }} />
          {rightPage ? (
            <EditablePage page={rightPage} photos={photos} width={pageW} height={pageH} side="right" />
          ) : (
            <div style={{ width: pageW, height: pageH }} className="bg-neutral-50" />
          )}
        </div>
      )}

      <span className="mt-3 text-xs font-medium text-neutral-500">{sp.label}</span>
    </div>
  );
}

// ─── Contextual toolbar ───────────────────────────────────────────────────────
function Toolbar() {
  const layout = useEditorStore((s) => s.layout);
  const addTextBox = useEditorStore((s) => s.addTextBox);
  const removeSelected = useEditorStore((s) => s.removeSelected);
  const selection = useEditorStore((s) => s.selection);
  const updateTextBox = useEditorStore((s) => s.updateTextBox);
  const setFullBleed = useEditorStore((s) => s.setFullBleed);

  const page = layout.pages[layout.currentPageIndex];
  const selText =
    selection?.kind === "text"
      ? page?.texts?.find((t) => t.id === selection.id)
      : undefined;

  return (
    <div className="flex items-center gap-2 rounded-full bg-white px-3 py-1.5 shadow-card ring-1 ring-neutral-200">
      <button onClick={() => page && addTextBox(page.id)} className="rounded px-3 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-100">
        + เพิ่มข้อความ
      </button>

      {page && (
        <>
          <div className="h-4 w-px bg-neutral-200" />
          <button
            onClick={() => setFullBleed(page.id, !page.fullBleed)}
            className={`rounded px-3 py-1 text-xs font-medium ${page.fullBleed ? "bg-neutral-900 text-white" : "text-neutral-700 hover:bg-neutral-100"}`}
            title={page.fullBleed ? "เปิดโครงร่างปกติ" : "เปิดโหมดเต็มหน้า"}
          >
            {page.fullBleed ? "📄 เต็มหน้า" : "📄 เต็มหน้า"}
          </button>
        </>
      )}

      {selText && (
        <>
          <div className="h-4 w-px bg-neutral-200" />
          {(["left", "center", "right"] as const).map((a) => (
            <button
              key={a}
              onClick={() => updateTextBox(page.id, { ...selText, align: a })}
              className={`rounded px-2 py-1 text-xs ${selText.align === a ? "bg-neutral-900 text-white" : "text-neutral-600 hover:bg-neutral-100"}`}
            >
              {a === "left" ? "ซ้าย" : a === "center" ? "กลาง" : "ขวา"}
            </button>
          ))}
          <button
            onClick={() => updateTextBox(page.id, { ...selText, weight: selText.weight === "bold" ? "normal" : "bold" })}
            className={`rounded px-2 py-1 text-xs font-bold ${selText.weight === "bold" ? "bg-neutral-900 text-white" : "text-neutral-600 hover:bg-neutral-100"}`}
          >
            B
          </button>
        </>
      )}

      {selection && (
        <>
          <div className="h-4 w-px bg-neutral-200" />
          <button onClick={removeSelected} className="rounded px-3 py-1 text-xs font-medium text-red-500 hover:bg-red-50">
            ลบ
          </button>
        </>
      )}
    </div>
  );
}

// ─── Editable page ────────────────────────────────────────────────────────────
function EditablePage({
  page,
  photos,
  width,
  height,
  side,
}: {
  page: BookPage;
  photos: UploadedPhoto[];
  width: number;
  height: number;
  side: "left" | "right";
}) {
  const fillSlot = useEditorStore((s) => s.fillSlotAction);
  const clearSlot = useEditorStore((s) => s.clearSlotAction);
  const placeFree = useEditorStore((s) => s.placePhotoFree);
  const updatePlacement = useEditorStore((s) => s.updatePlacement);
  const updateText = useEditorStore((s) => s.updateTextBox);
  const select = useEditorStore((s) => s.select);
  const selection = useEditorStore((s) => s.selection);
  const armedPhotoId = useEditorStore((s) => s.armedPhotoId);
  const armPhoto = useEditorStore((s) => s.armPhoto);

  const template = getTemplate(page.templateId);
  const photoById = (id?: string) => (id ? photos.find((p) => p.id === id) : undefined);

  const spineShadow =
    side === "left"
      ? "shadow-[inset_-8px_0_16px_-8px_rgba(0,0,0,0.18)]"
      : "shadow-[inset_8px_0_16px_-8px_rgba(0,0,0,0.18)]";

  // ── Generic pointer drag for free elements ──
  function startDrag(
    e: React.PointerEvent,
    onMove: (dxFrac: number, dyFrac: number) => void
  ) {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const move = (ev: PointerEvent) => onMove((ev.clientX - startX) / width, (ev.clientY - startY) / height);
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  }

  return (
    <div
      style={{ width, height, background: page.background ?? "#ffffff" }}
      className={`relative shrink-0 overflow-hidden ${spineShadow}`}
      onClick={(e) => {
        // Tap-to-place on a blank page: drop the armed photo where tapped
        if (armedPhotoId && page.templateId === "blank") {
          const rect = e.currentTarget.getBoundingClientRect();
          placeFree(page.id, armedPhotoId, (e.clientX - rect.left) / width, (e.clientY - rect.top) / height);
          armPhoto(null);
          return;
        }
        select(null);
      }}
      onDragOver={(e) => page.templateId === "blank" && e.preventDefault()}
      onDrop={(e) => {
        if (page.templateId !== "blank") return;
        const photoId = e.dataTransfer.getData("photoId");
        if (!photoId) return;
        const rect = e.currentTarget.getBoundingClientRect();
        placeFree(page.id, photoId, (e.clientX - rect.left) / width, (e.clientY - rect.top) / height);
      }}
    >
      {/* Template slots */}
      {template.slots.map((slot) => {
        const photo = photoById(page.slotFills[slot.id]);
        const isSel = selection?.kind === "slot" && selection.id === slot.id && selection.pageId === page.id;
        return (
          <div
            key={slot.id}
            onClick={(e) => {
              e.stopPropagation();
              // Tap-to-place: if a photo is armed, fill this slot
              if (armedPhotoId) {
                fillSlot(page.id, slot.id, armedPhotoId);
                armPhoto(null);
                return;
              }
              select({ pageId: page.id, kind: "slot", id: slot.id });
            }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const photoId = e.dataTransfer.getData("photoId");
              if (photoId) fillSlot(page.id, slot.id, photoId);
            }}
            style={{ position: "absolute", left: slot.x * width, top: slot.y * height, width: slot.width * width, height: slot.height * height }}
            className={`group overflow-hidden ${photo ? "" : "border-2 border-dashed border-neutral-300 bg-neutral-100"} ${isSel ? "ring-2 ring-neutral-900" : ""}`}
          >
            {photo ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.previewUrl} alt="" draggable={false} className="h-full w-full object-cover" />
                <button
                  onClick={(e) => { e.stopPropagation(); clearSlot(page.id, slot.id); }}
                  className="absolute right-1 top-1 hidden h-5 w-5 items-center justify-center rounded-full bg-black/60 text-xs text-white group-hover:flex"
                >
                  ×
                </button>
              </>
            ) : (
              <div className="flex h-full w-full items-center justify-center text-neutral-300">
                <svg width="22" height="22" viewBox="0 0 24 24"><path d="M4 16l5-5 4 4 3-3 4 4M4 6h16v12H4z" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinejoin="round" /></svg>
              </div>
            )}
          </div>
        );
      })}

      {/* Free placements (blank pages) */}
      {page.placements.map((pl) => {
        const photo = photoById(pl.photoId);
        if (!photo) return null;
        const isSel = selection?.kind === "photo" && selection.id === pl.id;
        return (
          <div
            key={pl.id}
            onClick={(e) => { e.stopPropagation(); select({ pageId: page.id, kind: "photo", id: pl.id }); }}
            onPointerDown={(e) => {
              select({ pageId: page.id, kind: "photo", id: pl.id });
              const orig = { ...pl };
              startDrag(e, (dx, dy) =>
                updatePlacement(page.id, clampPlacement({ ...orig, x: orig.x + dx, y: orig.y + dy }))
              );
            }}
            style={{ position: "absolute", left: pl.x * width, top: pl.y * height, width: pl.width * width, height: pl.height * height, cursor: "move", touchAction: "none" }}
            className={`overflow-hidden ${isSel ? "ring-2 ring-neutral-900" : ""}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo.previewUrl} alt="" draggable={false} className="h-full w-full object-cover" />
            {isSel && (
              <span
                onPointerDown={(e) => {
                  const orig = { ...pl };
                  startDrag(e, (dx, dy) =>
                    updatePlacement(page.id, clampPlacement({ ...orig, width: orig.width + dx, height: orig.height + dy }))
                  );
                }}
                className="absolute -bottom-1 -right-1 h-4 w-4 cursor-se-resize rounded-full border-2 border-neutral-900 bg-white"
                style={{ touchAction: "none" }}
              />
            )}
          </div>
        );
      })}

      {/* Text boxes */}
      {(page.texts ?? []).map((t) => {
        const isSel = selection?.kind === "text" && selection.id === t.id;
        return (
          <div
            key={t.id}
            onClick={(e) => { e.stopPropagation(); select({ pageId: page.id, kind: "text", id: t.id }); }}
            onPointerDown={(e) => {
              if ((e.target as HTMLElement).isContentEditable) return;
              select({ pageId: page.id, kind: "text", id: t.id });
              const orig = { ...t };
              startDrag(e, (dx, dy) =>
                updateText(page.id, { ...orig, x: clamp(orig.x + dx, 0, 1 - orig.width), y: clamp(orig.y + dy, 0, 0.95) })
              );
            }}
            style={{ position: "absolute", left: t.x * width, top: t.y * height, width: t.width * width, cursor: "move", touchAction: "none" }}
            className={isSel ? "ring-1 ring-neutral-900" : ""}
          >
            <div
              contentEditable={isSel}
              suppressContentEditableWarning
              onBlur={(e) => updateText(page.id, { ...t, text: e.currentTarget.textContent ?? "" })}
              onPointerDown={(e) => { if (isSel) e.stopPropagation(); }}
              style={{
                fontSize: t.fontSize * height,
                textAlign: t.align,
                fontWeight: t.weight === "bold" ? 700 : 400,
                color: t.color,
                lineHeight: 1.2,
                outline: "none",
                cursor: isSel ? "text" : "move",
              }}
              className="break-words"
            >
              {t.text}
            </div>
          </div>
        );
      })}
    </div>
  );
}
