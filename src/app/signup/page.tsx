import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentVisitor } from "@/features/visitors/server/auth";

export const metadata: Metadata = { title: "إنشاء حساب", robots: { index: false, follow: false } };
export default async function VisitorSignup({searchParams}: {searchParams: Promise<{error?:string}>}) {
  try { if (await getCurrentVisitor()) redirect("/account"); }
  catch (error) { if (error && typeof error === "object" && "digest" in error) throw error; }
  const {error} = await searchParams;
  const message = error === "limit" ? "محاولات كثيرة. حاول بعد 15 دقيقة." :
    error === "server" ? "تعذر إنشاء الحساب الآن. تحقق من جاهزية خدمة الحسابات." :
    error === "invalid" ? "تعذر إنشاء الحساب. راجع الاسم والبريد وكلمة المرور أو جرّب تسجيل الدخول." : null;
  return <main dir="rtl" className="min-h-[80vh] bg-[#222222] px-4 py-14 text-[#f8eedb]">
    <section className="mx-auto max-w-md rounded-3xl border border-[#69816e] bg-[#324b36] p-7 shadow-xl sm:p-10">
      <p className="mb-3 text-xs font-semibold tracking-widest text-[#ed8b52]">NAGA HOUSE · MEMBERS</p>
      <h1 className="mb-3 text-3xl font-extrabold">إنشاء حساب</h1>
      <p className="mb-7 text-sm leading-7 text-[#f8eedb]/80">انضم إلى NAGA HOUSE وسجّل دخولك بالطريقة التي تناسبك.</p>
      {message && <p role="alert" className="mb-5 rounded-xl border border-[#ed8b52] bg-[#613c32] p-4 text-sm">{message}</p>}
      <a href="/api/visitor/google/start" className="block rounded-xl bg-[#ed8b52] px-5 py-3.5 text-center font-bold text-[#222222] hover:bg-[#f4aa80]">إنشاء حساب باستخدام Google</a>
      <div className="my-6 flex items-center gap-3 text-sm text-[#f8eedb]/70"><span className="h-px flex-1 bg-[#f8eedb]/20"/><span>أو بالبريد الإلكتروني</span><span className="h-px flex-1 bg-[#f8eedb]/20"/></div>
      <form method="post" action="/api/visitor/register" className="grid gap-4">
        <label className="text-sm font-semibold">الاسم
          <input name="name" autoComplete="name" minLength={2} maxLength={80} required className="mt-2 w-full rounded-xl border border-[#69816e] bg-[#222222] px-4 py-3 text-[#f8eedb]" />
        </label>
        <label className="text-sm font-semibold">البريد الإلكتروني
          <input name="email" type="email" autoComplete="email" maxLength={254} required dir="ltr" placeholder="name@example.com" className="mt-2 w-full rounded-xl border border-[#69816e] bg-[#222222] px-4 py-3 text-[#f8eedb]" />
        </label>
        <label className="text-sm font-semibold">كلمة المرور
          <input name="password" type="password" autoComplete="new-password" minLength={15} maxLength={128} required dir="ltr" className="mt-2 w-full rounded-xl border border-[#69816e] bg-[#222222] px-4 py-3 text-[#f8eedb]" />
          <span className="mt-1 block text-xs font-normal text-[#f8eedb]/70">15 حرفًا على الأقل. اختر عبارة مرور طويلة وفريدة.</span>
        </label>
        <label className="text-sm font-semibold">تأكيد كلمة المرور
          <input name="confirmPassword" type="password" autoComplete="new-password" minLength={15} maxLength={128} required dir="ltr" className="mt-2 w-full rounded-xl border border-[#69816e] bg-[#222222] px-4 py-3 text-[#f8eedb]" />
        </label>
        <p className="text-xs leading-6 text-[#f8eedb]/70">الحساب بالبريد اليدوي لا يثبت ملكية البريد بعد؛ لن تُفعّل المزايا التي تتطلب بريدًا موثقًا قبل إضافة التحقق.</p>
        <button type="submit" className="rounded-xl bg-[#f8eedb] px-5 py-3 font-bold text-[#222222] hover:bg-white">إنشاء الحساب</button>
      </form>
      <p className="mt-6 text-center text-sm">لديك حساب؟ <Link href="/login" className="font-bold text-[#ed8b52] underline underline-offset-4">تسجيل الدخول</Link></p>
    </section>
  </main>;
}
