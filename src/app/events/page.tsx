import Link from "next/link";

import { EventCard } from "@/features/events/components";
import { MockEventRepository } from "@/features/events/data";
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

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-10">
          <p className="mb-3 text-sm uppercase tracking-[0.3em] text-white/50">
            JEDDAH EVENTS
          </p>

          <h1 className="text-4xl font-bold sm:text-5xl">
            جميع الفعاليات
          </h1>

          <p className="mt-4 max-w-2xl text-white/60">
            اكتشف الفعاليات والتجارب المختارة في جدة واحجز من خلال منصة
            التذاكر الرسمية.
          </p>
        </div>

        <form
          method="GET"
          className="mb-10 grid gap-4 rounded-3xl border border-white/10 bg-white/5 p-5 md:grid-cols-[1fr_220px_auto]"
        >
          <input
            type="search"
            name="search"
            defaultValue={search}
            placeholder="ابحث عن فعالية أو مكان..."
            className="rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-white/30"
          />

          <select
            name="category"
            defaultValue={category}
            className="rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-white/30"
          >
            <option value="">كل التصنيفات</option>

            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="rounded-2xl bg-white px-6 py-3 font-semibold text-black transition hover:bg-white/80"
          >
            بحث
          </button>
        </form>

        {(search || category) && (
          <div className="mb-8 flex items-center justify-between gap-4">
            <p className="text-sm text-white/50">
              عدد النتائج: {events.length}
            </p>

            <Link
              href="/events"
              className="text-sm font-medium text-white/70 transition hover:text-white"
            >
              مسح الفلاتر
            </Link>
          </div>
        )}

        {events.length > 0 ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-12 text-center">
            <h2 className="text-xl font-semibold">
              ما لقينا فعاليات مطابقة
            </h2>

            <p className="mt-3 text-white/50">
              جرّب كلمة بحث مختلفة أو امسح الفلاتر.
            </p>

            <Link
              href="/events"
              className="mt-6 inline-flex rounded-full bg-white px-5 py-3 text-sm font-semibold text-black"
            >
              عرض كل الفعاليات
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}