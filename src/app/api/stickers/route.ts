/**
 * GET /api/stickers            → list discovered categories [{id,label,emoji,count}]
 * GET /api/stickers?q=camera   → search stickers across all categories
 *
 * Auto-discovery: scans public/stickers at request time. Drop a new
 * .png/.svg/.webp into any folder and it appears — no code changes.
 */
import { NextRequest, NextResponse } from "next/server";
import { scanCategories, searchStickers } from "@/lib/stickers/scan";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q");
  if (q) {
    const results = await searchStickers(q);
    return NextResponse.json({ stickers: results });
  }
  const categories = await scanCategories();
  return NextResponse.json({ categories });
}
