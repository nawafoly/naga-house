import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/features/admin/server/auth";
import { DraftEventForm } from "./DraftEventForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "إضافة مسودة فعالية",
  robots: { index: false, follow: false },
};

const messages: Record<string, string> = {
  invalid: "البيانات غير صالحة. راجع الروابط والتاريخ والحقول المطلوبة. تأكد أن رابط التذاكر يخص منصة موثوقة.",
  duplicate: "هذا المعرّف مستخدم بالفعل. اختر رابطًا مختصرًا مختلفًا للفعالية.",
  server: "لم يتم حفظ المسودة. تحقق من اتصال D1 المحلية وحاول مرة أخرى.",
};

export default async function NewAdminEvent({
  searchParams,
}: { searchParams: Promise<{ error?: string }> }) {
  let admin;
  try { admin = await getCurrentAdmin(); } catch { redirect("/admin/login?error=server"); }
  if (!admin) redirect("/admin/login");
  const { error } = await searchParams;

  return (
    <main dir="rtl" className="min-h-[85vh] bg-[#222222] px-5 py-12 text-[#f8eedb]">
      <section className="mx-auto max-w-3xl">
        <Link href="/admin/events" className="text-sm text-[#ed8b52]">العودة إلى قائمة الفعاليات</Link>
        <h1 className="mb-3 mt-6 text-3xl font-extrabold">إضافة فعالية كمسودة</h1>
        <p className="mb-7 leading-8 text-[#f8eedb]/75">ستحفظ البيانات في D1 المحلية فقط. لن تُنشر الفعالية أو تظهر للزوار في هذه المرحلة.</p>
        {error && messages[error] && <p role="alert" className="mb-7 rounded-xl border border-[#ed8b52] bg-[#613c32] p-4">{messages[error]}</p>}
        <DraftEventForm />
      </section>
    </main>
  );
}
