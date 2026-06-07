const ITEMS = [
  "ปกแข็งพรีเมียม",
  "หน้ากางราบ",
  "หมึกไม่ซีดจาง",
  "เครื่องมือใช้ง่าย",
  "เสร็จในไม่กี่นาที",
  "ทนทานยาวนาน",
  "ช่วยออกแบบฟรี",
  "ส่งทั่วประเทศ",
]

export function Marquee() {
  const loop = [...ITEMS, ...ITEMS]
  return (
    <div className="overflow-hidden border-y-2 border-border bg-secondary py-4">
      <div className="flex w-max animate-marquee items-center gap-6">
        {loop.map((item, i) => (
          <div key={i} className="flex items-center gap-6">
            <span className="whitespace-nowrap font-heading text-lg font-bold text-secondary-foreground">
              {item}
            </span>
            <span className="text-xl text-primary" aria-hidden="true">
              ✦
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
