import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/features/admin/server/auth";

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

const inputClass = "mt-2 w-full rounded-lg border border-[#69816e] bg-[#222222] px-4 py-3 text-[#f8eedb] outline-offset-2 focus:outline-[#ed8b52]";
const labelClass = "block text-sm font-semibold";

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
        <form method="post" action="/api/admin/events" className="grid gap-6 rounded-2xl border border-[#69816e] bg-[#324b36] p-6 sm:p-8">
          <div className="grid gap-5 sm:grid-cols-2">
            <label className={labelClass}>اسم الفعالية بالعربية *
              <input className={inputClass} name="titleAr" maxLength={160} minLength={2} required placeholder="مثل: حفلة موسيقية في جدة" />
            </label>
            <label className={labelClass}>الاسم بالإنجليزية (اختياري)
              <input className={inputClass} name="titleEn" maxLength={160} dir="ltr" />
            </label>
          </div>
          <label className={labelClass}>المعرّف في الرابط (بالإنجليزية) *
            <input className={inputClass} name="slug" maxLength={120} minLength={3} required dir="ltr" placeholder="jeddah-music-night-2026" pattern="[a-z0-9]+(-[a-z0-9]+)*" />
          </label>
          <label className={labelClass}>وصف الفعالية (اختياري)
            <textarea className={inputClass} rows={4} maxLength={5000} name="descriptionAr" />
          </label>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className={labelClass}>التصنيف *
              <select className={inputClass} name="category" defaultValue="music" required>
                <option value="music">موسيقى</option>
                <option value="theater">مسرح</option>
                <option value="sports">رياضة</option>
                <option value="family">عائلة</option>
                <option value="dining">مطاعم وتجارب</option>
                <option value="entertainment">ترفيه</option>
              </select>
            </label>
            <label className={labelClass}>الموقع داخل جدة *
              <input className={inputClass} name="venue" maxLength={160} required placeholder="اسم المسرح أو القاعة" />
            </label>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className={labelClass}>وقت البداية (بتوقيت السعودية)
              <input className={inputClass} type="datetime-local" name="startAt" />
            </label>
            <label className={labelClass}>وصف الموعد (بديل للتاريخ)
              <input className={inputClass} name="scheduleLabel" maxLength={160} placeholder="قريبًا / موعد يعلن لاحقًا" />
            </label>
          </div>
          <p className="text-xs text-[#f8eedb]/75">يجب إدخال تاريخ البداية أو وصف الموعد على الأقل. المدينة مضبوطة على جدة.</p>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className={labelClass}>السعر يبدأ من (ريال، اختياري)
              <input className={inputClass} name="amountFrom" type="number" min="0" max="999999" step="0.01" />
            </label>
            <label className={labelClass}>منصة التذاكر الرسمية *
              <select className={inputClass} name="ticketProvider" required defaultValue="webook">
                <option value="webook">WeBook</option>
                <option value="ticketmx">TicketMX</option>
                <option value="platinumlist">Platinumlist</option>
                <option value="nofomo">NOFOMO</option>
              </select>
            </label>
          </div>
          <label className={labelClass}>رابط صفحة التذاكر الرسمية للفعالية *
            <input className={inputClass} name="ticketUrl" type="url" required dir="ltr" maxLength={2048} placeholder="https://webook.com/..." />
          </label>
          <label className={labelClass}>رابط صورة الفعالية من Unsplash *
            <input className={inputClass} name="imageUrl" type="url" required dir="ltr" maxLength={2048} placeholder="https://images.unsplash.com/..." />
          </label>
          <div className="flex flex-wrap gap-4">
            <button type="submit" className="rounded-lg bg-[#ed8b52] px-6 py-3 font-bold text-[#222222]">حفظ كمسودة</button>
            <Link href="/admin/events" className="rounded-lg border border-[#69816e] px-6 py-3">إلغاء</Link>
          </div>
        </form>
      </section>
    </main>
  );
}
