"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import QRCode from "qrcode";
import { BookOpen, Check, Clock, CreditCard, QrCode } from "lucide-react";
import {
  Order, getOrder, updateOrder,
  ORDER_STATUS_FLOW, ORDER_STATUS_LABEL, PAYMENT_STATUS_LABEL,
} from "@/lib/orders";
import { promptPayPayload } from "@/lib/promptpay";
import { SIZES, COVERS, PAPERS, formatTHB } from "@/lib/pricing";

const PROMPTPAY_ID = process.env.NEXT_PUBLIC_PROMPTPAY_ID || "0000000000";

export default function OrderPage() {
  const params = useParams<{ orderNumber: string }>();
  const router = useRouter();
  const orderNumber = params.orderNumber;
  const [order, setOrder] = useState<Order | null | undefined>(undefined);
  const [qr, setQr] = useState<string>("");

  useEffect(() => {
    (async () => {
      const o = await getOrder(orderNumber).catch(() => undefined);
      setOrder(o ?? null);
      if (o && o.paymentStatus === "pending") {
        try {
          const payload = promptPayPayload(PROMPTPAY_ID, o.amount);
          setQr(await QRCode.toDataURL(payload, { width: 280, margin: 1 }));
        } catch {}
      }
    })();
  }, [orderNumber]);

  async function markPaid() {
    const next = await updateOrder(orderNumber, { paymentStatus: "paid", orderStatus: "paid" });
    if (next) setOrder(next);
  }
  async function markFailed() {
    const next = await updateOrder(orderNumber, { paymentStatus: "failed" });
    if (next) setOrder(next);
  }
  async function retry() {
    const next = await updateOrder(orderNumber, { paymentStatus: "pending" });
    if (next) {
      setOrder(next);
      try {
        setQr(await QRCode.toDataURL(promptPayPayload(PROMPTPAY_ID, next.amount), { width: 280, margin: 1 }));
      } catch {}
    }
  }

  if (order === undefined) {
    return <div className="flex min-h-screen items-center justify-center bg-muted text-muted-foreground">กำลังโหลด…</div>;
  }
  if (order === null) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-gradient-to-b from-muted to-background text-center">
        <span className="text-4xl">🧾</span>
        <p className="font-heading text-lg font-bold text-foreground">ไม่พบคำสั่งซื้อ</p>
        <button onClick={() => router.push("/projects")} className="rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground">หนังสือของฉัน</button>
      </div>
    );
  }

  const sizeLabel = SIZES.find((s) => s.id === order.config.size)?.label ?? "";
  const coverLabel = COVERS.find((s) => s.id === order.config.cover)?.label ?? "";
  const paperLabel = PAPERS.find((s) => s.id === order.config.paper)?.label ?? "";
  const currentStep = ORDER_STATUS_FLOW.indexOf(order.orderStatus);

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted to-background">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-5 py-4">
          <span className="inline-flex size-9 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <BookOpen className="size-5" />
          </span>
          <div>
            <h1 className="font-heading text-lg font-extrabold leading-tight text-foreground">คำสั่งซื้อ {order.orderNumber}</h1>
            <p className="text-xs text-muted-foreground">{PAYMENT_STATUS_LABEL[order.paymentStatus]}</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-6 px-5 py-8">
        {/* Payment */}
        {order.paymentStatus === "pending" && (
          <section className="rounded-3xl border-2 border-border bg-card p-6 shadow-sm">
            {/* method tabs */}
            <div className="mb-5 inline-flex rounded-full border-2 border-border bg-background p-1">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-1.5 text-xs font-bold text-primary-foreground">
                <QrCode className="size-4" /> PromptPay
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold text-muted-foreground">
                <CreditCard className="size-4" /> บัตรเครดิต (เร็วๆ นี้)
              </span>
            </div>

            <div className="flex flex-col items-center gap-3 text-center">
              <p className="font-heading text-base font-bold text-foreground">สแกนเพื่อชำระเงินด้วย PromptPay</p>
              {qr ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={qr} alt="PromptPay QR" className="size-64 rounded-2xl border-2 border-border bg-white p-2" />
              ) : (
                <div className="flex size-64 items-center justify-center rounded-2xl border-2 border-dashed border-border text-muted-foreground">QR…</div>
              )}
              <p className="font-heading text-3xl font-extrabold text-primary">{formatTHB(order.amount)}</p>
              <p className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                <Clock className="size-4" /> รอการชำระเงิน
              </p>

              <div className="mt-2 flex w-full flex-col gap-2 sm:flex-row">
                <button onClick={markPaid} className="flex-1 rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition-transform hover:-translate-y-0.5">
                  ฉันชำระเงินแล้ว
                </button>
                <button onClick={markFailed} className="rounded-full border-2 border-border px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted">
                  ชำระเงินไม่สำเร็จ
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                PromptPay ID: {PROMPTPAY_ID === "0000000000" ? "ยังไม่ได้ตั้งค่า (ทดสอบ)" : PROMPTPAY_ID}
              </p>
            </div>
          </section>
        )}

        {order.paymentStatus === "failed" && (
          <section className="rounded-3xl border-2 border-destructive/30 bg-destructive/5 p-6 text-center shadow-sm">
            <p className="font-heading text-lg font-bold text-destructive">การชำระเงินไม่สำเร็จ</p>
            <button onClick={retry} className="mt-4 rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground">ลองชำระเงินอีกครั้ง</button>
          </section>
        )}

        {(order.paymentStatus === "paid" || order.paymentStatus === "refunded") && (
          <section className="rounded-3xl border-2 border-border bg-card p-6 text-center shadow-sm">
            <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-full bg-mint text-mint-foreground">
              <Check className="size-7" />
            </div>
            <p className="font-heading text-lg font-extrabold text-foreground">{PAYMENT_STATUS_LABEL[order.paymentStatus]}</p>
            <p className="mt-1 text-sm text-muted-foreground">ขอบคุณสำหรับคำสั่งซื้อ • {formatTHB(order.amount)}</p>
          </section>
        )}

        {/* Order status timeline */}
        <section className="rounded-3xl border-2 border-border bg-card p-6 shadow-sm">
          <h2 className="mb-4 font-heading text-base font-bold text-foreground">สถานะคำสั่งซื้อ</h2>
          <ol className="space-y-3">
            {ORDER_STATUS_FLOW.map((st, i) => {
              const reached = i <= currentStep;
              const active = i === currentStep;
              return (
                <li key={st} className="flex items-center gap-3">
                  <span className={`inline-flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    reached ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}>
                    {reached ? <Check className="size-4" /> : i + 1}
                  </span>
                  <span className={`text-sm ${active ? "font-bold text-foreground" : reached ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                    {ORDER_STATUS_LABEL[st]}
                  </span>
                </li>
              );
            })}
          </ol>
        </section>

        {/* Summary */}
        <section className="rounded-3xl border-2 border-border bg-card p-6 shadow-sm">
          <h2 className="mb-4 font-heading text-base font-bold text-foreground">รายละเอียด</h2>
          <dl className="space-y-2 text-sm">
            <Row label="ขนาด" value={sizeLabel} />
            <Row label="ปก" value={coverLabel} />
            <Row label="กระดาษ" value={paperLabel} />
            <Row label="จำนวนหน้า" value={`${order.pageCount} หน้า`} />
            <Row label="จำนวนเล่ม" value={`${order.config.quantity} เล่ม`} />
            <Row label="ผู้รับ" value={`${order.customer.firstName} ${order.customer.lastName}`} />
            <Row label="จัดส่งที่" value={`${order.customer.address} ${order.customer.province} ${order.customer.postalCode}`} />
            <div className="my-1 h-px bg-border" />
            <div className="flex items-center justify-between pt-1">
              <span className="font-semibold text-foreground">ยอดรวม</span>
              <span className="font-heading text-xl font-extrabold text-primary">{formatTHB(order.amount)}</span>
            </div>
          </dl>
        </section>
      </main>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd className="text-right font-semibold text-foreground">{value}</dd>
    </div>
  );
}
