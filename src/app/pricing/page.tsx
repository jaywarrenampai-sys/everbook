import Link from "next/link";
import { pricing, formatBaht } from "@/lib/content";

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-amber-50 pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-stone-800 mb-4">{pricing.heading}</h1>
        <p className="text-stone-500 mb-12">{pricing.subheading}</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {pricing.tiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative bg-white rounded-2xl p-8 shadow-sm border-2 ${
                tier.highlight ? "border-amber-500 shadow-amber-100 shadow-lg" : "border-stone-100"
              }`}
            >
              {tier.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-xs font-bold px-4 py-1 rounded-full">
                  {tier.badge}
                </span>
              )}
              <h2 className="font-bold text-stone-800 text-xl mb-2">{tier.name}</h2>
              <div className="mb-1">
                <span className="text-4xl font-bold text-amber-700">{formatBaht(tier.price)}</span>
              </div>
              <p className="text-sm text-stone-400 mb-1 line-through">ปกติ {formatBaht(tier.originalPrice)}</p>
              <p className="text-xs text-amber-600 font-semibold mb-6">
                {formatBaht(tier.perBook)} / เล่ม
              </p>
              <ul className="text-sm text-stone-600 space-y-3 mb-8 text-left">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <span className="text-amber-500 mt-0.5">✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/editor"
                className={`block w-full text-center py-3 rounded-full text-sm font-semibold transition-colors ${
                  tier.highlight
                    ? "bg-amber-700 hover:bg-amber-800 text-white"
                    : "bg-amber-100 hover:bg-amber-200 text-amber-800"
                }`}
              >
                {tier.cta}
              </Link>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-6 border border-stone-100 text-left max-w-2xl mx-auto">
          <h3 className="font-bold text-stone-800 mb-4">ราคารวมอะไรบ้าง?</h3>
          <ul className="text-sm text-stone-600 space-y-2">
            <li className="flex gap-2"><span className="text-amber-500">✓</span> หนังสือปกแข็งพรีเมียม 20 หน้า</li>
            <li className="flex gap-2"><span className="text-amber-500">✓</span> พิมพ์สีคุณภาพสูง 300 DPI</li>
            <li className="flex gap-2"><span className="text-amber-500">✓</span> บรรจุในกล่องของขวัญ</li>
            <li className="flex gap-2"><span className="text-amber-500">✓</span> จัดส่งทั่วประเทศไทย (รวมในราคา)</li>
            <li className="flex gap-2"><span className="text-stone-400">—</span> หน้าเพิ่มเติมคิดหน้าละ ฿15 (สูงสุด 60 หน้า)</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
