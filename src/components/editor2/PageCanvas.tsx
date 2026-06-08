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
 *
 * Supports full bleed mode where images extend edge-to-edge with crop/zoom controls.
 */
export default function PageCanvas({ page, photos, width, height }: Props) {
  if (!page) {
    return <div style={{ width, height }} className="shrink-0 bg-muted" />;
  }

  const template = getTemplate(page.templateId);
  const photoById = (id?: string) => (id ? photos.find((p) => p.id === id) : undefined);

  /**
   * Calculate image transform for full bleed mode.
   * cropX and cropY shift the image center; zoom scales it up.
   */
  const getImageTransform = (zoom: number = 100, cropX: number = 0, cropY: number = 0): string => {
    const zoomPercent = zoom / 100;
    // Translate by crop offset (as percentage of zoom)
    const translateX = (cropX / 100) * 20; // scale crop range to reasonable pixels
    const translateY = (cropY / 100) * 20;
    return `translate(${translateX}%, ${translateY}%) scale(${zoomPercent})`;
  };

  return (
    <div
      style={{ width, height, background: bgToCss(page.background) }}
      className="relative shrink-0 overflow-hidden"
    >
      {/* Template slots */}
      {template.slots.map((slot) => {
        const photo = photoById(page.slotFills[slot.id]);

        // When fullBleed is ON, make slot fill entire page
        const isFullBleed = page.fullBleed === true;
        const slotX = isFullBleed ? 0 : slot.x;
        const slotY = isFullBleed ? 0 : slot.y;
        const slotWidth = isFullBleed ? 1 : slot.width;
        const slotHeight = isFullBleed ? 1 : slot.height;

        return (
          <div
            key={slot.id}
            style={{
              position: "absolute",
              left: slotX * width,
              top: slotY * height,
              width: slotWidth * width,
              height: slotHeight * height,
              overflow: "hidden",
            }}
            className="bg-muted"
          >
            {photo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={photo.previewUrl}
                alt=""
                draggable={false}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "center",
                  transform: isFullBleed ? getImageTransform(page.zoom, page.cropX, page.cropY) : undefined,
                  transformOrigin: "center",
                }}
              />
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
              overflow: "hidden",
            }}
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

      {/* Stickers */}
      {(page.stickers ?? [])
        .slice()
        .sort((a, b) => a.zIndex - b.zIndex)
        .map((st) => (
          <div
            key={st.id}
            style={{
              position: "absolute",
              left: st.x * width,
              top: st.y * height,
              width: st.width * width,
              height: st.height * height,
              transform: `rotate(${st.rotation}deg)`,
              transformOrigin: "center",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={st.src} alt="" draggable={false} className="h-full w-full object-contain" />
          </div>
        ))}
    </div>
  );
}
