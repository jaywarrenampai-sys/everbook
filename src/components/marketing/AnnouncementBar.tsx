"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLanding } from "@/lib/i18n/landing";

export default function AnnouncementBar() {
  const { announcements } = useLanding();
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % announcements.length), 3500);
    return () => clearInterval(t);
  }, []);

  if (!open) return null;

  return (
    <div className="relative bg-espresso text-cream">
      <div className="mx-auto flex h-9 max-w-[1200px] items-center justify-center px-5 text-center">
        <AnimatePresence mode="wait">
          <motion.span
            key={index}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.4 }}
            className="text-[0.78rem] font-medium tracking-wide"
          >
            {announcements[index]}
          </motion.span>
        </AnimatePresence>
        <button
          onClick={() => setOpen(false)}
          aria-label="Dismiss"
          className="absolute right-4 text-cream/60 transition-colors hover:text-cream"
        >
          ×
        </button>
      </div>
    </div>
  );
}
