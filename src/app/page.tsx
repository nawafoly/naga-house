import Link from "next/link";

import { HeroSection } from "@/components/layout";
import { EventCard } from "@/features/events/components";
import { MockEventRepository } from "@/features/events/data";
import { EventService } from "@/features/events/services";

const eventService = new EventService(new MockEventRepository());

export default async function HomePage() {
  const events = await eventService.getFeaturedEvents();

  return (
    <main className="min-h-screen bg-black text-white">
      <HeroSection />

      <section
        id="featured-events"
        className="mx-auto w-full max-w-[1600px] px-4 py-20 sm:px-6 lg:px-8 lg:py-28"
      >
        <div className="mb-12 flex flex-col justify-between gap-8 lg:mb-16 lg:flex-row lg:items-end">
          <div>
            <p className="mb-5 text-base font-medium uppercase tracking-[0.45em] text-white/35 sm:text-lg">
              FEATURED EVENTS
            </p>

            <h2 className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              فعاليات مختارة
            </h2>

            <p className="mt-6 max-w-3xl text-lg leading-9 text-white/50 sm:text-xl">
              مجموعة مختارة من أبرز الفعاليات والتجارب القادمة في جدة.
            </p>
          </div>

          <Link
            href="/events"
            className="inline-flex h-14 w-fit items-center justify-center rounded-full border border-white/15 bg-white/[0.04] px-7 text-base font-semibold text-white transition hover:border-white/30 hover:bg-white/[0.08]"
          >
            عرض جميع الفعاليات
            <span className="mr-3 text-xl">
              ←
            </span>
          </Link>
        </div>

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
          <div className="rounded-[36px] border border-white/10 bg-white/[0.035] px-6 py-20 text-center">
            <h3 className="text-3xl font-semibold">
              لا توجد فعاليات مختارة حاليًا
            </h3>

            <p className="mt-4 text-lg text-white/45">
              يمكنك استعراض جميع الفعاليات المتوفرة.
            </p>

            <Link
              href="/events"
              className="mt-7 inline-flex rounded-full bg-white px-7 py-3.5 font-semibold text-black transition hover:bg-white/85"
            >
              استعرض الفعاليات
            </Link>
          </div>
        )}
      </section>

      <section className="border-y border-white/10 bg-white/[0.025]">
        <div className="mx-auto grid w-full max-w-[1600px] gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8 lg:py-28">
          <div>
            <p className="mb-5 text-base font-medium uppercase tracking-[0.45em] text-white/35">
              NAGA HOUSE
            </p>

            <h2 className="max-w-2xl text-5xl font-bold leading-tight tracking-tight sm:text-6xl">
              من الاكتشاف
              <br />
              <span className="text-white/40">
                إلى الحجز.
              </span>
            </h2>
          </div>

          <div className="flex items-center">
            <p className="max-w-3xl text-lg leading-9 text-white/50 sm:text-xl lg:text-2xl lg:leading-10">
              NAGA HOUSE يجمع لك الفعاليات في مكان واحد، ويعرض لك التفاصيل
              والمواعيد والأسعار بوضوح، ثم ينقلك إلى منصة التذاكر الرسمية
              لإكمال الحجز.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1600px] px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="relative overflow-hidden rounded-[40px] border border-white/10 bg-white/[0.045] px-6 py-14 sm:px-10 sm:py-16 lg:px-14">
          <div
            aria-hidden="true"
            className="absolute -left-16 -top-16 h-64 w-64 rounded-full bg-white/[0.05] blur-3xl"
          />

          <div className="relative flex flex-col justify-between gap-10 lg:flex-row lg:items-center">
            <div>
              <p className="mb-4 text-sm font-medium uppercase tracking-[0.4em] text-white/35">
                EXPLORE JEDDAH
              </p>

              <h2 className="max-w-3xl text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
                جاهز تكتشف وش يصير في جدة؟
              </h2>
            </div>

            <Link
              href="/events"
              className="inline-flex h-16 w-fit shrink-0 items-center justify-center rounded-full bg-white px-8 text-base font-semibold text-black transition hover:scale-[1.02] hover:bg-white/90 active:scale-[0.98] sm:px-10 sm:text-lg"
            >
              تصفح الفعاليات
              <span className="mr-3 text-xl">
                ←
              </span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}