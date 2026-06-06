/**
 * POST /api/payment/card
 * Body: { orderId: string, omiseToken: string }
 *
 * Charges a card using an Omise token (created client-side by OmiseJS).
 */
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { createCharge } from "@/lib/omise/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { orderId, omiseToken } = await req.json().catch(() => ({}));
  if (!orderId || !omiseToken)
    return NextResponse.json({ error: "orderId and omiseToken required" }, { status: 400 });

  let supabase: ReturnType<typeof createServerClient>;
  try { supabase = createServerClient(); }
  catch { return NextResponse.json({ error: "DB not configured" }, { status: 503 }); }

  const { data: order, error } = await supabase
    .from("orders").select("*").eq("id", orderId).single();
  if (error || !order)
    return NextResponse.json({ error: "Order not found" }, { status: 404 });

  if (order.status !== "pending_payment")
    return NextResponse.json({ error: "Order already processed" }, { status: 409 });

  try {
    const charge = await createCharge({
      amountSatang: order.total_price * 100,
      tokenId:      omiseToken,
      orderId,
      description:  `Everbook order ${orderId.slice(0, 8)} — ${order.quantity} เล่ม`,
    });

    // Mark paid immediately if successful (cards are synchronous)
    if (charge.status === "successful") {
      await supabase.from("orders").update({
        status:         "paid",
        payment_ref:    charge.id,
        payment_method: "card",
        paid_at:        new Date().toISOString(),
      }).eq("id", orderId);
    } else {
      await supabase.from("orders").update({
        payment_ref:    charge.id,
        payment_method: "card",
      }).eq("id", orderId);
    }

    return NextResponse.json({
      chargeId: charge.id,
      status:   charge.status,
      failure:  charge.failure_message ?? null,
    });
  } catch (e) {
    console.error("Card charge error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Payment failed" },
      { status: 500 }
    );
  }
}
