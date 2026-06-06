"use client";

import { checkout, pricing, getPriceForQuantity, formatBaht } from "@/lib/content";
import { CheckoutState } from "../CheckoutClient";

interface Props {
  state:      CheckoutState;
  onQuantity: (qty: number) => void;
  onNext:     () => void;
}

const QTY_OPTIONS = [1, 2, 3, 4, 5];

export default function StepQuantity({ state, onQuantity, onNext }: Props) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-stone-800 mb-1">{checkout.quantity.heading}</h1>
      <p className="text-stone-500 mb-8">{checkout.quantity.sub}</p>

      {/* Tier cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {pricing.tiers.map((tier, i) => {
          const qty = i + 1;
          const isSelected = state.quantity === qty;
          return (
            <button
              key={qty}
              onClick={() => onQuantity(qty)}
              className={`relative rounded-2xl p-4 border-2 text-left transition-all hover:-translate-y-0.5 ${
                isSelected
                  ? "border-amber-500 bg-amber-50 shadow-md shadow-amber-100"
                  : "border-stone-200 bg-white hover:border-amber-300"
              }`}
            >
              {tier.badge && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-[10px] font-bold px-3 py-0.5 rounded-full">
                  {tier.badge}
                </span>
              )}
              <div className="font-bold text-stone-800 mb-1">{tier.name}</div>
              <div className="text-xl font-bold text-amber-700">{formatBaht(tier.price)}</div>
              <div className="text-xs text-stone-400 line-through">{formatBaht(tier.originalPrice)}</div>
              <div className="text-xs text-green-600 font-medium mt-1">
                ประหยัด {formatBaht(tier.originalPrice - tier.price)}
              </div>
            </button>
          );
        })}
      </div>

      {/* Custom quantity */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 mb-8">
        <p className="text-sm text-stone-600 mb-3 font-medium">หรือเลือกจำนวนเอง</p>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 bg-stone-100 rounded-xl px-4 py-2">
            <button
              onClick={() => onQuantity(Math.max(1, state.quantity - 1))}
              className="w-8 h-8 rounded-full bg-white shadow text-lg font-bold text-stone-700 hover:bg-amber-50 transition-colors flex items-center justify-center"
            >−</button>
            <span className="text-xl font-bold text-stone-800 w-8 text-center">{state.quantity}</span>
            <button
              onClick={() => onQuantity(Math.min(20, state.quantity + 1))}
              className="w-8 h-8 rounded-full bg-white shadow text-lg font-bold text-stone-700 hover:bg-amber-50 transition-colors flex items-center justify-center"
            >+</button>
          </div>
          <div>
            <div className="text-sm text-stone-500">
              {formatBaht(state.unitPrice)} {checkout.quantity.perBook}
            </div>
            {state.quantity > 3 && (
              <div className="text-xs text-green-600">ใช้ราคา 3 เล่มขึ้นไป</div>
            )}
          </div>
        </div>
      </div>

      {/* Order summary */}
      <div className="bg-amber-700 text-white rounded-2xl p-5 mb-6 flex items-center justify-between">
        <div>
          <div className="text-sm text-amber-200">{state.quantity} เล่ม × {formatBaht(state.unitPrice)}</div>
          <div className="text-2xl font-bold">{formatBaht(state.totalPrice)}</div>
          <div className="text-xs text-amber-300 mt-0.5">รวมจัดส่งทั่วไทย</div>
        </div>
        <button
          onClick={onNext}
          className="bg-white text-amber-800 font-bold px-6 py-3 rounded-full hover:bg-amber-50 transition-colors shadow"
        >
          {checkout.quantity.continue}
        </button>
      </div>
    </div>
  );
}
