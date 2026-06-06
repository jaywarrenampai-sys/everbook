"use client";

import { BookPage, UploadedPhoto } from "@/lib/editor/types";
import { getTemplate } from "@/lib/editor/templates";

interface Props {
  page: BookPage | null;
  photos: UploadedPhoto[];
  width: number;
  height: number;
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
 */
export default function PageCanvas({ page, photos, width, height }: Props) {
  if (!page) {
    return <div style={{ width, height }} className="shrink-0 bg-neutral-50" />;
  }

  const template = getTemplate(page.templateId);
  const photoById = (id?: string) => (id ? photos.find((p) => p.id === id) : undefined);

  return (
    <div
      style={{ width, height, background: bgToCss(page.background) }}
      className="relative shrink-0 overflow-hidden"
    >
      {/* Template slots */}
      {template.slots.map((slot) => {
        const photo = photoById(page.slotFills[slot.id]);
        return (
          <div
            key={slot.id}
            style={{
              position: "absolute",
              left: slot.x * width,
              top: slot.y * height,
              width: slot.width * width,
              height: slot.height * height,
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
