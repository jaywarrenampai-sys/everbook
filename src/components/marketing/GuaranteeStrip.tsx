"use client";

import { motion } from "framer-motion";
import { useLanding } from "@/lib/i18n/landing";
import Container from "@/components/marketing/ui/Container";
import Icon from "@/components/marketing/ui/Icon";

export default function GuaranteeStrip() {
  const { guarantees } = useLanding();
  return (
    <div className="border-y border-espresso/10 bg-sand py-12">
      <Container>
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.12 } } }}
          className="grid gap-8 sm:grid-cols-3"
        >
          {guarantees.map((g) => (
            <motion.div
              key={g.title}
              variants={{
                hidden: { opacity: 0, scale: 0.85 },
                show: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 260, damping: 20 } },
              }}
              className="flex flex-col items-center gap-3 text-center sm:flex-row sm:text-left"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-cream text-terracotta shadow-sm">
                <Icon name={g.icon} size={24} />
              </div>
              <div>
                <div className="font-display text-base font-semibold text-ink">{g.title}</div>
                <div className="text-sm text-espresso/60">{g.body}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </div>
  );
}
