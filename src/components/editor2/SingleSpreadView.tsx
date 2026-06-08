"use client";

import { useEffect, useRef, useState } from "react";
import { useEditorStore } from "@/lib/store/editorStore";
import { useIsMobile } from "@/lib/useIsMobile";
import { BookPage, UploadedPhoto } from "@/lib/editor/types";
import { getTemplate } from "@/lib/editor/templates";
import { clampPlacement, clamp } from "@/lib/editor/layout";
import FullBleedControls from "./FullBleedControls";

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
    <div ref={containerRef} className="scroll-touch flex flex-1 flex-col items-center overflow-auto bg-gradient-to-b from-muted to-background px-3 pt-5 pb-28 md:pt-8 md:pb-24">
      <Toolbar />

      {isMobile ? (
        <div className="mt-5 overflow-hidden rounded-2xl border-4 border-card shadow-2xl shadow-foreground/10">
          {mobilePage && (
            <EditablePage page={mobilePage} photos={photos} width={pageW} height={pageH} side="right" />
          )}
        </div>
      ) : (
        <div className="mt-6 flex overflow-hidden rounded-2xl border-4 border-card shadow-2xl shadow-foreground/10">
          {leftPage ? (
            <EditablePage page={leftPage} photos={photos} width={pageW} height={pageH} side="left" />
          ) : (
            <div style={{ width: pageW, height: pageH }} className="border-r border-border bg-muted" />
          )}
          <div className="w-[3px] shrink-0 bg-gradient-to-r from-foreground/15 to-foreground/5" style={{ height: pageH }} />
          {rightPage ? (
            <EditablePage page={rightPage} photos={photos} width={pageW} height={pageH} side="right" />
          ) : (
            <div style={{ width: pageW, height: pageH }} className="bg-muted" />
          )}
        </div>
      )}

      <span className="mt-3 rounded-full bg-muted px-4 py-1.5 text-xs font-semibold text-muted-foreground">{sp.label}</span>
    </div>
  );
}

// ─── Contextual toolbar ───────────────────────────────────────────────────────
function Toolbar() {
  const layout = useEditorStore((s) => s.layout);
  const photos = useEditorStore((s) => s.photos);
  const addTextBox = useEditorStore((s) => s.addTextBox);
  const removeSelected = useEditorStore((s) => s.removeSelected);
  const selection = useEditorStore((s) => s.selection);
  const updateTextBox = useEditorStore((s) => s.updateTextBox);
  const setFullBleed = useEditorStore((s) => s.setFullBleed);
  const setCropX = useEditorStore((s) => s.setCropX);
  const setCropY = useEditorStore((s) => s.setCropY);
  const setZoom = useEditorStore((s) => s.setZoom);

  const page = layout.pages[layout.currentPageIndex];
  const selText =
    selection?.kind === "text"
      ? page?.texts?.find((t) => t.id === selection.id)
      : undefined;

  /**
   * Auto-fit image to fill page without white space.
   * Uses object-fit: cover logic to scale image and remove margins.
   */
  const fitImageToPage = () => {
    if (!page) return;

    // Get the first photo in the current slot (for template-based pages)
    const slotFills = Object.values(page.slotFills);
    const photoId = slotFills[0];
    const photo = photoId ? photos.find((p) => p.id === photoId) : null;

    if (!photo) return;

    // Page aspect ratio (height / width) for portrait orientation
    const PAGE_ASPECT = 1 / 0.77; // ≈ 1.30 (portrait)
    const imageAspect = photo.height / photo.width;

    // Calculate scale needed for object-fit: cover behavior
    // cover_scale = max(pageWidth/imageWidth, pageHeight/imageHeight)
    // Using aspect ratios: max(1, pageAspect/imageAspect)
    const coverScale = Math.max(1, PAGE_ASPECT / imageAspect);
    let requiredZoom = Math.round(coverScale * 100);

    // Clamp zoom to valid range
    requiredZoom = Math.max(100, Math.min(300, requiredZoom));

    // Set fullBleed with auto-calculated zoom and centered crop
    setFullBleed(page.id, true);
    setZoom(page.id, requiredZoom);
    setCropX(page.id, 0);
    setCropY(page.id, 0);
  };

  const handleFullBleedToggle = () => {
    if (!page) return;
    if (!page.fullBleed) {
      // Turning ON: auto-fit the image
      fitImageToPage();
    } else {
      // Turning OFF: just toggle
      setFullBleed(page.id, false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex flex-wrap items-center justify-center gap-1.5 rounded-full border-2 border-border bg-card px-2.5 py-1.5 shadow-sm">
        <button onClick={() => page && addTextBox(page.id)} className="rounded-full px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted">
          + เพิ่มข้อความ
        </button>

        {page && (
          <>
            <div className="h-4 w-px bg-border" />
            <button
              onClick={handleFullBleedToggle}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${page.fullBleed ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"}`}
              title={page.fullBleed ? "เปิดโครงร่างปกติ" : "เปิดโหมดเต็มหน้า"}
            >
              📄 เต็มหน้า
            </button>
          </>
        )}

        {selText && (
          <>
            <div className="h-4 w-px bg-border" />
            {(["left", "center", "right"] as const).map((a) => (
              <button
                key={a}
                onClick={() => updateTextBox(page.id, { ...selText, align: a })}
                className={`rounded-full px-2.5 py-1.5 text-xs font-semibold transition-colors ${selText.align === a ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
              >
                {a === "left" ? "ซ้าย" : a === "center" ? "กลาง" : "ขวา"}
              </button>
            ))}
            <button
              onClick={() => updateTextBox(page.id, { ...selText, weight: selText.weight === "bold" ? "normal" : "bold" })}
              className={`rounded-full px-2.5 py-1.5 text-xs font-bold transition-colors ${selText.weight === "bold" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
            >
              B
            </button>
          </>
        )}

        {selection && (
          <>
            <div className="h-4 w-px bg-border" />
            <button onClick={removeSelected} className="rounded-full px-3 py-1.5 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/10">
              ลบ
            </button>
          </>
        )}
      </div>

      {/* Full bleed crop/zoom controls */}
      {page && page.fullBleed && (
        <FullBleedControls
          cropX={page.cropX ?? 0}
          cropY={page.cropY ?? 0}
          zoom={page.zoom ?? 100}
          onCropXChange={(value) => setCropX(page.id, value)}
          onCropYChange={(value) => setCropY(page.id, value)}
          onZoomChange={(value) => setZoom(page.id, value)}
        />
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
  const addSticker = useEditorStore((s) => s.addSticker);
  const updateSticker = useEditorStore((s) => s.updateSticker);
  const duplicateSticker = useEditorStore((s) => s.duplicateSticker);
  const removeSelected = useEditorStore((s) => s.removeSelected);

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
      data-page=""
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
      onDragOver={(e) => {
        // Stickers can drop on any template; photos only on blank pages
        if (page.templateId === "blank" || e.dataTransfer.types.includes("stickerid")) {
          e.preventDefault();
        }
      }}
      onDrop={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const fx = (e.clientX - rect.left) / width;
        const fy = (e.clientY - rect.top) / height;
        // Sticker drop (allowed on any template)
        const stickerId = e.dataTransfer.getData("stickerId");
        const stickerSrc = e.dataTransfer.getData("stickerSrc");
        const stickerCat = e.dataTransfer.getData("stickerCategory");
        if (stickerId && stickerSrc) {
          e.preventDefault();
          addSticker(page.id, stickerId, stickerCat, stickerSrc, fx, fy);
          return;
        }
        // Photo drop (blank pages only)
        if (page.templateId !== "blank") return;
        const photoId = e.dataTransfer.getData("photoId");
        if (!photoId) return;
        placeFree(page.id, photoId, fx, fy);
      }}
    >
      {/* Template slots */}
      {template.slots.map((slot) => {
        const photo = photoById(page.slotFills[slot.id]);
        const isSel = selection?.kind === "slot" && selection.id === slot.id && selection.pageId === page.id;

        // When fullBleed is ON, slot fills entire page
        const isFullBleed = page.fullBleed === true;
        const slotX = isFullBleed ? 0 : slot.x;
        const slotY = isFullBleed ? 0 : slot.y;
        const slotW = isFullBleed ? 1 : slot.width;
        const slotH = isFullBleed ? 1 : slot.height;

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
            style={{ position: "absolute", left: slotX * width, top: slotY * height, width: slotW * width, height: slotH * height }}
            className={`group overflow-hidden ${photo ? "" : "rounded-xl border-2 border-dashed border-foreground/15 bg-card/40"} ${isSel ? "ring-2 ring-primary" : ""}`}
          >
            {photo ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.previewUrl}
                  alt=""
                  draggable={false}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: "center",
                    transform: isFullBleed
                      ? `translate(${(page.cropX ?? 0) / 5}%, ${(page.cropY ?? 0) / 5}%) scale(${(page.zoom ?? 100) / 100})`
                      : undefined,
                    transformOrigin: "center",
                  }}
                />
                <button
                  onClick={(e) => { e.stopPropagation(); clearSlot(page.id, slot.id); }}
                  className="absolute right-1 top-1 hidden h-5 w-5 items-center justify-center rounded-full bg-black/60 text-xs text-white group-hover:flex"
                >
                  ×
                </button>
              </>
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-foreground/40">
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
            className={`overflow-hidden ${isSel ? "ring-2 ring-primary" : ""}`}
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
                className="absolute -bottom-1 -right-1 h-4 w-4 cursor-se-resize rounded-full border-2 border-primary bg-card"
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
            className={isSel ? "ring-1 ring-primary" : ""}
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

      {/* Stickers */}
      {(page.stickers ?? [])
        .slice()
        .sort((a, b) => a.zIndex - b.zIndex)
        .map((st) => {
          const isSel = selection?.kind === "sticker" && selection.id === st.id;
          const aspect = st.height / st.width; // preserve sticker aspect on resize
          return (
            <div
              key={st.id}
              onClick={(e) => { e.stopPropagation(); select({ pageId: page.id, kind: "sticker", id: st.id }); }}
              onPointerDown={(e) => {
                e.stopPropagation();
                select({ pageId: page.id, kind: "sticker", id: st.id });
                const orig = { ...st };
                startDrag(e, (dx, dy) =>
                  updateSticker(page.id, {
                    ...orig,
                    x: clamp(orig.x + dx, 0, 1 - orig.width),
                    y: clamp(orig.y + dy, 0, 1 - orig.height),
                  })
                );
              }}
              style={{
                position: "absolute",
                left: st.x * width,
                top: st.y * height,
                width: st.width * width,
                height: st.height * height,
                transform: `rotate(${st.rotation}deg)`,
                transformOrigin: "center",
                cursor: "move",
                touchAction: "none",
              }}
              className={isSel ? "ring-2 ring-primary" : ""}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={st.src} alt="" draggable={false} className="h-full w-full select-none object-contain" />

              {isSel && (
                <>
                  {/* delete */}
                  <button
                    onClick={(e) => { e.stopPropagation(); removeSelected(); }}
                    onPointerDown={(e) => e.stopPropagation()}
                    className="absolute -right-3 -top-3 flex size-6 items-center justify-center rounded-full bg-destructive text-xs font-bold text-background shadow"
                    title="ลบ"
                  >
                    ×
                  </button>
                  {/* duplicate */}
                  <button
                    onClick={(e) => { e.stopPropagation(); duplicateSticker(page.id, st.id); }}
                    onPointerDown={(e) => e.stopPropagation()}
                    className="absolute -left-3 -top-3 flex size-6 items-center justify-center rounded-full bg-primary text-background shadow"
                    title="ทำสำเนา"
                  >
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><rect x="3" y="3" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.6" /><path d="M6 13h7V6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
                  </button>
                  {/* rotate (top center) */}
                  <span
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      const pageEl = (e.target as HTMLElement).closest("[data-page]") as HTMLElement | null;
                      if (!pageEl) return;
                      const r = pageEl.getBoundingClientRect();
                      const cx = r.left + (st.x + st.width / 2) * width;
                      const cy = r.top + (st.y + st.height / 2) * height;
                      const orig = { ...st };
                      const move = (ev: PointerEvent) => {
                        const ang = (Math.atan2(ev.clientY - cy, ev.clientX - cx) * 180) / Math.PI + 90;
                        updateSticker(page.id, { ...orig, rotation: Math.round(ang) });
                      };
                      const up = () => {
                        window.removeEventListener("pointermove", move);
                        window.removeEventListener("pointerup", up);
                      };
                      window.addEventListener("pointermove", move);
                      window.addEventListener("pointerup", up);
                    }}
                    className="absolute -top-7 left-1/2 size-5 -translate-x-1/2 cursor-grab rounded-full border-2 border-primary bg-card"
                    style={{ touchAction: "none" }}
                    title="หมุน"
                  />
                  {/* resize (bottom-right) */}
                  <span
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      const orig = { ...st };
                      startDrag(e, (dx) => {
                        const width2 = clamp(orig.width + dx, 0.05, 1);
                        updateSticker(page.id, { ...orig, width: width2, height: width2 * aspect });
                      });
                    }}
                    className="absolute -bottom-2 -right-2 size-4 cursor-se-resize rounded-full border-2 border-primary bg-card"
                    style={{ touchAction: "none" }}
                    title="ปรับขนาด"
                  />
                </>
              )}
            </div>
          );
        })}
    </div>
  );
}
