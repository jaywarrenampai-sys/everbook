"use client";

import { checkout, formatBaht } from "@/lib/content";
import { CheckoutState } from "../CheckoutClient";
import PromptPayScreen from "@/components/payment/PromptPayScreen";
import CardForm        from "@/components/payment/CardForm";

interface Props {
  state:           CheckoutState;
  isSubmitting:    boolean;
  onPaymentMethod: (method: string) => void;
  onBack:          () => void;
  onConfirm:       () => void;
  onPaid:          () => void;
  onFailed:        (msg: string) => void;
}

export default function StepPayment({
  state,
  isSubmitting,
  onPaymentMethod,
  onBack,
  onConfirm,
  onPaid,
  onFailed,
}: Props) {
  const { shipping } = state;

  // ─── Payment UI (after order is created) ────────────────────────────────────
  if (state.orderId) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-stone-800 mb-1">{checkout.payment.heading}</h1>
        <p className="text-stone-500 mb-8">
          {state.paymentMethod === "promptpay"
            ? "สแกน QR Code เพื่อชำระเงินผ่าน PromptPay"
            : "กรอกข้อมูลบัตรเพื่อชำระเงิน"}
        </p>

        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
          {state.paymentMethod === "promptpay" ? (
            <PromptPayScreen
              orderId={state.orderId}
              amount={state.totalPrice}
              onPaid={onPaid}
              onFailed={onFailed}
            />
          ) : (
            <CardForm
              orderId={state.orderId}
              amount={state.totalPrice}
              onPaid={onPaid}
              onFailed={onFailed}
            />
          )}
        </div>

        <button
          onClick={() => onFailed("ยกเลิกการชำระเงิน")}
          className="mt-4 w-full text-sm text-stone-400 hover:text-stone-600 transition-colors py-2"
        >
          ← เปลี่ยนวิธีชำระเงิน
        </button>
      </div>
    );
  }

  // ─── Method selection + order summary ───────────────────────────────────────
  return (
    <div>
      <h1 className="text-2xl font-bold text-stone-800 mb-1">{checkout.payment.heading}</h1>
      <p className="text-stone-500 mb-8">{checkout.payment.sub}</p>

      {/* Order summary */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 mb-6">
        <h2 className="font-semibold text-stone-800 mb-3">{checkout.payment.summary}</h2>
        <div className="space-y-2 text-sm text-stone-600 divide-y divide-stone-50">
          <div className="flex justify-between pb-2">
            <span>หนังสือภาพ {state.quantity} เล่ม</span>
            <span>{formatBaht(state.totalPrice)}</span>
          </div>
          <div className="flex justify-between py-2 text-stone-400">
            <span>ค่าจัดส่ง</span>
            <span className="text-green-600 font-medium">ฟรี</span>
          </div>
          <div className="flex justify-between pt-2 font-bold text-stone-800 text-base">
            <span>ยอดรวมทั้งสิ้น</span>
            <span className="text-amber-700 text-xl">{formatBaht(state.totalPrice)}</span>
          </div>
        </div>
      </div>

      {/* Shipping summary */}
      {shipping && (
        <div className="bg-stone-50 rounded-2xl border border-stone-100 p-4 mb-6 text-sm text-stone-600">
          <div className="font-semibold text-stone-800 mb-2">📦 ที่อยู่จัดส่ง</div>
          <div>{shipping.fullName} · {shipping.phone}</div>
          <div>{shipping.addressLine}</div>
          <div>{shipping.subDistrict} {shipping.district} {shipping.province} {shipping.postalCode}</div>
        </div>
      )}

      {/* Payment methods */}
      <div className="space-y-3 mb-6">
        {checkout.payment.methods.map((method) => (
          <button
            key={method.id}
            onClick={() => onPaymentMethod(method.id)}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
              state.paymentMethod === method.id
                ? "border-amber-500 bg-amber-50"
                : "border-stone-200 bg-white hover:border-amber-300"
            }`}
          >
            <span className="text-3xl">{method.icon}</span>
            <div className="flex-1">
              <div className="font-semibold text-stone-800">{method.label}</div>
              <div className="text-xs text-stone-500">{method.description}</div>
            </div>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
              state.paymentMethod === method.id
                ? "border-amber-500 bg-amber-500"
                : "border-stone-300"
            }`}>
              {state.paymentMethod === method.id && (
                <div className="w-2 h-2 rounded-full bg-white" />
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Test mode notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-xs text-blue-700 mb-6">
        {checkout.payment.testMode}
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          disabled={isSubmitting}
          className="flex-1 py-3 rounded-full border-2 border-stone-200 text-stone-600 font-medium hover:bg-stone-50 transition-colors disabled:opacity-50"
        >
          {checkout.payment.back}
        </button>
        <button
          onClick={onConfirm}
          disabled={isSubmitting}
          className="flex-grow-[2] py-3 rounded-full bg-amber-700 hover:bg-amber-800 disabled:opacity-50 disabled:cursor-wait text-white font-bold transition-colors flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <><span className="animate-spin">⏳</span> กำลังดำเนินการ…</>
          ) : (
            <>{checkout.payment.confirm} {formatBaht(state.totalPrice)}</>
          )}
        </button>
      </div>
    </div>
  );
}
