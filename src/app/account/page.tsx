import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentVisitor } from "@/features/visitors/server/auth";

export const metadata: Metadata = { title: "حسابي", robots: { index: false, follow: false } };
export default async function VisitorAccount() {
  let visitor;
  try { visitor = await getCurrentVisitor(); }
  catch { redirect("/login?error=server"); }
  if (!visitor) redirect("/login");
  return <main dir="rtl" className="min-h-[80vh] bg-[#222222] px-4 py-14 text-[#f8eedb]">
    <section className="mx-auto max-w-2xl rounded-3xl border border-[#69816e] bg-[#324b36] p-8 shadow-xl sm:p-12">
      <p className="mb-2 text-xs font-bold tracking-widest text-[#ed8b52]">NAGA HOUSE · ACCOUNT</p>
      <h1 className="mb-5 text-3xl font-extrabold">حسابي</h1>
      <p className="mb-3 text-lg">أهلًا، {visitor.display_name}</p>
      <p dir="ltr" className="mb-4 text-left text-sm text-[#f8eedb]/85">{visitor.email}</p>
      {visitor.email_verified
        ? <p className="mb-8 text-sm text-[#f8eedb]/80">البريد الإلكتروني موثّق عبر Google.</p>
        : <p className="mb-8 rounded-xl border border-[#ed8b52]/50 bg-[#613c32] p-4 text-sm leading-7">بريدك غير موثّق. تجنّب استخدام هذا الحساب في المعاملات الحساسة حتى تتوفر ميزة التحقق من البريد واستعادة الحساب.</p>}
      <div className="flex flex-wrap items-center gap-3">
        <Link href="/events" className="rounded-xl bg-[#ed8b52] px-5 py-3 font-bold text-[#222222]">تصفّح الفعاليات</Link>
        <form method="post" action="/api/visitor/logout"><button className="rounded-xl border border-[#f8eedb]/40 px-5 py-3 font-bold" type="submit">تسجيل الخروج</button></form>
      </div>
    </section>
  </main>;
}
