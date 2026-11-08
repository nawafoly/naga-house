import Link from "next/link";

import {
  EventCard,
  EventLiveSearch,
} from "@/features/events/components";
import { getEventCategoryLabel } from "@/features/events/domain";
import { getPublicEventService } from "@/features/events/server/public-event-service";

export const instant = false;
export const dynamic = "force-dynamic";


interface EventsPageProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
  }>;
}

export default async function EventsPage({
  searchParams,
}: EventsPageProps) {
  const eventService = getPublicEventService();
  const params = await searchParams;

  const search = params.search?.trim() ?? "";
  const category = params.category?.trim() ?? "";

  const [events, categories] = await Promise.all([
    eventService.searchPublishedEvents({
      search: search || undefined,
      category: category || undefined,
      city: "Jeddah",
    }),
    eventService.getPublishedCategories(),
  ]);
  const hasPublishedEvents = categories.length > 0;
  const hasActiveFilters = Boolean(search || category);

  function getCategoryHref(nextCategory: string) {
    const query = new URLSearchParams();

    if (search) {
      query.set("search", search);
    }

    if (nextCategory) {
      query.set("category", nextCategory);
    }

    const queryString = query.toString();

    return queryString
      ? `/events?${queryString}`
      : "/events";
  }

  return (
    <main className="min-h-screen bg-brand-ink text-brand-cream">
      <section className="naga-hero relative isolate z-10 overflow-visible border-b border-brand-cream/15 text-brand-cream">
        <div
          aria-hidden="true"
          className="naga-hero-lines pointer-events-none absolute inset-0 -z-10"
        />
        <div className="relative mx-auto w-full max-w-[1600px] px-4 pb-16 pt-14 sm:px-6 lg:px-8 lg:pb-20 lg:pt-20">
          <p className="naga-latin text-sm font-bold tracking-[0.36em] text-brand-orange sm:text-base">
            JEDDAH EVENTS
          </p>
          <div className="mt-5 lg:flex lg:items-end lg:justify-between lg:gap-12">
            <div>
              <h1 className="text-5xl font-extrabold leading-tight sm:text-7xl lg:text-8xl">
                جميع <span className="text-brand-orange">الفعاليات</span>
              </h1>
              <p className="mt-5 max-w-3xl text-lg leading-9 text-brand-cream/85 sm:text-xl">
                اكتشف تجارب جدة في مكان واحد، واختر الفعالية اللي تناسبك.
              </p>
            </div>
            <Link
              href="/categories"
              className="mt-7 inline-flex w-fit items-center gap-3 rounded-full border border-brand-cream/30 bg-brand-cream/10 px-6 py-3.5 font-bold text-brand-cream transition hover:bg-brand-cream/20 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-orange lg:mt-0"
            >
              تصفح التصنيفات <span aria-hidden="true">←</span>
            </Link>
          </div>
          <div className="relative z-40 mt-10 max-w-4xl">
            <EventLiveSearch
              key={`${search}:${category}`}
              initialQuery={search}
              category={category}
            />
          </div>
        </div>
      </section>

      <section className="naga-public-content px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="mx-auto w-full max-w-[1600px]">
          <div className="mb-11 rounded-[28px] border border-brand-green/15 bg-[#fffaf0] p-5 shadow-[0_10px_30px_rgba(34,34,34,0.06)] sm:p-6">
            <p className="mb-4 text-sm font-bold text-brand-green">
              تصفية حسب التصنيف
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href={getCategoryHref("")}
                aria-current={!category ? "page" : undefined}
                className={`rounded-full border px-5 py-2.5 text-sm font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-copper sm:text-base ${
                  !category
                    ? "border-brand-green bg-brand-green text-brand-cream"
                    : "border-brand-green/20 bg-brand-cream text-brand-green hover:border-brand-copper hover:bg-brand-orange/15"
                }`}
              >
                الكل
              </Link>
              {categories.map((item) => {
                const isActive = category === item;
                return (
                  <Link
                    key={item}
                    href={getCategoryHref(item)}
                    aria-current={isActive ? "page" : undefined}
                    className={`rounded-full border px-5 py-2.5 text-sm font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-copper sm:text-base ${
                      isActive
                        ? "border-brand-green bg-brand-green text-brand-cream"
                        : "border-brand-green/20 bg-brand-cream text-brand-green hover:border-brand-copper hover:bg-brand-orange/15"
                    }`}
                  >
                    {getEventCategoryLabel(item)}
                  </Link>
                );
              })}
            </div>
          </div>

          {hasActiveFilters && (
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
              <p className="font-medium text-brand-cream/80">
                عدد النتائج: <span className="font-extrabold text-brand-orange">{events.length}</span>
              </p>
              <Link
                href="/events"
                className="rounded-full border border-brand-orange/50 px-5 py-2.5 font-bold text-brand-orange transition hover:bg-brand-orange/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-orange"
              >
                مسح الفلاتر
              </Link>
            </div>
          )}

          {events.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-8">
              {events.map((event, index) => (
                <EventCard
                  key={event.id}
                  event={event}
                  eager={index < 3}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-[30px] border border-brand-green/15 bg-[#fffaf0] px-6 py-20 text-center">
              <h2 className="text-3xl font-extrabold text-brand-green sm:text-4xl">
                {!hasPublishedEvents
                  ? "فعاليات جدة قريبًا"
                  : hasActiveFilters
                    ? "ما لقينا فعاليات مطابقة"
                    : "لا توجد فعاليات في جدة حاليًا"}
              </h2>
              <p className="mt-5 text-lg text-brand-ink/70">
                {!hasPublishedEvents
                  ? "نعمل على إضافة فعاليات جديدة. ستظهر هنا فور نشرها رسميًا."
                  : hasActiveFilters
                    ? "جرّب كلمة بحث مختلفة أو اختر تصنيفًا آخر."
                    : "ستظهر هنا الفعاليات الجديدة بمجرد توفرها."}
              </p>
              <Link
                href={hasActiveFilters && hasPublishedEvents ? "/events" : "/"}
                className="mt-8 inline-flex rounded-full bg-brand-orange px-7 py-3.5 font-bold text-brand-ink transition hover:bg-brand-green hover:text-brand-cream"
              >
                {hasActiveFilters && hasPublishedEvents ? "مسح الفلاتر" : "العودة للرئيسية"}
              </Link>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
