import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { currentVisitor } from "@/features/visitors/server/google-auth";

export const metadata: Metadata = { title: "تسجيل الدخول", robots: { index: false, follow: false } };

const messages: Record<string, string> = {
  google: "تعذر تسجيل الدخول بواسطة Google. حاول مجددًا.",
  access: "لا يمكن فتح هذا الحساب حاليًا. تواصل مع الإدارة إن استمرت المشكلة.",
  server: "خدمة حسابات الزوار غير جاهزة بعد. حاول لاحقًا.",
};

export default async function VisitorLogin({ searchParams }: { searchParams: Promise<{error?:string}> }) {
  let visitor = null;
  try { visitor = await currentVisitor(); } catch { /* No access is granted on D1 errors. */ }
  if (visitor) redirect("/account");
  const { error } = await searchParams;
  const message = typeof error === "string" && Object.hasOwn(messages, error) ? messages[error] : null;
  return <main dir="rtl" className="min-h-[80vh] bg-[#222222] px-5 py-16 text-[#f8eedb]">
    <section className="mx-auto max-w-lg rounded-3xl border border-[#69816e] bg-[#324b36] p-8 shadow-xl sm:p-11">
      <p className="mb-4 text-xs font-bold tracking-widest text-[#ed8b52]">NAGA HOUSE · MEMBERS</p>
      <h1 className="mb-3 text-3xl font-extrabold">تسجيل الدخول</h1>
      <p className="mb-8 text-sm leading-8 text-[#f8eedb]/80">ادخل لحسابك أو أنشئ حسابًا جديدًا باستخدام Google.</p>
      {message && <p role="alert" className="mb-6 rounded-xl border border-[#ed8b52] bg-[#613c32] p-4 text-sm">{message}</p>}
      <a href="/api/visitor/google/start" className="block rounded-xl bg-[#ed8b52] px-6 py-4 text-center font-bold text-[#222222] transition hover:bg-[#f4aa80]">
        المتابعة باستخدام Google
      </a>
      <div className="my-7 flex items-center gap-4 text-sm text-[#f8eedb]/75"><span className="h-px flex-1 bg-[#f8eedb]/20"/><span>أو بالبريد الإلكتروني</span><span className="h-px flex-1 bg-[#f8eedb]/20"/></div>
      <div className="rounded-xl border border-dashed border-[#f8eedb]/30 bg-[#222222]/45 p-5 text-center">
        <p className="font-semibold">الدخول بالبريد وكلمة المرور</p>
        <p className="mt-2 text-sm leading-7 text-[#f8eedb]/75">قيد التجهيز. سيُفعّل بعد إضافة التحقق من البريد واستعادة كلمة المرور.</p>
      </div>
      <p className="mt-7 text-center text-sm">ليس لديك حساب؟ <Link href="/signup" className="font-bold text-[#ed8b52] underline underline-offset-4">إنشاء حساب</Link></p>
      <p className="mt-6 border-t border-[#f8eedb]/20 pt-6 text-center text-sm text-[#f8eedb]/75">حساب إدارة؟ <Link href="/admin/login" className="underline underline-offset-4">دخول لوحة الإدارة</Link></p>
    </section>
  </main>;
}
