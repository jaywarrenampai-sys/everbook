/**
 * GET /api/stickers/[category] → list stickers in one category (lazy loading)
 */
import { NextResponse } from "next/server";
import { scanCategory } from "@/lib/stickers/scan";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ category: string }> }
) {
  const { category } = await params;
  const stickers = await scanCategory(category);
  return NextResponse.json({ stickers });
}
