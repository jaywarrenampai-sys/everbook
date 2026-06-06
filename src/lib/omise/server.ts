/**
 * Server-side Omise helpers.
 * NEVER import this from a "use client" component — skey is server-only.
 */

const OMISE_SECRET = process.env.OMISE_SECRET_KEY!;
const OMISE_API    = "https://api.omise.co";

/** Base64 encode credentials for Basic Auth */
function authHeader() {
  return "Basic " + Buffer.from(`${OMISE_SECRET}:`).toString("base64");
}

async function omiseFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${OMISE_API}${path}`, {
    ...options,
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message ?? `Omise API error ${res.status}`);
  }
  return data as T;
}

// ── PromptPay source ──────────────────────────────────────────────────────────

export interface PromptPaySource {
  id: string;
  object: "source";
  type: "promptpay";
  amount: number;
  currency: string;
  scannable_code: {
    type: "qr";
    image: { download_uri: string; filename: string };
  };
}

export async function createPromptPaySource(
  amountSatang: number   // amount in smallest unit (satang = THB × 100)
): Promise<PromptPaySource> {
  return omiseFetch<PromptPaySource>("/sources", {
    method: "POST",
    body: JSON.stringify({
      type:     "promptpay",
      amount:   amountSatang,
      currency: "THB",
    }),
  });
}

// ── Create charge ─────────────────────────────────────────────────────────────

export interface OmiseCharge {
  id: string;
  object: "charge";
  status: "pending" | "successful" | "failed" | "expired";
  amount: number;
  currency: string;
  source?: { type: string };
  card?:   { id: string; last_digits: string; brand: string };
  failure_code?: string;
  failure_message?: string;
  metadata?: Record<string, string>;
}

export async function createCharge(params: {
  amountSatang: number;
  sourceId?: string;   // for PromptPay
  tokenId?:  string;   // for card
  orderId:   string;
  description: string;
}): Promise<OmiseCharge> {
  const body: Record<string, unknown> = {
    amount:      params.amountSatang,
    currency:    "THB",
    description: params.description,
    metadata:    { order_id: params.orderId },
  };
  if (params.sourceId) body.source = params.sourceId;
  if (params.tokenId)  body.card   = params.tokenId;

  return omiseFetch<OmiseCharge>("/charges", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

// ── Retrieve charge ───────────────────────────────────────────────────────────

export async function getCharge(chargeId: string): Promise<OmiseCharge> {
  return omiseFetch<OmiseCharge>(`/charges/${chargeId}`);
}
