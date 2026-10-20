import Link from "next/link";

import { HeroSection } from "@/components/layout";
import { EventCard } from "@/features/events/components";
import { CuratedEventRepository } from "@/features/events/data";
import { EventService } from "@/features/events/services";

const eventService = new EventService(new CuratedEventRepository());

export default async function HomePage() {
  const events = await eventService.getFeaturedEvents();

  return (
    <main className="min-h-screen bg-brand-ink text-brand-cream">
      <HeroSection />

      <section id="featured-events" className="naga-home-featured scroll-mt-24">
        <div className="mx-auto w-full max-w-[1600px] px-4 pb-20 pt-24 sm:px-6 lg:px-8 lg:pb-28 lg:pt-28">
          <div className="mb-12 flex flex-col justify-between gap-8 lg:mb-16 lg:flex-row lg:items-end">
            <div>
              <p className="naga-latin mb-5 text-sm font-bold uppercase tracking-[0.35em] text-brand-orange sm:text-base">
                FEATURED EVENTS
              </p>

              <h2 className="text-4xl font-extrabold tracking-tight text-brand-cream sm:text-6xl lg:text-7xl">
                فعاليات مختارة
              </h2>

              <p className="mt-6 max-w-3xl text-lg leading-9 text-brand-cream/80 sm:text-xl">
                مجموعة مختارة من أبرز الفعاليات والتجارب القادمة في جدة.
              </p>
            </div>

            <Link
              href="/events"
              className="inline-flex h-14 w-fit items-center justify-center rounded-full border border-brand-orange/50 bg-brand-orange/10 px-7 text-base font-bold text-brand-cream transition hover:border-brand-orange hover:bg-brand-orange/20 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-orange"
            >
              عرض جميع الفعاليات
              <span className="mr-3 text-xl" aria-hidden="true">←</span>
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
            <div className="rounded-[36px] border border-brand-cream/15 bg-brand-cream/5 px-6 py-20 text-center">
              <h3 className="text-3xl font-bold text-brand-cream">
                لا توجد فعاليات مختارة حاليًا
              </h3>

              <p className="mt-4 text-lg text-brand-cream/75">
                يمكنك استعراض جميع الفعاليات المتوفرة.
              </p>

              <Link
                href="/events"
                className="mt-7 inline-flex rounded-full bg-brand-orange px-7 py-3.5 font-bold text-brand-ink transition hover:bg-brand-cream"
              >
                استعرض الفعاليات
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="border-y border-brand-cream/10 bg-brand-green/30">
        <div className="mx-auto grid w-full max-w-[1600px] gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8 lg:py-28">
          <div>
            <p className="naga-latin mb-5 text-sm font-bold uppercase tracking-[0.35em] text-brand-orange">
              NAGA HOUSE
            </p>

            <h2 className="max-w-2xl text-5xl font-extrabold leading-tight tracking-tight text-brand-cream sm:text-6xl">
              من الاكتشاف
              <br />
              <span className="text-brand-orange">
                إلى الحجز.
              </span>
            </h2>
          </div>

          <div className="flex items-center">
            <p className="max-w-3xl text-lg leading-9 text-brand-cream/85 sm:text-xl lg:text-2xl lg:leading-10">
              NAGA HOUSE يجمع لك الفعاليات في مكان واحد، ويعرض لك التفاصيل
              والمواعيد والأسعار بوضوح، ثم ينقلك إلى منصة التذاكر الرسمية
              لإكمال الحجز.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1600px] px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="relative overflow-hidden rounded-[40px] border border-brand-orange/25 bg-[linear-gradient(110deg,#354b39,#26372c)] px-6 py-14 sm:px-10 sm:py-16 lg:px-14">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full bg-brand-orange/15 blur-3xl"
          />

          <div className="relative flex flex-col justify-between gap-10 lg:flex-row lg:items-center">
            <div>
              <p className="naga-latin mb-4 text-sm font-bold uppercase tracking-[0.35em] text-brand-orange">
                EXPLORE JEDDAH
              </p>

              <h2 className="max-w-3xl text-4xl font-extrabold leading-tight text-brand-cream sm:text-5xl lg:text-6xl">
                جاهز تكتشف وش يصير في جدة؟
              </h2>
            </div>

            <Link
              href="/events"
              className="inline-flex h-16 w-fit shrink-0 items-center justify-center rounded-full bg-brand-orange px-8 text-base font-bold text-brand-ink transition hover:scale-[1.02] hover:bg-brand-cream focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-orange active:scale-[0.98] sm:px-10 sm:text-lg"
            >
              تصفح الفعاليات
              <span className="mr-3 text-xl" aria-hidden="true">←</span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
