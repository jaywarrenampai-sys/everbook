/**
 * GET /api/payment/status?chargeId=xxx&orderId=xxx
 *
 * Polls Omise for the current charge status.
 * Used by the PromptPay QR screen to know when the customer has paid.
 * On success: marks order as paid in Supabase.
 */
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { getCharge } from "@/lib/omise/server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const chargeId = req.nextUrl.searchParams.get("chargeId");
  const orderId  = req.nextUrl.searchParams.get("orderId");

  if (!chargeId || !orderId)
    return NextResponse.json({ error: "chargeId and orderId required" }, { status: 400 });

  let supabase: ReturnType<typeof createServerClient>;
  try { supabase = createServerClient(); }
  catch { return NextResponse.json({ error: "DB not configured" }, { status: 503 }); }

  try {
    const charge = await getCharge(chargeId);

    if (charge.status === "successful") {
      // Mark order paid
      await supabase.from("orders").update({
        status:  "paid",
        paid_at: new Date().toISOString(),
      }).eq("id", orderId).eq("status", "pending_payment"); // only update once
    }

    if (charge.status === "failed" || charge.status === "expired") {
      await supabase.from("orders").update({
        status: "cancelled",
      }).eq("id", orderId).eq("status", "pending_payment");
    }

    return NextResponse.json({ status: charge.status });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Status check failed" },
      { status: 500 }
    );
  }
}
