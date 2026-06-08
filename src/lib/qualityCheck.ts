// Pre-print validation: warn the admin about issues before generating files.

import { BookLayout, UploadedPhoto } from "@/lib/editor/types";
import { getTemplate } from "@/lib/editor/templates";
import { isImageBackground } from "@/lib/editor/background";

// A4 at 300 DPI
const DPI_W = 2480;
const DPI_H = 3508;

export interface QualityIssue {
  level: "error" | "warning";
  message: string;
}

export function qualityCheck(layout: BookLayout, photos: UploadedPhoto[]): QualityIssue[] {
  const issues: QualityIssue[] = [];
  const byId = new Map(photos.map((p) => [p.id, p]));

  layout.pages.forEach((page, i) => {
    const label = i === 0 ? "ปก" : `หน้า ${i}`;
    const tmpl = getTemplate(page.templateId);
    const slotPhotoIds = tmpl.slots.map((s) => page.slotFills[s.id]).filter(Boolean) as string[];
    const placementIds = page.placements.map((p) => p.photoId);
    const allIds = [...slotPhotoIds, ...placementIds];

    // Missing photos
    for (const id of allIds) {
      if (!byId.has(id)) issues.push({ level: "error", message: `${label}: รูปภาพหายไป` });
    }

    // Empty pages
    const hasContent =
      allIds.length > 0 ||
      (page.texts?.length ?? 0) > 0 ||
      (page.stickers?.length ?? 0) > 0 ||
      isImageBackground(page.background);
    if (!hasContent) {
      issues.push({ level: "warning", message: `${label}: หน้าว่างเปล่า` });
    }

    // Low-resolution images (vs slot size at 300 DPI)
    for (const slot of tmpl.slots) {
      const id = page.slotFills[slot.id];
      const photo = id ? byId.get(id) : undefined;
      if (!photo) continue;
      const needW = slot.width * DPI_W;
      const needH = slot.height * DPI_H;
      if (photo.width < needW * 0.8 || photo.height < needH * 0.8) {
        issues.push({ level: "warning", message: `${label}: รูปความละเอียดต่ำ (${photo.width}×${photo.height}px)` });
      }
    }

    // Bleed: full-bleed page whose image is smaller than the page → soft edges
    if (page.fullBleed) {
      const id = Object.values(page.slotFills)[0] ?? page.placements[0]?.photoId;
      const photo = id ? byId.get(id) : undefined;
      if (photo && (photo.width < DPI_W || photo.height < DPI_H)) {
        issues.push({ level: "warning", message: `${label}: ภาพเต็มหน้าอาจคมไม่พอสำหรับพิมพ์เต็มขอบ` });
      }
    }
  });

  return issues;
}
