import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { hasAdminPermission } from "@/features/admin/domain/permissions";
import { getAdminDb, getCurrentAdmin } from "@/features/admin/server/auth";
import { DraftEventForm } from "../../new/DraftEventForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "تعديل بيانات فعالية منشورة", robots: { index: false, follow: false } };

type LiveRow = {
  id: string;
  slug: string;
  status: string;
  updated_at: string;
  title_ar: string;
  title_en: string | null;
  description_ar: string | null;
  image_url: string;
  category: string;
  venue: string;
  start_at: string | null;
  schedule_label: string | null;
  amount_from: number | null;
  ticket_provider: string;
  ticket_url: string;
};

function saudiDateTimeInput(utc: string | null): string {
  if (!utc) return "";
  const date = new Date(utc);
  if (Number.isNaN(date.getTime())) return "";
  return new Date(date.getTime() + 3 * 60 * 60 * 1000).toISOString().slice(0, 16);
}

export default async function EditLiveEvent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  let admin;
  try { admin = await getCurrentAdmin(); }
  catch { redirect("/admin/login?error=server"); }
  if (!admin) redirect("/admin/login");
  if (!hasAdminPermission(admin.role, "events.publish")) notFound();

  const { id } = await params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(id)) notFound();

  const row = await getAdminDb().prepare(`SELECT id, slug, status, updated_at, title_ar, title_en,
    description_ar, image_url, category, venue, start_at, schedule_label, amount_from,
    ticket_provider, ticket_url
    FROM events WHERE id = ? AND status IN ('published', 'sold_out') AND deleted_at IS NULL LIMIT 1`)
    .bind(id).first<LiveRow>();

  if (!row) notFound();

  return (
    <main dir="rtl" className="min-h-[85vh] bg-[#222222] px-5 py-12 text-[#f8eedb]">
      <section className="mx-auto max-w-3xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/admin/events" className="text-sm text-[#ed8b52]">العودة إلى الفعاليات</Link>
          <Link href={`/events/${encodeURIComponent(row.slug)}`} className="rounded-lg border border-[#ed8b52] px-4 py-2 text-sm font-bold">عرض صفحة الزوار</Link>
        </div>
        <h1 className="mb-3 mt-6 text-3xl font-extrabold">تعديل فعالية منشورة</h1>
        <p className="mb-7 leading-8 text-[#f8eedb]/75">
          هذه الفعالية مرئية للزوار الآن. أي تعديل تحفظه سيظهر فورًا، ولهذا يتطلب تأكيد المعرّف.
          لا يمكنك تغيير المعرّف أو حالة الفعالية من هذا النموذج.
        </p>
        <DraftEventForm
          eventId={row.id}
          liveStatus={row.status as "published" | "sold_out"}
          version={row.updated_at}
          initialValues={{
            slug: row.slug,
            titleAr: row.title_ar,
            titleEn: row.title_en ?? "",
            descriptionAr: row.description_ar ?? "",
            imageUrl: row.image_url,
            category: row.category,
            venue: row.venue,
            startAt: saudiDateTimeInput(row.start_at),
            scheduleLabel: row.schedule_label ?? "",
            amountFrom: row.amount_from === null ? "" : String(row.amount_from),
            ticketProvider: row.ticket_provider,
            ticketUrl: row.ticket_url,
          }}
        />
      </section>
    </main>
  );
}
