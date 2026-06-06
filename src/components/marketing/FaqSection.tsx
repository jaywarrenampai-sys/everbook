"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLanding } from "@/lib/i18n/landing";
import Section from "@/components/marketing/ui/Section";
import Reveal from "@/components/marketing/ui/Reveal";
import Icon from "@/components/marketing/ui/Icon";
import { cn } from "@/lib/cn";

function AccordionItem({
  q,
  a,
  open,
  onToggle,
}: {
  q: string;
  a: string;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-espresso/10">
      <button
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 py-5 text-left"
      >
        <span className={cn("font-display text-lg font-medium transition-colors", open ? "text-terracotta" : "text-ink")}>
          {q}
        </span>
        <Icon
          name="chevron"
          size={20}
          className={cn("shrink-0 text-espresso/50 transition-transform duration-300", open && "rotate-180")}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className="pb-5 pr-8 text-espresso/65 leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FaqSection() {
  const { faq } = useLanding();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <Section id="faq" tone="cream">
      <div className="mx-auto max-w-3xl">
        <Reveal className="mb-12 text-center">
          <p className="eyebrow mb-3 text-terracotta">{faq.eyebrow}</p>
          <h2 className="font-display font-semibold tracking-tight text-ink" style={{ fontSize: "var(--text-h2)" }}>
            {faq.heading}
          </h2>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="rounded-[1rem] bg-mist px-6 shadow-card ring-1 ring-espresso/5 md:px-8">
            {faq.items.map((item, i) => (
              <AccordionItem
                key={item.q}
                q={item.q}
                a={item.a}
                open={openIndex === i}
                onToggle={() => setOpenIndex(openIndex === i ? null : i)}
              />
            ))}
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
