import { Truck, ShieldCheck, Heart } from "lucide-react"

const BADGES = [
  {
    icon: Truck,
    title: "จัดส่งฟรีและรวดเร็ว",
    desc: "ส่งฟรีเมื่อครบ ฿1,500 · พิมพ์ภายในไม่กี่วัน",
    bg: "bg-mint",
    fg: "text-mint-foreground",
  },
  {
    icon: ShieldCheck,
    title: "รับประกัน 30 วัน",
    desc: "พอใจหรือยินดีคืนเงิน",
    bg: "bg-peach",
    fg: "text-peach-foreground",
  },
  {
    icon: Heart,
    title: "ลูกค้าพึงพอใจกว่า 12,000 คน",
    desc: "คะแนน 4.9/5 ทุกช่องทาง",
    bg: "bg-sky",
    fg: "text-sky-foreground",
  },
]

export function TrustBadges() {
  return (
    <section className="mx-auto max-w-6xl px-5 pb-16 md:pb-24">
      <div className="grid gap-6 rounded-[2.5rem] border-2 border-border bg-secondary/50 p-7 md:grid-cols-3 md:p-10">
        {BADGES.map((b) => (
          <div key={b.title} className="flex items-center gap-4">
            <span className={`inline-flex size-14 shrink-0 items-center justify-center rounded-2xl ${b.bg} ${b.fg}`}>
              <b.icon className="size-7" aria-hidden="true" />
            </span>
            <div>
              <p className="font-heading text-base font-bold text-foreground">{b.title}</p>
              <p className="text-sm text-muted-foreground">{b.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
