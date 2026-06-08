// ─── Local project persistence API ──────────────────────────────────────────
// Save / open / duplicate / rename / delete photobook projects in the browser
// (IndexedDB). No backend or login required. Photo originals are stored as
// blobs so projects fully restore after refresh or a browser crash.

import { BookLayout, ProductConfig, CheckoutInfo, UploadedPhoto } from "@/lib/editor/types";
import { uid } from "@/lib/uid";
import {
  STORES,
  idbPut,
  idbGet,
  idbGetAll,
  idbDelete,
  idbGetAllByIndex,
  idbExists,
} from "./db";

/** Full project record stored in the "projects" store. */
interface ProjectRecord {
  id: string;
  name: string;
  pageCount: number;
  cover: string; // data URL thumbnail
  createdAt: number;
  updatedAt: number;
  layout: BookLayout;
}

/** Photo blob record stored in the "photos" store. */
interface PhotoRecord {
  key: string; // `${projectId}:${photoId}`
  projectId: string;
  photoId: string;
  name: string;
  type: string;
  width: number;
  height: number;
  blob: Blob;
}

/** Lightweight metadata for the dashboard (no layout / blobs). */
export interface ProjectSummary {
  id: string;
  name: string;
  pageCount: number;
  cover: string;
  createdAt: number;
  updatedAt: number;
}

const photoKey = (projectId: string, photoId: string) => `${projectId}:${photoId}`;

/** Save (upsert) a project + any not-yet-stored photo blobs. */
export async function saveProject(args: {
  id: string;
  name: string;
  layout: BookLayout;
  photos: UploadedPhoto[];
  cover: string;
}): Promise<void> {
  const { id, name, layout, photos, cover } = args;
  const existing = await idbGet<ProjectRecord>(STORES.PROJECTS, id);
  const now = Date.now();

  const record: ProjectRecord = {
    id,
    name,
    pageCount: layout.pages.length,
    cover,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    layout,
  };
  await idbPut(STORES.PROJECTS, record);

  // Only persist photo blobs we don't already have (autosave-friendly).
  for (const p of photos) {
    const key = photoKey(id, p.id);
    if (await idbExists(STORES.PHOTOS, key)) continue;
    try {
      const blob = p.file instanceof Blob ? p.file : await (await fetch(p.previewUrl)).blob();
      const rec: PhotoRecord = {
        key,
        projectId: id,
        photoId: p.id,
        name: p.file?.name ?? `${p.id}.jpg`,
        type: p.file?.type ?? blob.type ?? "image/jpeg",
        width: p.width,
        height: p.height,
        blob,
      };
      await idbPut(STORES.PHOTOS, rec);
    } catch {
      // Skip a photo we can't read rather than failing the whole save.
    }
  }
}

/** Load a project and rebuild its photos (recreating object URLs). */
export async function loadProject(
  id: string
): Promise<{ id: string; name: string; layout: BookLayout; photos: UploadedPhoto[] } | null> {
  const rec = await idbGet<ProjectRecord>(STORES.PROJECTS, id);
  if (!rec) return null;
  const photoRecs = await idbGetAllByIndex<PhotoRecord>(STORES.PHOTOS, "projectId", id);
  const photos: UploadedPhoto[] = photoRecs.map((r) => ({
    id: r.photoId,
    file: new File([r.blob], r.name, { type: r.type }),
    previewUrl: URL.createObjectURL(r.blob),
    width: r.width,
    height: r.height,
  }));
  return { id: rec.id, name: rec.name, layout: rec.layout, photos };
}

/** Load just a project's layout + name (no photo blobs) — for the config page. */
export async function getProjectLayout(
  id: string
): Promise<{ id: string; name: string; layout: BookLayout } | null> {
  const rec = await idbGet<ProjectRecord>(STORES.PROJECTS, id);
  if (!rec) return null;
  return { id: rec.id, name: rec.name, layout: rec.layout };
}

/** Patch a project's product configuration in place (no photo rewrite). */
export async function updateProjectConfig(id: string, config: ProductConfig): Promise<void> {
  const rec = await idbGet<ProjectRecord>(STORES.PROJECTS, id);
  if (!rec) return;
  await idbPut<ProjectRecord>(STORES.PROJECTS, {
    ...rec,
    layout: { ...rec.layout, productConfig: config },
    updatedAt: Date.now(),
  });
}

/** Patch a project's checkout details in place (no photo rewrite). */
export async function updateCheckout(id: string, checkout: CheckoutInfo): Promise<void> {
  const rec = await idbGet<ProjectRecord>(STORES.PROJECTS, id);
  if (!rec) return;
  await idbPut<ProjectRecord>(STORES.PROJECTS, {
    ...rec,
    layout: { ...rec.layout, checkout },
    updatedAt: Date.now(),
  });
}

/** List project summaries, newest first. */
export async function listProjects(): Promise<ProjectSummary[]> {
  const recs = await idbGetAll<ProjectRecord>(STORES.PROJECTS);
  return recs
    .map(({ id, name, pageCount, cover, createdAt, updatedAt }) => ({
      id,
      name,
      pageCount,
      cover,
      createdAt,
      updatedAt,
    }))
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

/** Delete a project and all of its photo blobs. */
export async function deleteProject(id: string): Promise<void> {
  const photoRecs = await idbGetAllByIndex<PhotoRecord>(STORES.PHOTOS, "projectId", id);
  await Promise.all(photoRecs.map((r) => idbDelete(STORES.PHOTOS, r.key)));
  await idbDelete(STORES.PROJECTS, id);
}

/** Duplicate a project (new id, copies layout + photo blobs). */
export async function duplicateProject(id: string): Promise<string | null> {
  const rec = await idbGet<ProjectRecord>(STORES.PROJECTS, id);
  if (!rec) return null;
  const newId = uid();
  const now = Date.now();
  await idbPut<ProjectRecord>(STORES.PROJECTS, {
    ...rec,
    id: newId,
    name: `${rec.name} (สำเนา)`,
    createdAt: now,
    updatedAt: now,
  });
  const photoRecs = await idbGetAllByIndex<PhotoRecord>(STORES.PHOTOS, "projectId", id);
  for (const r of photoRecs) {
    await idbPut<PhotoRecord>(STORES.PHOTOS, { ...r, key: photoKey(newId, r.photoId), projectId: newId });
  }
  return newId;
}

/** Rename a project. */
export async function renameProject(id: string, name: string): Promise<void> {
  const rec = await idbGet<ProjectRecord>(STORES.PROJECTS, id);
  if (!rec) return;
  await idbPut<ProjectRecord>(STORES.PROJECTS, { ...rec, name, updatedAt: Date.now() });
}

// ── Recovery: remember the last opened project id ──
const LAST_KEY = "everbook:lastProject";
export function setLastProject(id: string) {
  try { localStorage.setItem(LAST_KEY, id); } catch {}
}
export function getLastProject(): string | null {
  try { return localStorage.getItem(LAST_KEY); } catch { return null; }
}
