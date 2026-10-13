import Link from "next/link";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-white/10">
      <div className="mx-auto grid min-h-[520px] max-w-7xl items-center gap-10 px-6 py-20 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.3em] text-white/50">
            JEDDAH EVENTS
          </p>

          <h1 className="max-w-3xl text-5xl font-bold leading-tight sm:text-6xl lg:text-7xl">
            اكتشف أقوى فعاليات جدة في مكان واحد
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/60">
            NAGA HOUSE يجمع لك الفعاليات المختارة في جدة، ويأخذك مباشرة إلى
            منصة الحجز الرسمية لإكمال شراء التذاكر.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/events"
              className="rounded-full bg-white px-6 py-3 font-semibold text-black transition hover:bg-white/80"
            >
              استكشف الفعاليات
            </Link>

            <a
              href="#featured-events"
              className="rounded-full border border-white/20 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
            >
              الأكثر تميزًا
            </a>
          </div>
        </div>

        <div className="relative hidden min-h-[380px] overflow-hidden rounded-3xl border border-white/10 bg-white/5 lg:block">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.14),transparent_45%)]" />

          <div className="absolute bottom-8 right-8 left-8">
            <p className="text-sm text-white/40">
              NAGA HOUSE
            </p>

            <p className="mt-2 text-3xl font-semibold">
              جدة تبدأ من هنا
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
