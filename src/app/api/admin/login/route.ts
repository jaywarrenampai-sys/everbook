/**
 * POST /api/admin/login
 * Body: { password: string }
 *
 * Returns a signed session token stored in an httpOnly cookie.
 * Simple HMAC-based token — no JWT dependency needed.
 */
import { NextRequest, NextResponse } from "next/server";
import { createHmac }                from "crypto";

export const runtime = "nodejs";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "";
const SECRET         = process.env.OMISE_SECRET_KEY ?? "fallback-secret"; // reuse server secret as signing key

function makeToken(): string {
  const payload = `admin:${Date.now()}`;
  const sig     = createHmac("sha256", SECRET).update(payload).digest("hex");
  return Buffer.from(`${payload}:${sig}`).toString("base64url");
}

export async function POST(req: NextRequest) {
  const { password } = await req.json().catch(() => ({}));

  if (!ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Admin not configured" }, { status: 503 });
  }

  if (password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "รหัสผ่านไม่ถูกต้อง" }, { status: 401 });
  }

  const token = makeToken();
  const res   = NextResponse.json({ ok: true });

  res.cookies.set("admin_token", token, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge:   60 * 60 * 8, // 8 hours
    path:     "/",
  });

  return res;
}
