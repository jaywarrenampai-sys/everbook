"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, BookOpen, Check } from "lucide-react";
import { ProductConfig } from "@/lib/editor/types";
import {
  SIZES, COVERS, PAPERS, QUANTITIES,
  DEFAULT_CONFIG, normalizeConfig, priceBreakdown, formatTHB,
} from "@/lib/pricing";
import { getProjectLayout, updateProjectConfig } from "@/lib/projects/localProjects";

export default function ConfigurePage() {
  const router = useRouter();
  const [projectId, setProjectId] = useState<string | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [config, setConfig] = useState<ProductConfig>(DEFAULT_CONFIG);
  const [loaded, setLoaded] = useState(false);

  // Load project (config + page count). Falls back to ?pages= and defaults.
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
          setConfig(normalizeConfig(proj.layout.productConfig));
          setLoaded(true);
          return;
        }
      }
      setPageCount(pagesParam);
      setLoaded(true);
    })();
  }, []);

  // Persist config to the project whenever it changes.
  function update(patch: Partial<ProductConfig>) {
    setConfig((prev) => {
      const next = { ...prev, ...patch };
      if (projectId) updateProjectConfig(projectId, next).catch(() => {});
      return next;
    });
  }

  const price = useMemo(() => priceBreakdown(config, pageCount), [config, pageCount]);

  function continueToCheckout() {
    const params = new URLSearchParams({ ...(projectId ? { projectId } : {}), pages: String(pageCount) });
    router.push(`/checkout?${params.toString()}`);
  }

  const sizeLabel = SIZES.find((s) => s.id === config.size)?.label ?? "";
  const coverLabel = COVERS.find((s) => s.id === config.cover)?.label ?? "";
  const paperLabel = PAPERS.find((s) => s.id === config.paper)?.label ?? "";

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted to-background">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-5 py-4">
          <button
            onClick={() => router.push(projectId ? `/editor?projectId=${projectId}` : "/editor")}
            className="inline-flex size-10 items-center justify-center rounded-full bg-muted text-foreground transition-transform hover:-translate-y-0.5"
            aria-label="กลับไปแก้ไข"
          >
            <ArrowLeft className="size-5" />
          </button>
          <span className="inline-flex size-9 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <BookOpen className="size-5" />
          </span>
          <h1 className="font-heading text-xl font-extrabold text-foreground">ตั้งค่าหนังสือ</h1>
        </div>
      </header>

      <main className="mx-auto grid max-w-5xl gap-6 px-5 py-8 lg:grid-cols-[1fr_340px]">
        {/* Options */}
        <div className="space-y-7">
          <Section title="ขนาดหนังสือ">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {SIZES.map((s) => (
                <OptionCard key={s.id} active={config.size === s.id} title={s.label} sub={s.sub} onClick={() => update({ size: s.id })} />
              ))}
            </div>
          </Section>

          <Section title="ชนิดปก">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {COVERS.map((c) => (
                <OptionCard key={c.id} active={config.cover === c.id} title={c.label} sub={`${c.sub} · +${formatTHB(c.price)}`} onClick={() => update({ cover: c.id })} />
              ))}
            </div>
          </Section>

          <Section title="ชนิดกระดาษ">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {PAPERS.map((p) => (
                <OptionCard key={p.id} active={config.paper === p.id} title={p.label} sub={`${p.sub} · ${formatTHB(p.perPage)}/หน้า`} onClick={() => update({ paper: p.id })} />
              ))}
            </div>
          </Section>

          <Section title="จำนวน">
            <div className="flex flex-wrap gap-2">
              {QUANTITIES.map((q) => (
                <button
                  key={q}
                  onClick={() => update({ quantity: q })}
                  className={`inline-flex size-12 items-center justify-center rounded-2xl border-2 text-sm font-bold transition-transform hover:-translate-y-0.5 ${
                    config.quantity === q ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground"
                  }`}
                >
                  {q}
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
              <div className="my-1 h-px bg-border" />
              <Row label="ราคาต่อเล่ม" value={formatTHB(price.unit)} />
              <div className="flex items-center justify-between pt-1">
                <span className="font-semibold text-foreground">ราคารวม</span>
                <span className="font-heading text-2xl font-extrabold text-primary">{formatTHB(price.total)}</span>
              </div>
            </dl>

            <button
              onClick={continueToCheckout}
              disabled={!loaded || pageCount === 0}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-base font-bold text-primary-foreground shadow-sm transition-transform hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
            >
              ดำเนินการต่อ
            </button>
            <p className="mt-3 text-center text-xs text-muted-foreground">จัดส่งฟรีทั่วประเทศ · ผลิตภายใน 5-7 วันทำการ</p>
          </div>
        </aside>
      </main>
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

function OptionCard({ active, title, sub, onClick }: { active: boolean; title: string; sub: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`relative flex flex-col items-start gap-0.5 rounded-2xl border-2 p-3 text-left transition-transform hover:-translate-y-0.5 ${
        active ? "border-primary bg-primary/5" : "border-border bg-card"
      }`}
    >
      {active && (
        <span className="absolute right-2 top-2 inline-flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Check className="size-3.5" />
        </span>
      )}
      <span className="font-heading text-sm font-bold text-foreground">{title}</span>
      <span className="text-xs text-muted-foreground">{sub}</span>
    </button>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-semibold text-foreground">{value}</dd>
    </div>
  );
}
