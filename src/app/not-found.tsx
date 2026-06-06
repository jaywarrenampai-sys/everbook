import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-amber-50 flex items-center justify-center px-4 pt-16">
      <div className="text-center max-w-md">
        <div className="text-7xl mb-6">📖</div>
        <h1 className="text-3xl font-bold text-stone-800 mb-3">ไม่พบหน้านี้</h1>
        <p className="text-stone-500 mb-8 leading-relaxed">
          หน้าที่คุณกำลังมองหาไม่มีอยู่หรือถูกย้ายไปแล้ว
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="px-6 py-3 rounded-full bg-amber-700 hover:bg-amber-800 text-white font-bold transition-colors"
          >
            กลับหน้าหลัก
          </Link>
          <Link
            href="/editor"
            className="px-6 py-3 rounded-full border-2 border-stone-200 text-stone-600 hover:bg-stone-50 font-medium transition-colors"
          >
            สร้างหนังสือภาพ
          </Link>
        </div>
      </div>
    </main>
  );
}
