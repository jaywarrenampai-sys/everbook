/**
 * POST /api/export-cover-preview
 * Body: { layout: BookLayout, config: ProductConfig, photos: { id, dataUrl }[] }
 * Generates a wraparound cover PDF (back | spine | front) from editor state.
 */
import { NextRequest, NextResponse } from "next/server";
import { generateCoverPDF } from "@/lib/pdf/export";
import { BookLayout, ProductConfig } from "@/lib/editor/types";

export const runtime = "nodejs";

interface PhotoData { id: string; dataUrl: string }

export async function POST(req: NextRequest) {
  let layout: BookLayout;
  let config: ProductConfig;
  let photos: PhotoData[];
  try {
    const body = await req.json();
    layout = body.layout;
    config = body.config;
    photos = body.photos ?? [];
    if (!layout || !config) throw new Error("layout and config are required");
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const photoMap = new Map(
    photos.map((p) => {
      const [header, base64] = p.dataUrl.split(",");
      const mimeType = header.match(/data:([^;]+)/)?.[1] ?? "image/jpeg";
      return [p.id, { data: new Uint8Array(Buffer.from(base64, "base64")), mimeType }];
    })
  );

  async function fetchPhoto(id: string) {
    const p = photoMap.get(id);
    if (!p) throw new Error(`Photo ${id} not found`);
    return p;
  }

  try {
    const bytes = await generateCoverPDF(layout, config, fetchPhoto);
    return new NextResponse(Buffer.from(bytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="everbook-cover.pdf"',
        "Content-Length": bytes.byteLength.toString(),
      },
    });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Cover generation failed" }, { status: 500 });
  }
}
