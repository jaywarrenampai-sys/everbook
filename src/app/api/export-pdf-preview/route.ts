/**
 * POST /api/export-pdf-preview
 * Body: { layout: BookLayout, photos: { id, dataUrl }[] }
 *
 * Generates a PDF directly from the editor state WITHOUT needing a saved project.
 * Used for "Generate sample PDF" during development and for quick client-side export.
 * Photos are sent as base64 data URLs (converted from Object URLs client-side).
 */
import { NextRequest, NextResponse } from "next/server";
import { generatePDF } from "@/lib/pdf/export";
import { BookLayout } from "@/lib/editor/types";

export const runtime = "nodejs";

interface PhotoData {
  id: string;
  dataUrl: string; // "data:image/jpeg;base64,..."
}

export async function POST(req: NextRequest) {
  let layout: BookLayout;
  let photos: PhotoData[];

  try {
    const body = await req.json();
    layout = body.layout;
    photos = body.photos ?? [];
    if (!layout) throw new Error("layout is required");
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  // Build photo lookup from base64 data URLs
  const photoMap = new Map(
    photos.map((p) => {
      const [header, base64] = p.dataUrl.split(",");
      const mimeType = header.match(/data:([^;]+)/)?.[1] ?? "image/jpeg";
      const data = Buffer.from(base64, "base64");
      return [p.id, { data: new Uint8Array(data), mimeType }];
    })
  );

  async function fetchPhoto(photoId: string) {
    const photo = photoMap.get(photoId);
    if (!photo) throw new Error(`Photo ${photoId} not found in request`);
    return photo;
  }

  let pdfBytes: Uint8Array;
  try {
    pdfBytes = await generatePDF(layout, fetchPhoto);
  } catch (e) {
    console.error("PDF preview generation error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "PDF generation failed" },
      { status: 500 }
    );
  }

  return new NextResponse(Buffer.from(pdfBytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="everbook-sample.pdf"',
      "Content-Length": pdfBytes.byteLength.toString(),
    },
  });
}
