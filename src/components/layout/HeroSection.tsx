import Link from "next/link";

import { EventLiveSearch } from "@/features/events/components";

export function HeroSection() {
  return (
    <section className="relative overflow-visible border-b border-white/10 bg-black">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_75%_30%,rgba(255,255,255,0.10),transparent_28%),radial-gradient(circle_at_15%_75%,rgba(255,255,255,0.06),transparent_25%)]"
      />

      <div
        aria-hidden="true"
        className="absolute -left-32 top-20 h-80 w-80 rounded-full bg-white/[0.04] blur-3xl"
      />

      <div
        aria-hidden="true"
        className="absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-white/[0.05] blur-3xl"
      />

      <div className="relative mx-auto flex min-h-[700px] w-full max-w-[1600px] items-center px-4 py-20 sm:px-6 lg:min-h-[760px] lg:px-8 lg:py-24">
        <div className="w-full max-w-6xl">
          <div className="mb-8 flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-white/15 bg-white/[0.07] px-5 py-2.5 text-sm font-medium text-white/80 backdrop-blur">
              جدة
            </span>

            <span className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium text-white/65">
              فعاليات • تجارب • ترفيه
            </span>
          </div>

          <p className="mb-6 text-base font-medium uppercase tracking-[0.45em] text-white/55 sm:text-lg">
            NAGA HOUSE · JEDDAH
          </p>

          <h1 className="max-w-6xl text-6xl font-bold leading-[1.08] tracking-[-0.04em] text-white sm:text-7xl lg:text-[96px] lg:leading-[1.03]">
            جدة كلها
            <br />

            <span className="text-white/85">
              في مكان واحد.
            </span>
          </h1>

          <p className="mt-8 max-w-3xl text-lg leading-9 text-white/70 sm:text-xl lg:text-2xl lg:leading-10">
            ابحث عن المسرحية أو الحفلة أو التجربة اللي تبيها، وبتظهر لك
            النتائج مباشرة أثناء الكتابة.
          </p>

          <div className="relative z-40 mt-10">
            <EventLiveSearch />
          </div>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/events"
              className="inline-flex h-14 items-center justify-center rounded-full bg-white px-7 text-base font-semibold text-black transition hover:scale-[1.02] hover:bg-white/90 active:scale-[0.98]"
            >
              تصفح جميع الفعاليات
              <span className="mr-3 text-xl">
                ←
              </span>
            </Link>

            <a
              href="#featured-events"
              className="inline-flex h-14 items-center justify-center rounded-full border border-white/20 bg-white/[0.05] px-7 text-base font-semibold text-white transition hover:border-white/35 hover:bg-white/[0.09]"
            >
              الفعاليات المختارة
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}