// ─── Layout Math — single source of truth ─────────────────────────────────
// All geometry used by both the canvas preview and the print PDF must live here.
// Never duplicate these numbers in components.

import { BookPage, PlacedPhoto, TextBox } from "./types";
import { uid } from "@/lib/uid";
import { getTemplate } from "./templates";

/** Book page aspect ratio (width / height).
 *  Placeholder: A4 landscape = 297mm / 210mm ≈ 1.4143
 *  UPDATE this once the real print spec is confirmed with the printer.
 */
export const PAGE_ASPECT_RATIO = 297 / 210; // ~1.4143  (width / height)

/** Minimum placement size as a fraction of page dimension */
export const MIN_PLACEMENT_SIZE = 0.08;

/** Clamp a number between min and max */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/** Snap a placement so it doesn't go outside the page */
export function clampPlacement(p: PlacedPhoto): PlacedPhoto {
  const width = clamp(p.width, MIN_PLACEMENT_SIZE, 1);
  const height = clamp(p.height, MIN_PLACEMENT_SIZE, 1);
  const x = clamp(p.x, 0, 1 - width);
  const y = clamp(p.y, 0, 1 - height);
  return { ...p, x, y, width, height };
}

/** Convert a canvas-pixel delta to fractional page units */
export function pxToFraction(
  pxDelta: number,
  pagePxDimension: number
): number {
  return pxDelta / pagePxDimension;
}

/** Create a blank page */
export function newPage(templateId = "blank"): BookPage {
  return {
    id: uid(),
    templateId,
    slotFills: {},
    placements: [],
  };
}

/** Fill a template slot with a photo (immutable) */
export function fillSlot(
  page: BookPage,
  slotId: string,
  photoId: string
): BookPage {
  return { ...page, slotFills: { ...page.slotFills, [slotId]: photoId } };
}

/** Clear a slot (immutable) */
export function clearSlot(page: BookPage, slotId: string): BookPage {
  const slotFills = { ...page.slotFills };
  delete slotFills[slotId];
  return { ...page, slotFills };
}

/** Change the template of a page while preserving photos and full bleed settings */
export function applyTemplate(page: BookPage, templateId: string): BookPage {
  // Get all currently filled photos (in order)
  const currentPhotos = Object.values(page.slotFills).filter(Boolean);

  // Map photos to new template's slots in order
  // This preserves photos when switching templates
  const newTemplate = getTemplate(templateId);
  const newSlotFills: Record<string, string> = {};
  newTemplate.slots.forEach((slot, index) => {
    if (currentPhotos[index]) {
      newSlotFills[slot.id] = currentPhotos[index];
    }
  });

  return {
    ...page,
    templateId,
    slotFills: newSlotFills, // Preserve and remap photos
    // Preserve free placements (blank page photos)
    placements: page.placements,
    // Preserve full bleed and crop settings
    fullBleed: page.fullBleed,
    cropX: page.cropX,
    cropY: page.cropY,
    zoom: page.zoom,
  };
}

/** Add a new placement to a page, centred, sized to 40% of page */
export function defaultPlacement(photoId: string): PlacedPhoto {
  return {
    id: uid(),
    photoId,
    x: 0.3,
    y: 0.3,
    width: 0.4,
    height: 0.4,
  };
}

/** Update a single placement inside a page (immutable) */
export function updatePlacement(
  page: BookPage,
  updated: PlacedPhoto
): BookPage {
  return {
    ...page,
    placements: page.placements.map((p) =>
      p.id === updated.id ? updated : p
    ),
  };
}

/** Remove a placement from a page (immutable) */
export function removePlacement(page: BookPage, placementId: string): BookPage {
  return {
    ...page,
    placements: page.placements.filter((p) => p.id !== placementId),
  };
}

/** Add a placement to a page (immutable) */
export function addPlacement(page: BookPage, placement: PlacedPhoto): BookPage {
  return { ...page, placements: [...page.placements, placement] };
}

// ─── Text boxes ────────────────────────────────────────────────────────────

/** Create a default centred caption text box */
export function defaultTextBox(text = "ข้อความ"): TextBox {
  return {
    id: uid(),
    text,
    x: 0.15,
    y: 0.45,
    width: 0.7,
    fontSize: 0.06,
    align: "center",
    weight: "bold",
    color: "#2E2620",
  };
}

/** Add a text box (immutable) */
export function addText(page: BookPage, box: TextBox): BookPage {
  return { ...page, texts: [...(page.texts ?? []), box] };
}

/** Update a text box (immutable) */
export function updateText(page: BookPage, updated: TextBox): BookPage {
  return {
    ...page,
    texts: (page.texts ?? []).map((t) => (t.id === updated.id ? updated : t)),
  };
}

/** Remove a text box (immutable) */
export function removeText(page: BookPage, textId: string): BookPage {
  return { ...page, texts: (page.texts ?? []).filter((t) => t.id !== textId) };
}

/** Set a page background (immutable) */
export function setBackground(page: BookPage, background?: string): BookPage {
  return { ...page, background };
}

/** Toggle full bleed mode on a page (immutable) */
export function setFullBleed(page: BookPage, fullBleed: boolean): BookPage {
  return { ...page, fullBleed, cropX: 0, cropY: 0, zoom: 100 };
}

/** Set horizontal crop position for full bleed (immutable) */
export function setCropX(page: BookPage, cropX: number): BookPage {
  return { ...page, cropX: Math.max(-100, Math.min(100, cropX)) };
}

/** Set vertical crop position for full bleed (immutable) */
export function setCropY(page: BookPage, cropY: number): BookPage {
  return { ...page, cropY: Math.max(-100, Math.min(100, cropY)) };
}

/** Set zoom level for full bleed (immutable) */
export function setZoom(page: BookPage, zoom: number): BookPage {
  return { ...page, zoom: Math.max(100, Math.min(300, zoom)) };
}
