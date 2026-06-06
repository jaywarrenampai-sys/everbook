"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router   = useRouter();
  const [pw,     setPw]     = useState("");
  const [error,  setError]  = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res  = await fetch("/api/admin/login", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ password: pw }),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "เกิดข้อผิดพลาด");
      setLoading(false);
    } else {
      router.refresh(); // re-render server component → now authenticated
    }
  }

  return (
    <div className="min-h-screen bg-stone-900 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">📚</div>
          <h1 className="text-2xl font-bold text-white">Everbook Admin</h1>
          <p className="text-stone-400 text-sm mt-1">ระบบจัดการคำสั่งซื้อ</p>
        </div>

        <form
          onSubmit={handleLogin}
          className="bg-stone-800 rounded-2xl p-6 space-y-4 shadow-xl"
        >
          {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-300 text-sm rounded-xl px-4 py-3">
              ⚠️ {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-stone-300 mb-1.5">
              รหัสผ่าน
            </label>
            <input
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              placeholder="••••••••"
              required
              autoFocus
              className="w-full bg-stone-700 border border-stone-600 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold py-3 rounded-full transition-colors"
          >
            {loading ? "กำลังเข้าสู่ระบบ…" : "เข้าสู่ระบบ"}
          </button>
        </form>
      </div>
    </div>
  );
}
