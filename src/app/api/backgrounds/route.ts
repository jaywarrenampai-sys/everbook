/**
 * GET /api/backgrounds            → discovered categories [{id,label,emoji,count}]
 * GET /api/backgrounds?q=cloud    → search backgrounds across categories
 *
 * Auto-discovery: scans public/backgrounds at request time. Drop a new
 * .png/.jpg/.jpeg/.webp into any folder and it appears — no code changes.
 */
import { NextRequest, NextResponse } from "next/server";
import { scanCategories, searchBackgrounds } from "@/lib/backgrounds/scan";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q");
  if (q) return NextResponse.json({ backgrounds: await searchBackgrounds(q) });
  return NextResponse.json({ categories: await scanCategories() });
}
