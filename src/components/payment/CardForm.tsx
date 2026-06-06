"use client";

import { useState, useEffect } from "react";
import { formatBaht } from "@/lib/content";

declare global {
  interface Window {
    // OmiseJS loaded via CDN script tag
    Omise?: {
      setPublicKey: (key: string) => void;
      createToken: (
        type: "card",
        card: {
          name: string;
          number: string;
          expiration_month: number;
          expiration_year: number;
          security_code: string;
        },
        callback: (status: number, response: { id?: string; message?: string }) => void
      ) => void;
    };
  }
}

interface Props {
  orderId: string;
  amount:  number;
  onPaid:  () => void;
  onFailed:(msg: string) => void;
}

export default function CardForm({ orderId, amount, onPaid, onFailed }: Props) {
  const [name,   setName]   = useState("");
  const [number, setNumber] = useState("");
  const [expiry, setExpiry] = useState(""); // MM/YY
  const [cvv,    setCvv]    = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const [omiseReady, setOmiseReady] = useState(false);

  // Load OmiseJS from CDN
  useEffect(() => {
    if (window.Omise) { setOmiseReady(true); return; }
    const script = document.createElement("script");
    script.src = "https://cdn.omise.co/omise.js";
    script.onload = () => {
      window.Omise?.setPublicKey(process.env.NEXT_PUBLIC_OMISE_PUBLIC_KEY!);
      setOmiseReady(true);
    };
    document.head.appendChild(script);
  }, []);

  function formatCardNumber(val: string) {
    return val.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
  }

  function formatExpiry(val: string) {
    const digits = val.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!window.Omise || !omiseReady) {
      setError("กำลังโหลดระบบชำระเงิน กรุณารอสักครู่");
      return;
    }

    const [mm, yy] = expiry.split("/");
    const cardNumber = number.replace(/\s/g, "");

    setLoading(true);
    setError(null);

    window.Omise.createToken(
      "card",
      {
        name,
        number:             cardNumber,
        expiration_month:   parseInt(mm, 10),
        expiration_year:    parseInt(`20${yy}`, 10),
        security_code:      cvv,
      },
      async (status, response) => {
        if (status !== 200 || !response.id) {
          setError(response.message ?? "ข้อมูลบัตรไม่ถูกต้อง");
          setLoading(false);
          return;
        }

        try {
          const res = await fetch("/api/payment/card", {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({ orderId, omiseToken: response.id }),
          });
          const data = await res.json();

          if (!res.ok || data.status === "failed") {
            setError(data.failure ?? data.error ?? "การชำระเงินล้มเหลว");
            onFailed(data.failure ?? data.error ?? "การชำระเงินล้มเหลว");
          } else if (data.status === "successful") {
            onPaid();
          } else {
            setError("สถานะการชำระเงินไม่ชัดเจน กรุณาติดต่อเรา");
          }
        } catch {
          setError("เกิดข้อผิดพลาดในการเชื่อมต่อ");
        } finally {
          setLoading(false);
        }
      }
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Amount */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-center mb-2">
        <div className="text-xs text-stone-500">ยอดชำระ</div>
        <div className="text-2xl font-bold text-amber-700">{formatBaht(amount)}</div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
          ⚠️ {error}
        </div>
      )}

      {/* Cardholder name */}
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1.5">ชื่อบนบัตร</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value.toUpperCase())}
          placeholder="SOMCHAI JAIDEE"
          required
          className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-400 uppercase tracking-widest"
        />
      </div>

      {/* Card number */}
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1.5">หมายเลขบัตร</label>
        <input
          type="text"
          value={number}
          onChange={(e) => setNumber(formatCardNumber(e.target.value))}
          placeholder="0000 0000 0000 0000"
          required
          inputMode="numeric"
          className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-400 tracking-widest"
        />
      </div>

      {/* Expiry + CVV */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">วันหมดอายุ</label>
          <input
            type="text"
            value={expiry}
            onChange={(e) => setExpiry(formatExpiry(e.target.value))}
            placeholder="MM/YY"
            required
            inputMode="numeric"
            maxLength={5}
            className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-400 tracking-widest"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">CVV</label>
          <input
            type="password"
            value={cvv}
            onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
            placeholder="•••"
            required
            inputMode="numeric"
            className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>
      </div>

      {/* Test card hint */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-xs text-blue-600">
        🧪 <strong>ทดสอบ:</strong> ใช้บัตร <span className="font-mono">4242 4242 4242 4242</span> วันหมดอายุใดก็ได้ CVV ใดก็ได้
      </div>

      <button
        type="submit"
        disabled={loading || !omiseReady}
        className="w-full bg-amber-700 hover:bg-amber-800 disabled:opacity-50 disabled:cursor-wait text-white font-bold py-3.5 rounded-full transition-colors flex items-center justify-center gap-2"
      >
        {loading ? (
          <><span className="animate-spin">⏳</span> กำลังชำระเงิน…</>
        ) : (
          <>💳 ชำระเงิน {formatBaht(amount)}</>
        )}
      </button>

      <p className="text-center text-xs text-stone-400">
        🔒 ปลอดภัยด้วย Omise — ข้อมูลบัตรไม่ผ่านเซิร์ฟเวอร์ของเรา
      </p>
    </form>
  );
}
