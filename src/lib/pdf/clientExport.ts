/**
 * Client-side export helper.
 * Converts in-memory Object URLs to base64, then calls the preview export API.
 * Used when the user hasn't saved their project yet.
 */
import { BookLayout, ProductConfig, UploadedPhoto } from "@/lib/editor/types";

async function encodePhotos(photos: UploadedPhoto[]) {
  return Promise.all(
    photos.map(async (p) => ({ id: p.id, dataUrl: await objectUrlToDataUrl(p.previewUrl) }))
  );
}

/** Generate the Interior PDF and return its raw bytes (for storage). */
export async function fetchInteriorPDFBytes(
  layout: BookLayout,
  photos: UploadedPhoto[]
): Promise<Uint8Array> {
  const res = await fetch("/api/export-pdf-preview", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ layout, photos: await encodePhotos(photos) }),
  });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? `Export failed (${res.status})`);
  return new Uint8Array(await res.arrayBuffer());
}

/** Generate the wraparound Cover PDF and return its raw bytes. */
export async function fetchCoverPDFBytes(
  layout: BookLayout,
  photos: UploadedPhoto[],
  config: ProductConfig
): Promise<Uint8Array> {
  const res = await fetch("/api/export-cover-preview", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ layout, config, photos: await encodePhotos(photos) }),
  });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? `Cover export failed (${res.status})`);
  return new Uint8Array(await res.arrayBuffer());
}

/** Download an existing Blob (a stored PDF version). */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

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
