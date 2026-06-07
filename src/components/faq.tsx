"use client"

import { useState } from "react"
import { Plus } from "lucide-react"

const FAQS = [
  {
    q: "ทำหนังสือภาพอย่างไร?",
    a: "เลือกเทมเพลต อัปโหลดรูป แล้วระบบจะจัดวางให้ คุณสามารถสลับหน้า เพิ่มข้อความ ดูตัวอย่าง แล้วสั่งซื้อ ใช้เวลาเพียงไม่กี่นาที",
  },
  {
    q: "จัดส่งใช้เวลานานไหม?",
    a: "เราพิมพ์ภายในไม่กี่วันทำการ และจัดส่งถึงบ้านคุณโดยทั่วไปภายใน 5-7 วันหลังยืนยันคำสั่งซื้อ",
  },
  {
    q: "จัดส่งทั่วประเทศหรือไม่?",
    a: "ใช่ เราจัดส่งทั่วประเทศไทย และส่งฟรีเมื่อสั่งซื้อครบ ฿1,500",
  },
  {
    q: "ปรับแต่งเลย์เอาต์ได้ไหม?",
    a: "ได้เต็มที่ ทุกเทมเพลตปรับแต่งได้ ทั้งย้ายรูป เปลี่ยนเลย์เอาต์ เพิ่มข้อความ และปรับสีพื้นหลัง",
  },
  {
    q: "มีขนาดและจำนวนหน้าแบบไหนบ้าง?",
    a: "เริ่มต้นที่ปกแข็ง 24 หน้า และสามารถเพิ่มจำนวนหน้าได้ตามต้องการในขั้นตอนการออกแบบ",
  },
  {
    q: "ถ้าหนังสือมาถึงแล้วชำรุดทำอย่างไร?",
    a: "เรารับประกันความพึงพอใจ 30 วัน หากชำรุดหรือไม่พอใจ แจ้งเราได้เลย ยินดีพิมพ์ใหม่หรือคืนเงิน",
  },
]

export function Faq() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section id="faq" className="mx-auto max-w-3xl px-5 py-16 md:py-24">
      <div className="mb-10 text-center">
        <p className="mb-3 text-sm font-bold uppercase tracking-wider text-primary">เรื่องน่ารู้</p>
        <h2 className="font-heading text-3xl font-extrabold text-balance text-foreground sm:text-4xl">
          คำถามที่พบบ่อย
        </h2>
      </div>

      <div className="flex flex-col gap-3">
        {FAQS.map((item, i) => {
          const isOpen = open === i
          return (
            <div
              key={item.q}
              className={`rounded-3xl border-2 bg-card transition-colors ${
                isOpen ? "border-primary" : "border-border"
              }`}
            >
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                aria-expanded={isOpen}
              >
                <span className="font-heading text-lg font-bold text-foreground">{item.q}</span>
                <span
                  className={`inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground transition-transform ${
                    isOpen ? "rotate-45" : ""
                  }`}
                >
                  <Plus className="size-4" aria-hidden="true" />
                </span>
              </button>
              {isOpen && (
                <p className="px-6 pb-6 text-pretty leading-relaxed text-muted-foreground">{item.a}</p>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
