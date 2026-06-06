"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { brand, footer } from "@/lib/content";

export default function Footer() {
  const pathname = usePathname();
  // Homepage ships its own marketing footer; editor & admin are full-screen.
  if (pathname === "/" || pathname.startsWith("/editor") || pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <footer className="bg-amber-950 text-amber-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="col-span-1">
            <h3 className="text-xl font-bold text-white mb-2">{brand.name}</h3>
            <p className="text-sm text-amber-300 mb-4">{brand.tagline}</p>
            <p className="text-xs text-amber-400 leading-relaxed">
              {footer.tagline}
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold text-amber-200 uppercase tracking-wider mb-4">
              เมนู
            </h4>
            <ul className="space-y-2">
              {footer.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-amber-300 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold text-amber-200 uppercase tracking-wider mb-4">
              ติดต่อเรา
            </h4>
            <ul className="space-y-2 text-sm text-amber-300">
              <li>
                อีเมล:{" "}
                <a
                  href={`mailto:${footer.contact.email}`}
                  className="hover:text-white transition-colors"
                >
                  {footer.contact.email}
                </a>
              </li>
              <li>LINE: {footer.contact.line}</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-amber-900 text-center text-xs text-amber-500">
          {footer.copyright}
        </div>
      </div>
    </footer>
  );
}
