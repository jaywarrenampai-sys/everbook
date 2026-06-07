const STEPS = [
  {
    num: "01",
    title: "เลือกเทมเพลต",
    desc: "เริ่มจากเลย์เอาต์สำเร็จรูปหรือหน้าว่าง ทุกเทมเพลตปรับแต่งได้เต็มที่",
    bg: "bg-butter",
    fg: "text-butter-foreground",
  },
  {
    num: "02",
    title: "อัปโหลดรูปภาพ",
    desc: "เพิ่มรูปจากมือถือหรือคอมพิวเตอร์ ระบบเติมรูปอัตโนมัติจัดให้ในไม่กี่วินาที",
    bg: "bg-mint",
    fg: "text-mint-foreground",
  },
  {
    num: "03",
    title: "ปรับแต่งและสั่งซื้อ",
    desc: "ปรับหน้า เพิ่มข้อความ ดูตัวอย่าง แล้วเราจะพิมพ์และจัดส่งถึงบ้านคุณ",
    bg: "bg-peach",
    fg: "text-peach-foreground",
  },
]

export function Steps() {
  return (
    <section id="how" className="bg-secondary/40 py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-5">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="mb-3 text-sm font-bold uppercase tracking-wider text-primary">ง่ายเพียง 1 2 3</p>
          <h2 className="font-heading text-3xl font-extrabold text-balance text-foreground sm:text-4xl">
            จากรูปในมือถือสู่หนังสือที่ระลึก
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.num} className="relative rounded-[2rem] border-2 border-border bg-card p-7">
              <span
                className={`mb-5 inline-flex size-14 items-center justify-center rounded-2xl font-heading text-2xl font-extrabold ${s.bg} ${s.fg}`}
              >
                {s.num}
              </span>
              <h3 className="mb-2 font-heading text-xl font-bold text-foreground">{s.title}</h3>
              <p className="text-pretty leading-relaxed text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
