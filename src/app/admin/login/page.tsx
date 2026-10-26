import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/features/admin/server/auth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "تسجيل دخول الإدارة", robots: { index: false, follow: false } };

const messages: Record<string, string> = {
  access: "هذا الحساب غير مصرح له بدخول إدارة NAGA HOUSE.",
  google: "تعذر إكمال تسجيل الدخول من Google. حاول مرة أخرى.",
  config: "إعدادات الدخول غير مكتملة على الخادم. راجع إعدادات OAuth.",
  server: "تعذر الاتصال بنظام الإدارة. تأكد من تهيئة قاعدة D1 محليًا.",
};

export default async function AdminLogin({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  let current;
  try { current = await getCurrentAdmin(); }
  catch { /* Fail closed; an unauthenticated user never sees admin content. */ }
  if (current) redirect("/admin");
  const { error } = await searchParams;
  return (
    <main dir="rtl" className="min-h-[82vh] bg-[#222222] px-5 py-16 text-[#f8eedb]">
      <section className="mx-auto max-w-lg rounded-3xl border border-[#69816e] bg-[#324b36] p-8 shadow-xl sm:p-11">
        <div className="mb-7 inline-flex rounded-full border border-[#ed8b52]/50 px-4 py-2 text-xs tracking-wider">NAGA HOUSE · ADMIN</div>
        <h1 className="mb-4 text-3xl font-extrabold">دخول لوحة الإدارة</h1>
        <p className="mb-8 text-sm leading-8 text-[#f8eedb]/85">تسجيل الدخول متاح لحسابات الإدارة المعتمدة فقط. لن تمنحك إضافة حساب Google صلاحية الإدارة تلقائيًا.</p>
        {error && messages[error] && <p role="alert" className="mb-6 rounded-xl border border-[#ed8b52] bg-[#613c32] p-4 text-sm">{messages[error]}</p>}
        <a href="/api/auth/google/start" className="block rounded-xl bg-[#ed8b52] px-6 py-4 text-center font-bold text-[#222222] transition hover:bg-[#f4aa80]">المتابعة باستخدام Google</a>
        <Link href="/" className="mt-7 block text-center text-sm underline underline-offset-4">العودة إلى الصفحة الرئيسية</Link>
      </section>
    </main>
  );
}
