/**
 * POST /api/export-pdf
 * Body: { projectId: string }
 *
 * Loads the project from Supabase, fetches original photos from private Storage,
 * generates a print-ready PDF using the same layout math as the editor, and
 * streams it back as a download.
 */
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { generatePDF } from "@/lib/pdf/export";
import { BookLayout } from "@/lib/editor/types";

export const runtime = "nodejs"; // pdf-lib needs Node.js, not Edge

export async function POST(req: NextRequest) {
  let projectId: string;

  try {
    const body = await req.json();
    projectId = body.projectId;
    if (!projectId) throw new Error("projectId is required");
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  let supabase: ReturnType<typeof createServerClient>;
  try {
    supabase = createServerClient();
  } catch (e) {
    return NextResponse.json(
      { error: "Supabase not configured. Add SUPABASE_SERVICE_ROLE_KEY to .env.local" },
      { status: 503 }
    );
  }

  // ── Load project from DB ──────────────────────────────────────────────────
  const { data: project, error: projErr } = await supabase
    .from("projects")
    .select("id, title, layout_json")
    .eq("id", projectId)
    .single();

  if (projErr || !project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const layout = project.layout_json as BookLayout;

  // ── Load photo metadata (storage paths) ──────────────────────────────────
  const { data: photoRows, error: photoErr } = await supabase
    .from("project_photos")
    .select("id, storage_path, mime_type")
    .eq("project_id", projectId);

  if (photoErr) {
    return NextResponse.json({ error: "Failed to load photos" }, { status: 500 });
  }

  // Build a map: photoId (editor id stored in _photoMeta) → storage path
  // The layout._photoMeta maps editorPhotoId → { originalPath, ... }
  // @ts-expect-error — _photoMeta is our persistence extension
  const photoMeta: Record<string, { originalPath: string }> = layout._photoMeta ?? {};

  const storagePathByEditorId = new Map<string, string>();
  for (const [editorId, meta] of Object.entries(photoMeta)) {
    storagePathByEditorId.set(editorId, meta.originalPath);
  }

  // Also index by saved photo row (fallback)
  const mimeByPath = new Map(photoRows?.map((r) => [r.storage_path, r.mime_type]) ?? []);

  // ── fetchPhoto: downloads original from private bucket ───────────────────
  async function fetchPhoto(editorPhotoId: string) {
    const storagePath = storagePathByEditorId.get(editorPhotoId);
    if (!storagePath) throw new Error(`No storage path for photo ${editorPhotoId}`);

    const { data, error } = await supabase.storage
      .from("everbook-originals")
      .download(storagePath);

    if (error || !data) throw new Error(`Storage download failed: ${error?.message}`);

    const arrayBuffer = await data.arrayBuffer();
    const mimeType = mimeByPath.get(storagePath) ?? "image/jpeg";

    return { data: new Uint8Array(arrayBuffer), mimeType };
  }

  // ── Generate PDF ──────────────────────────────────────────────────────────
  let pdfBytes: Uint8Array;
  try {
    pdfBytes = await generatePDF(layout, fetchPhoto);
  } catch (e) {
    console.error("PDF generation error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "PDF generation failed" },
      { status: 500 }
    );
  }

  // ── Stream the PDF ────────────────────────────────────────────────────────
  const filename = `everbook-${project.title.replace(/[^a-zA-Z0-9ก-๙]/g, "-")}-print.pdf`;

  return new NextResponse(Buffer.from(pdfBytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": pdfBytes.byteLength.toString(),
    },
  });
}
