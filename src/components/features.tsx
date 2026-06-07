import { Wand2, Sparkles, ShieldCheck } from "lucide-react"

const FEATURES = [
  {
    icon: Wand2,
    title: "แก้ไขง่ายดาย",
    desc: "ลาก วาง เสร็จ เลย์เอาต์อัจฉริยะจัดวางรูปให้สวยงามโดยไม่ต้องมีพื้นฐานการออกแบบ",
    bg: "bg-mint",
    fg: "text-mint-foreground",
  },
  {
    icon: Sparkles,
    title: "งานพิมพ์คุณภาพแกลเลอรี",
    desc: "หน้ากระดาษหนากางราบ หมึกคุณภาพสูง และปกแข็งที่ทนทานยาวนาน",
    bg: "bg-peach",
    fg: "text-peach-foreground",
  },
  {
    icon: ShieldCheck,
    title: "ได้รับความไว้วางใจ",
    desc: "การันตีด้วยรีวิว 5 ดาวกว่า 12,000 รายการ พร้อมรับประกันความพึงพอใจ 30 วันทุกเล่ม",
    bg: "bg-sky",
    fg: "text-sky-foreground",
  },
]

export function Features() {
  return (
    <section id="why" className="mx-auto max-w-6xl px-5 py-16 md:py-24">
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <p className="mb-3 text-sm font-bold uppercase tracking-wider text-primary">ทำไมต้อง EVERBOOK</p>
        <h2 className="font-heading text-3xl font-extrabold text-balance text-foreground sm:text-4xl">
          หนังสือที่สร้างมาเพื่อเก็บรักษา
        </h2>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className="group rounded-[2rem] border-2 border-border bg-card p-7 transition-transform hover:-translate-y-1"
          >
            <div className={`mb-5 inline-flex size-14 items-center justify-center rounded-2xl ${f.bg} ${f.fg}`}>
              <f.icon className="size-7" aria-hidden="true" />
            </div>
            <h3 className="mb-2 font-heading text-xl font-bold text-foreground">{f.title}</h3>
            <p className="text-pretty leading-relaxed text-muted-foreground">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
