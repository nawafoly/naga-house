import Link from "next/link";

import {
  EventCard,
  EventLiveSearch,
} from "@/features/events/components";
import { CuratedEventRepository } from "@/features/events/data";
import { getEventCategoryLabel } from "@/features/events/domain";
import { EventService } from "@/features/events/services";

export const instant = false;

const eventService = new EventService(new CuratedEventRepository());

interface EventsPageProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
  }>;
}

export default async function EventsPage({
  searchParams,
}: EventsPageProps) {
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
    <main className="min-h-screen bg-brand-cream text-brand-ink">
      <section className="relative isolate overflow-visible bg-brand-green text-brand-cream">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_85%,rgba(237,139,82,0.2),transparent_35%),radial-gradient(circle_at_85%_10%,rgba(34,93,126,0.32),transparent_34%)]"
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
            <EventLiveSearch />
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1600px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
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

        {(search || category) && (
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <p className="font-medium text-brand-ink/75">
              عدد النتائج: <span className="font-extrabold text-brand-green">{events.length}</span>
            </p>
            <Link
              href="/events"
              className="rounded-full border border-brand-copper/30 px-5 py-2.5 font-bold text-brand-copper transition hover:bg-brand-orange/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-copper"
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
              ما لقينا فعاليات مطابقة
            </h2>
            <p className="mt-5 text-lg text-brand-ink/70">
              جرّب كلمة بحث مختلفة أو اختر تصنيفًا آخر.
            </p>
            <Link
              href="/events"
              className="mt-8 inline-flex rounded-full bg-brand-orange px-7 py-3.5 font-bold text-brand-ink transition hover:bg-brand-green hover:text-brand-cream"
            >
              عرض كل الفعاليات
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
