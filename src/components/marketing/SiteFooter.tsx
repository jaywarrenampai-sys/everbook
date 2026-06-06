"use client";
import { useLanding } from "@/lib/i18n/landing";
import Container from "@/components/marketing/ui/Container";

export default function SiteFooter() {
  const { brand, footer } = useLanding();
  return (
    <footer className="bg-espresso text-cream">
      <Container className="py-16">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          {/* Brand */}
          <div>
            <div className="font-display text-2xl font-semibold">
              {brand.name}
              <span className="text-terracotta">.</span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-cream/60">{footer.blurb}</p>
            <a href={`mailto:${brand.email}`} className="mt-5 inline-block text-sm text-cream/80 underline-offset-4 hover:underline">
              {brand.email}
            </a>
          </div>

          {/* Link columns */}
          {footer.columns.map((col) => (
            <div key={col.title}>
              <h4 className="eyebrow mb-4 text-cream/50">{col.title}</h4>
              <ul className="space-y-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <a href={l.href} className="text-sm text-cream/75 transition-colors hover:text-cream">
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom row */}
        <div className="mt-14 flex flex-col items-center justify-between gap-6 border-t border-cream/15 pt-8 md:flex-row">
          <div className="flex items-center gap-5">
            {footer.socials.map((s) => (
              <a key={s} href="#" className="text-sm text-cream/60 transition-colors hover:text-cream">
                {s}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2 text-cream/50">
            {["VISA", "MC", "AMEX", "PayPal"].map((p) => (
              <span key={p} className="rounded bg-cream/10 px-2 py-1 text-[10px] font-semibold tracking-wide">
                {p}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-3 text-xs text-cream/40 md:flex-row">
          <span>© {new Date().getFullYear()} {brand.name}. All rights reserved.</span>
          <div className="flex gap-5">
            {footer.legal.map((l) => (
              <a key={l} href="#" className="transition-colors hover:text-cream/70">
                {l}
              </a>
            ))}
          </div>
        </div>
      </Container>
    </footer>
  );
}
