/**
 * POST /api/payment/promptpay
 * Body: { orderId: string }
 *
 * Creates an Omise PromptPay source, creates a charge, returns the QR image URL.
 */
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { createPromptPaySource, createCharge } from "@/lib/omise/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { orderId } = await req.json().catch(() => ({}));
  if (!orderId) return NextResponse.json({ error: "orderId required" }, { status: 400 });

  let supabase: ReturnType<typeof createServerClient>;
  try { supabase = createServerClient(); }
  catch { return NextResponse.json({ error: "DB not configured" }, { status: 503 }); }

  // Load order
  const { data: order, error } = await supabase
    .from("orders").select("*").eq("id", orderId).single();
  if (error || !order)
    return NextResponse.json({ error: "Order not found" }, { status: 404 });

  if (order.status !== "pending_payment")
    return NextResponse.json({ error: "Order already processed" }, { status: 409 });

  try {
    const amountSatang = order.total_price * 100; // THB → satang

    // Create PromptPay source
    const source = await createPromptPaySource(amountSatang);

    // Create charge linked to source
    const charge = await createCharge({
      amountSatang,
      sourceId:    source.id,
      orderId,
      description: `Everbook order ${orderId.slice(0, 8)} — ${order.quantity} เล่ม`,
    });

    // Save charge ID to order
    await supabase.from("orders").update({
      payment_ref:    charge.id,
      payment_method: "promptpay",
    }).eq("id", orderId);

    return NextResponse.json({
      chargeId:   charge.id,
      qrImageUrl: source.scannable_code.image.download_uri,
      amount:     order.total_price,
      status:     charge.status,
    });
  } catch (e) {
    console.error("PromptPay charge error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Payment failed" },
      { status: 500 }
    );
  }
}
