/**
 * GET  /api/admin/orders          — list all orders (newest first)
 * PATCH /api/admin/orders         — update order status / tracking
 * Body: { id, status, trackingNumber? }
 */
import { NextRequest, NextResponse } from "next/server";
import { createServerClient }        from "@/lib/supabase/server";
import { isAdminAuthenticated }      from "@/lib/admin/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function guard() {
  if (!(await isAdminAuthenticated()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return null;
}

export async function GET() {
  const deny = await guard(); if (deny) return deny;

  let supabase: ReturnType<typeof createServerClient>;
  try { supabase = createServerClient(); }
  catch { return NextResponse.json({ error: "DB not configured" }, { status: 503 }); }

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ orders: data });
}

export async function PATCH(req: NextRequest) {
  const deny = await guard(); if (deny) return deny;

  const { id, status, trackingNumber } = await req.json().catch(() => ({}));
  if (!id || !status)
    return NextResponse.json({ error: "id and status required" }, { status: 400 });

  const VALID = ["pending_payment", "paid", "printing", "shipped", "delivered", "cancelled"];
  if (!VALID.includes(status))
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });

  let supabase: ReturnType<typeof createServerClient>;
  try { supabase = createServerClient(); }
  catch { return NextResponse.json({ error: "DB not configured" }, { status: 503 }); }

  const patch: Record<string, unknown> = { status };
  if (trackingNumber) patch.tracking_number = trackingNumber;
  if (status === "shipped" && trackingNumber) patch.shipped_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("orders")
    .update(patch)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ order: data });
}
