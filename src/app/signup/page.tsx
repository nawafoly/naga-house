import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { currentVisitor } from "@/features/visitors/server/google-auth";

export const metadata: Metadata = { title: "إنشاء حساب", robots: { index: false, follow: false } };
export default async function Signup() {
  let visitor = null;
  try { visitor = await currentVisitor(); } catch { /* Fail closed */ }
  if (visitor) redirect("/account");
  return <main dir="rtl" className="min-h-[80vh] bg-[#222222] px-5 py-16 text-[#f8eedb]">
    <section className="mx-auto max-w-lg rounded-3xl border border-[#69816e] bg-[#324b36] p-8 shadow-xl sm:p-11">
      <p className="mb-3 text-xs font-bold tracking-widest text-[#ed8b52]">NAGA HOUSE · MEMBERS</p>
      <h1 className="mb-3 text-3xl font-extrabold">إنشاء حساب</h1>
      <p className="mb-8 text-sm leading-8 text-[#f8eedb]/80">انضم إلى NAGA HOUSE بخطوة واحدة، بدون كلمة مرور جديدة.</p>
      <a href="/api/visitor/google/start" className="block rounded-xl bg-[#ed8b52] px-6 py-4 text-center font-bold text-[#222222] hover:bg-[#f4aa80]">إنشاء حساب باستخدام Google</a>
      <p className="mt-6 text-center text-xs leading-7 text-[#f8eedb]/70">إنشاء الحساب بالبريد وكلمة المرور سيُضاف بعد اكتمال التحقق والاستعادة.</p>
      <p className="mt-7 text-center text-sm">لديك حساب؟ <Link href="/login" className="font-bold text-[#ed8b52] underline underline-offset-4">تسجيل الدخول</Link></p>
    </section>
  </main>;
}
