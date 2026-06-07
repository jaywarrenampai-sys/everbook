"use client";

import { BookPage, UploadedPhoto } from "@/lib/editor/types";
import { getTemplate } from "@/lib/editor/templates";

interface Props {
  page: BookPage | null;
  photos: UploadedPhoto[];
  width: number;
  height: number;
  fullBleed?: boolean;
}

/** Resolve a background id/hex to a CSS value. */
function bgToCss(bg?: string): string {
  if (!bg) return "#ffffff";
  return bg; // hex or css color
}

/**
 * Pure, read-only render of one book page at a given pixel size.
 * Coordinates are 0–1 fractions (same system as PDF export).
 * Used for grid thumbnails AND as the visual base of the single view.
 *
 * When fullBleed is true, template slots are scaled to remove margins
 * and extend to the page edges.
 */
export default function PageCanvas({ page, photos, width, height, fullBleed }: Props) {
  if (!page) {
    return <div style={{ width, height }} className="shrink-0 bg-neutral-50" />;
  }

  const template = getTemplate(page.templateId);
  const photoById = (id?: string) => (id ? photos.find((p) => p.id === id) : undefined);

  /**
   * When fullBleed is enabled, scale slot positioning to remove margins.
   * This adjusts slots that have built-in margins to extend to the page edges.
   */
  const adjustSlotForBleed = (
    slotX: number,
    slotY: number,
    slotWidth: number,
    slotHeight: number
  ) => {
    if (!fullBleed) return { x: slotX, y: slotY, w: slotWidth, h: slotHeight };

    // Scale slots to remove margins: contract the overall bounding box
    // and expand slots to fill it, effectively removing safety margins
    const margin = 0.04; // typical margin in templates
    const scaleFactor = 1 / (1 - margin * 2);
    const adjustedX = Math.max(0, (slotX - margin) * scaleFactor);
    const adjustedY = Math.max(0, (slotY - margin) * scaleFactor);
    const adjustedW = Math.min(1, slotWidth * scaleFactor);
    const adjustedH = Math.min(1, slotHeight * scaleFactor);

    return { x: adjustedX, y: adjustedY, w: adjustedW, h: adjustedH };
  };

  return (
    <div
      style={{ width, height, background: bgToCss(page.background) }}
      className="relative shrink-0 overflow-hidden"
      data-fullbleed={fullBleed ? "true" : undefined}
    >
      {/* Template slots */}
      {template.slots.map((slot) => {
        const photo = photoById(page.slotFills[slot.id]);
        const adjusted = adjustSlotForBleed(slot.x, slot.y, slot.width, slot.height);
        return (
          <div
            key={slot.id}
            style={{
              position: "absolute",
              left: adjusted.x * width,
              top: adjusted.y * height,
              width: adjusted.w * width,
              height: adjusted.h * height,
            }}
            className="overflow-hidden bg-neutral-100"
          >
            {photo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photo.previewUrl} alt="" draggable={false} className="h-full w-full object-cover" />
            )}
          </div>
        );
      })}

      {/* Free placements */}
      {page.placements.map((pl) => {
        const photo = photoById(pl.photoId);
        if (!photo) return null;
        return (
          <div
            key={pl.id}
            style={{
              position: "absolute",
              left: pl.x * width,
              top: pl.y * height,
              width: pl.width * width,
              height: pl.height * height,
            }}
            className="overflow-hidden"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo.previewUrl} alt="" draggable={false} className="h-full w-full object-cover" />
          </div>
        );
      })}

      {/* Text boxes */}
      {(page.texts ?? []).map((t) => (
        <div
          key={t.id}
          style={{
            position: "absolute",
            left: t.x * width,
            top: t.y * height,
            width: t.width * width,
            fontSize: t.fontSize * height,
            textAlign: t.align,
            fontWeight: t.weight === "bold" ? 700 : 400,
            color: t.color,
            lineHeight: 1.2,
          }}
          className="select-none break-words"
        >
          {t.text}
        </div>
      ))}
    </div>
  );
}
