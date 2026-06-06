"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/cn";

interface Props {
  children: React.ReactNode;
  className?: string;
  /** stagger delay in seconds */
  delay?: number;
  /** travel distance on the y-axis */
  y?: number;
  as?: "div" | "li" | "span";
}

/**
 * Scroll-triggered fade-up reveal. Fires once when ~15% in view.
 * Used to wrap any section block for the site-wide reveal pattern.
 */
export default function Reveal({ children, className, delay = 0, y = 32, as = "div" }: Props) {
  const MotionTag = motion[as];
  return (
    <MotionTag
      className={cn(className)}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </MotionTag>
  );
}
