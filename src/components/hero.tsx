import Image from "next/image"
import { Star } from "lucide-react"

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      {/* playful pastel blobs */}
      <div className="pointer-events-none absolute -left-24 top-10 size-72 rounded-full bg-mint/50 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-20 top-40 size-80 rounded-full bg-peach/50 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 size-72 rounded-full bg-sky/40 blur-3xl" aria-hidden="true" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-5 py-14 md:grid-cols-2 md:py-20">
        <div className="flex flex-col items-start gap-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-butter px-4 py-1.5 text-sm font-semibold text-butter-foreground">
            <span className="size-2 rounded-full bg-primary" aria-hidden="true" />
            อันดับ 1 ด้านหนังสือภาพ
          </span>

          <h1 className="font-heading text-4xl font-extrabold leading-tight text-balance text-foreground sm:text-5xl lg:text-6xl">
            ความทรงจำของคุณ
            <br />
            <span className="text-primary">ในเล่มที่งดงาม</span>
          </h1>

          <p className="max-w-md text-pretty text-base leading-relaxed text-muted-foreground">
            เปลี่ยนรูปในมือถือให้เป็นหนังสือภาพปกแข็งสุดสวยภายในไม่กี่นาที เลือกเลย์เอาต์ วางรูป แล้วเราจะพิมพ์เป็นของที่ระลึกที่คุณเก็บไว้ได้ตลอดไป
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="/editor"
              className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-base font-semibold text-primary-foreground shadow-sm transition-transform hover:-translate-y-0.5"
            >
              เริ่มทำหนังสือ
            </a>
            <a
              href="#reviews"
              className="inline-flex items-center justify-center rounded-full border-2 border-border bg-card px-6 py-3 text-base font-semibold text-foreground transition-colors hover:bg-secondary"
            >
              อ่านรีวิว
            </a>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <div className="flex -space-x-2">
              {["bg-peach", "bg-mint", "bg-sky", "bg-butter"].map((c) => (
                <span key={c} className={`size-8 rounded-full border-2 border-background ${c}`} aria-hidden="true" />
              ))}
            </div>
            <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
              <span className="flex text-primary" aria-hidden="true">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="size-4 fill-current" />
                ))}
              </span>
              4.9/5 จากรีวิวกว่า 12,000 รายการ
            </div>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-md">
          <div className="absolute inset-0 -rotate-3 rounded-[2.5rem] bg-mint/60" aria-hidden="true" />
          <div className="relative overflow-hidden rounded-[2.5rem] border-4 border-card bg-card shadow-xl">
            <Image
              src="/images/hero-book.png"
              alt="หนังสือภาพปกแข็ง Everbook หน้าปกพิมพ์รูปครอบครัว"
              width={640}
              height={640}
              className="h-full w-full object-cover"
              priority
            />
          </div>
          <div className="absolute -bottom-5 -right-3 rounded-3xl border-2 border-card bg-card px-5 py-3 shadow-lg">
            <p className="font-heading text-2xl font-extrabold text-foreground">4.9 ★</p>
            <p className="text-xs font-medium text-muted-foreground">12,000+ รีวิว</p>
          </div>
          <div className="absolute -left-4 top-6 rotate-[-6deg] rounded-2xl border-2 border-card bg-butter px-4 py-2 shadow-md">
            <p className="text-sm font-bold text-butter-foreground">ปกแข็ง · 24 หน้า</p>
          </div>
        </div>
      </div>
    </section>
  )
}
