"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLanding } from "@/lib/i18n/landing";
import { useLocale } from "@/lib/i18n/locale";
import Container from "@/components/marketing/ui/Container";
import Button from "@/components/marketing/ui/Button";
import Icon from "@/components/marketing/ui/Icon";
import { cn } from "@/lib/cn";

function LangToggle() {
  const locale = useLocale((s) => s.locale);
  const setLocale = useLocale((s) => s.setLocale);
  return (
    <div className="flex items-center rounded-full border border-espresso/15 p-0.5 text-xs font-semibold">
      <button
        onClick={() => setLocale("th")}
        className={`rounded-full px-2.5 py-1 transition-colors ${locale === "th" ? "bg-espresso text-cream" : "text-espresso/60 hover:text-espresso"}`}
        aria-pressed={locale === "th"}
      >
        TH
      </button>
      <button
        onClick={() => setLocale("en")}
        className={`rounded-full px-2.5 py-1 transition-colors ${locale === "en" ? "bg-espresso text-cream" : "text-espresso/60 hover:text-espresso"}`}
        aria-pressed={locale === "en"}
      >
        EN
      </button>
    </div>
  );
}

export default function SiteHeader() {
  const { brand, nav } = useLanding();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled ? "bg-cream/85 backdrop-blur-md shadow-[0_1px_0_rgba(46,38,32,0.07)]" : "bg-transparent"
      )}
    >
      <Container className="flex h-16 items-center justify-between md:h-[72px]">
        {/* Logo */}
        <a href="#top" className="font-display text-2xl font-semibold tracking-tight text-ink">
          {brand.name}
          <span className="text-terracotta">.</span>
        </a>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 md:flex">
          {nav.links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-espresso/70 transition-colors hover:text-espresso"
            >
              {l.label}
            </a>
          ))}
        </nav>

        {/* Right */}
        <div className="flex items-center gap-2">
          <LangToggle />
          <Button href="/editor" size="sm" className="hidden sm:inline-flex">
            <Icon name="cart" size={16} />
            {nav.cta}
          </Button>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
            className="flex h-10 w-10 items-center justify-center rounded-full text-espresso transition-colors hover:bg-espresso/5 md:hidden"
          >
            <Icon name={open ? "close" : "menu"} size={22} />
          </button>
        </div>
      </Container>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t border-espresso/10 bg-cream md:hidden"
          >
            <div className="flex flex-col gap-1 px-5 py-4">
              {nav.links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-4 py-3 font-medium text-espresso transition-colors hover:bg-espresso/5"
                >
                  {l.label}
                </a>
              ))}
              <Button href="/editor" fullWidth className="mt-2" onClick={() => setOpen(false)}>
                {nav.cta}
              </Button>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
