"use client";

import { useEffect, useState, useCallback } from "react";
import { formatBaht } from "@/lib/content";

interface Props {
  orderId:  string;
  amount:   number;
  onPaid:   () => void;
  onFailed: (msg: string) => void;
}

type Stage = "loading" | "ready" | "paid" | "failed" | "expired";

export default function PromptPayScreen({ orderId, amount, onPaid, onFailed }: Props) {
  const [stage,      setStage]      = useState<Stage>("loading");
  const [qrImageUrl, setQrImageUrl] = useState<string | null>(null);
  const [chargeId,   setChargeId]   = useState<string | null>(null);
  const [timeLeft,   setTimeLeft]   = useState(600); // 10 minutes

  // Create PromptPay charge + get QR
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/payment/promptpay", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ orderId }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "ไม่สามารถสร้าง QR Code ได้");
        setQrImageUrl(data.qrImageUrl);
        setChargeId(data.chargeId);
        setStage("ready");
      } catch (e) {
        onFailed(e instanceof Error ? e.message : "เกิดข้อผิดพลาด");
        setStage("failed");
      }
    })();
  }, [orderId, onFailed]);

  // Poll for payment status every 3 seconds
  const checkStatus = useCallback(async () => {
    if (!chargeId || stage !== "ready") return;
    try {
      const res  = await fetch(`/api/payment/status?chargeId=${chargeId}&orderId=${orderId}`);
      const data = await res.json();
      if (data.status === "successful") { setStage("paid");    onPaid(); }
      if (data.status === "failed")     { setStage("failed");  onFailed("การชำระเงินล้มเหลว"); }
      if (data.status === "expired")    { setStage("expired"); }
    } catch { /* network hiccup — try again next tick */ }
  }, [chargeId, orderId, stage, onPaid, onFailed]);

  useEffect(() => {
    if (stage !== "ready") return;
    const poll  = setInterval(checkStatus, 3000);
    const timer = setInterval(() => setTimeLeft((t) => {
      if (t <= 1) { clearInterval(poll); clearInterval(timer); setStage("expired"); return 0; }
      return t - 1;
    }), 1000);
    return () => { clearInterval(poll); clearInterval(timer); };
  }, [stage, checkStatus]);

  const mins = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const secs = String(timeLeft % 60).padStart(2, "0");

  if (stage === "loading") {
    return (
      <div className="text-center py-16">
        <div className="text-4xl animate-spin mb-4">⏳</div>
        <p className="text-stone-500">กำลังสร้าง QR Code…</p>
      </div>
    );
  }

  if (stage === "paid") {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">✅</div>
        <h3 className="text-xl font-bold text-green-700 mb-2">ชำระเงินสำเร็จ!</h3>
        <p className="text-stone-500">กำลังดำเนินการคำสั่งซื้อ…</p>
      </div>
    );
  }

  if (stage === "expired") {
    return (
      <div className="text-center py-12">
        <div className="text-5xl mb-4">⏱️</div>
        <h3 className="text-xl font-bold text-stone-700 mb-2">QR Code หมดอายุแล้ว</h3>
        <p className="text-stone-500 mb-6">กรุณาลองใหม่อีกครั้ง</p>
        <button
          onClick={() => { setStage("loading"); setTimeLeft(600); }}
          className="bg-amber-700 text-white px-6 py-2.5 rounded-full font-semibold hover:bg-amber-800 transition-colors"
        >
          ขอ QR Code ใหม่
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Amount */}
      <div className="text-center">
        <div className="text-sm text-stone-500 mb-1">ยอดชำระ</div>
        <div className="text-3xl font-bold text-amber-700">{formatBaht(amount)}</div>
      </div>

      {/* QR Code */}
      {qrImageUrl && (
        <div className="bg-white p-4 rounded-2xl shadow-lg border border-stone-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrImageUrl} alt="PromptPay QR Code" className="w-52 h-52" />
        </div>
      )}

      {/* Instructions */}
      <div className="text-center max-w-xs">
        <p className="text-sm font-semibold text-stone-700 mb-1">📲 วิธีชำระเงิน</p>
        <p className="text-xs text-stone-500 leading-relaxed">
          เปิดแอปธนาคารของคุณ → เลือก &ldquo;สแกน QR&rdquo; → สแกนรหัสด้านบน → ยืนยันการโอนเงิน
        </p>
      </div>

      {/* Countdown */}
      <div className={`text-sm font-mono px-4 py-2 rounded-full ${
        timeLeft < 60 ? "bg-red-100 text-red-600" : "bg-stone-100 text-stone-500"
      }`}>
        หมดเวลาใน {mins}:{secs}
      </div>

      {/* Polling indicator */}
      <div className="flex items-center gap-2 text-xs text-stone-400">
        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        กำลังรอการชำระเงิน…
      </div>
    </div>
  );
}
