import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "الصفحة غير موجودة",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main dir="rtl" className="min-h-[75vh] bg-[#222222] px-5 py-20 text-[#f8eedb]">
      <section className="mx-auto max-w-2xl text-center">
        <p className="mb-4 text-6xl font-black text-[#ed8b52]">404</p>
        <h1 className="mb-5 text-3xl font-extrabold sm:text-4xl">الصفحة غير موجودة</h1>
        <p className="mx-auto mb-9 max-w-xl leading-8 text-[#f8eedb]/75">
          قد يكون الرابط غير صحيح، أو أن الفعالية غير متاحة للعرض حاليًا.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link href="/events" className="rounded-xl bg-[#ed8b52] px-6 py-3 font-bold text-[#222222]">
            استعرض الفعاليات
          </Link>
          <Link href="/" className="rounded-xl border border-[#69816e] px-6 py-3 font-bold">
            العودة للرئيسية
          </Link>
        </div>
      </section>
    </main>
  );
}
