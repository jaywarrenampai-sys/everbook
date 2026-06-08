/**
 * Client-side export helper.
 * Converts in-memory Object URLs to base64, then calls the preview export API.
 * Used when the user hasn't saved their project yet.
 */
import { BookLayout, UploadedPhoto } from "@/lib/editor/types";

async function objectUrlToDataUrl(objectUrl: string): Promise<string> {
  const res = await fetch(objectUrl);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export async function exportPDFFromEditor(
  layout: BookLayout,
  photos: UploadedPhoto[],
  projectId: string | null
): Promise<void> {
  // If project is saved, use the server-side export (uses original hi-res photos)
  if (projectId) {
    const res = await fetch("/api/export-pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error ?? `Export failed (${res.status})`);
    }
    downloadResponse(res, "everbook-print.pdf");
    return;
  }

  // Otherwise: encode photos as base64 and send to the preview export route
  const photoData = await Promise.all(
    photos.map(async (p) => ({
      id: p.id,
      dataUrl: await objectUrlToDataUrl(p.previewUrl),
    }))
  );

  const res = await fetch("/api/export-pdf-preview", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ layout, photos: photoData }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? `Export failed (${res.status})`);
  }

  downloadResponse(res, "everbook-sample.pdf");
}

/**
 * Admin print-file export from a LOCAL project: encodes photos as base64 and
 * uses the real server export route (handles backgrounds, stickers, text, A4).
 * coverOnly trims to the cover page (Cover PDF).
 */
export async function exportLocalProjectPDF(
  layout: BookLayout,
  photos: UploadedPhoto[],
  opts: { coverOnly?: boolean; filename?: string } = {}
): Promise<void> {
  let usedLayout: BookLayout = layout;
  if (opts.coverOnly) {
    const coverPages = layout.pages.filter((p) => p.isCover).slice(0, 1);
    usedLayout = { ...layout, pages: coverPages.length ? coverPages : layout.pages.slice(0, 1) };
  }
  const photoData = await Promise.all(
    photos.map(async (p) => ({ id: p.id, dataUrl: await objectUrlToDataUrl(p.previewUrl) }))
  );
  const res = await fetch("/api/export-pdf-preview", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ layout: usedLayout, photos: photoData }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? `Export failed (${res.status})`);
  }
  await downloadResponse(res, opts.filename ?? "everbook.pdf");
}

async function downloadResponse(res: Response, fallbackName: string) {
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const disposition = res.headers.get("Content-Disposition") ?? "";
  const match = disposition.match(/filename="([^"]+)"/);
  a.download = match?.[1] ?? fallbackName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
