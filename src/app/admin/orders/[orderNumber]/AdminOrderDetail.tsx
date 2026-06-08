"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, Download, FileText, FolderOpen } from "lucide-react";
import {
  Order, getOrder, updateOrder,
  ALL_ORDER_STATUSES, ORDER_STATUS_LABEL, PAYMENT_STATUS_LABEL,
  OrderStatus, PaymentStatus,
} from "@/lib/orders";
import { SIZES, COVERS, PAPERS, formatTHB } from "@/lib/pricing";
import { loadProject } from "@/lib/projects/localProjects";
import { fetchInteriorPDFBytes, fetchCoverPDFBytes, downloadBlob } from "@/lib/pdf/clientExport";
import { savePrintFile, listPrintFiles, getPrintFileBlob, formatBytes, PrintFileMeta, PrintFileType } from "@/lib/printFiles";
import { qualityCheck, QualityIssue } from "@/lib/qualityCheck";
import { normalizeConfig } from "@/lib/pricing";

const PAYMENT_STATES: PaymentStatus[] = ["pending", "paid", "failed", "refunded"];

export default function AdminOrderDetail({ orderNumber }: { orderNumber: string }) {
  const [order, setOrder] = useState<Order | null | undefined>(undefined);
  const [notes, setNotes] = useState("");
  const [pdfBusy, setPdfBusy] = useState<string | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [history, setHistory] = useState<PrintFileMeta[]>([]);
  const [issues, setIssues] = useState<QualityIssue[] | null>(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    (async () => {
      const o = await getOrder(orderNumber).catch(() => undefined);
      setOrder(o ?? null);
      setNotes(o?.notes ?? "");
      setHistory(await listPrintFiles(orderNumber).catch(() => []));
    })();
  }, [orderNumber]);

  // Persist notes (debounced)
  useEffect(() => {
    if (!order) return;
    const t = setTimeout(() => updateOrder(orderNumber, { notes }), 600);
    return () => clearTimeout(t);
  }, [notes, order, orderNumber]);

  async function setOrderStatus(s: OrderStatus) {
    const next = await updateOrder(orderNumber, { orderStatus: s });
    if (next) setOrder(next);
  }
  async function setPaymentStatus(s: PaymentStatus) {
    const next = await updateOrder(orderNumber, { paymentStatus: s });
    if (next) setOrder(next);
  }

  async function runQualityCheck() {
    if (!order?.projectId) { setPdfError("คำสั่งซื้อนี้ไม่มีโปรเจกต์ในเครื่องนี้"); return; }
    setChecking(true);
    setPdfError(null);
    try {
      const proj = await loadProject(order.projectId);
      if (!proj) throw new Error("ไม่พบโปรเจกต์ในเครื่องนี้");
      setIssues(qualityCheck(proj.layout, proj.photos));
    } catch (e) {
      setPdfError(e instanceof Error ? e.message : "ตรวจสอบไม่สำเร็จ");
    } finally {
      setChecking(false);
    }
  }

  async function generate(type: PrintFileType) {
    if (!order?.projectId) { setPdfError("คำสั่งซื้อนี้ไม่มีโปรเจกต์ในเครื่องนี้"); return; }
    setPdfError(null);
    setPdfBusy(type);
    try {
      const proj = await loadProject(order.projectId);
      if (!proj) throw new Error("ไม่พบโปรเจกต์ในเครื่องนี้");
      const config = normalizeConfig(proj.layout.productConfig ?? order.config);
      const bytes =
        type === "cover"
          ? await fetchCoverPDFBytes(proj.layout, proj.photos, config)
          : await fetchInteriorPDFBytes(proj.layout, proj.photos);
      const meta = await savePrintFile(order.orderNumber, type, bytes);
      const next = await updateOrder(order.orderNumber, {
        printFiles: { ...order.printFiles, [type]: meta },
      });
      if (next) setOrder(next);
      setHistory(await listPrintFiles(order.orderNumber));
      // also download the freshly generated file
      const blob = await getPrintFileBlob(order.orderNumber, type, meta.version);
      if (blob) downloadBlob(blob, `${order.orderNumber}-${type}-v${meta.version}.pdf`);
    } catch (e) {
      setPdfError(e instanceof Error ? e.message : "สร้าง PDF ไม่สำเร็จ");
    } finally {
      setPdfBusy(null);
    }
  }

  async function downloadVersion(type: PrintFileType, version: number) {
    const blob = await getPrintFileBlob(order!.orderNumber, type, version);
    if (blob) downloadBlob(blob, `${order!.orderNumber}-${type}-v${version}.pdf`);
  }

  if (order === undefined) return <Center>กำลังโหลด…</Center>;
  if (order === null) {
    return (
      <Center>
        <p className="font-heading text-lg font-bold text-foreground">ไม่พบคำสั่งซื้อ</p>
        <Link href="/admin" className="mt-3 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground">กลับแดชบอร์ด</Link>
      </Center>
    );
  }

  const c = order.customer;
  const sizeLabel = SIZES.find((s) => s.id === order.config.size)?.label ?? order.config.size;
  const coverLabel = COVERS.find((s) => s.id === order.config.cover)?.label ?? order.config.cover;
  const paperLabel = PAPERS.find((s) => s.id === order.config.paper)?.label ?? order.config.paper;

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted to-background">
      <header className="border-b border-border/60 bg-background/85 px-5 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center gap-3">
          <Link href="/admin" className="inline-flex size-10 items-center justify-center rounded-full bg-muted text-foreground hover:-translate-y-0.5">
            <ArrowLeft className="size-5" />
          </Link>
          <div>
            <h1 className="font-heading text-lg font-extrabold leading-tight text-foreground">{order.orderNumber}</h1>
            <p className="text-xs text-muted-foreground">{order.bookName}</p>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-4xl gap-5 px-5 py-8 lg:grid-cols-2">
        {/* Status controls */}
        <Card title="สถานะ">
          <div className="space-y-3">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-muted-foreground">สถานะคำสั่งซื้อ</span>
              <select value={order.orderStatus} onChange={(e) => setOrderStatus(e.target.value as OrderStatus)}
                className="w-full rounded-2xl border-2 border-border bg-background px-3 py-2.5 text-sm font-semibold text-foreground">
                {ALL_ORDER_STATUSES.map((s) => <option key={s} value={s}>{ORDER_STATUS_LABEL[s]}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-muted-foreground">สถานะการชำระเงิน</span>
              <select value={order.paymentStatus} onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                className="w-full rounded-2xl border-2 border-border bg-background px-3 py-2.5 text-sm font-semibold text-foreground">
                {PAYMENT_STATES.map((s) => <option key={s} value={s}>{PAYMENT_STATUS_LABEL[s]}</option>)}
              </select>
            </label>
          </div>
        </Card>

        {/* Customer + shipping */}
        <Card title="ลูกค้าและที่อยู่จัดส่ง">
          <dl className="space-y-1.5 text-sm">
            <Row label="ชื่อ" value={`${c.firstName} ${c.lastName}`} />
            <Row label="อีเมล" value={c.email} />
            <Row label="โทร" value={c.phone} />
            <Row label="ที่อยู่" value={`${c.address} ${c.district}`} />
            <Row label="จังหวัด" value={`${c.province} ${c.postalCode}`} />
            <Row label="ประเทศ" value={c.country} />
          </dl>
        </Card>

        {/* Book configuration */}
        <Card title="รายละเอียดหนังสือ">
          <dl className="space-y-1.5 text-sm">
            <Row label="ขนาด" value={sizeLabel} />
            <Row label="ปก" value={coverLabel} />
            <Row label="กระดาษ" value={paperLabel} />
            <Row label="จำนวนหน้า" value={`${order.pageCount} หน้า`} />
            <Row label="จำนวนเล่ม" value={`${order.config.quantity} เล่ม`} />
            <div className="my-1 h-px bg-border" />
            <Row label="ยอดรวม" value={formatTHB(order.amount)} bold />
          </dl>
          {order.projectId && (
            <Link href={`/editor?projectId=${order.projectId}`}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm font-bold text-secondary-foreground transition-transform hover:-translate-y-0.5">
              <FolderOpen className="size-4" /> เปิดโปรเจกต์ลูกค้า
            </Link>
          )}
        </Card>

        {/* Print files */}
        <Card title="ไฟล์สำหรับพิมพ์" full>
          {/* Quality check */}
          <div className="mb-4 rounded-2xl bg-secondary/20 p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">ตรวจสอบคุณภาพก่อนพิมพ์</span>
              <button onClick={runQualityCheck} disabled={checking}
                className="rounded-full bg-muted px-3 py-1.5 text-xs font-bold text-foreground hover:bg-secondary disabled:opacity-50">
                {checking ? "กำลังตรวจ…" : "ตรวจสอบ"}
              </button>
            </div>
            {issues !== null && (
              issues.length === 0 ? (
                <p className="mt-2 text-xs font-medium text-mint-foreground">✓ ไม่พบปัญหา พร้อมสร้างไฟล์พิมพ์</p>
              ) : (
                <ul className="mt-2 space-y-1">
                  {issues.map((iss, k) => (
                    <li key={k} className={`flex items-center gap-1.5 text-xs ${iss.level === "error" ? "text-destructive" : "text-foreground"}`}>
                      {iss.level === "error" ? <AlertTriangle className="size-3.5" /> : <span>⚠️</span>} {iss.message}
                    </li>
                  ))}
                </ul>
              )
            )}
          </div>

          {/* Generate */}
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <button onClick={() => generate("interior")} disabled={pdfBusy !== null}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition-transform hover:-translate-y-0.5 disabled:opacity-50">
              <FileText className="size-4" /> {pdfBusy === "interior" ? "กำลังสร้าง…" : "สร้าง Interior PDF"}
            </button>
            <button onClick={() => generate("cover")} disabled={pdfBusy !== null}
              className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-border px-4 py-2.5 text-sm font-bold text-foreground transition-transform hover:-translate-y-0.5 disabled:opacity-50">
              <FileText className="size-4" /> {pdfBusy === "cover" ? "กำลังสร้าง…" : "สร้าง Cover PDF"}
            </button>
          </div>
          {pdfError && <p className="mt-2 text-xs font-medium text-destructive">{pdfError}</p>}

          {/* Version history */}
          {history.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-xs font-bold text-muted-foreground">ประวัติไฟล์ (รวม {history.length} เวอร์ชัน)</p>
              <ul className="space-y-1.5">
                {history.map((h) => (
                  <li key={`${h.type}-${h.version}`} className="flex items-center justify-between rounded-xl bg-muted/40 px-3 py-2 text-xs">
                    <span className="font-semibold text-foreground">
                      {h.type === "cover" ? "Cover" : "Interior"} · v{h.version}
                    </span>
                    <span className="text-muted-foreground">
                      {new Date(h.createdAt).toLocaleString("th-TH", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })} · {formatBytes(h.size)}
                    </span>
                    <button onClick={() => downloadVersion(h.type, h.version)} className="inline-flex items-center gap-1 rounded-full bg-card px-2.5 py-1 font-bold text-foreground hover:bg-secondary">
                      <Download className="size-3.5" /> โหลด
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <p className="mt-3 text-xs text-muted-foreground">300 DPI · เผื่อตัดตก 3 มม. · ฝังรูปภาพ • ข้อความไทยบนปกต้องฝังฟอนต์ไทย (กำลังพัฒนา)</p>
        </Card>

        {/* Internal notes */}
        <Card title="บันทึกภายใน" full>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="เช่น ลูกค้าขอปรับสีรูปหน้า 3…"
            rows={4}
            className="w-full rounded-2xl border-2 border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/40"
          />
        </Card>
      </main>
    </div>
  );
}

function Card({ title, children, full }: { title: string; children: React.ReactNode; full?: boolean }) {
  return (
    <section className={`rounded-3xl border-2 border-border bg-card p-5 shadow-sm ${full ? "lg:col-span-2" : ""}`}>
      <h2 className="mb-3 font-heading text-base font-bold text-foreground">{title}</h2>
      {children}
    </section>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd className={`text-right ${bold ? "font-heading text-lg font-extrabold text-primary" : "font-semibold text-foreground"}`}>{value}</dd>
    </div>
  );
}

function Center({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-screen flex-col items-center justify-center gap-2 bg-gradient-to-b from-muted to-background text-center text-muted-foreground">{children}</div>;
}
