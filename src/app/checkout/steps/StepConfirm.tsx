"use client";

import Link from "next/link";
import { checkout, formatBaht } from "@/lib/content";
import { CheckoutState } from "../CheckoutClient";

interface Props {
  state: CheckoutState;
}

export default function StepConfirm({ state }: Props) {
  const { shipping } = state;
  const shortId = state.orderId?.slice(0, 8).toUpperCase() ?? "—";

  return (
    <div className="text-center">
      {/* Confetti-like success icon */}
      <div className="text-6xl mb-4">🎉</div>
      <h1 className="text-2xl font-bold text-stone-800 mb-2">{checkout.confirmation.heading}</h1>
      <p className="text-stone-500 mb-2">{checkout.confirmation.sub}</p>
      <p className="text-sm text-stone-500 mb-8 max-w-sm mx-auto">{checkout.confirmation.message}</p>

      {/* Order card */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 mb-6 text-left max-w-md mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-xs text-stone-400">{checkout.confirmation.orderIdLabel}</div>
            <div className="font-mono font-bold text-stone-800 text-lg">#{shortId}</div>
          </div>
          <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
            ✅ ชำระเงินแล้ว
          </span>
        </div>

        <div className="space-y-2 text-sm text-stone-600 divide-y divide-stone-50">
          <div className="flex justify-between pb-2">
            <span>หนังสือภาพ {state.quantity} เล่ม</span>
            <span className="font-semibold text-amber-700">{formatBaht(state.totalPrice)}</span>
          </div>
          {shipping && (
            <div className="pt-2">
              <div className="text-xs text-stone-400 mb-1">ที่อยู่จัดส่ง</div>
              <div>{shipping.fullName}</div>
              <div>{shipping.addressLine}</div>
              <div>{shipping.subDistrict} {shipping.district} {shipping.province} {shipping.postalCode}</div>
              <div className="text-stone-400">{shipping.phone}</div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700 mb-8 max-w-md mx-auto">
        <strong>ชำระเงินสำเร็จแล้ว!</strong> ทีมงานของเราจะเริ่มจัดพิมพ์และจัดส่งให้คุณภายใน 5–7 วันทำการ
      </div>

      <p className="text-xs text-stone-400 mb-6">{checkout.confirmation.deliveryNote}</p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/"
          className="px-6 py-3 rounded-full border-2 border-stone-200 text-stone-600 font-medium hover:bg-stone-50 transition-colors"
        >
          {checkout.confirmation.backHome}
        </Link>
        <Link
          href="/editor"
          className="px-6 py-3 rounded-full bg-amber-700 hover:bg-amber-800 text-white font-bold transition-colors"
        >
          {checkout.confirmation.createAnother}
        </Link>
      </div>
    </div>
  );
}
