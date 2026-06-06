"use client";

import { motion } from "framer-motion";
import { useLanding } from "@/lib/i18n/landing";
import Section from "@/components/marketing/ui/Section";
import Reveal from "@/components/marketing/ui/Reveal";
import Button from "@/components/marketing/ui/Button";
import Pill from "@/components/marketing/ui/Pill";
import BookVisual from "@/components/marketing/ui/BookVisual";
import { cn } from "@/lib/cn";

const EASE = [0.22, 1, 0.36, 1] as const;

export default function ProductShowcase() {
  const { product, formatPrice } = useLanding();
  return (
    <Section id="product" tone="cream">
      <Reveal className="mx-auto mb-14 max-w-2xl text-center">
        <Pill className="mb-4">{product.eyebrow}</Pill>
        <h2 className="font-display font-semibold tracking-tight text-ink" style={{ fontSize: "var(--text-h2)" }}>
          {product.heading}
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-espresso/65" style={{ fontSize: "var(--text-lead)" }}>
          {product.sub}
        </p>
      </Reveal>

      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
        className="grid gap-6 md:grid-cols-3 md:gap-8"
      >
        {product.options.map((opt) => (
          <motion.div
            key={opt.id}
            variants={{
              hidden: { opacity: 0, y: 32 },
              show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
            }}
            whileHover={{ y: -8 }}
            className={cn(
              "group relative flex flex-col overflow-hidden rounded-[1.25rem] bg-mist ring-1 transition-shadow duration-300 hover:shadow-lift",
              opt.featured ? "ring-2 ring-terracotta shadow-card" : "ring-espresso/5 shadow-card"
            )}
          >
            {opt.featured && (
              <div className="absolute left-1/2 top-4 z-10 -translate-x-1/2">
                <Pill tone="dark">Bestseller</Pill>
              </div>
            )}

            <div className="relative overflow-hidden">
              <BookVisual
                accent={opt.accent}
                label={opt.name}
                note={opt.note}
                className="aspect-[3/4] transition-transform duration-500 group-hover:scale-[1.04]"
              />
              <div className="absolute right-3 top-3">
                <Pill>{opt.save}</Pill>
              </div>
            </div>

            <div className="flex flex-1 flex-col p-6 text-center">
              <h3 className="font-display text-xl font-semibold text-ink">{opt.name}</h3>
              <p className="mt-1 text-sm capitalize text-espresso/55">{opt.note}</p>

              <div className="mt-3 flex items-center justify-center gap-2">
                <span className="font-display text-2xl font-semibold text-ink">{formatPrice(opt.price)}</span>
                <span className="text-sm text-espresso/40 line-through">{formatPrice(opt.compareAt)}</span>
              </div>

              <Button href="/editor" className="mt-5" fullWidth>
                {product.cta}
              </Button>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <Reveal delay={0.1} className="mt-8 text-center">
        <span className="text-sm text-espresso/50">
          ✦ Discounts apply automatically at checkout · Free shipping over $40
        </span>
      </Reveal>
    </Section>
  );
}
