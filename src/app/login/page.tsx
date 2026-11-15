import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentVisitor } from "@/features/visitors/server/auth";

export const metadata: Metadata = { title: "تسجيل الدخول", robots: { index: false, follow: false } };
const messages: Record<string,string> = {
  invalid: "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
  limit: "محاولات كثيرة. حاول بعد 15 دقيقة.",
  google: "تعذر تسجيل الدخول عبر Google. حاول مرة أخرى.",
  conflict: "يوجد حساب بهذا البريد بطريقة دخول أخرى. استخدم طريقة الدخول الأصلية.",
  server: "تعذر الوصول إلى خدمة الحسابات الآن. حاول لاحقًا.",
};

export default async function VisitorLogin({searchParams}: {searchParams: Promise<{error?:string}>}) {
  try { if (await getCurrentVisitor()) redirect("/account"); }
  catch (error) { if (error && typeof error === "object" && "digest" in error) throw error; }
  const {error} = await searchParams;
  const message = typeof error === "string" && Object.hasOwn(messages,error) ? messages[error] : null;
  return <main dir="rtl" className="min-h-[80vh] bg-[#222222] px-4 py-14 text-[#f8eedb]">
    <section className="mx-auto max-w-md rounded-3xl border border-[#69816e] bg-[#324b36] p-7 shadow-xl sm:p-10">
      <p className="mb-3 text-xs font-semibold tracking-widest text-[#ed8b52]">NAGA HOUSE · MEMBERS</p>
      <h1 className="mb-3 text-3xl font-extrabold">تسجيل الدخول</h1>
      <p className="mb-7 text-sm leading-7 text-[#f8eedb]/80">ادخل لحسابك لمتابعة تجربتك في NAGA HOUSE.</p>
      {message && <p role="alert" className="mb-5 rounded-xl border border-[#ed8b52] bg-[#613c32] p-4 text-sm">{message}</p>}
      <a href="/api/visitor/google/start" className="block rounded-xl bg-[#ed8b52] px-5 py-3.5 text-center font-bold text-[#222222] hover:bg-[#f4aa80]">المتابعة باستخدام Google</a>
      <div className="my-6 flex items-center gap-3 text-sm text-[#f8eedb]/70"><span className="h-px flex-1 bg-[#f8eedb]/20"/><span>أو بالبريد الإلكتروني</span><span className="h-px flex-1 bg-[#f8eedb]/20"/></div>
      <form method="post" action="/api/visitor/login" className="grid gap-4">
        <label className="text-sm font-semibold">البريد الإلكتروني
          <input name="email" type="email" autoComplete="email" maxLength={254} required dir="ltr" className="mt-2 w-full rounded-xl border border-[#69816e] bg-[#222222] px-4 py-3 text-[#f8eedb]" placeholder="name@example.com" />
        </label>
        <label className="text-sm font-semibold">كلمة المرور
          <input name="password" type="password" autoComplete="current-password" minLength={15} maxLength={128} required dir="ltr" className="mt-2 w-full rounded-xl border border-[#69816e] bg-[#222222] px-4 py-3 text-[#f8eedb]" />
        </label>
        <button type="submit" className="rounded-xl bg-[#f8eedb] px-5 py-3 font-bold text-[#222222] hover:bg-white">تسجيل الدخول</button>
      </form>
      <p className="mt-6 text-center text-sm">ما عندك حساب؟ <Link href="/signup" className="font-bold text-[#ed8b52] underline underline-offset-4">إنشاء حساب جديد</Link></p>
      <p className="mt-6 border-t border-[#f8eedb]/20 pt-5 text-center text-xs text-[#f8eedb]/70">تدير الفعاليات؟ <Link href="/admin/login" className="underline underline-offset-4">دخول الإدارة</Link></p>
    </section>
  </main>;
}
