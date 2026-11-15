import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { currentVisitor } from "@/features/visitors/server/google-auth";

export const metadata: Metadata = { title: "حسابي", robots: { index: false, follow: false } };
export default async function Account() {
  let visitor;
  try { visitor = await currentVisitor(); } catch { redirect("/login?error=server"); }
  if (!visitor) redirect("/login");
  return <main dir="rtl" className="min-h-[80vh] bg-[#222222] px-5 py-16 text-[#f8eedb]">
    <section className="mx-auto max-w-2xl rounded-3xl border border-[#69816e] bg-[#324b36] p-8 shadow-xl sm:p-11">
      <p className="mb-3 text-xs font-bold tracking-widest text-[#ed8b52]">NAGA HOUSE · ACCOUNT</p>
      <h1 className="mb-4 text-3xl font-extrabold">حسابي</h1>
      <p className="text-lg">مرحبًا، {visitor.display_name}</p>
      <p dir="ltr" className="mt-2 text-left text-sm text-[#f8eedb]/80">{visitor.email}</p>
      <p className="mt-5 text-sm text-[#f8eedb]/75">هذا الحساب مخصص للزوار ولا يمنح صلاحيات إدارة الموقع.</p>
      <div className="mt-9 flex flex-wrap items-center gap-3">
        <Link href="/events" className="rounded-xl bg-[#ed8b52] px-5 py-3 font-bold text-[#222222]">استعراض الفعاليات</Link>
        <form method="post" action="/api/visitor/logout">
          <button type="submit" className="rounded-xl border border-[#f8eedb]/35 px-5 py-3 font-bold">تسجيل الخروج</button>
        </form>
      </div>
    </section>
  </main>;
}
