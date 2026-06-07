import { Star } from "lucide-react"

const REVIEWS = [
  {
    title: "สวยเกินคาด!",
    body: "คุณภาพงานพิมพ์เกินคาดมาก หน้ากางราบสนิทและสีสันสดสวย เป็นของขวัญครบรอบที่สมบูรณ์แบบ",
    initial: "ม",
    name: "มายา",
    bg: "bg-peach",
    fg: "text-peach-foreground",
  },
  {
    title: "ทำง่ายมาก",
    body: "เปลี่ยนทริปทั้งทริปเป็นหนังสือได้ในไม่ถึงสิบห้านาที ระบบเติมรูปอัตโนมัติช่วยได้เยอะมาก",
    initial: "พ",
    name: "พิยะ",
    bg: "bg-mint",
    fg: "text-mint-foreground",
  },
  {
    title: "คุ้มทุกบาท",
    body: "สั่งให้คุณตายายสามเล่ม ท่านน้ำตาคลอเลย ปกแข็งให้สัมผัสพรีเมียมจริง",
    initial: "เ",
    name: "เอเลน่า",
    bg: "bg-sky",
    fg: "text-sky-foreground",
  },
]

export function Testimonials() {
  return (
    <section id="reviews" className="bg-secondary/40 py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-5">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="mb-3 text-sm font-bold uppercase tracking-wider text-primary">ลูกค้าหลายพันคนหลงรัก</p>
          <h2 className="font-heading text-3xl font-extrabold text-balance text-foreground sm:text-4xl">
            ให้รีวิวเป็นผู้เล่าเรื่อง
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {REVIEWS.map((r) => (
            <figure key={r.name} className="flex flex-col rounded-[2rem] border-2 border-border bg-card p-7">
              <span className="mb-3 flex text-primary" aria-hidden="true">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="size-4 fill-current" />
                ))}
              </span>
              <figcaption className="mb-2 font-heading text-lg font-bold text-foreground">
                {"\u201C"}
                {r.title}
                {"\u201D"}
              </figcaption>
              <blockquote className="flex-1 text-pretty leading-relaxed text-muted-foreground">{r.body}</blockquote>
              <div className="mt-6 flex items-center gap-3">
                <span className={`inline-flex size-10 items-center justify-center rounded-full font-bold ${r.bg} ${r.fg}`}>
                  {r.initial}
                </span>
                <div>
                  <p className="text-sm font-bold text-foreground">{r.name}</p>
                  <p className="text-xs font-medium text-mint-foreground">✓ ผู้ซื้อที่ยืนยันแล้ว</p>
                </div>
              </div>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
