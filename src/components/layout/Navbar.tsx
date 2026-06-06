"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { brand, nav } from "@/lib/content";

export default function Navbar() {
  const [open,     setOpen]     = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  // Close menu on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  // The homepage ships its own marketing header; editor & admin are full-screen.
  const hideOn = pathname === "/" || pathname.startsWith("/editor") || pathname.startsWith("/admin");

  // Shrink shadow when user scrolls
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 4);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const links = [
    { href: "/#how-it-works", label: nav.howItWorks },
    { href: "/pricing",        label: nav.pricing    },
    { href: "/#faq",           label: nav.faq        },
    { href: "/#contact",       label: nav.contact    },
  ];

  if (hideOn) return null;

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-amber-100 transition-shadow ${scrolled ? "shadow-md" : ""}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="text-2xl font-bold text-amber-800 tracking-tight">
              {brand.name}
            </span>
            <span className="hidden sm:inline-block text-xs text-amber-500 font-medium mt-1">
              · หนังสือภาพ
            </span>
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-8">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm text-stone-600 hover:text-amber-700 transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* CTA — always visible */}
            <Link
              href="/editor"
              className="bg-amber-700 hover:bg-amber-800 text-white text-sm font-medium px-5 py-2 rounded-full transition-colors shadow-sm"
            >
              {nav.startCreating}
            </Link>

            {/* Hamburger — mobile only */}
            <button
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "ปิดเมนู" : "เปิดเมนู"}
              className="md:hidden flex flex-col gap-1.5 p-2 rounded-lg hover:bg-amber-50 transition-colors"
            >
              <span className={`block h-0.5 w-5 bg-stone-700 rounded transition-all origin-center ${open ? "rotate-45 translate-y-2" : ""}`} />
              <span className={`block h-0.5 w-5 bg-stone-700 rounded transition-all ${open ? "opacity-0 scale-x-0" : ""}`} />
              <span className={`block h-0.5 w-5 bg-stone-700 rounded transition-all origin-center ${open ? "-rotate-45 -translate-y-2" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu drawer */}
      <div className={`md:hidden overflow-hidden transition-all duration-200 ${open ? "max-h-72 border-t border-amber-100" : "max-h-0"}`}>
        <nav className="px-4 py-4 space-y-1 bg-white">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="block px-4 py-3 text-stone-700 hover:bg-amber-50 hover:text-amber-700 rounded-xl font-medium transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
