"use client";

import { motion } from "framer-motion";
import { useLanding } from "@/lib/i18n/landing";
import Section from "@/components/marketing/ui/Section";
import Reveal from "@/components/marketing/ui/Reveal";
import Icon from "@/components/marketing/ui/Icon";

const EASE = [0.22, 1, 0.36, 1] as const;

export default function Testimonials() {
  const { testimonials } = useLanding();
  return (
    <Section id="reviews" tone="mist">
      <Reveal className="mx-auto mb-14 max-w-2xl text-center">
        <p className="eyebrow mb-3 text-terracotta">{testimonials.eyebrow}</p>
        <h2 className="font-display font-semibold tracking-tight text-ink" style={{ fontSize: "var(--text-h2)" }}>
          {testimonials.heading}
        </h2>
      </Reveal>

      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.12 } } }}
        className="grid gap-6 md:grid-cols-3 md:gap-8"
      >
        {testimonials.items.map((t) => (
          <motion.figure
            key={t.name}
            variants={{
              hidden: { opacity: 0, y: 32 },
              show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
            }}
            className="flex flex-col rounded-[1rem] bg-cream p-7 shadow-card ring-1 ring-espresso/5"
          >
            <div className="mb-4 flex text-terracotta">
              {Array.from({ length: 5 }).map((_, i) => (
                <Icon key={i} name="star" size={16} />
              ))}
            </div>
            <figcaption className="mb-2 font-display text-lg font-semibold text-ink">
              “{t.title}”
            </figcaption>
            <blockquote className="flex-1 text-espresso/65 leading-relaxed">{t.body}</blockquote>
            <div className="mt-6 flex items-center gap-3 border-t border-espresso/10 pt-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sand font-display text-sm font-semibold text-terracotta">
                {t.name.charAt(0)}
              </div>
              <div>
                <div className="text-sm font-semibold text-ink">{t.name}</div>
                <div className="text-xs text-leaf">✓ {t.meta}</div>
              </div>
            </div>
          </motion.figure>
        ))}
      </motion.div>
    </Section>
  );
}
