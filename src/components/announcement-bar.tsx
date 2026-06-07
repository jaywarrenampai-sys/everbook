"use client"

import { useState } from "react"
import { X } from "lucide-react"

export function AnnouncementBar() {
  const [show, setShow] = useState(true)
  if (!show) return null

  return (
    <div className="relative bg-primary px-5 py-2.5 text-center text-sm font-semibold text-primary-foreground">
      ✦ ส่งฟรีเมื่อสั่งซื้อครบ ฿1,500
      <button
        onClick={() => setShow(false)}
        className="absolute right-3 top-1/2 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-full transition-colors hover:bg-primary-foreground/15"
        aria-label="ปิด"
      >
        <X className="size-4" aria-hidden="true" />
      </button>
    </div>
  )
}
