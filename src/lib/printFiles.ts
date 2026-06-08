// ─── Print-file storage & versioning (local-first) ──────────────────────────
// Generated Interior/Cover PDFs are stored in IndexedDB with a version history.

import { STORES, idbPut, idbGetAllByIndex, idbGet } from "@/lib/projects/db";

export type PrintFileType = "interior" | "cover";

export interface PrintFileMeta {
  type: PrintFileType;
  version: number;
  size: number;
  createdAt: number;
}

interface PdfRecord extends PrintFileMeta {
  key: string; // `${orderNumber}:${type}:v${version}`
  orderNumber: string;
  blob: Blob;
}

const keyFor = (orderNumber: string, type: PrintFileType, v: number) =>
  `${orderNumber}:${type}:v${v}`;

/** Store a freshly generated PDF as the next version; returns its metadata. */
export async function savePrintFile(
  orderNumber: string,
  type: PrintFileType,
  bytes: Uint8Array
): Promise<PrintFileMeta> {
  const existing = await listPrintFiles(orderNumber);
  const maxV = Math.max(0, ...existing.filter((m) => m.type === type).map((m) => m.version));
  const version = maxV + 1;
  const blob = new Blob([bytes.slice() as unknown as BlobPart], { type: "application/pdf" });
  const rec: PdfRecord = {
    key: keyFor(orderNumber, type, version),
    orderNumber,
    type,
    version,
    size: blob.size,
    createdAt: Date.now(),
    blob,
  };
  await idbPut(STORES.PDFS, rec);
  return { type, version, size: rec.size, createdAt: rec.createdAt };
}

/** All stored print-file versions for an order (newest first). */
export async function listPrintFiles(orderNumber: string): Promise<PrintFileMeta[]> {
  const recs = await idbGetAllByIndex<PdfRecord>(STORES.PDFS, "orderNumber", orderNumber);
  return recs
    .map(({ type, version, size, createdAt }) => ({ type, version, size, createdAt }))
    .sort((a, b) => b.createdAt - a.createdAt);
}

/** Retrieve the blob for a specific version (to download). */
export async function getPrintFileBlob(
  orderNumber: string,
  type: PrintFileType,
  version: number
): Promise<Blob | undefined> {
  const rec = await idbGet<PdfRecord>(STORES.PDFS, keyFor(orderNumber, type, version));
  return rec?.blob;
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}
