import Link from "next/link";

import { EventCard } from "@/features/events/components";
import { MockEventRepository } from "@/features/events/data";
import { getEventCategoryLabel } from "@/features/events/domain";
import { EventService } from "@/features/events/services";

export const instant = false;

const eventService = new EventService(new MockEventRepository());

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

    return queryString ? `/events?${queryString}` : "/events";
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="mx-auto w-full max-w-[1600px] px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="mb-14 lg:mb-16">
          <p className="mb-5 text-base font-medium uppercase tracking-[0.45em] text-white/40 sm:text-lg">
            JEDDAH EVENTS
          </p>

          <h1 className="text-6xl font-bold tracking-tight sm:text-7xl lg:text-8xl">
            جميع الفعاليات
          </h1>

          <p className="mt-6 max-w-4xl text-lg leading-9 text-white/55 sm:text-xl lg:text-2xl lg:leading-10">
            اكتشف أفضل الفعاليات والتجارب المختارة في جدة، واستعرض التفاصيل
            واحجز مباشرة من خلال منصة التذاكر الرسمية.
          </p>
        </div>

        <div className="mb-12 rounded-[36px] border border-white/10 bg-white/[0.035] p-5 sm:p-6 lg:p-7">
          <form
            method="GET"
            className="flex flex-col gap-4 sm:flex-row"
          >
            {category && (
              <input
                type="hidden"
                name="category"
                value={category}
              />
            )}

            <input
              type="search"
              name="search"
              defaultValue={search}
              placeholder="ابحث عن فعالية أو مكان..."
              className="h-16 flex-1 rounded-2xl border border-white/10 bg-black/60 px-6 text-lg text-white outline-none transition placeholder:text-white/25 hover:border-white/20 focus:border-white/40 focus:bg-black"
            />

            <button
              type="submit"
              className="h-16 rounded-2xl bg-white px-10 text-base font-semibold text-black transition hover:bg-white/85 active:scale-[0.98]"
            >
              بحث
            </button>
          </form>

          <div className="mt-6 border-t border-white/10 pt-6">
            <div className="flex flex-wrap gap-3">
              <Link
                href={getCategoryHref("")}
                className={`rounded-full border px-6 py-3 text-base font-medium transition ${
                  !category
                    ? "border-white bg-white text-black"
                    : "border-white/10 bg-white/5 text-white/60 hover:border-white/25 hover:bg-white/10 hover:text-white"
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
                        : "border-white/10 bg-white/5 text-white/60 hover:border-white/25 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {getEventCategoryLabel(item)}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {(search || category) && (
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <p className="text-base text-white/45">
              عدد النتائج:{" "}
              <span className="font-semibold text-white">
                {events.length}
              </span>
            </p>

            <Link
              href="/events"
              className="rounded-full border border-white/10 px-5 py-2.5 text-base text-white/55 transition hover:border-white/25 hover:bg-white/5 hover:text-white"
            >
              مسح البحث والتصنيفات
            </Link>
          </div>
        )}

        {events.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-8">
            {events.map((event, index) => (
              <EventCard
                key={event.id}
                event={event}
                eager={index === 0}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-[36px] border border-white/10 bg-white/[0.035] px-6 py-24 text-center">
            <h2 className="text-3xl font-semibold sm:text-4xl">
              ما لقينا فعاليات مطابقة
            </h2>

            <p className="mt-5 text-lg text-white/45">
              جرّب كلمة بحث مختلفة أو اختر تصنيفًا آخر.
            </p>

            <Link
              href="/events"
              className="mt-8 inline-flex rounded-full bg-white px-7 py-3.5 text-base font-semibold text-black transition hover:bg-white/85"
            >
              عرض كل الفعاليات
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}