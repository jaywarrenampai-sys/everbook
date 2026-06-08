// ─── Orders (local-first) ────────────────────────────────────────────────────
// Order records live in IndexedDB. When auth + a real gateway are added later,
// these map straight onto a server order table.

import { ProductConfig, CheckoutInfo } from "@/lib/editor/types";
import { STORES, idbPut, idbGet, idbGetAll } from "@/lib/projects/db";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";
export type OrderStatus =
  | "pending_payment"
  | "paid"
  | "preparing"
  | "printing"
  | "shipped"
  | "delivered";

export const ORDER_STATUS_FLOW: OrderStatus[] = [
  "pending_payment", "paid", "preparing", "printing", "shipped", "delivered",
];

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending_payment: "รอชำระเงิน",
  paid: "ชำระเงินแล้ว",
  preparing: "กำลังเตรียม",
  printing: "กำลังพิมพ์",
  shipped: "จัดส่งแล้ว",
  delivered: "ได้รับแล้ว",
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
  config: ProductConfig;
  pageCount: number;
  customer: CheckoutInfo;
  amount: number; // grand total (book + shipping)
  paymentMethod: "promptpay" | "card";
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
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
    config: input.config,
    pageCount: input.pageCount,
    customer: input.customer,
    amount: input.amount,
    paymentMethod: input.paymentMethod ?? "promptpay",
    paymentStatus: "pending",
    orderStatus: "pending_payment",
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
