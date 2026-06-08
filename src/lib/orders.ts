// ─── Orders (local-first) ────────────────────────────────────────────────────
// Order records live in IndexedDB. When auth + a real gateway are added later,
// these map straight onto a server order table.

import { ProductConfig, CheckoutInfo } from "@/lib/editor/types";
import { STORES, idbPut, idbGet, idbGetAll } from "@/lib/projects/db";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";
export type OrderStatus =
  | "pending_payment"
  | "paid"
  | "preparing_files"
  | "ready_for_print"
  | "printing"
  | "quality_check"
  | "ready_to_ship"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

/** Linear production pipeline (for the customer timeline). */
export const ORDER_STATUS_FLOW: OrderStatus[] = [
  "pending_payment", "paid", "preparing_files", "ready_for_print",
  "printing", "quality_check", "ready_to_ship", "shipped", "delivered",
];

/** Every status an admin can set (pipeline + terminal states). */
export const ALL_ORDER_STATUSES: OrderStatus[] = [
  ...ORDER_STATUS_FLOW, "cancelled", "refunded",
];

// Record<string,...> so legacy values (e.g. "preparing") still render.
export const ORDER_STATUS_LABEL: Record<string, string> = {
  pending_payment: "รอชำระเงิน",
  paid: "ชำระเงินแล้ว",
  preparing_files: "เตรียมไฟล์",
  ready_for_print: "พร้อมพิมพ์",
  printing: "กำลังพิมพ์",
  quality_check: "ตรวจคุณภาพ",
  ready_to_ship: "พร้อมจัดส่ง",
  shipped: "จัดส่งแล้ว",
  delivered: "ได้รับแล้ว",
  cancelled: "ยกเลิก",
  refunded: "คืนเงินแล้ว",
  preparing: "กำลังเตรียม", // legacy
};

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  pending: "รอการชำระเงิน",
  paid: "ชำระเงินสำเร็จ",
  failed: "ชำระเงินไม่สำเร็จ",
  refunded: "คืนเงินแล้ว",
};

export interface Order {
  orderNumber: string;
  projectId: string | null;
  bookName: string;
  config: ProductConfig;
  pageCount: number;
  customer: CheckoutInfo;
  amount: number; // grand total (book + shipping)
  paymentMethod: "promptpay" | "card";
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  notes: string; // internal admin notes
  /** Latest generated print files (full version history lives in the pdfs store) */
  printFiles?: {
    interior?: { version: number; size: number; createdAt: number };
    cover?: { version: number; size: number; createdAt: number };
  };
  createdAt: number;
  updatedAt: number;
}

function generateOrderNumber(): string {
  const ts = Date.now().toString(36).toUpperCase().slice(-6);
  const rand = Math.floor(Math.random() * 36 ** 3).toString(36).toUpperCase().padStart(3, "0");
  return `EB-${ts}${rand}`;
}

export async function createOrder(input: {
  projectId: string | null;
  bookName?: string;
  config: ProductConfig;
  pageCount: number;
  customer: CheckoutInfo;
  amount: number;
  paymentMethod?: "promptpay" | "card";
}): Promise<Order> {
  const now = Date.now();
  const order: Order = {
    orderNumber: generateOrderNumber(),
    projectId: input.projectId,
    bookName: input.bookName || "หนังสือของฉัน",
    config: input.config,
    pageCount: input.pageCount,
    customer: input.customer,
    amount: input.amount,
    paymentMethod: input.paymentMethod ?? "promptpay",
    paymentStatus: "pending",
    orderStatus: "pending_payment",
    notes: "",
    createdAt: now,
    updatedAt: now,
  };
  await idbPut(STORES.ORDERS, order);
  return order;
}

export async function getOrder(orderNumber: string): Promise<Order | undefined> {
  return idbGet<Order>(STORES.ORDERS, orderNumber);
}

export async function listOrders(): Promise<Order[]> {
  const all = await idbGetAll<Order>(STORES.ORDERS);
  return all.sort((a, b) => b.createdAt - a.createdAt);
}

export async function updateOrder(orderNumber: string, patch: Partial<Order>): Promise<Order | undefined> {
  const cur = await idbGet<Order>(STORES.ORDERS, orderNumber);
  if (!cur) return undefined;
  const next = { ...cur, ...patch, updatedAt: Date.now() };
  await idbPut(STORES.ORDERS, next);
  return next;
}
