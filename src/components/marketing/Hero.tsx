"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { useLanding } from "@/lib/i18n/landing";
import Container from "@/components/marketing/ui/Container";
import Button from "@/components/marketing/ui/Button";
import BookVisual from "@/components/marketing/ui/BookVisual";
import Icon from "@/components/marketing/ui/Icon";

const EASE = [0.22, 1, 0.36, 1] as const;

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

export default function Hero() {
  const { hero } = useLanding();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const visualY = useTransform(scrollYProgress, [0, 1], [0, -50]);

  return (
    <section id="top" ref={ref} className="relative overflow-hidden bg-cream">
      {/* ambient blooms */}
      <div className="pointer-events-none absolute -right-24 top-10 h-96 w-96 rounded-full bg-clay/20 blur-[100px]" />
      <div className="pointer-events-none absolute -left-20 bottom-0 h-80 w-80 rounded-full bg-rosetag/40 blur-[100px]" />

      <Container className="relative grid items-center gap-12 py-16 md:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:gap-8 lg:py-24">
        {/* Copy */}
        <motion.div variants={container} initial="hidden" animate="show" className="text-center lg:text-left">
          <motion.p variants={item} className="eyebrow mb-5 text-terracotta">
            {hero.eyebrow}
          </motion.p>

          <motion.h1
            variants={item}
            className="font-display font-semibold leading-[1.04] tracking-tight text-ink"
            style={{ fontSize: "var(--text-display)" }}
          >
            {hero.heading.split("\n").map((line, i) => (
              <span key={i} className="block">
                {line}
              </span>
            ))}
          </motion.h1>

          <motion.p
            variants={item}
            className="mx-auto mt-6 max-w-xl text-espresso/70 lg:mx-0"
            style={{ fontSize: "var(--text-lead)", lineHeight: 1.55 }}
          >
            {hero.sub}
          </motion.p>

          <motion.div variants={item} className="mt-9 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
            <Button href="/editor" size="lg" className="w-full sm:w-auto">
              {hero.ctaPrimary}
              <Icon name="arrow" size={18} />
            </Button>
            <Button href="#reviews" size="lg" variant="outline" className="w-full sm:w-auto">
              {hero.ctaSecondary}
            </Button>
          </motion.div>

          <motion.div variants={item} className="mt-7 flex items-center justify-center gap-2 lg:justify-start">
            <div className="flex text-terracotta">
              {Array.from({ length: 5 }).map((_, i) => (
                <Icon key={i} name="star" size={16} className="fill-terracotta" />
              ))}
            </div>
            <span className="text-sm text-espresso/60">{hero.rating}</span>
          </motion.div>
        </motion.div>

        {/* Visual */}
        <motion.div
          style={{ y: visualY }}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.15 }}
          className="relative mx-auto w-full max-w-md"
        >
          <BookVisual
            accent="#F3D7CB"
            label="Our Story"
            note="hardcover · 24 pages"
            className="aspect-[4/5] rounded-[1.5rem] shadow-[0_24px_60px_-20px_rgba(46,38,32,0.4)]"
          />
          {/* floating rating chip */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="absolute -bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-mist px-5 py-3 shadow-card ring-1 ring-espresso/5"
          >
            <span className="font-display text-xl font-semibold text-ink">4.9</span>
            <span className="text-xs leading-tight text-espresso/60">
              ★★★★★<br />12,000+ reviews
            </span>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
}
