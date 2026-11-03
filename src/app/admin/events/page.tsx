import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { hasAdminPermission } from "@/features/admin/domain/permissions";
import { getAdminDb, getCurrentAdmin } from "@/features/admin/server/auth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "فعاليات الإدارة",
  robots: { index: false, follow: false },
};

type AdminEvent = {
  id: string;
  slug: string;
  title_ar: string;
  status: string;
  city: string;
  start_at: string | null;
};

const publishErrors: Record<string, string> = {
  invalid: "تعذر النشر: تأكد من مطابقة المعرّف وصحة بيانات الفعالية والرابط الرسمي.",
  conflict: "لم تُنشر الفعالية: تغيرت حالتها أو سبق نشرها. حدث الصفحة.",
  not_found: "تعذر العثور على الفعالية. حدث الصفحة ثم حاول مجددًا.",
};

export default async function AdminEvents({
  searchParams,
}: {
  searchParams: Promise<{ created?: string; edited?: string; edit_error?: string; published?: string; publish_error?: string }>;
}) {
  let admin;
  try { admin = await getCurrentAdmin(); }
  catch { redirect("/admin/login?error=server"); }
  if (!admin) redirect("/admin/login");

  let events: AdminEvent[];
  try {
    const result = await getAdminDb().prepare(`SELECT id, slug, title_ar, status, city, start_at
      FROM events WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT 100`)
      .all<AdminEvent>();
    events = result.results;
  } catch {
    redirect("/admin/login?error=server");
  }

  const { created, edited, edit_error: editError, published, publish_error: publishError } = await searchParams;
  const canPublish = hasAdminPermission(admin.role, "events.publish");
  const canEdit = hasAdminPermission(admin.role, "events.draft.edit");

  return (
    <main dir="rtl" className="min-h-[85vh] bg-[#222222] px-5 py-12 text-[#f8eedb]">
      <section className="mx-auto max-w-5xl">
        <Link href="/admin" className="text-sm text-[#ed8b52]">العودة للوحة التحكم</Link>
        <div className="my-6 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl font-extrabold">فعاليات NAGA HOUSE</h1>
          <Link href="/admin/events/new" className="rounded-lg bg-[#ed8b52] px-5 py-3 font-bold text-[#222222]">
            إضافة مسودة جديدة
          </Link>
        </div>
        <p className="mb-8 text-sm leading-7 text-[#f8eedb]/70">
          تُحفظ الفعاليات في D1، ولا تظهر للزوار إلا عندما تكون منشورة.
          يتطلب النشر تأكيد المعرّف؛ لا تنشر مسودة الاختبار الداخلي.
        </p>
        {created === "1" && (
          <div role="status" className="mb-6 rounded-lg border border-[#69816e] bg-[#324b36] p-4">
            تم حفظ المسودة في D1 بنجاح.
          </div>
        )}
        {edited === "1" && (
          <div role="status" className="mb-6 rounded-lg border border-[#69816e] bg-[#324b36] p-4">تم حفظ تعديل المسودة في D1 بنجاح.</div>
        )}
        {editError && (
          <div role="alert" className="mb-6 rounded-lg border border-[#ed8b52] bg-[#613c32] p-4">تعذر تعديل المسودة. حدّث الصفحة وتأكد من صلاحية البيانات.</div>
        )}
        {published === "1" && (
          <div role="status" className="mb-6 rounded-lg border border-[#69816e] bg-[#324b36] p-4">
            تم نشر الفعالية بنجاح، وأصبحت متاحة في صفحات الزوار.
          </div>
        )}
        {publishError && Object.hasOwn(publishErrors, publishError) && (
          <div role="alert" className="mb-6 rounded-lg border border-[#ed8b52] bg-[#613c32] p-4">
            {publishErrors[publishError]}
          </div>
        )}

        {events.length === 0 ? (
          <div className="rounded-2xl border border-[#69816e] bg-[#324b36] p-10 text-center">
            لا توجد فعاليات في D1 حتى الآن. استخدم «إضافة مسودة جديدة» للبدء.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-[#69816e]">
            <table className="w-full min-w-[760px] text-right text-sm">
              <thead className="bg-[#324b36]">
                <tr>
                  <th className="p-4">الفعالية</th>
                  <th className="p-4">المدينة</th>
                  <th className="p-4">الحالة</th>
                  <th className="p-4">البداية</th>
                  {canPublish && <th className="p-4">النشر</th>}
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr className="border-t border-[#69816e]/50" key={event.id}>
                    <td className="p-4">
                      <span>{event.title_ar}</span>
                      {event.status === "draft" && (
                        <div className="mt-2 flex flex-wrap gap-3 text-xs font-bold text-[#ed8b52]">
                          {canEdit && <Link href={`/admin/events/${encodeURIComponent(event.id)}/edit`}>تعديل المسودة</Link>}
                          <Link href={`/admin/events/${encodeURIComponent(event.id)}/preview`}>معاينة خاصة</Link>
                        </div>
                      )}
                    </td>
                    <td className="p-4">{event.city}</td>
                    <td className="p-4">{event.status === "draft" ? "مسودة" : event.status === "published" ? "منشورة" : event.status}</td>
                    <td className="p-4">{event.start_at || "غير محدد"}</td>
                    {canPublish && (
                      <td className="p-4">
                        {event.status === "draft" ? (
                          <form method="post" action={`/api/admin/events/${encodeURIComponent(event.id)}/publish`} className="flex min-w-[220px] flex-col gap-2">
                            <label className="text-xs text-[#f8eedb]/85" htmlFor={`confirm-${event.id}`}>
                              اكتب المعرّف لتأكيد النشر: <span dir="ltr" className="font-bold">{event.slug}</span>
                            </label>
                            <input
                              id={`confirm-${event.id}`}
                              name="confirmSlug"
                              type="text"
                              dir="ltr"
                              autoComplete="off"
                              required
                              maxLength={120}
                              pattern="[a-z0-9]+(-[a-z0-9]+)*"
                              className="rounded-lg border border-[#69816e] bg-[#222222] p-2 text-[#f8eedb]"
                            />
                            <button type="submit" className="rounded-lg bg-[#ed8b52] px-4 py-2 font-bold text-[#222222]">
                              نشر الفعالية
                            </button>
                          </form>
                        ) : "—"}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
