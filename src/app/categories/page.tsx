import Link from "next/link";

import { eventCategoryLabels } from "@/features/events/domain";

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

export default function CategoriesPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <section className="mx-auto w-full max-w-[1600px] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mb-16 max-w-5xl">
          <p className="mb-5 text-base font-medium uppercase tracking-[0.45em] text-white/50">
            EXPLORE CATEGORIES
          </p>

          <h1 className="text-6xl font-bold tracking-tight sm:text-7xl lg:text-8xl">
            التصنيفات
          </h1>

          <p className="mt-7 max-w-3xl text-lg leading-9 text-white/70 sm:text-xl lg:text-2xl lg:leading-10">
            اختر نوع التجربة اللي تبيها، واستعرض الفعاليات المتوفرة في جدة
            مباشرة.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categoryOrder.map((category, index) => (
            <Link
              key={category}
              href={`/events?category=${category}`}
              className="group relative min-h-[300px] overflow-hidden rounded-[34px] border border-white/10 bg-white/[0.035] p-7 transition duration-300 hover:-translate-y-1 hover:border-white/25 hover:bg-white/[0.065] sm:p-8"
            >
              <div
                aria-hidden="true"
                className="absolute -left-16 -top-16 h-56 w-56 rounded-full bg-white/[0.045] blur-3xl transition duration-500 group-hover:bg-white/[0.08]"
              />

              <div className="relative flex h-full min-h-[240px] flex-col justify-between">
                <div>
                  <p className="text-sm font-medium tracking-[0.3em] text-white/35">
                    {String(index + 1).padStart(2, "0")}
                  </p>

                  <h2 className="mt-7 text-4xl font-bold tracking-tight sm:text-5xl">
                    {eventCategoryLabels[category]}
                  </h2>

                  <p className="mt-5 max-w-sm text-base leading-8 text-white/55">
                    {categoryDescriptions[category]}
                  </p>
                </div>

                <div className="mt-10 flex items-center justify-between border-t border-white/10 pt-6">
                  <span className="text-base font-semibold text-white">
                    استعرض الفعاليات
                  </span>

                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-xl text-black transition duration-300 group-hover:-translate-x-1">
                    ←
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-16 flex justify-center">
          <Link
            href="/events"
            className="inline-flex h-14 items-center justify-center rounded-full border border-white/15 bg-white/[0.04] px-8 text-base font-semibold text-white transition hover:border-white/30 hover:bg-white/[0.08]"
          >
            عرض جميع الفعاليات
            <span className="mr-3 text-xl">←</span>
          </Link>
        </div>
      </section>
    </main>
  );
}