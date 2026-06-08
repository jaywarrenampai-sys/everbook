/**
 * GET /api/backgrounds/[category] → list backgrounds in one category (lazy)
 */
import { NextResponse } from "next/server";
import { scanCategory } from "@/lib/backgrounds/scan";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ category: string }> }
) {
  const { category } = await params;
  return NextResponse.json({ backgrounds: await scanCategory(category) });
}
