"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Order, listOrders, updateOrder,
  ORDER_STATUS_FLOW, ORDER_STATUS_LABEL, PAYMENT_STATUS_LABEL,
  OrderStatus, PaymentStatus,
} from "@/lib/orders";
import { formatTHB } from "@/lib/pricing";

const PAYMENT_STATES: PaymentStatus[] = ["pending", "paid", "failed", "refunded"];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[] | null>(null);

  const refresh = useCallback(async () => {
    try { setOrders(await listOrders()); } catch { setOrders([]); }
  }, []);
  useEffect(() => { refresh(); }, [refresh]);

  async function setOrderStatus(n: string, s: OrderStatus) {
    await updateOrder(n, { orderStatus: s });
    refresh();
  }
  async function setPaymentStatus(n: string, s: PaymentStatus) {
    await updateOrder(n, { paymentStatus: s });
    refresh();
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted to-background">
      <header className="border-b border-border/60 bg-background/85 px-5 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <h1 className="font-heading text-xl font-extrabold text-foreground">จัดการคำสั่งซื้อ (Admin)</h1>
          <Link href="/projects" className="text-sm font-semibold text-muted-foreground hover:text-foreground">หนังสือของฉัน →</Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-8">
        {orders === null ? (
          <p className="py-16 text-center text-muted-foreground">กำลังโหลด…</p>
        ) : orders.length === 0 ? (
          <p className="py-16 text-center text-muted-foreground">ยังไม่มีคำสั่งซื้อ</p>
        ) : (
          <div className="space-y-3">
            {orders.map((o) => (
              <div key={o.orderNumber} className="flex flex-col gap-3 rounded-2xl border-2 border-border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <Link href={`/order/${o.orderNumber}`} className="font-heading text-sm font-bold text-foreground hover:underline">
                    {o.orderNumber}
                  </Link>
                  <p className="truncate text-xs text-muted-foreground">
                    {o.customer.firstName} {o.customer.lastName} · {o.pageCount} หน้า × {o.config.quantity} · {formatTHB(o.amount)}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <label className="text-xs text-muted-foreground">ชำระเงิน</label>
                  <select
                    value={o.paymentStatus}
                    onChange={(e) => setPaymentStatus(o.orderNumber, e.target.value as PaymentStatus)}
                    className="rounded-full border-2 border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground"
                  >
                    {PAYMENT_STATES.map((s) => <option key={s} value={s}>{PAYMENT_STATUS_LABEL[s]}</option>)}
                  </select>
                  <label className="text-xs text-muted-foreground">สถานะ</label>
                  <select
                    value={o.orderStatus}
                    onChange={(e) => setOrderStatus(o.orderNumber, e.target.value as OrderStatus)}
                    className="rounded-full border-2 border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground"
                  >
                    {ORDER_STATUS_FLOW.map((s) => <option key={s} value={s}>{ORDER_STATUS_LABEL[s]}</option>)}
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
        <p className="mt-6 text-center text-xs text-muted-foreground">
          หมายเหตุ: ออเดอร์เก็บในเครื่องนี้ (ยังไม่มีระบบล็อกอิน/เซิร์ฟเวอร์)
        </p>
      </main>
    </div>
  );
}
