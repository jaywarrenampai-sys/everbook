"use client"

import { useState } from "react"
import { Menu, ShoppingBag, X } from "lucide-react"

const NAV = [
  { label: "ทำหนังสือ", href: "#pricing" },
  { label: "ทำไมต้อง Everbook", href: "#why" },
  { label: "วิธีใช้งาน", href: "#how" },
  { label: "รีวิว", href: "#reviews" },
  { label: "คำถามที่พบบ่อย", href: "#faq" },
]

export function SiteHeader() {
  const [open, setOpen] = useState(false)
  const [lang, setLang] = useState<"TH" | "EN">("TH")

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3.5">
        <a href="#top" className="font-heading text-2xl font-extrabold tracking-tight text-foreground">
          Everbook<span className="text-primary">.</span>
        </a>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-full px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-secondary-foreground"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          <div className="hidden items-center rounded-full bg-muted p-1 sm:flex">
            {(["TH", "EN"] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                  lang === l ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                }`}
              >
                {l}
              </button>
            ))}
          </div>

          <a
            href="/projects"
            className="hidden items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted sm:inline-flex"
          >
            หนังสือของฉัน
          </a>
          <a
            href="/editor"
            className="hidden items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-transform hover:-translate-y-0.5 sm:inline-flex"
          >
            <ShoppingBag className="size-4" aria-hidden="true" />
            เริ่มทำหนังสือ
          </a>

          <button
            onClick={() => setOpen((v) => !v)}
            className="inline-flex size-10 items-center justify-center rounded-full bg-muted text-foreground lg:hidden"
            aria-label="เปิดเมนู"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border/60 bg-background px-5 py-4 lg:hidden">
          <nav className="flex flex-col gap-1">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-2xl px-4 py-3 text-base font-medium text-foreground transition-colors hover:bg-secondary"
              >
                {item.label}
              </a>
            ))}
            <a
              href="/editor"
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-base font-semibold text-primary-foreground"
            >
              <ShoppingBag className="size-4" aria-hidden="true" />
              เริ่มทำหนังสือ
            </a>
          </nav>
        </div>
      )}
    </header>
  )
}
