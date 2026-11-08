import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { hasAdminPermission } from "@/features/admin/domain/permissions";
import { getAdminDb, getCurrentAdmin } from "@/features/admin/server/auth";
import { EventCard } from "@/features/events/components/EventCard";
import { EventDetailsView } from "@/features/events/components/EventDetailsView";
import type { Event, TicketProvider } from "@/features/events/domain";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "معاينة خاصة لمسودة فعالية", robots: { index: false, follow: false } };

type PreviewRow = {
  id: string; slug: string; title_ar: string; title_en: string | null;
  description_ar: string | null; description_en: string | null;
  image_url: string; cover_image_url: string | null;
  category: string; city: string; venue: string;
  latitude: number | null; longitude: number | null;
  start_at: string | null; end_at: string | null; schedule_label: string | null;
  amount_from: number | null; ticket_provider: TicketProvider; ticket_url: string;
  featured: number; created_at: string; updated_at: string;
};

export default async function PreviewAdminDraft({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  let admin;
  try { admin = await getCurrentAdmin(); }
  catch { redirect("/admin/login?error=server"); }
  if (!admin) redirect("/admin/login");
  if (!hasAdminPermission(admin.role, "events.view")) notFound();

  const { id } = await params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(id)) notFound();

  // Never use public D1 reads for preview. Only authenticated admins may view drafts.
  const row = await getAdminDb().prepare(`SELECT id, slug, title_ar, title_en,
    description_ar, description_en, image_url, cover_image_url, category, city, venue,
    latitude, longitude, start_at, end_at, schedule_label, amount_from,
    ticket_provider, ticket_url, featured, created_at, updated_at
    FROM events WHERE id = ? AND status = 'draft' AND deleted_at IS NULL LIMIT 1`)
    .bind(id).first<PreviewRow>();

  if (!row) notFound();

  const event: Event = {
    id: row.id,
    slug: row.slug,
    titleAr: row.title_ar,
    titleEn: row.title_en ?? undefined,
    descriptionAr: row.description_ar ?? undefined,
    descriptionEn: row.description_en ?? undefined,
    imageUrl: row.image_url,
    coverImageUrl: row.cover_image_url ?? undefined,
    category: row.category,
    location: {
      city: row.city, venue: row.venue,
      latitude: row.latitude ?? undefined, longitude: row.longitude ?? undefined,
    },
    startAt: row.start_at ?? undefined,
    endAt: row.end_at ?? undefined,
    scheduleLabel: row.schedule_label ?? undefined,
    price: { amountFrom: row.amount_from ?? undefined, currency: "SAR" },
    ticketProvider: row.ticket_provider,
    ticketUrl: row.ticket_url,
    featured: row.featured === 1,
    status: "draft",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };

  return (
    <>
      <section dir="rtl" className="border-b border-[#ed8b52] bg-[#222222] px-5 py-5 text-[#f8eedb]">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-4">
          <div>
            <strong className="block text-lg">معاينة خاصة — غير منشورة</strong>
            <p className="mt-1 text-sm text-[#f8eedb]/75">هذه الصفحة متاحة للمسؤولين فقط؛ الحجز معطل أثناء المعاينة.</p>
          </div>
          <Link href={`/admin/events/${encodeURIComponent(id)}/edit`} className="rounded-lg border border-[#ed8b52] px-5 py-2 font-bold">
            العودة إلى تعديل المسودة
          </Link>
        </div>
      </section>
      <section
        dir="rtl"
        aria-labelledby="draft-card-preview-heading"
        className="bg-brand-cream px-5 py-12 text-brand-ink sm:py-16"
      >
        <div className="mx-auto w-full max-w-[1600px]">
          <h2
            id="draft-card-preview-heading"
            className="text-3xl font-extrabold text-brand-green sm:text-4xl"
          >
            معاينة بطاقة الفعالية
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-8 text-brand-ink/75">
            هذا شكل البطاقة المتوقع عند عرض الفعالية للزوار بعد النشر. المسودة غير منشورة، والرابط العام غير مفعّل.
          </p>
          <div className="mt-8 w-full max-w-[420px]">
            <EventCard event={event} eager preview />
          </div>
        </div>
      </section>
      <EventDetailsView event={event} preview />
    </>
  );
}
