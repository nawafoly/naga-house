import Image from "next/image";
import Link from "next/link";

import { EventLiveSearch } from "@/features/events/components";

export function HeroSection() {
  return (
    <section className="naga-hero relative isolate z-10 overflow-visible border-b border-brand-cream/15 text-brand-cream">
      <div
        aria-hidden="true"
        className="naga-hero-lines pointer-events-none absolute inset-0 -z-10"
      />

      <div className="relative mx-auto grid min-h-[600px] w-full max-w-[1600px] items-center gap-8 px-4 py-14 sm:px-6 sm:py-16 lg:min-h-[650px] lg:grid-cols-[minmax(0,1fr)_minmax(220px,0.36fr)] lg:gap-12 lg:px-8 lg:py-20">
        <div className="relative z-20 w-full max-w-5xl">
          <div className="mb-7 flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-brand-orange/55 bg-brand-orange/20 px-4 py-2 text-sm font-bold text-brand-cream backdrop-blur">
              جدة
            </span>

            <span className="rounded-full border border-brand-cream/25 bg-brand-cream/5 px-4 py-2 text-sm font-medium text-brand-cream/90">
              فعاليات • تجارب • ترفيه
            </span>
          </div>

          <p className="naga-latin mb-5 text-sm font-bold uppercase tracking-[0.3em] text-brand-orange sm:text-base">
            NAGA HOUSE · JEDDAH
          </p>

          <h1 className="text-5xl font-extrabold leading-[1.2] tracking-tight text-brand-cream sm:text-6xl lg:text-[76px] lg:leading-[1.14]">
            جدة كلها
            <br />
            <span className="text-brand-orange">في مكان واحد.</span>
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-9 text-brand-cream/90 sm:text-xl lg:leading-10">
            ابحث عن المسرحية أو الحفلة أو التجربة اللي تبيها، وبتظهر لك
            النتائج مباشرة أثناء الكتابة.
          </p>

          <div className="relative z-40 mt-8 max-w-[840px]">
            <EventLiveSearch />
          </div>

          <div className="mt-7 flex flex-wrap gap-3 sm:gap-4">
            <Link
              href="/events"
              className="inline-flex h-14 items-center justify-center rounded-full bg-brand-orange px-6 text-base font-bold text-brand-ink transition hover:scale-[1.02] hover:bg-brand-cream focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-cream active:scale-[0.98] sm:px-7"
            >
              تصفح جميع الفعاليات
              <span className="mr-3 text-xl" aria-hidden="true">←</span>
            </Link>

            <a
              href="#featured-events"
              className="inline-flex h-14 items-center justify-center rounded-full border border-brand-cream/40 bg-brand-cream/10 px-6 text-base font-semibold text-brand-cream transition hover:border-brand-cream/70 hover:bg-brand-cream/20 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-cream sm:px-7"
            >
              الفعاليات المختارة
            </a>
          </div>
        </div>

        <div aria-hidden="true" className="relative hidden items-center justify-center lg:flex">
          <div className="absolute aspect-square w-full max-w-[325px] rotate-6 rounded-[54px] border border-brand-cream/15 bg-brand-cream/5" />
          <div className="relative flex aspect-square w-full max-w-[310px] -rotate-3 items-center justify-center rounded-[50px] border border-brand-cream/25 bg-brand-cream p-6 shadow-[0_24px_75px_rgba(0,0,0,0.2)]">
            <Image
              src="/brand/naga-house-icon.svg"
              alt=""
              width={275}
              height={275}
              className="h-auto w-full object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
