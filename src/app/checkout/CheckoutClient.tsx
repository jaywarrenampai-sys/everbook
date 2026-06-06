"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { checkout, getPriceForQuantity, formatBaht, pricing } from "@/lib/content";
import { createOrder, ShippingAddress } from "@/lib/supabase/orders";
import StepQuantity  from "./steps/StepQuantity";
import StepShipping  from "./steps/StepShipping";
import StepPayment   from "./steps/StepPayment";
import StepConfirm   from "./steps/StepConfirm";

export type CheckoutStep = 0 | 1 | 2 | 3;

export interface CheckoutState {
  projectId:     string | null;
  pageCount:     number;
  quantity:      number;
  unitPrice:     number;
  totalPrice:    number;
  shipping:      ShippingAddress | null;
  paymentMethod: string;
  orderId:       string | null;
}

const EMPTY_SHIPPING: ShippingAddress = {
  fullName: "", phone: "", addressLine: "",
  subDistrict: "", district: "", province: "", postalCode: "",
};

export default function CheckoutClient() {
  const params     = useSearchParams();
  const projectId  = params.get("projectId");
  const pageCount  = parseInt(params.get("pages") ?? "20", 10);

  const [step, setStep] = useState<CheckoutStep>(0);
  const [state, setState] = useState<CheckoutState>(() => {
    const { unit, total } = getPriceForQuantity(1);
    return {
      projectId,
      pageCount,
      quantity:      1,
      unitPrice:     unit,
      totalPrice:    total,
      shipping:      null,
      paymentMethod: "promptpay",
      orderId:       null,
    };
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setQuantity(qty: number) {
    const { unit, total } = getPriceForQuantity(qty);
    setState((s) => ({ ...s, quantity: qty, unitPrice: unit, totalPrice: total }));
  }

  function setShipping(shipping: ShippingAddress) {
    setState((s) => ({ ...s, shipping }));
  }

  function setPaymentMethod(method: string) {
    setState((s) => ({ ...s, paymentMethod: method }));
  }

  // Creates the order in Supabase (pending_payment), then stays on step 2
  // so the payment component can launch. Step 3 is reached only after onPaid().
  async function submitOrder() {
    if (!state.shipping) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const order = await createOrder({
        projectId:     state.projectId,
        quantity:      state.quantity,
        unitPrice:     state.unitPrice,
        totalPrice:    state.totalPrice,
        pageCount:     state.pageCount,
        shipping:      state.shipping,
        paymentMethod: state.paymentMethod,
      });
      // Don't advance step — StepPayment will show the live payment UI now
      setState((s) => ({ ...s, orderId: order.id }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handlePaid() {
    setStep(3);
  }

  function handlePaymentFailed(msg: string) {
    setError(msg);
    // Reset orderId so customer can try again (new order will be created)
    setState((s) => ({ ...s, orderId: null }));
  }

  return (
    <div className="min-h-screen bg-amber-50 pt-16">
      {/* Progress bar */}
      <div className="bg-white border-b border-stone-100 sticky top-16 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {checkout.steps.map((label, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  i < step  ? "bg-green-500 text-white"
                  : i === step ? "bg-amber-700 text-white"
                  : "bg-stone-200 text-stone-400"
                }`}>
                  {i < step ? "✓" : i + 1}
                </div>
                <span className={`text-xs hidden sm:block ${
                  i === step ? "text-amber-700 font-semibold" : "text-stone-400"
                }`}>
                  {label}
                </span>
                {i < checkout.steps.length - 1 && (
                  <div className={`h-px w-8 sm:w-16 mx-1 ${i < step ? "bg-green-400" : "bg-stone-200"}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Step content */}
      <div className="max-w-2xl mx-auto px-4 py-10">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm flex items-center gap-2">
            ⚠️ {error}
            <button onClick={() => setError(null)} className="ml-auto opacity-60 hover:opacity-100">×</button>
          </div>
        )}

        {step === 0 && (
          <StepQuantity
            state={state}
            onQuantity={setQuantity}
            onNext={() => setStep(1)}
          />
        )}
        {step === 1 && (
          <StepShipping
            initial={state.shipping ?? EMPTY_SHIPPING}
            onBack={() => setStep(0)}
            onNext={(s) => { setShipping(s); setStep(2); }}
          />
        )}
        {step === 2 && (
          <StepPayment
            state={state}
            isSubmitting={isSubmitting}
            onPaymentMethod={setPaymentMethod}
            onBack={() => setStep(1)}
            onConfirm={submitOrder}
            onPaid={handlePaid}
            onFailed={handlePaymentFailed}
          />
        )}
        {step === 3 && (
          <StepConfirm state={state} />
        )}
      </div>
    </div>
  );
}
