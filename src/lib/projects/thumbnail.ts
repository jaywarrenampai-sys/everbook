// Generate a small cover thumbnail (data URL) for the dashboard.
// Draws the cover page's background + its first photo, cover-fit, at A4 ratio.

import { BookLayout, UploadedPhoto } from "@/lib/editor/types";
import { PAGE_H_OVER_W } from "@/lib/editor/layout";

const W = 200;
const H = Math.round(W * PAGE_H_OVER_W); // A4 portrait

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export async function makeCoverThumbnail(
  layout: BookLayout,
  photos: UploadedPhoto[]
): Promise<string> {
  const cover = layout.pages.find((p) => p.isCover) ?? layout.pages[0];
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx || !cover) return "";

  ctx.fillStyle = cover.background ?? "#ffffff";
  ctx.fillRect(0, 0, W, H);

  // First photo on the cover (slot fill or free placement)
  const photoId =
    Object.values(cover.slotFills ?? {})[0] ?? cover.placements?.[0]?.photoId;
  const photo = photoId ? photos.find((p) => p.id === photoId) : undefined;

  if (photo) {
    try {
      const img = await loadImage(photo.previewUrl);
      // cover-fit
      const ar = img.width / img.height;
      const car = W / H;
      let dw = W, dh = H, dx = 0, dy = 0;
      if (ar > car) { dh = H; dw = H * ar; dx = (W - dw) / 2; }
      else { dw = W; dh = W / ar; dy = (H - dh) / 2; }
      ctx.drawImage(img, dx, dy, dw, dh);
    } catch {
      /* fall through to background-only */
    }
  }

  try {
    return canvas.toDataURL("image/jpeg", 0.7);
  } catch {
    return "";
  }
}
