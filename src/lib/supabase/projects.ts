/**
 * Project persistence layer.
 * All Supabase calls go through here — components never import supabase directly.
 */
import { supabase } from "./client";
import { BookLayout, UploadedPhoto } from "@/lib/editor/types";

// ── Types ────────────────────────────────────────────────────────────────────

export interface SavedProject {
  id: string;
  title: string;
  layout_json: BookLayout;
  page_count: number;
  created_at: string;
  updated_at: string;
}

export interface SavedPhoto {
  id: string;
  project_id: string;
  storage_path: string;
  preview_path: string;
  file_name: string;
  mime_type: string;
  width: number;
  height: number;
  file_size: number;
}

/** What we store in the layout JSON — replaces the File object (not serialisable) */
export interface SerializedPhoto {
  id: string;          // matches UploadedPhoto.id used in placements/slots
  savedPhotoId: string; // references project_photos.id
  previewUrl: string;  // public URL from everbook-previews bucket
  originalPath: string; // path in everbook-originals (for PDF export)
  width: number;
  height: number;
}

// ── Upload a single photo ─────────────────────────────────────────────────────

export async function uploadPhoto(
  projectId: string,
  photo: UploadedPhoto
): Promise<SerializedPhoto> {
  const ext = photo.file.name.split(".").pop() ?? "jpg";
  const base = `${projectId}/${photo.id}`;
  const originalPath = `${base}.${ext}`;
  const previewPath  = `${base}_preview.${ext}`;

  // Upload original (private)
  const { error: origErr } = await supabase.storage
    .from("everbook-originals")
    .upload(originalPath, photo.file, { upsert: true });
  if (origErr) throw new Error(`Upload original failed: ${origErr.message}`);

  // Generate a smaller preview blob (~800px wide)
  const previewBlob = await resizeImage(photo.file, 800);

  // Upload preview (public)
  const { error: prevErr } = await supabase.storage
    .from("everbook-previews")
    .upload(previewPath, previewBlob, { upsert: true, contentType: photo.file.type });
  if (prevErr) throw new Error(`Upload preview failed: ${prevErr.message}`);

  // Get public preview URL
  const { data: urlData } = supabase.storage
    .from("everbook-previews")
    .getPublicUrl(previewPath);

  // Save metadata row
  const { data: row, error: rowErr } = await supabase
    .from("project_photos")
    .insert({
      project_id:   projectId,
      storage_path: originalPath,
      preview_path: previewPath,
      file_name:    photo.file.name,
      mime_type:    photo.file.type,
      width:        photo.width,
      height:       photo.height,
      file_size:    photo.file.size,
    })
    .select()
    .single();
  if (rowErr) throw new Error(`Photo metadata insert failed: ${rowErr.message}`);

  return {
    id:           photo.id,
    savedPhotoId: row.id,
    previewUrl:   urlData.publicUrl,
    originalPath,
    width:        photo.width,
    height:       photo.height,
  };
}

// ── Save / upsert a project ───────────────────────────────────────────────────

export async function saveProject(
  projectId: string | null,
  title: string,
  layout: BookLayout,
  photos: UploadedPhoto[],
  /** Already-serialized photos from a previous save — skip re-uploading */
  existingSerialized: SerializedPhoto[] = []
): Promise<{ projectId: string; serializedPhotos: SerializedPhoto[] }> {

  // 1. Create the project row first (needed for photo foreign key)
  let pid = projectId;
  if (!pid) {
    const { data, error } = await supabase
      .from("projects")
      .insert({ title, layout_json: {}, page_count: layout.pages.length })
      .select("id")
      .single();
    if (error) throw new Error(`Create project failed: ${error.message}`);
    pid = data.id;
  }

  // 2. Upload any photos that haven't been saved yet
  const existingIds = new Set(existingSerialized.map((s) => s.id));
  const toUpload = photos.filter((p) => !existingIds.has(p.id));

  const newSerialized = await Promise.all(
    toUpload.map((p) => uploadPhoto(pid!, p))
  );
  const allSerialized = [...existingSerialized, ...newSerialized];

  // 3. Rewrite layout: replace previewUrl references with the public URLs
  //    so the saved JSON can be restored without the original File objects.
  const serializedMap = new Map(allSerialized.map((s) => [s.id, s]));
  const portableLayout = rewriteLayoutUrls(layout, serializedMap);

  // 4. Upsert the project row with the final layout
  const { error: upsertErr } = await supabase
    .from("projects")
    .upsert({
      id:          pid,
      title,
      layout_json: portableLayout,
      page_count:  layout.pages.length,
    });
  if (upsertErr) throw new Error(`Upsert project failed: ${upsertErr.message}`);

  return { projectId: pid!, serializedPhotos: allSerialized };
}

// ── Load a project ────────────────────────────────────────────────────────────

export async function loadProject(projectId: string): Promise<{
  project: SavedProject;
  photos: UploadedPhoto[];
}> {
  const { data: project, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .single();
  if (error) throw new Error(`Load project failed: ${error.message}`);

  // Reconstruct UploadedPhoto objects from the saved preview URLs
  // (File objects can't be restored — we use the public preview URL instead)
  const layout: BookLayout = project.layout_json;
  const photoIds = collectPhotoIds(layout);

  const photos: UploadedPhoto[] = photoIds.map((id) => ({
    id,
    // The previewUrl was saved in the layout during save
    previewUrl: getPreviewUrl(layout, id) ?? "",
    file: new File([], "restored"), // placeholder — original kept in Storage for PDF
    width: 0,
    height: 0,
  }));

  return { project, photos };
}

// ── List all projects ─────────────────────────────────────────────────────────

export async function listProjects(): Promise<SavedProject[]> {
  const { data, error } = await supabase
    .from("projects")
    .select("id, title, layout_json, page_count, created_at, updated_at")
    .order("updated_at", { ascending: false });
  if (error) throw new Error(`List projects failed: ${error.message}`);
  return data ?? [];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Replace in-memory Object URLs with the persistent Supabase public URLs */
function rewriteLayoutUrls(
  layout: BookLayout,
  map: Map<string, SerializedPhoto>
): BookLayout {
  // The layout JSON doesn't directly store URLs — they live in UploadedPhoto
  // objects referenced by id. We embed a photoMeta map so the layout is
  // self-contained for restoration.
  return {
    ...layout,
    // @ts-expect-error — extra field for persistence only
    _photoMeta: Object.fromEntries(
      [...map.entries()].map(([id, s]) => [
        id,
        { previewUrl: s.previewUrl, originalPath: s.originalPath, width: s.width, height: s.height },
      ])
    ),
  };
}

/** Collect all unique photo IDs referenced in the layout */
function collectPhotoIds(layout: BookLayout): string[] {
  const ids = new Set<string>();
  for (const page of layout.pages) {
    Object.values(page.slotFills).forEach((id) => ids.add(id));
    page.placements.forEach((p) => ids.add(p.photoId));
  }
  return [...ids];
}

function getPreviewUrl(layout: BookLayout, photoId: string): string | null {
  // @ts-expect-error — _photoMeta is our persistence extension
  const meta = layout._photoMeta?.[photoId];
  return meta?.previewUrl ?? null;
}

/** Resize an image file to maxWidth, returns a Blob */
async function resizeImage(file: File, maxWidth: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.naturalWidth);
      const w = Math.round(img.naturalWidth * scale);
      const h = Math.round(img.naturalHeight * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      canvas.toBlob(
        (blob) => blob ? resolve(blob) : reject(new Error("toBlob failed")),
        file.type,
        0.85
      );
    };
    img.onerror = reject;
    img.src = url;
  });
}
