import { Check } from "lucide-react"

const PLANS = [
  {
    name: "เดี่ยว",
    detail: "1 เล่ม · 24 หน้า",
    price: "฿690",
    original: "฿1,380",
    discount: "ลด 50%",
    accent: "bg-mint",
    accentFg: "text-mint-foreground",
    featured: false,
  },
  {
    name: "คู่",
    detail: "2 เล่ม · เล่มละ 24 หน้า",
    price: "฿1,190",
    original: "฿2,760",
    discount: "ลด 57%",
    accent: "bg-peach",
    accentFg: "text-peach-foreground",
    featured: true,
  },
  {
    name: "สามเล่ม",
    detail: "3 เล่ม · เล่มละ 24 หน้า",
    price: "฿1,590",
    original: "฿4,140",
    discount: "ลด 62%",
    accent: "bg-sky",
    accentFg: "text-sky-foreground",
    featured: false,
  },
]

const PERKS = ["ปกแข็งพรีเมียม", "หน้ากางราบ", "ช่วยออกแบบฟรี"]

export function Pricing() {
  return (
    <section id="pricing" className="mx-auto max-w-6xl px-5 py-16 md:py-24">
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <span className="mb-3 inline-block rounded-full bg-primary px-4 py-1.5 text-sm font-bold text-primary-foreground">
          โปรเปิดตัว ลดสูงสุด 70%
        </span>
        <h2 className="font-heading text-3xl font-extrabold text-balance text-foreground sm:text-4xl">
          เลือกหนังสือของคุณ
        </h2>
        <p className="mt-3 text-pretty text-muted-foreground">
          ปกแข็งพรีเมียมเหมือนกันทุกแบบ เริ่มได้ 3 รูปแบบ ส่วนลดจะคำนวณอัตโนมัติตอนชำระเงิน
        </p>
      </div>

      <div className="grid items-start gap-6 md:grid-cols-3">
        {PLANS.map((p) => (
          <div
            key={p.name}
            className={`relative flex flex-col rounded-[2rem] border-2 bg-card p-7 transition-transform hover:-translate-y-1 ${
              p.featured ? "border-primary shadow-xl md:-mt-4 md:mb-4" : "border-border"
            }`}
          >
            {p.featured && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-bold text-primary-foreground">
                Bestseller
              </span>
            )}
            <div className="mb-5 flex items-center justify-between">
              <div className={`inline-flex items-center rounded-2xl ${p.accent} ${p.accentFg} px-4 py-2`}>
                <span className="font-heading text-lg font-bold">{p.name}</span>
              </div>
              <span className="rounded-full bg-butter px-3 py-1 text-xs font-bold text-butter-foreground">
                {p.discount}
              </span>
            </div>
            <p className="text-sm font-medium text-muted-foreground">{p.detail}</p>
            <div className="mt-4 flex items-end gap-2">
              <span className="font-heading text-4xl font-extrabold text-foreground">{p.price}</span>
              <span className="mb-1 text-base text-muted-foreground line-through">{p.original}</span>
            </div>

            <ul className="mt-5 flex flex-col gap-2.5">
              {PERKS.map((perk) => (
                <li key={perk} className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <span className="inline-flex size-5 items-center justify-center rounded-full bg-mint text-mint-foreground">
                    <Check className="size-3.5" aria-hidden="true" />
                  </span>
                  {perk}
                </li>
              ))}
            </ul>

            <a
              href="/editor"
              className={`mt-6 inline-flex items-center justify-center rounded-full px-6 py-3 text-base font-semibold transition-transform hover:-translate-y-0.5 ${
                p.featured
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "border-2 border-border bg-card text-foreground hover:bg-secondary"
              }`}
            >
              เริ่มออกแบบ
            </a>
          </div>
        ))}
      </div>

      <p className="mt-8 text-center text-sm font-medium text-muted-foreground">
        ✦ ส่วนลดคำนวณอัตโนมัติตอนชำระเงิน · ส่งฟรีเมื่อสั่งซื้อครบ ฿1,500
      </p>
    </section>
  )
}
