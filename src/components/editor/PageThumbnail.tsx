"use client";

import { BookPage, UploadedPhoto } from "@/lib/editor/types";
import { getTemplate } from "@/lib/editor/templates";

interface Props {
  page:    BookPage | null; // null = blank white half
  photos:  UploadedPhoto[];
  width:   number;
  height:  number;
}

/**
 * Read-only thumbnail of a single page.
 * Used in the page grid and preview strip.
 */
export default function PageThumbnail({ page, photos, width, height }: Props) {
  if (!page) {
    // Blank half (e.g., right side of Cover spread)
    return (
      <div
        style={{ width, height }}
        className="bg-neutral-50 border border-neutral-100 flex-shrink-0"
      />
    );
  }

  const template = getTemplate(page.templateId);
  const scale    = Math.min(width, height) / 300; // normalise rendering

  function getPhoto(id: string): UploadedPhoto | undefined {
    return photos.find((p) => p.id === id);
  }

  return (
    <div
      style={{ width, height, fontSize: scale * 10 }}
      className="relative bg-white flex-shrink-0 overflow-hidden"
    >
      {/* Template slots */}
      {template.slots.map((slot) => {
        const photoId = page.slotFills[slot.id];
        const photo   = photoId ? getPhoto(photoId) : undefined;
        return (
          <div
            key={slot.id}
            style={{
              position:  "absolute",
              left:      slot.x      * width,
              top:       slot.y      * height,
              width:     slot.width  * width,
              height:    slot.height * height,
              overflow:  "hidden",
            }}
            className="bg-neutral-100"
          >
            {photo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={photo.previewUrl}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                draggable={false}
              />
            )}
          </div>
        );
      })}

      {/* Free placements */}
      {page.templateId === "blank" &&
        page.placements.map((placement) => {
          const photo = getPhoto(placement.photoId);
          if (!photo) return null;
          return (
            <div
              key={placement.id}
              style={{
                position:  "absolute",
                left:      placement.x     * width,
                top:       placement.y     * height,
                width:     placement.width * width,
                height:    placement.height* height,
                overflow:  "hidden",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.previewUrl}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                draggable={false}
              />
            </div>
          );
        })}

      {/* Empty blank page indicator */}
      {page.templateId === "blank" && page.placements.length === 0 && template.slots.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="text-neutral-200 font-light"
            style={{ fontSize: Math.max(8, width * 0.08) }}
          >
            —
          </div>
        </div>
      )}
    </div>
  );
}
