"use client";

import { useEffect } from "react";

interface Props {
  error:  Error & { digest?: string };
  reset:  () => void;
}

export default function GlobalError({ error, reset }: Props) {
  useEffect(() => {
    // In production you'd send this to Sentry / LogRocket
    console.error("Unhandled error:", error);
  }, [error]);

  return (
    <main className="min-h-screen bg-amber-50 flex items-center justify-center px-4 pt-16">
      <div className="text-center max-w-md">
        <div className="text-7xl mb-6">😔</div>
        <h1 className="text-2xl font-bold text-stone-800 mb-3">เกิดข้อผิดพลาดบางอย่าง</h1>
        <p className="text-stone-500 mb-2 leading-relaxed">
          ขออภัย มีบางอย่างผิดปกติ กรุณาลองใหม่อีกครั้ง
        </p>
        {error.digest && (
          <p className="text-xs text-stone-400 font-mono mb-6">ref: {error.digest}</p>
        )}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 rounded-full bg-amber-700 hover:bg-amber-800 text-white font-bold transition-colors"
          >
            ลองใหม่
          </button>
          <a
            href="/"
            className="px-6 py-3 rounded-full border-2 border-stone-200 text-stone-600 hover:bg-stone-50 font-medium transition-colors"
          >
            กลับหน้าหลัก
          </a>
        </div>
      </div>
    </main>
  );
}
