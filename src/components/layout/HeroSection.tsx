
import Link from "next/link";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-white/10 bg-black">
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

      <div className="relative mx-auto flex min-h-[720px] w-full max-w-[1600px] items-center px-4 py-20 sm:px-6 lg:min-h-[780px] lg:px-8 lg:py-28">
        <div className="max-w-6xl">
          <div className="mb-8 flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-white/10 bg-white/[0.06] px-5 py-2.5 text-sm font-medium text-white/65 backdrop-blur">
              جدة
            </span>

            <span className="rounded-full border border-white/10 px-5 py-2.5 text-sm font-medium text-white/45">
              فعاليات • تجارب • ترفيه
            </span>
          </div>

          <p className="mb-6 text-base font-medium uppercase tracking-[0.45em] text-white/35 sm:text-lg">
            NAGA HOUSE · JEDDAH
          </p>

          <h1 className="max-w-6xl text-6xl font-bold leading-[1.08] tracking-[-0.04em] text-white sm:text-7xl lg:text-[96px] lg:leading-[1.03]">
            جدة كلها
            <br />
            <span className="text-white/45">
              في مكان واحد.
            </span>
          </h1>

          <p className="mt-8 max-w-3xl text-lg leading-9 text-white/55 sm:text-xl lg:text-2xl lg:leading-10">
            اكتشف أبرز الفعاليات والتجارب في جدة، اعرف التفاصيل والمواعيد
            والأسعار، ثم انتقل مباشرة إلى منصة الحجز الرسمية.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/events"
              className="inline-flex h-16 items-center justify-center rounded-full bg-white px-8 text-base font-semibold text-black transition hover:scale-[1.02] hover:bg-white/90 active:scale-[0.98] sm:px-10 sm:text-lg"
            >
              اكتشف الفعاليات
              <span className="mr-3 text-xl">
                ←
              </span>
            </Link>

            <a
              href="#featured-events"
              className="inline-flex h-16 items-center justify-center rounded-full border border-white/15 bg-white/[0.04] px-8 text-base font-semibold text-white transition hover:border-white/30 hover:bg-white/[0.08] sm:px-10 sm:text-lg"
            >
              الفعاليات المختارة
            </a>
          </div>

          <div className="mt-14 flex flex-wrap gap-x-10 gap-y-6 border-t border-white/10 pt-8">
            <div>
              <p className="text-2xl font-semibold text-white">
                جدة أولًا
              </p>
              <p className="mt-1 text-sm text-white/35">
                تركيزنا الحالي
              </p>
            </div>

            <div>
              <p className="text-2xl font-semibold text-white">
                حجز رسمي
              </p>
              <p className="mt-1 text-sm text-white/35">
                عبر مزود التذاكر
              </p>
            </div>

            <div>
              <p className="text-2xl font-semibold text-white">
                تجربة أسرع
              </p>
              <p className="mt-1 text-sm text-white/35">
                اكتشف ثم احجز
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
