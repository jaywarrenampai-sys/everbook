// PromptPay QR payload generator (EMVCo / Thai PromptPay spec).
// Produces the string encoded into the QR; render it with the `qrcode` library.

function field(id: string, value: string): string {
  const len = value.length.toString().padStart(2, "0");
  return `${id}${len}${value}`;
}

function sanitize(target: string): string {
  return target.replace(/[^0-9]/g, "");
}

/** Format a phone number / national id / e-wallet id for tag 29. */
function formatTarget(target: string): { tag: string; value: string } {
  const t = sanitize(target);
  if (t.length >= 13) {
    // national id or e-wallet id
    return { tag: "02", value: t };
  }
  // mobile phone → 0066 + number without leading 0, padded to 13
  const n = t.replace(/^0/, "66");
  return { tag: "01", value: ("0000000000000" + n).slice(-13) };
}

function crc16(payload: string): string {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

/**
 * Build the PromptPay EMVCo payload for a target (phone or national id) and
 * an optional amount in THB.
 */
export function promptPayPayload(target: string, amount?: number): string {
  const { tag, value } = formatTarget(target);
  const merchant = field("29", field("00", "A000000677010111") + field(tag, value));
  const parts = [
    field("00", "01"),
    field("01", amount ? "12" : "11"),
    merchant,
    field("53", "764"), // currency THB
    ...(amount ? [field("54", amount.toFixed(2))] : []),
    field("58", "TH"),
  ];
  const payload = parts.join("") + "6304";
  return payload + crc16(payload);
}
