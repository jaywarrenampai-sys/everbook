"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { Order, listOrders, ORDER_STATUS_LABEL } from "@/lib/orders";
import { formatTHB } from "@/lib/pricing";

const FILTERS: { id: string; label: string }[] = [
  { id: "all", label: "ทั้งหมด" },
  { id: "pending_payment", label: "รอชำระเงิน" },
  { id: "paid", label: "ชำระแล้ว" },
  { id: "printing", label: "กำลังพิมพ์" },
  { id: "shipped", label: "จัดส่งแล้ว" },
  { id: "delivered", label: "ได้รับแล้ว" },
];

function startOfToday() { const d = new Date(); d.setHours(0, 0, 0, 0); return d.getTime(); }
function startOfMonth() { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1).getTime(); }
function fmtDate(ts: number) { return new Date(ts).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "2-digit" }); }

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");

  const refresh = useCallback(async () => {
    try { setOrders(await listOrders()); } catch { setOrders([]); }
  }, []);
  useEffect(() => { refresh(); }, [refresh]);

  const stats = useMemo(() => {
    const o = orders ?? [];
    const paid = o.filter((x) => x.paymentStatus === "paid");
    const today = startOfToday();
    const month = startOfMonth();
    return {
      total: o.length,
      pending: o.filter((x) => x.orderStatus === "pending_payment").length,
      paid: paid.length,
      printing: o.filter((x) => x.orderStatus === "printing").length,
      shipped: o.filter((x) => x.orderStatus === "shipped").length,
      delivered: o.filter((x) => x.orderStatus === "delivered").length,
      revToday: paid.filter((x) => x.createdAt >= today).reduce((s, x) => s + x.amount, 0),
      revMonth: paid.filter((x) => x.createdAt >= month).reduce((s, x) => s + x.amount, 0),
    };
  }, [orders]);

  const shown = useMemo(() => {
    let o = orders ?? [];
    if (filter !== "all") o = o.filter((x) => x.orderStatus === filter);
    const q = query.trim().toLowerCase();
    if (q) {
      o = o.filter((x) =>
        x.orderNumber.toLowerCase().includes(q) ||
        `${x.customer.firstName} ${x.customer.lastName}`.toLowerCase().includes(q) ||
        x.customer.email.toLowerCase().includes(q) ||
        x.customer.phone.toLowerCase().includes(q)
      );
    }
    return o;
  }, [orders, filter, query]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted to-background">
      <header className="border-b border-border/60 bg-background/85 px-5 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <h1 className="font-heading text-xl font-extrabold text-foreground">แดชบอร์ดผู้ดูแล</h1>
          <Link href="/projects" className="text-sm font-semibold text-muted-foreground hover:text-foreground">หนังสือของฉัน →</Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-5 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="คำสั่งซื้อทั้งหมด" value={stats.total} />
          <Stat label="รอชำระเงิน" value={stats.pending} tone="peach" />
          <Stat label="ชำระแล้ว" value={stats.paid} tone="mint" />
          <Stat label="กำลังพิมพ์" value={stats.printing} tone="sky" />
          <Stat label="จัดส่งแล้ว" value={stats.shipped} tone="sky" />
          <Stat label="ได้รับแล้ว" value={stats.delivered} tone="mint" />
          <Stat label="รายได้วันนี้" value={formatTHB(stats.revToday)} tone="butter" />
          <Stat label="รายได้เดือนนี้" value={formatTHB(stats.revMonth)} tone="butter" />
        </div>

        {/* Search + filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ค้นหา: เลขที่ / ชื่อ / อีเมล / เบอร์โทร"
            className="w-full rounded-2xl border-2 border-border bg-card px-4 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/40 sm:max-w-sm"
          />
          <div className="no-scrollbar flex gap-1.5 overflow-x-auto">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                  filter === f.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Order list */}
        {orders === null ? (
          <p className="py-16 text-center text-muted-foreground">กำลังโหลด…</p>
        ) : shown.length === 0 ? (
          <p className="rounded-2xl border-2 border-dashed border-border bg-card py-16 text-center text-muted-foreground">ไม่พบคำสั่งซื้อ</p>
        ) : (
          <div className="overflow-hidden rounded-2xl border-2 border-border bg-card shadow-sm">
            <div className="hidden grid-cols-[1.1fr_1.2fr_0.9fr_1.2fr_1fr_0.8fr] gap-3 border-b border-border/60 px-4 py-3 text-xs font-bold text-muted-foreground sm:grid">
              <span>เลขที่</span><span>ลูกค้า</span><span>วันที่</span><span>หนังสือ</span><span>สถานะ</span><span className="text-right">ราคา</span>
            </div>
            {shown.map((o) => (
              <Link
                key={o.orderNumber}
                href={`/admin/orders/${o.orderNumber}`}
                className="grid grid-cols-2 gap-2 border-b border-border/40 px-4 py-3 text-sm transition-colors last:border-0 hover:bg-muted/40 sm:grid-cols-[1.1fr_1.2fr_0.9fr_1.2fr_1fr_0.8fr] sm:gap-3"
              >
                <span className="font-heading font-bold text-foreground">{o.orderNumber}</span>
                <span className="truncate text-foreground">{o.customer.firstName} {o.customer.lastName}</span>
                <span className="text-muted-foreground">{fmtDate(o.createdAt)}</span>
                <span className="truncate text-foreground">{o.bookName}</span>
                <span><span className="inline-block rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-secondary-foreground">{ORDER_STATUS_LABEL[o.orderStatus] ?? o.orderStatus}</span></span>
                <span className="font-semibold text-foreground sm:text-right">{formatTHB(o.amount)}</span>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

const TONE: Record<string, string> = {
  default: "bg-card",
  peach: "bg-peach/40",
  mint: "bg-mint/40",
  sky: "bg-sky/40",
  butter: "bg-butter/50",
};

function Stat({ label, value, tone = "default" }: { label: string; value: string | number; tone?: string }) {
  return (
    <div className={`rounded-2xl border-2 border-border p-4 shadow-sm ${TONE[tone]}`}>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 font-heading text-2xl font-extrabold text-foreground">{value}</p>
    </div>
  );
}
