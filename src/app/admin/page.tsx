import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminDb, getCurrentAdmin } from "@/features/admin/server/auth";


export const metadata: Metadata = { title: "لوحة إدارة NAGA HOUSE", robots: { index: false, follow: false } };

type Stats = { total: number; published: number; drafts: number };

export default async function AdminDashboard() {
  let admin;
  try { admin = await getCurrentAdmin(); } catch { redirect("/admin/login?error=server"); }
  if (!admin) redirect("/admin/login");

  let counts: Stats;
  try {
    const row = await getAdminDb().prepare(`SELECT COUNT(*) AS total,
      COALESCE(SUM(CASE WHEN status = 'published' AND deleted_at IS NULL THEN 1 ELSE 0 END), 0) AS published,
      COALESCE(SUM(CASE WHEN status = 'draft' AND deleted_at IS NULL THEN 1 ELSE 0 END), 0) AS drafts
      FROM events`).first<Stats>();
    counts = row ?? { total: 0, published: 0, drafts: 0 };
  } catch { redirect("/admin/login?error=server"); }

  return (
    <main dir="rtl" className="min-h-[85vh] bg-[#222222] px-5 py-12 text-[#f8eedb]">
      <div className="mx-auto max-w-5xl">
        <div className="mb-9 flex flex-wrap items-center justify-between gap-4">
          <div><p className="mb-2 text-sm text-[#ed8b52]">NAGA HOUSE / ADMIN</p><h1 className="text-3xl font-extrabold">لوحة التحكم</h1></div>
          <form method="post" action="/api/auth/logout"><button type="submit" className="rounded-lg border border-[#ed8b52] px-5 py-3 font-semibold">تسجيل الخروج</button></form>
        </div>
        <p className="mb-8 text-sm text-[#f8eedb]/75">مرحبًا، {admin.display_name || admin.email} · الدور: {admin.role}</p>
        <div className="grid gap-4 sm:grid-cols-3">
          <Stat title="إجمالي الفعاليات" value={counts.total} />
          <Stat title="منشورة" value={counts.published} />
          <Stat title="مسودات" value={counts.drafts} />
        </div>
        <section className="mt-9 rounded-2xl border border-[#69816e] bg-[#324b36] p-7">
          <h2 className="mb-3 text-xl font-bold">إدارة الفعاليات</h2>
          <p className="mb-5 leading-8 text-[#f8eedb]/75">يمكنك الآن إضافة فعاليات كمسودات في D1 المحلية. التحرير والنشر وربط الفعاليات بالصفحات العامة ستكون في المراحل التالية.</p>
          <div className="flex flex-wrap gap-3">
            <Link className="inline-block rounded-lg bg-[#ed8b52] px-5 py-3 font-semibold text-[#222222]" href="/admin/events/new">إضافة مسودة</Link>
            <Link className="inline-block rounded-lg border border-[#69816e] px-5 py-3 font-semibold" href="/admin/events">استعراض الفعاليات</Link>
          </div>
        </section>
      </div>
    </main>
  );
}

function Stat({ title, value }: { title: string; value: number }) {
  return <div className="rounded-xl border border-[#69816e] bg-[#324b36] p-6"><p className="mb-3 text-sm text-[#f8eedb]/80">{title}</p><p className="text-4xl font-extrabold tabular-nums">{value}</p></div>;
}
