import Link from "next/link";

import { CuratedEventRepository } from "@/features/events/data";
import { eventCategoryLabels } from "@/features/events/domain";
import { EventService } from "@/features/events/services";

const eventService = new EventService(new CuratedEventRepository());

const categoryDescriptions: Record<string, string> = {
  music: "حفلات، موسيقى، دي جي وتجارب موسيقية مباشرة.",
  theater: "مسرحيات وعروض حية وتجارب فنية.",
  sports: "مباريات، بطولات وتجارب رياضية.",
  family: "فعاليات وتجارب مناسبة للعائلة والأطفال.",
  dining: "مطاعم، تجارب طعام ومذاقات مختلفة.",
  entertainment: "ألعاب وتجارب وأنشطة ترفيهية متنوعة.",
};

const categoryOrder = [
  "music",
  "theater",
  "sports",
  "family",
  "dining",
  "entertainment",
];

const categoryAccents: Record<string, string> = {
  music: "bg-brand-orange",
  theater: "bg-brand-brick",
  sports: "bg-brand-blue",
  family: "bg-brand-green",
  dining: "bg-brand-copper",
  entertainment: "bg-brand-orange",
};

export default async function CategoriesPage() {
  const events = await eventService.getPublishedEvents();

  const categoryCounts = events.reduce<Record<string, number>>(
    (counts, event) => {
      counts[event.category] =
        (counts[event.category] ?? 0) + 1;

      return counts;
    },
    {}
  );

  const knownCategories = categoryOrder.filter(
    (category) => (categoryCounts[category] ?? 0) > 0
  );

  const extraCategories = Object.keys(categoryCounts)
    .filter((category) => !categoryOrder.includes(category))
    .sort();

  const availableCategories = [
    ...knownCategories,
    ...extraCategories,
  ];

  return (
    <main className="min-h-screen bg-brand-cream text-brand-ink">
      <section className="relative isolate overflow-hidden bg-brand-green text-brand-cream">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_90%,rgba(237,139,82,0.22),transparent_35%),radial-gradient(circle_at_85%_15%,rgba(34,93,126,0.35),transparent_40%)]"
        />
        <div className="relative mx-auto w-full max-w-[1600px] px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <p className="naga-latin text-sm font-bold tracking-[0.36em] text-brand-orange sm:text-base">
            EXPLORE CATEGORIES
          </p>
          <div className="mt-5 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-5xl font-extrabold leading-tight sm:text-7xl lg:text-8xl">
                اكتشف <span className="text-brand-orange">التصنيفات</span>
              </h1>
              <p className="mt-5 max-w-3xl text-lg leading-9 text-brand-cream/85 sm:text-xl">
                اختر نوع التجربة اللي تبيها، واستعرض الفعاليات المتوفرة حاليًا في جدة.
              </p>
            </div>
            <Link
              href="/events"
              className="inline-flex w-fit items-center gap-3 rounded-full border border-brand-cream/30 bg-brand-cream/10 px-6 py-3.5 font-bold text-brand-cream transition hover:bg-brand-cream/20 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-orange"
            >
              عرض جميع الفعاليات <span aria-hidden="true">←</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1600px] px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="mb-8 flex items-center justify-between gap-4">
          <h2 className="text-2xl font-extrabold text-brand-green sm:text-3xl">
            اختر عالمك
          </h2>
          <span className="rounded-full bg-brand-green/10 px-4 py-2 text-sm font-bold text-brand-green">
            {availableCategories.length} تصنيفات
          </span>
        </div>

        {availableCategories.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {availableCategories.map((category, index) => {
              const count = categoryCounts[category] ?? 0;
              const accent = categoryAccents[category] ?? "bg-brand-blue";

              return (
                <Link
                  key={category}
                  href={`/events?category=${encodeURIComponent(category)}`}
                  className="group relative flex min-h-[300px] flex-col overflow-hidden rounded-[30px] border border-brand-green/15 bg-[#fffaf0] p-7 shadow-[0_14px_35px_rgba(34,34,34,0.07)] transition duration-300 hover:-translate-y-1 hover:border-brand-green/40 hover:shadow-[0_22px_45px_rgba(34,34,34,0.12)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-copper sm:p-8"
                >
                  <div className={`absolute inset-x-0 top-0 h-2 ${accent}`} aria-hidden="true" />
                  <div className="flex items-center justify-between gap-4">
                    <span className="naga-latin text-sm font-bold tracking-[0.25em] text-brand-copper">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="rounded-full border border-brand-green/15 bg-brand-green/10 px-3 py-1.5 text-xs font-bold text-brand-green">
                      {count} {count === 1 ? "فعالية" : "فعاليات"}
                    </span>
                  </div>

                  <div className="mt-10 flex-1">
                    <h3 className="text-4xl font-extrabold text-brand-green sm:text-5xl">
                      {eventCategoryLabels[category] ?? category}
                    </h3>
                    <p className="mt-5 max-w-sm text-base leading-8 text-brand-ink/75">
                      {categoryDescriptions[category] ??
                        "استعرض الفعاليات المتوفرة ضمن هذا التصنيف."}
                    </p>
                  </div>

                  <div className="mt-9 flex items-center justify-between border-t border-brand-green/15 pt-5">
                    <span className="font-bold text-brand-copper">استعرض الفعاليات</span>
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-orange text-xl text-brand-ink transition duration-300 group-hover:-translate-x-1 group-hover:bg-brand-green group-hover:text-brand-cream" aria-hidden="true">
                      ←
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="rounded-[30px] border border-brand-green/20 bg-white/60 px-6 py-20 text-center">
            <h2 className="text-3xl font-extrabold text-brand-green">لا توجد تصنيفات متاحة حاليًا</h2>
            <p className="mt-4 text-base text-brand-ink/70">
              ستظهر التصنيفات تلقائيًا عند إضافة فعاليات جديدة.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
