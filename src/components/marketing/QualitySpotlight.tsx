"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useLanding } from "@/lib/i18n/landing";
import Container from "@/components/marketing/ui/Container";
import Reveal from "@/components/marketing/ui/Reveal";

export default function QualitySpotlight() {
  const { spotlight } = useLanding();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], [-60, 60]);

  return (
    <section ref={ref} className="relative overflow-hidden bg-espresso text-cream">
      {/* parallax gradient field */}
      <motion.div
        style={{ y: bgY }}
        className="pointer-events-none absolute inset-0 scale-125"
      >
        <div className="absolute left-1/4 top-0 h-[28rem] w-[28rem] rounded-full bg-terracotta/30 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 h-[24rem] w-[24rem] rounded-full bg-clay/30 blur-[120px]" />
      </motion.div>

      <Container className="relative grid items-center gap-12 py-24 md:py-32 lg:grid-cols-2">
        <Reveal>
          <p className="eyebrow mb-4 text-clay">{spotlight.eyebrow}</p>
          <h2 className="font-display font-semibold leading-[1.08] tracking-tight" style={{ fontSize: "var(--text-h2)" }}>
            {spotlight.heading}
          </h2>
          <p className="mt-6 max-w-lg text-cream/70" style={{ fontSize: "var(--text-lead)", lineHeight: 1.55 }}>
            {spotlight.body}
          </p>
        </Reveal>

        <Reveal delay={0.15} className="grid grid-cols-2 gap-5">
          {[spotlight.stat1, spotlight.stat2].map((s) => (
            <div key={s.label} className="rounded-[1rem] bg-cream/[0.06] p-7 ring-1 ring-cream/10 backdrop-blur-sm">
              <div className="font-display text-5xl font-semibold text-cream">{s.value}</div>
              <div className="mt-2 text-sm leading-relaxed text-cream/60">{s.label}</div>
            </div>
          ))}
        </Reveal>
      </Container>
    </section>
  );
}
