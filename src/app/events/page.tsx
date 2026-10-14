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
    <main className="min-h-screen bg-black text-white">
      <section className="mx-auto w-full max-w-[1600px] px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="mb-14 lg:mb-16">
          <p className="mb-5 text-base font-medium uppercase tracking-[0.45em] text-white/55 sm:text-lg">
            JEDDAH EVENTS
          </p>

          <h1 className="text-6xl font-bold tracking-tight sm:text-7xl lg:text-8xl">
            جميع الفعاليات
          </h1>

          <p className="mt-6 max-w-4xl text-lg leading-9 text-white/70 sm:text-xl lg:text-2xl lg:leading-10">
            اكتب اسم المسرحية أو الحفلة أو التجربة، وبتظهر لك النتائج
            مباشرة أثناء الكتابة.
          </p>
        </div>

        <div className="relative z-40 mb-8">
          <EventLiveSearch />
        </div>

        <div className="mb-12 rounded-[32px] border border-white/10 bg-white/[0.035] p-5 sm:p-6">
          <p className="mb-4 text-sm font-medium text-white/55">
            تصفية حسب التصنيف
          </p>

          <div className="flex flex-wrap gap-3">
            <Link
              href={getCategoryHref("")}
              className={`rounded-full border px-6 py-3 text-base font-medium transition ${
                !category
                  ? "border-white bg-white text-black"
                  : "border-white/10 bg-white/5 text-white/70 hover:border-white/25 hover:bg-white/10 hover:text-white"
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
                  className={`rounded-full border px-6 py-3 text-base font-medium transition ${
                    isActive
                      ? "border-white bg-white text-black"
                      : "border-white/10 bg-white/5 text-white/70 hover:border-white/25 hover:bg-white/10 hover:text-white"
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
            <p className="text-base text-white/60">
              عدد النتائج:{" "}
              <span className="font-semibold text-white">
                {events.length}
              </span>
            </p>

            <Link
              href="/events"
              className="rounded-full border border-white/10 px-5 py-2.5 text-base text-white/70 transition hover:border-white/25 hover:bg-white/5 hover:text-white"
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
          <div className="rounded-[36px] border border-white/10 bg-white/[0.035] px-6 py-24 text-center">
            <h2 className="text-3xl font-semibold sm:text-4xl">
              ما لقينا فعاليات مطابقة
            </h2>

            <p className="mt-5 text-lg text-white/65">
              جرّب كلمة بحث مختلفة أو اختر تصنيفًا آخر.
            </p>

            <Link
              href="/events"
              className="mt-8 inline-flex rounded-full bg-white px-7 py-3.5 text-base font-semibold text-black"
            >
              عرض كل الفعاليات
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}