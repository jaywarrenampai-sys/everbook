import Image from "next/image"

const STATS = [
  { value: "200+", label: "เลย์เอาต์และเทมเพลตให้เลือก" },
  { value: "100%", label: "รับประกันความพึงพอใจทุกเล่ม" },
]

export function Quality() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-16 md:py-24">
      <div className="grid items-center gap-10 md:grid-cols-2">
        <div className="relative order-2 md:order-1">
          <div className="absolute inset-0 rotate-3 rounded-[2.5rem] bg-peach/60" aria-hidden="true" />
          <div className="relative overflow-hidden rounded-[2.5rem] border-4 border-card shadow-xl">
            <Image
              src="/images/open-spread.png"
              alt="หนังสือภาพเปิดกางราบแสดงรูปภาพหลากสีสัน"
              width={720}
              height={560}
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        <div className="order-1 flex flex-col items-start gap-6 md:order-2">
          <p className="text-sm font-bold uppercase tracking-wider text-primary">ความแตกต่างของ EVERBOOK</p>
          <h2 className="font-heading text-3xl font-extrabold text-balance text-foreground sm:text-4xl">
            คุณภาพงดงามสำหรับช่วงเวลางดงาม
          </h2>
          <p className="text-pretty leading-relaxed text-muted-foreground">
            หนังสือ Everbook ทุกเล่มพิมพ์บนกระดาษหนากางราบด้วยหมึกคุณภาพสูงที่ไม่ซีดจาง เข้าเล่มปกแข็งพรีเมียม เพื่อให้เรื่องราวของคุณสวยงามเหมือนวันแรกแม้ผ่านไปยี่สิบปี
          </p>
          <div className="grid w-full grid-cols-2 gap-4">
            {STATS.map((s) => (
              <div key={s.label} className="rounded-3xl border-2 border-border bg-card p-5">
                <p className="font-heading text-3xl font-extrabold text-primary">{s.value}</p>
                <p className="mt-1 text-sm font-medium text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
