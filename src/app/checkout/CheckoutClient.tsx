"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, BookOpen, Check } from "lucide-react";
import { CheckoutInfo } from "@/lib/editor/types";
import {
  SIZES, COVERS, PAPERS, SHIPPING,
  normalizeConfig, priceBreakdown, shippingPrice, formatTHB, DEFAULT_CONFIG,
} from "@/lib/pricing";
import { getProjectLayout, updateCheckout } from "@/lib/projects/localProjects";
import { createOrder } from "@/lib/orders";

const EMPTY: CheckoutInfo = {
  firstName: "", lastName: "", email: "", phone: "",
  address: "", district: "", province: "", postalCode: "",
  country: "ประเทศไทย", delivery: "standard",
};

const REQUIRED: (keyof CheckoutInfo)[] = [
  "firstName", "lastName", "email", "phone", "address", "province", "postalCode",
];

export default function CheckoutClient() {
  const router = useRouter();
  const [projectId, setProjectId] = useState<string | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [bookName, setBookName] = useState("หนังสือของฉัน");
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [form, setForm] = useState<CheckoutInfo>(EMPTY);
  const [touched, setTouched] = useState(false);
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    (async () => {
      const params = new URLSearchParams(window.location.search);
      const pid = params.get("projectId");
      const pagesParam = parseInt(params.get("pages") ?? "0", 10) || 0;
      setProjectId(pid);
      if (pid) {
        const proj = await getProjectLayout(pid).catch(() => null);
        if (proj) {
          setPageCount(proj.layout.pages.length);
          setBookName(proj.name);
          setConfig(normalizeConfig(proj.layout.productConfig));
          if (proj.layout.checkout) setForm({ ...EMPTY, ...proj.layout.checkout });
          return;
        }
      }
      setPageCount(pagesParam);
    })();
  }, []);

  // Persist checkout details (debounced) whenever they change.
  useEffect(() => {
    if (!projectId) return;
    const t = setTimeout(() => updateCheckout(projectId, form).catch(() => {}), 600);
    return () => clearTimeout(t);
  }, [projectId, form]);

  const set = (k: keyof CheckoutInfo, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const product = useMemo(() => priceBreakdown(config, pageCount), [config, pageCount]);
  const ship = shippingPrice(form.delivery);
  const grandTotal = product.total + ship;

  const missing = REQUIRED.filter((k) => !form[k].trim());
  const valid = missing.length === 0;

  async function submit() {
    setTouched(true);
    if (!valid || placing) return;
    setPlacing(true);
    try {
      if (projectId) await updateCheckout(projectId, form).catch(() => {});
      const order = await createOrder({
        projectId,
        bookName,
        config,
        pageCount,
        customer: form,
        amount: grandTotal,
        paymentMethod: "promptpay",
      });
      router.push(`/order/${order.orderNumber}`);
    } catch {
      setPlacing(false);
    }
  }

  const sizeLabel = SIZES.find((s) => s.id === config.size)?.label ?? "";
  const coverLabel = COVERS.find((s) => s.id === config.cover)?.label ?? "";
  const paperLabel = PAPERS.find((s) => s.id === config.paper)?.label ?? "";

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted to-background">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-5 py-4">
          <button
            onClick={() => router.push(projectId ? `/configure?projectId=${projectId}&pages=${pageCount}` : "/configure")}
            className="inline-flex size-10 items-center justify-center rounded-full bg-muted text-foreground transition-transform hover:-translate-y-0.5"
            aria-label="ย้อนกลับ"
          >
            <ArrowLeft className="size-5" />
          </button>
          <span className="inline-flex size-9 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <BookOpen className="size-5" />
          </span>
          <h1 className="font-heading text-xl font-extrabold text-foreground">ชำระเงินและจัดส่ง</h1>
        </div>
      </header>

      {(
        <main className="mx-auto grid max-w-5xl gap-6 px-5 py-8 lg:grid-cols-[1fr_340px]">
          <div className="space-y-7">
            {/* Customer details */}
            <Section title="ข้อมูลผู้สั่งซื้อ">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="ชื่อ" required value={form.firstName} onChange={(v) => set("firstName", v)} show={touched} />
                <Field label="นามสกุล" required value={form.lastName} onChange={(v) => set("lastName", v)} show={touched} />
                <Field label="อีเมล" required type="email" value={form.email} onChange={(v) => set("email", v)} show={touched} />
                <Field label="เบอร์โทรศัพท์" required type="tel" value={form.phone} onChange={(v) => set("phone", v)} show={touched} />
              </div>
            </Section>

            {/* Shipping address */}
            <Section title="ที่อยู่จัดส่ง">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Field label="ที่อยู่" required value={form.address} onChange={(v) => set("address", v)} show={touched} />
                </div>
                <Field label="เขต/อำเภอ" value={form.district} onChange={(v) => set("district", v)} show={touched} />
                <Field label="จังหวัด" required value={form.province} onChange={(v) => set("province", v)} show={touched} />
                <Field label="รหัสไปรษณีย์" required type="tel" value={form.postalCode} onChange={(v) => set("postalCode", v)} show={touched} />
                <Field label="ประเทศ" value={form.country} onChange={(v) => set("country", v)} show={touched} />
              </div>
            </Section>

            {/* Delivery */}
            <Section title="วิธีจัดส่ง">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {SHIPPING.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => set("delivery", s.id)}
                    className={`relative flex flex-col items-start gap-0.5 rounded-2xl border-2 p-3 text-left transition-transform hover:-translate-y-0.5 ${
                      form.delivery === s.id ? "border-primary bg-primary/5" : "border-border bg-card"
                    }`}
                  >
                    {form.delivery === s.id && (
                      <span className="absolute right-2 top-2 inline-flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Check className="size-3.5" />
                      </span>
                    )}
                    <span className="font-heading text-sm font-bold text-foreground">{s.label}</span>
                    <span className="text-xs text-muted-foreground">{s.sub} · {formatTHB(s.price)}</span>
                  </button>
                ))}
              </div>
            </Section>
          </div>

          {/* Order summary */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-3xl border-2 border-border bg-card p-5 shadow-sm">
              <h2 className="mb-4 font-heading text-lg font-extrabold text-foreground">สรุปคำสั่งซื้อ</h2>
              <dl className="space-y-2.5 text-sm">
                <Row label="ขนาด" value={sizeLabel} />
                <Row label="ปก" value={coverLabel} />
                <Row label="กระดาษ" value={paperLabel} />
                <Row label="จำนวนหน้า" value={`${pageCount} หน้า`} />
                <Row label="จำนวนเล่ม" value={`${config.quantity} เล่ม`} />
                <Row label="ค่าหนังสือ" value={formatTHB(product.total)} />
                <Row label="ค่าจัดส่ง" value={formatTHB(ship)} />
                <div className="my-1 h-px bg-border" />
                <div className="flex items-center justify-between pt-1">
                  <span className="font-semibold text-foreground">ยอดรวมทั้งหมด</span>
                  <span className="font-heading text-2xl font-extrabold text-primary">{formatTHB(grandTotal)}</span>
                </div>
              </dl>

              {touched && !valid && (
                <p className="mt-3 rounded-xl bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">
                  กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน
                </p>
              )}

              <button
                onClick={submit}
                disabled={placing}
                className="mt-5 w-full rounded-full bg-primary px-6 py-3 text-base font-bold text-primary-foreground shadow-sm transition-transform hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {placing ? "กำลังสร้างคำสั่งซื้อ…" : "สั่งซื้อและชำระเงิน"}
              </button>
              <p className="mt-3 text-center text-xs text-muted-foreground">ขั้นตอนถัดไป: ชำระเงินผ่าน PromptPay</p>
            </div>
          </aside>
        </main>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 font-heading text-base font-bold text-foreground">{title}</h2>
      {children}
    </section>
  );
}

function Field({
  label, value, onChange, required, type = "text", show,
}: {
  label: string; value: string; onChange: (v: string) => void;
  required?: boolean; type?: string; show?: boolean;
}) {
  const invalid = show && required && !value.trim();
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-muted-foreground">
        {label} {required && <span className="text-destructive">*</span>}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-2xl border-2 bg-secondary/20 px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/40 ${
          invalid ? "border-destructive" : "border-border"
        }`}
      />
    </label>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={bold ? "font-heading text-lg font-extrabold text-primary" : "font-semibold text-foreground"}>{value}</dd>
    </div>
  );
}
