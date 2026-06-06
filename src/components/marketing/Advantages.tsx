"use client";

import { motion } from "framer-motion";
import { useLanding } from "@/lib/i18n/landing";
import Section from "@/components/marketing/ui/Section";
import Reveal from "@/components/marketing/ui/Reveal";
import Icon from "@/components/marketing/ui/Icon";

const EASE = [0.22, 1, 0.36, 1] as const;

export default function Advantages() {
  const { advantages } = useLanding();
  return (
    <Section id="advantages" tone="cream">
      <Reveal className="mx-auto mb-14 max-w-2xl text-center">
        <p className="eyebrow mb-3 text-terracotta">{advantages.eyebrow}</p>
        <h2 className="font-display font-semibold tracking-tight text-ink" style={{ fontSize: "var(--text-h2)" }}>
          {advantages.heading}
        </h2>
      </Reveal>

      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.12 } } }}
        className="grid gap-6 md:grid-cols-3 md:gap-8"
      >
        {advantages.items.map((item) => (
          <motion.div
            key={item.title}
            variants={{
              hidden: { opacity: 0, y: 32 },
              show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
            }}
            whileHover={{ y: -6 }}
            className="group rounded-[1rem] bg-mist p-8 shadow-card ring-1 ring-espresso/5 transition-shadow duration-300 hover:shadow-lift"
          >
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-sand text-terracotta transition-colors duration-300 group-hover:bg-terracotta group-hover:text-cream">
              <Icon name={item.icon} size={26} />
            </div>
            <h3 className="mb-2 font-display text-xl font-semibold text-ink">{item.title}</h3>
            <p className="text-espresso/65 leading-relaxed">{item.body}</p>
          </motion.div>
        ))}
      </motion.div>
    </Section>
  );
}
