// ─── Layout Math — single source of truth ─────────────────────────────────
// All geometry used by both the canvas preview and the print PDF must live here.
// Never duplicate these numbers in components.

import { BookPage, PlacedPhoto, TextBox, Sticker } from "./types";
import { uid } from "@/lib/uid";
import { getTemplate } from "./templates";

/** ─── A4 page geometry — single source of truth ──────────────────────────
 *  Every page is portrait A4. The editor canvas, preview, grid thumbnails and
 *  print PDF all derive their proportions from these constants so what the
 *  user sees matches the printed book on every device. */
export const PAGE_W_MM = 210; // portrait A4 width
export const PAGE_H_MM = 297; // portrait A4 height

/** width / height — portrait A4 = 210/297 ≈ 0.7071 */
export const PAGE_ASPECT_RATIO = PAGE_W_MM / PAGE_H_MM;

/** height / width — portrait A4 = 297/210 ≈ 1.4142.
 *  Multiply a page's pixel width by this to get its pixel height. */
export const PAGE_H_OVER_W = PAGE_H_MM / PAGE_W_MM;

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
    images: [],  // Source of truth for all photos
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
  // Add photo to images array if not already there
  const images = page.images.includes(photoId) ? page.images : [...page.images, photoId];

  return {
    ...page,
    images,
    slotFills: { ...page.slotFills, [slotId]: photoId },
  };
}

/** Clear a slot (immutable) */
export function clearSlot(page: BookPage, slotId: string): BookPage {
  const slotFills = { ...page.slotFills };
  delete slotFills[slotId];
  return { ...page, slotFills };
}

/** Change the template of a page while preserving all photos and settings */
export function applyTemplate(page: BookPage, templateId: string): BookPage {
  // Get the new template definition
  const newTemplate = getTemplate(templateId);

  // Map images from the page.images array to the new template's slots
  // Photos are drawn from the images array (never deleted), just remapped to new slots
  const newSlotFills: Record<string, string> = {};
  newTemplate.slots.forEach((slot, index) => {
    // Map images by index: first image → first slot, second image → second slot, etc.
    if (page.images[index]) {
      newSlotFills[slot.id] = page.images[index];
    }
  });

  return {
    ...page,
    templateId,
    // images array is NEVER modified - always preserved
    slotFills: newSlotFills,  // Only remap slot references
    // Preserve free placements
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
  // Add photo to images array if not already there
  const images = page.images.includes(placement.photoId)
    ? page.images
    : [...page.images, placement.photoId];

  return {
    ...page,
    images,
    placements: [...page.placements, placement],
  };
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

// ─── Stickers ──────────────────────────────────────────────────────────────

/** Page width / height ratio (portrait A4 ≈ 0.7071).
 *  Used to keep square stickers visually square across the fraction system. */
const STICKER_PAGE_W_OVER_H = PAGE_ASPECT_RATIO;

/** Create a sticker placement. Default ~120px feel: 22% of page width,
 *  height adjusted so the square SVG stays square. Centred unless x/y given. */
export function defaultSticker(
  stickerId: string,
  category: string,
  src: string,
  x?: number,
  y?: number,
  zIndex = 1
): Sticker {
  const width = 0.22;
  const height = width * STICKER_PAGE_W_OVER_H; // keep square SVG square
  return {
    id: uid(),
    stickerId,
    category,
    src,
    x: x != null ? clamp(x - width / 2, 0, 1 - width) : 0.5 - width / 2,
    y: y != null ? clamp(y - height / 2, 0, 1 - height) : 0.5 - height / 2,
    width,
    height,
    rotation: 0,
    zIndex,
  };
}

/** Add a sticker to a page (immutable) */
export function addSticker(page: BookPage, sticker: Sticker): BookPage {
  return { ...page, stickers: [...(page.stickers ?? []), sticker] };
}

/** Update a sticker on a page (immutable) */
export function updateSticker(page: BookPage, updated: Sticker): BookPage {
  return {
    ...page,
    stickers: (page.stickers ?? []).map((s) => (s.id === updated.id ? updated : s)),
  };
}

/** Remove a sticker from a page (immutable) */
export function removeSticker(page: BookPage, stickerId: string): BookPage {
  return { ...page, stickers: (page.stickers ?? []).filter((s) => s.id !== stickerId) };
}
