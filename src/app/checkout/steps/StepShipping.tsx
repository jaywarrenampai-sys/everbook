"use client";

import { useState } from "react";
import { checkout, THAI_PROVINCES } from "@/lib/content";
import { ShippingAddress } from "@/lib/supabase/orders";

interface Props {
  initial: ShippingAddress;
  onBack: () => void;
  onNext: (s: ShippingAddress) => void;
}

export default function StepShipping({ initial, onBack, onNext }: Props) {
  const [form, setForm] = useState<ShippingAddress>(initial);
  const [errors, setErrors] = useState<Partial<Record<keyof ShippingAddress, string>>>({});

  function set(field: keyof ShippingAddress, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  }

  function validate(): boolean {
    const newErrors: typeof errors = {};
    const required: (keyof ShippingAddress)[] = [
      "fullName", "phone", "addressLine", "subDistrict", "district", "province", "postalCode",
    ];
    for (const field of required) {
      if (!form[field].trim()) newErrors[field] = "กรุณากรอกข้อมูล";
    }
    if (form.phone && !/^[0-9]{9,10}$/.test(form.phone.replace(/[-\s]/g, ""))) {
      newErrors.phone = "เบอร์โทรศัพท์ไม่ถูกต้อง";
    }
    if (form.postalCode && !/^[0-9]{5}$/.test(form.postalCode)) {
      newErrors.postalCode = "รหัสไปรษณีย์ต้องเป็นตัวเลข 5 หลัก";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit() {
    if (validate()) onNext(form);
  }

  const f = checkout.shipping.fields;

  function Field({
    id, label, type = "text", isSelect = false, required = true,
  }: {
    id: keyof ShippingAddress; label: string; type?: string;
    isSelect?: boolean; required?: boolean;
  }) {
    const err = errors[id];
    const baseClass = `w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-colors ${
      err
        ? "border-red-300 focus:ring-red-300"
        : "border-stone-200 focus:ring-amber-400"
    }`;
    return (
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1.5">
          {label}{required && <span className="text-red-400 ml-0.5">*</span>}
        </label>
        {isSelect ? (
          <select
            value={form[id]}
            onChange={(e) => set(id, e.target.value)}
            className={baseClass}
          >
            <option value="">เลือกจังหวัด</option>
            {THAI_PROVINCES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        ) : (
          <input
            type={type}
            value={form[id]}
            onChange={(e) => set(id, e.target.value)}
            className={baseClass}
            placeholder={label}
          />
        )}
        {err && <p className="text-red-500 text-xs mt-1">{err}</p>}
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-stone-800 mb-1">{checkout.shipping.heading}</h1>
      <p className="text-stone-500 mb-8">{checkout.shipping.sub}</p>

      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 space-y-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field id="fullName"    label={f.fullName} />
          <Field id="phone"       label={f.phone} type="tel" />
        </div>
        <Field id="addressLine"   label={f.addressLine} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field id="subDistrict" label={f.subDistrict} />
          <Field id="district"    label={f.district} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field id="province"    label={f.province} isSelect />
          <Field id="postalCode"  label={f.postalCode} />
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 py-3 rounded-full border-2 border-stone-200 text-stone-600 font-medium hover:bg-stone-50 transition-colors"
        >
          {checkout.shipping.back}
        </button>
        <button
          onClick={handleSubmit}
          className="flex-2 flex-grow-[2] py-3 rounded-full bg-amber-700 hover:bg-amber-800 text-white font-bold transition-colors"
        >
          {checkout.shipping.continue}
        </button>
      </div>
    </div>
  );
}
