"use client";

import { motion } from "framer-motion";
import { useLanding } from "@/lib/i18n/landing";
import Section from "@/components/marketing/ui/Section";
import Reveal from "@/components/marketing/ui/Reveal";

const EASE = [0.22, 1, 0.36, 1] as const;

export default function HowItWorks() {
  const { howItWorks } = useLanding();
  return (
    <Section id="how" tone="sand">
      <Reveal className="mx-auto mb-16 max-w-2xl text-center">
        <p className="eyebrow mb-3 text-terracotta">{howItWorks.eyebrow}</p>
        <h2 className="font-display font-semibold tracking-tight text-ink" style={{ fontSize: "var(--text-h2)" }}>
          {howItWorks.heading}
        </h2>
      </Reveal>

      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.15 } } }}
        className="relative grid gap-10 md:grid-cols-3 md:gap-8"
      >
        {/* connecting line */}
        <div className="absolute left-[16.66%] right-[16.66%] top-9 hidden h-px bg-clay/40 md:block" />

        {howItWorks.steps.map((step) => (
          <motion.div
            key={step.n}
            variants={{
              hidden: { opacity: 0, y: 32 },
              show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
            }}
            className="relative flex flex-col items-center text-center"
          >
            <div className="mb-6 flex h-[72px] w-[72px] items-center justify-center rounded-full bg-cream font-display text-2xl font-semibold text-terracotta shadow-card ring-1 ring-espresso/5">
              {step.n}
            </div>
            <h3 className="mb-2 font-display text-xl font-semibold text-ink">{step.title}</h3>
            <p className="max-w-xs text-espresso/65 leading-relaxed">{step.body}</p>
          </motion.div>
        ))}
      </motion.div>
    </Section>
  );
}
