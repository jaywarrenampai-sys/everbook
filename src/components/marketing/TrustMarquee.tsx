"use client";
import { useLanding } from "@/lib/i18n/landing";

export default function TrustMarquee() {
  const { marquee } = useLanding();
  const items = [...marquee, ...marquee]; // duplicate for seamless loop
  return (
    <div className="border-y border-espresso/10 bg-sand py-4">
      <div className="no-scrollbar overflow-hidden">
        <div className="animate-marquee flex w-max items-center gap-10 whitespace-nowrap">
          {items.map((m, i) => (
            <span key={i} className="flex items-center gap-10 text-sm font-medium tracking-wide text-espresso/70">
              {m}
              <span className="text-terracotta">✦</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
