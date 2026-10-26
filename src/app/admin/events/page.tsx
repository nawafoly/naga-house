import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminDb, getCurrentAdmin } from "@/features/admin/server/auth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "فعاليات الإدارة", robots: { index: false, follow: false } };

type AdminEvent = { id: string; title_ar: string; status: string; city: string; start_at: string | null };

export default async function AdminEvents({
  searchParams,
}: { searchParams: Promise<{ created?: string }> }) {
  let admin;
  try { admin = await getCurrentAdmin(); } catch { redirect("/admin/login?error=server"); }
  if (!admin) redirect("/admin/login");

  let events: AdminEvent[];
  try {
    const result = await getAdminDb().prepare(`SELECT id, title_ar, status, city, start_at FROM events
      WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT 100`).all<AdminEvent>();
    events = result.results;
  } catch { redirect("/admin/login?error=server"); }
  const { created } = await searchParams;

  return (
    <main dir="rtl" className="min-h-[85vh] bg-[#222222] px-5 py-12 text-[#f8eedb]">
      <section className="mx-auto max-w-5xl">
        <Link href="/admin" className="text-sm text-[#ed8b52]">العودة للوحة التحكم</Link>
        <div className="my-6 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl font-extrabold">فعاليات NAGA HOUSE</h1>
          <Link href="/admin/events/new" className="rounded-lg bg-[#ed8b52] px-5 py-3 font-bold text-[#222222]">إضافة مسودة جديدة</Link>
        </div>
        <p className="mb-8 text-sm text-[#f8eedb]/70">هذه البيانات محفوظة في D1 منفصلة عن كتالوج الموقع الحالي. لا يوجد نشر تلقائي للزوار.</p>
        {created === "1" && <div role="status" className="mb-6 rounded-lg border border-[#69816e] bg-[#324b36] p-4">تم حفظ المسودة في D1 بنجاح.</div>}
        {events.length === 0 ? (
          <div className="rounded-2xl border border-[#69816e] bg-[#324b36] p-10 text-center">لا توجد مسودات في D1 حتى الآن. استخدم «إضافة مسودة جديدة» للبدء.</div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-[#69816e]">
            <table className="w-full min-w-[560px] text-right text-sm">
              <thead className="bg-[#324b36]"><tr><th className="p-4">الفعالية</th><th className="p-4">المدينة</th><th className="p-4">الحالة</th><th className="p-4">البداية</th></tr></thead>
              <tbody>{events.map((event) => <tr className="border-t border-[#69816e]/50" key={event.id}>
                <td className="p-4">{event.title_ar}</td><td className="p-4">{event.city}</td><td className="p-4">{event.status === "draft" ? "مسودة" : event.status}</td><td className="p-4">{event.start_at || "غير محدد"}</td>
              </tr>)}</tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
