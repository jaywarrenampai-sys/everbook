/**
 * ─── Print PDF Export ────────────────────────────────────────────────────────
 *
 * Uses the SAME layout math as the editor (fractions from /lib/editor/layout).
 * If the editor preview and this file ever drift apart, the printed book will
 * not match what the customer designed. Keep them in sync.
 *
 * ⚠️  PRINT SPEC PLACEHOLDERS — confirm with your printer before going live:
 *   - Page size:    A4 landscape (297 × 210 mm)   ← confirm
 *   - Bleed:        3 mm each edge                ← confirm
 *   - Safe margin:  5 mm inside trim              ← confirm
 *   - Resolution:   300 DPI minimum               ← confirmed (enforce on upload)
 *   - Color profile: sRGB (PDF/X-1a needs CMYK)  ← PLACEHOLDER — get printer ICC
 *   - File format:  PDF (not yet PDF/X-1a)        ← PLACEHOLDER — upgrade when spec confirmed
 *   - Cover spec:   not yet implemented           ← PLACEHOLDER
 */

import { PDFDocument, rgb, degrees, PDFOperator } from "pdf-lib";
import { BookLayout } from "@/lib/editor/types";
import { getTemplate } from "@/lib/editor/templates";
import { PAGE_ASPECT_RATIO } from "@/lib/editor/layout";
import { STICKER_PATHS } from "@/lib/stickers/paths";

/** Parse "#rrggbb" or "#rrggbbaa" → pdf-lib color + opacity */
function parseFill(hex: string): { color: ReturnType<typeof rgb>; opacity: number } {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const opacity = h.length >= 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1;
  return { color: rgb(r || 0, g || 0, b || 0), opacity };
}

// ── Print constants ───────────────────────────────────────────────────────────
const MM_TO_PT = 2.83465;   // 1 mm = 2.83465 points (PostScript points)

// ⚠️ PLACEHOLDER — confirm these with your printer
const PAGE_W_MM  = 297;     // trim width
const PAGE_H_MM  = 210;     // trim height
const BLEED_MM   = 3;       // bleed on each edge
const SAFE_MM    = 5;       // safe margin inside trim (for reference only — templates enforce this)

// Derived in points
const BLEED_PT   = BLEED_MM  * MM_TO_PT;
const PAGE_W_PT  = PAGE_W_MM * MM_TO_PT;
const PAGE_H_PT  = PAGE_H_MM * MM_TO_PT;
// Full page with bleed
const FULL_W_PT  = (PAGE_W_MM + BLEED_MM * 2) * MM_TO_PT;
const FULL_H_PT  = (PAGE_H_MM + BLEED_MM * 2) * MM_TO_PT;

// Sanity-check: PAGE_ASPECT_RATIO should match PAGE_W_MM / PAGE_H_MM
// If you change the layout.ts constant, update PAGE_W_MM / PAGE_H_MM here too.
if (Math.abs(PAGE_W_MM / PAGE_H_MM - PAGE_ASPECT_RATIO) > 0.01) {
  console.warn(
    "⚠️ PDF export: PAGE_ASPECT_RATIO in layout.ts does not match the print spec. " +
    "The printed book will not match the editor preview."
  );
}

// ── Photo cache type ──────────────────────────────────────────────────────────
interface PhotoBytes {
  data: Uint8Array;
  mimeType: string;
}

// ── Main export function ──────────────────────────────────────────────────────

/**
 * Generate a print-ready PDF from a saved book layout.
 *
 * @param layout       The BookLayout JSON (loaded from DB)
 * @param fetchPhoto   A function that returns raw bytes for a given photoId.
 *                     The caller is responsible for fetching from Storage.
 * @returns            PDF bytes ready to stream or save.
 */
export async function generatePDF(
  layout: BookLayout,
  fetchPhoto: (photoId: string) => Promise<PhotoBytes>
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setTitle("Everbook Print PDF");
  doc.setCreator("Everbook");

  // Pre-load all referenced photos
  const photoIds = collectPhotoIds(layout);
  const photoCache = new Map<string, PhotoBytes>();
  await Promise.all(
    photoIds.map(async (id) => {
      try {
        photoCache.set(id, await fetchPhoto(id));
      } catch (e) {
        console.warn(`Could not fetch photo ${id}:`, e);
      }
    })
  );

  // Render each page
  for (let i = 0; i < layout.pages.length; i++) {
    await renderPage(doc, layout, i, photoCache);
  }

  // Metadata
  doc.setSubject(`${layout.pages.length} pages`);
  doc.setKeywords(["everbook", "photobook", "print"]);

  const bytes = await doc.save();
  return bytes;
}

// ── Render one page ───────────────────────────────────────────────────────────

async function renderPage(
  doc: PDFDocument,
  layout: BookLayout,
  pageIndex: number,
  photoCache: Map<string, PhotoBytes>
) {
  const bookPage = layout.pages[pageIndex];
  const template = getTemplate(bookPage.templateId);

  // pdf-lib: origin is bottom-left, y increases upward
  // Our layout: origin is top-left, y increases downward — flip required
  const page = doc.addPage([FULL_W_PT, FULL_H_PT]);

  // ── White page background (inside bleed area) ────────────────────────────
  page.drawRectangle({
    x: BLEED_PT,
    y: BLEED_PT,
    width: PAGE_W_PT,
    height: PAGE_H_PT,
    color: rgb(1, 1, 1),
  });

  // ── Draw bleed marks (crop marks) ───────────────────────────────────────
  drawCropMarks(page, FULL_W_PT, FULL_H_PT, BLEED_PT);

  // ── Template slots ───────────────────────────────────────────────────────
  for (const slot of template.slots) {
    const photoId = bookPage.slotFills[slot.id];
    if (!photoId) continue;
    const photoBytes = photoCache.get(photoId);
    if (!photoBytes) continue;

    await drawPhoto(doc, page, photoBytes, {
      // Convert 0-1 fractions → page coordinates (origin top-left of trim area)
      xFrac: slot.x,
      yFrac: slot.y,
      wFrac: slot.width,
      hFrac: slot.height,
    });
  }

  // ── Free placements (blank template) ────────────────────────────────────
  if (bookPage.templateId === "blank") {
    for (const placement of bookPage.placements) {
      const photoBytes = photoCache.get(placement.photoId);
      if (!photoBytes) continue;

      await drawPhoto(doc, page, photoBytes, {
        xFrac: placement.x,
        yFrac: placement.y,
        wFrac: placement.width,
        hFrac: placement.height,
      });
    }
  }

  // ── Stickers (drawn on top, vector — uses same fraction coords) ─────────
  for (const sticker of bookPage.stickers ?? []) {
    const art = STICKER_PATHS[sticker.stickerId];
    if (!art) continue;

    // Square art (100×100). Draw at side S based on width fraction.
    const S = sticker.width * PAGE_W_PT;
    const scale = S / 100;
    const cxFrac = sticker.x + sticker.width / 2;
    const cyFrac = sticker.y + sticker.height / 2;
    const cx = BLEED_PT + cxFrac * PAGE_W_PT;
    const cy = BLEED_PT + PAGE_H_PT - cyFrac * PAGE_H_PT; // flip y
    const r = (-sticker.rotation * Math.PI) / 180; // editor clockwise → pdf ccw

    // Position the SVG top-left origin so the art rotates about its centre
    const x = cx - Math.cos(r) * (S / 2) - Math.sin(r) * (S / 2);
    const y = cy - Math.sin(r) * (S / 2) + Math.cos(r) * (S / 2);

    for (const p of art.paths) {
      const { color, opacity } = parseFill(p.fill);
      page.drawSvgPath(p.d, {
        x,
        y,
        scale,
        rotate: degrees(-sticker.rotation),
        color,
        opacity,
      });
    }
  }

  // ── Page number (in bleed gutter — will be trimmed off) ─────────────────
  page.drawText(`${pageIndex + 1}`, {
    x: FULL_W_PT / 2,
    y: BLEED_PT / 2,
    size: 7,
    color: rgb(0.6, 0.6, 0.6),
  });
}

// ── Draw a photo into a fractional slot ──────────────────────────────────────

async function drawPhoto(
  doc: PDFDocument,
  page: ReturnType<PDFDocument["addPage"]>,
  photo: PhotoBytes,
  slot: { xFrac: number; yFrac: number; wFrac: number; hFrac: number }
) {
  // Convert fractions to points (relative to trim area, then offset by bleed)
  const x = BLEED_PT + slot.xFrac * PAGE_W_PT;
  const w = slot.wFrac * PAGE_W_PT;
  const h = slot.hFrac * PAGE_H_PT;
  // Flip y: pdf-lib y=0 is bottom; our y=0 is top
  const y = BLEED_PT + PAGE_H_PT - slot.yFrac * PAGE_H_PT - h;

  let image;
  try {
    if (photo.mimeType === "image/png") {
      image = await doc.embedPng(photo.data);
    } else {
      // Default to JPEG (covers jpg, jpeg, webp-converted)
      image = await doc.embedJpg(photo.data);
    }
  } catch {
    // If embedding fails, draw a placeholder rectangle
    page.drawRectangle({ x, y, width: w, height: h, color: rgb(0.9, 0.85, 0.8) });
    page.drawText("รูปภาพ", { x: x + w / 2 - 15, y: y + h / 2, size: 10, color: rgb(0.6, 0.5, 0.4) });
    return;
  }

  // Scale to fill slot (cover behaviour — crop to fit)
  const imgAspect = image.width / image.height;
  const slotAspect = w / h;

  let srcX = 0, srcY = 0, srcW = image.width, srcH = image.height;
  if (imgAspect > slotAspect) {
    // Image is wider than slot — crop sides
    srcW = image.height * slotAspect;
    srcX = (image.width - srcW) / 2;
  } else {
    // Image is taller than slot — crop top/bottom
    srcH = image.width / slotAspect;
    srcY = (image.height - srcH) / 2;
  }

  page.drawImage(image, {
    x, y, width: w, height: h,
    xSkew: degrees(0), ySkew: degrees(0),
    // pdf-lib doesn't support srcX/srcY clipping directly —
    // for a full crop implementation, use a content stream clipping path.
    // For now, draw full image scaled to slot (letterbox/pillarbox instead of crop).
    // ⚠️ PLACEHOLDER: upgrade to proper clipping for production.
  });

  // ⚠️ PLACEHOLDER: pdf-lib doesn't natively support crop/clip on drawImage.
  // For production, use a content stream with clipping path (re W n).
  // Current behaviour: image is letterboxed/pillarboxed to fit the slot.
  void PDFOperator; // imported for future use
}

// ── Crop marks ────────────────────────────────────────────────────────────────

function drawCropMarks(
  page: ReturnType<PDFDocument["addPage"]>,
  fullW: number,
  fullH: number,
  bleed: number
) {
  const markLen = 14; // length of each crop mark stroke
  const gap     = 2;  // gap between page edge and start of mark
  const markColor = rgb(0, 0, 0);
  const thin = 0.25;

  const corners = [
    // top-left
    { x: bleed, y: fullH - bleed, dx: -1, dy:  1 },
    // top-right
    { x: fullW - bleed, y: fullH - bleed, dx: 1, dy:  1 },
    // bottom-left
    { x: bleed, y: bleed, dx: -1, dy: -1 },
    // bottom-right
    { x: fullW - bleed, y: bleed, dx:  1, dy: -1 },
  ];

  for (const c of corners) {
    // Horizontal mark
    page.drawLine({
      start: { x: c.x + c.dx * gap,              y: c.y },
      end:   { x: c.x + c.dx * (gap + markLen),   y: c.y },
      thickness: thin, color: markColor,
    });
    // Vertical mark
    page.drawLine({
      start: { x: c.x, y: c.y + c.dy * gap             },
      end:   { x: c.x, y: c.y + c.dy * (gap + markLen) },
      thickness: thin, color: markColor,
    });
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function collectPhotoIds(layout: BookLayout): string[] {
  const ids = new Set<string>();
  for (const page of layout.pages) {
    Object.values(page.slotFills).forEach((id) => ids.add(id));
    page.placements.forEach((p) => ids.add(p.photoId));
  }
  return [...ids];
}

// Export print spec for reference / display in UI
export const PRINT_SPEC = {
  pageSizeMm:    `${PAGE_W_MM} × ${PAGE_H_MM} mm (A4 landscape)`,
  bleedMm:       `${BLEED_MM} mm`,
  safeMarginMm:  `${SAFE_MM} mm`,
  resolution:    "300 DPI minimum",
  colorProfile:  "⚠️ sRGB (PLACEHOLDER — needs CMYK/ICC for print)",
  fileFormat:    "⚠️ PDF (PLACEHOLDER — upgrade to PDF/X-1a when spec confirmed)",
  coverSpec:     "⚠️ Not yet implemented",
};
