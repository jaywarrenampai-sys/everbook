const COLUMNS = [
  {
    title: "ทำหนังสือ",
    links: ["เทมเพลตทั้งหมด", "ขายดี", "หนังสือของขวัญ"],
  },
  {
    title: "บริษัท",
    links: ["เกี่ยวกับเรา", "รีวิว", "ติดต่อ"],
  },
  {
    title: "ช่วยเหลือ",
    links: ["คำถามที่พบบ่อย", "การจัดส่ง", "การคืนสินค้า"],
  },
]

const SOCIALS = ["Instagram", "TikTok", "Facebook", "YouTube"]
const PAYMENTS = ["VISA", "MC", "AMEX", "PayPal"]

export function SiteFooter() {
  return (
    <footer className="border-t-2 border-border bg-card">
      <div className="mx-auto max-w-6xl px-5 py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <p className="font-heading text-2xl font-extrabold text-foreground">
              Everbook<span className="text-primary">.</span>
            </p>
            <p className="mt-3 max-w-xs text-pretty leading-relaxed text-muted-foreground">
              หนังสือภาพปกแข็งพรีเมียม ออกแบบเองได้ในไม่กี่นาที พิมพ์มาเพื่อเก็บไว้ตลอดชีวิต
            </p>
            <a
              href="mailto:hello@everbook.com"
              className="mt-4 inline-block font-medium text-primary hover:underline"
            >
              hello@everbook.com
            </a>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="mb-4 font-heading text-base font-bold text-foreground">{col.title}</h4>
              <ul className="flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-muted-foreground transition-colors hover:text-primary">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-6 border-t border-border pt-8 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {SOCIALS.map((s) => (
              <a
                key={s}
                href="#"
                className="rounded-full bg-secondary px-4 py-2 text-xs font-semibold text-secondary-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                {s}
              </a>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {PAYMENTS.map((p) => (
              <span
                key={p}
                className="rounded-lg border border-border bg-muted px-3 py-1.5 text-xs font-bold text-muted-foreground"
              >
                {p}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>© 2026 Everbook. All rights reserved.</p>
          <div className="flex flex-wrap gap-4">
            <a href="#" className="hover:text-primary">ข้อกำหนด</a>
            <a href="#" className="hover:text-primary">ความเป็นส่วนตัว</a>
            <a href="#" className="hover:text-primary">นโยบายคืนเงิน</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
