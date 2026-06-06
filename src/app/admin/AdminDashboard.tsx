"use client";

import { useEffect, useState, useCallback } from "react";
import { formatBaht } from "@/lib/content";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Order {
  id:              string;
  full_name:       string;
  phone:           string;
  address_line:    string;
  sub_district:    string;
  district:        string;
  province:        string;
  postal_code:     string;
  quantity:        number;
  total_price:     number;
  page_count:      number;
  status:          string;
  payment_method:  string | null;
  payment_ref:     string | null;
  tracking_number: string | null;
  project_id:      string | null;
  created_at:      string;
  paid_at:         string | null;
  shipped_at:      string | null;
}

// ─── Status helpers ───────────────────────────────────────────────────────────

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending_payment: { label: "รอชำระเงิน",  color: "bg-yellow-100 text-yellow-700" },
  paid:            { label: "ชำระแล้ว",    color: "bg-blue-100   text-blue-700"   },
  printing:        { label: "กำลังพิมพ์",  color: "bg-purple-100 text-purple-700" },
  shipped:         { label: "จัดส่งแล้ว",  color: "bg-green-100  text-green-700"  },
  delivered:       { label: "ส่งถึงแล้ว",  color: "bg-emerald-100 text-emerald-700" },
  cancelled:       { label: "ยกเลิก",      color: "bg-red-100    text-red-700"    },
};

const NEXT_STATUS: Record<string, string | null> = {
  paid:     "printing",
  printing: "shipped",
  shipped:  "delivered",
};

const STATUS_BUTTON_LABEL: Record<string, string> = {
  printing:  "📦 เริ่มพิมพ์",
  shipped:   "🚚 จัดส่งแล้ว",
  delivered: "✅ ส่งถึงแล้ว",
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [orders,  setOrders]  = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);
  const [filter,  setFilter]  = useState<string>("all");

  // Tracking modal state
  const [trackingModal, setTrackingModal] = useState<{
    orderId: string; nextStatus: string;
  } | null>(null);
  const [trackingInput, setTrackingInput] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setError(null);
    try {
      const res  = await fetch("/api/admin/orders");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setOrders(data.orders ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "โหลดคำสั่งซื้อไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  async function updateStatus(id: string, status: string, trackingNumber?: string) {
    setUpdating(id);
    try {
      const res  = await fetch("/api/admin/orders", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ id, status, trackingNumber }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setOrders((prev) => prev.map((o) => (o.id === id ? data.order : o)));
    } catch (e) {
      alert(e instanceof Error ? e.message : "เกิดข้อผิดพลาด");
    } finally {
      setUpdating(null);
      setTrackingModal(null);
      setTrackingInput("");
    }
  }

  function handleAdvanceStatus(order: Order) {
    const next = NEXT_STATUS[order.status];
    if (!next) return;
    if (next === "shipped") {
      setTrackingModal({ orderId: order.id, nextStatus: next });
    } else {
      updateStatus(order.id, next);
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.reload();
  }

  const filtered = filter === "all"
    ? orders
    : orders.filter((o) => o.status === filter);

  const counts = Object.fromEntries(
    Object.keys(STATUS_LABELS).map((s) => [s, orders.filter((o) => o.status === s).length])
  );

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-stone-100">
      {/* Header */}
      <header className="bg-stone-900 text-white sticky top-0 z-20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl">📚</span>
            <span className="font-bold text-lg">Everbook Admin</span>
            {!loading && (
              <span className="text-stone-400 text-sm">— {orders.length} คำสั่งซื้อ</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchOrders}
              className="text-stone-400 hover:text-white text-sm transition-colors"
              title="Refresh"
            >
              🔄 รีเฟรช
            </button>
            <button
              onClick={handleLogout}
              className="text-stone-400 hover:text-white text-sm transition-colors"
            >
              ออกจากระบบ
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">

        {/* Stats row */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-6">
          {Object.entries(STATUS_LABELS).map(([key, { label, color }]) => (
            <button
              key={key}
              onClick={() => setFilter(filter === key ? "all" : key)}
              className={`rounded-xl px-3 py-3 text-center transition-all border-2 ${
                filter === key ? "border-amber-500 shadow-md" : "border-transparent"
              } ${color}`}
            >
              <div className="text-2xl font-bold">{counts[key] ?? 0}</div>
              <div className="text-xs mt-0.5">{label}</div>
            </button>
          ))}
        </div>

        {/* Filter label */}
        {filter !== "all" && (
          <div className="flex items-center gap-2 mb-4 text-sm text-stone-600">
            <span>กรอง: <strong>{STATUS_LABELS[filter]?.label}</strong></span>
            <button onClick={() => setFilter("all")} className="text-stone-400 hover:text-stone-700">✕ ล้างตัวกรอง</button>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-4">
            ⚠️ {error} — <button onClick={fetchOrders} className="underline">ลองใหม่</button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-24 text-stone-400">
            <div className="text-4xl animate-spin mb-4">⏳</div>
            กำลังโหลด…
          </div>
        )}

        {/* Empty */}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-24 text-stone-400">
            <div className="text-5xl mb-4">📭</div>
            ยังไม่มีคำสั่งซื้อ
          </div>
        )}

        {/* Order cards */}
        {!loading && filtered.length > 0 && (
          <div className="space-y-4">
            {filtered.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                updating={updating === order.id}
                onAdvance={() => handleAdvanceStatus(order)}
                onCancel={() => updateStatus(order.id, "cancelled")}
              />
            ))}
          </div>
        )}
      </div>

      {/* Tracking modal */}
      {trackingModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-lg font-bold text-stone-800 mb-2">หมายเลขพัสดุ</h3>
            <p className="text-sm text-stone-500 mb-4">กรอกหมายเลขพัสดุ (ถ้ามี) ก่อนอัปเดตสถานะ &ldquo;จัดส่งแล้ว&rdquo;</p>
            <input
              type="text"
              value={trackingInput}
              onChange={(e) => setTrackingInput(e.target.value)}
              placeholder="เช่น EF123456789TH"
              autoFocus
              className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm font-mono mb-4 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setTrackingModal(null); setTrackingInput(""); }}
                className="flex-1 py-2.5 rounded-full border-2 border-stone-200 text-stone-600 text-sm font-medium hover:bg-stone-50"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => updateStatus(trackingModal.orderId, trackingModal.nextStatus, trackingInput || undefined)}
                className="flex-1 py-2.5 rounded-full bg-green-600 hover:bg-green-700 text-white text-sm font-bold transition-colors"
              >
                🚚 ยืนยันจัดส่ง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── OrderCard ────────────────────────────────────────────────────────────────

function OrderCard({
  order, updating, onAdvance, onCancel,
}: {
  order:    Order;
  updating: boolean;
  onAdvance: () => void;
  onCancel:  () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const { label, color } = STATUS_LABELS[order.status] ?? { label: order.status, color: "bg-stone-100 text-stone-600" };
  const nextStatus = NEXT_STATUS[order.status];
  const shortId    = order.id.slice(0, 8).toUpperCase();
  const date       = new Date(order.created_at).toLocaleDateString("th-TH", {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });

  return (
    <div className={`bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden transition-opacity ${updating ? "opacity-60" : ""}`}>
      {/* Main row */}
      <div
        className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-stone-50 transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        {/* ID + date */}
        <div className="min-w-[100px]">
          <div className="font-mono font-bold text-stone-800 text-sm">#{shortId}</div>
          <div className="text-xs text-stone-400">{date}</div>
        </div>

        {/* Customer */}
        <div className="flex-1 min-w-0">
          <div className="font-medium text-stone-800 truncate">{order.full_name}</div>
          <div className="text-xs text-stone-400 truncate">{order.phone} · {order.province}</div>
        </div>

        {/* Quantity & amount */}
        <div className="text-right hidden sm:block">
          <div className="font-bold text-amber-700">{formatBaht(order.total_price)}</div>
          <div className="text-xs text-stone-400">{order.quantity} เล่ม · {order.page_count} หน้า</div>
        </div>

        {/* Status badge */}
        <span className={`text-xs font-semibold px-3 py-1 rounded-full shrink-0 ${color}`}>
          {label}
        </span>

        {/* Chevron */}
        <span className={`text-stone-300 transition-transform ${expanded ? "rotate-180" : ""}`}>▼</span>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-stone-100 px-5 py-4 bg-stone-50 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          {/* Shipping */}
          <div>
            <div className="text-xs text-stone-400 font-semibold uppercase tracking-wide mb-1">ที่อยู่จัดส่ง</div>
            <div className="text-stone-700">
              <div>{order.full_name}</div>
              <div>{order.address_line}</div>
              <div>{order.sub_district} {order.district}</div>
              <div>{order.province} {order.postal_code}</div>
              <div className="text-stone-400">{order.phone}</div>
            </div>
          </div>

          {/* Payment + actions */}
          <div className="space-y-3">
            <div>
              <div className="text-xs text-stone-400 font-semibold uppercase tracking-wide mb-1">การชำระเงิน</div>
              <div className="text-stone-700">
                {order.payment_method === "promptpay" ? "💸 PromptPay"
                  : order.payment_method === "card"   ? "💳 บัตรเครดิต"
                  : "—"}
              </div>
              {order.payment_ref && (
                <div className="text-xs text-stone-400 font-mono">{order.payment_ref}</div>
              )}
              {order.tracking_number && (
                <div className="mt-1">
                  <span className="text-xs text-stone-400">หมายเลขพัสดุ: </span>
                  <span className="font-mono text-xs text-stone-700">{order.tracking_number}</span>
                </div>
              )}
            </div>

            {/* PDF download */}
            {order.project_id && (
              <a
                href={`/api/export-pdf?projectId=${order.project_id}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 hover:text-amber-900 border border-amber-200 bg-amber-50 rounded-lg px-3 py-1.5 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                📄 ดาวน์โหลด PDF
              </a>
            )}

            {/* Action buttons */}
            <div className="flex gap-2 flex-wrap">
              {nextStatus && (
                <button
                  onClick={(e) => { e.stopPropagation(); onAdvance(); }}
                  disabled={updating}
                  className="bg-amber-700 hover:bg-amber-800 disabled:opacity-50 text-white text-xs font-bold px-4 py-2 rounded-full transition-colors"
                >
                  {updating ? "⏳ กำลังอัปเดต…" : (STATUS_BUTTON_LABEL[nextStatus] ?? nextStatus)}
                </button>
              )}
              {order.status !== "cancelled" && order.status !== "delivered" && (
                <button
                  onClick={(e) => { e.stopPropagation(); if (confirm("ยืนยันการยกเลิกคำสั่งซื้อ?")) onCancel(); }}
                  disabled={updating}
                  className="text-red-500 hover:text-red-700 text-xs font-medium px-3 py-2 rounded-full border border-red-200 hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  ยกเลิก
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
