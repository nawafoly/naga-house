import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CuratedEventRepository } from "@/features/events/data";
import {
  getEventCategoryLabel,
  isTrustedTicketUrl,
} from "@/features/events/domain";
import { EventService } from "@/features/events/services";

export const instant = false;

const eventService = new EventService(
  new CuratedEventRepository()
);

interface EventPageProps {
  params: Promise<{
    slug: string;
  }>;
}

function formatEventDate(value: string) {
  return new Intl.DateTimeFormat(
    "ar-SA-u-ca-gregory",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "Asia/Riyadh",
    }
  ).format(new Date(value));
}

function formatEventTime(value: string) {
  return new Intl.DateTimeFormat("ar-SA", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Riyadh",
  }).format(new Date(value));
}

export default async function EventPage({
  params,
}: EventPageProps) {
  const { slug } = await params;

  const event =
    await eventService.getEventBySlug(slug);

  if (!event) {
    notFound();
  }

  const hasPrice =
    event.price.amountFrom !== undefined;

  const price = hasPrice
    ? `${event.price.amountFrom} ر.س`
    : "يحدد لاحقًا";

  const canBook = isTrustedTicketUrl(
    event.ticketProvider,
    event.ticketUrl
  );

  const startAt = event.startAt;

  const eventDate = startAt
    ? formatEventDate(startAt)
    : null;

  const eventTime = startAt
    ? formatEventTime(startAt)
    : null;

  const scheduleLabel =
    event.scheduleLabel ?? "متاح للحجز";

  const primarySchedule =
    eventDate ?? scheduleLabel;

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="mx-auto w-full max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="mb-6">
          <Link
            href="/events"
            className="inline-flex items-center gap-2 text-sm font-medium text-white/70 transition hover:text-white"
          >
            <span>→</span>
            جميع الفعاليات
          </Link>
        </div>

        <div className="relative overflow-hidden rounded-[36px] border border-white/10 bg-white/[0.03]">
          <div className="relative min-h-[500px] w-full sm:min-h-[580px] lg:min-h-[680px]">
            <Image
              src={
                event.coverImageUrl ??
                event.imageUrl
              }
              alt={event.titleAr}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/10" />

            <div className="absolute inset-x-0 top-0 flex flex-wrap items-center gap-3 p-5 sm:p-8">
              <span className="rounded-full border border-white/20 bg-black/55 px-5 py-2.5 text-sm font-medium text-white backdrop-blur-md">
                {getEventCategoryLabel(
                  event.category
                )}
              </span>

              {event.featured && (
                <span className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black">
                  فعالية مميزة
                </span>
              )}
            </div>

            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10 lg:p-14">
              <p className="mb-4 text-lg font-medium text-white/80">
                {event.location.city} ·{" "}
                {event.location.venue}
              </p>

              <h1 className="max-w-5xl text-5xl font-bold sm:text-6xl lg:text-8xl">
                {event.titleAr}
              </h1>

              <div className="mt-7 flex flex-wrap gap-8 text-lg font-medium text-white/80">
                <span>
                  {primarySchedule}
                </span>

                {eventTime && (
                  <span>
                    {eventTime}
                  </span>
                )}

                <span>
                  {hasPrice
                    ? `يبدأ من ${price}`
                    : price}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-8 py-10 lg:grid-cols-[minmax(0,1fr)_380px] lg:py-14">
          <div className="space-y-8">
            <section className="rounded-[32px] border border-white/10 bg-white/[0.03] p-8">
              <p className="text-sm font-medium tracking-[0.35em] text-white/60">
                ABOUT EVENT
              </p>

              <h2 className="mt-4 text-4xl font-bold">
                عن الفعالية
              </h2>

              <p className="mt-6 text-xl leading-10 text-white/75">
                {event.descriptionAr ??
                  "تفاصيل الفعالية ستتوفر قريبًا."}
              </p>
            </section>

            <section className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6">
                <p className="text-base font-semibold text-white/70">
                  الموعد
                </p>

                <p className="mt-3 text-xl font-semibold">
                  {primarySchedule}
                </p>

                {eventTime && (
                  <p className="mt-2 text-white/70">
                    {eventTime}
                  </p>
                )}
              </div>

              <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6">
                <p className="text-base font-semibold text-white/70">
                  الموقع
                </p>

                <p className="mt-3 text-xl font-semibold">
                  {event.location.venue}
                </p>

                <p className="mt-2 text-white/70">
                  {event.location.city}
                </p>
              </div>
            </section>
          </div>

          <aside>
            <div className="sticky top-32 rounded-[32px] border border-white/10 bg-white/[0.045] p-8">
              <p className="text-base font-semibold text-white/70">
                أسعار التذاكر
              </p>

              <p className="mt-3 text-4xl font-bold">
                {price}
              </p>

              <div className="my-7 h-px bg-white/10" />

              <div className="space-y-6">
                <div>
                  <p className="font-semibold text-white/70">
                    الموعد
                  </p>

                  <p className="mt-2">
                    {primarySchedule}
                  </p>

                  {eventTime && (
                    <p className="mt-1 text-sm text-white/55">
                      {eventTime}
                    </p>
                  )}
                </div>

                <div>
                  <p className="font-semibold text-white/70">
                    المكان
                  </p>

                  <p className="mt-2">
                    {event.location.venue}
                  </p>
                </div>
              </div>

              {canBook ? (
                <a
                  href={event.ticketUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-8 flex h-16 w-full items-center justify-center rounded-full bg-white px-6 text-lg font-semibold text-black transition hover:scale-[1.01] hover:bg-white/90 active:scale-[0.99]"
                >
                  احجز الآن
                  <span className="mr-3">
                    ↗
                  </span>
                </a>
              ) : (
                <button
                  type="button"
                  disabled
                  className="mt-8 flex h-16 w-full cursor-not-allowed items-center justify-center rounded-full bg-white px-6 text-lg font-semibold text-black/45"
                >
                  احجز الآن
                  <span className="mr-3">
                    ↗
                  </span>
                </button>
              )}

              {!canBook && (
                <p className="mt-3 text-center text-sm leading-6 text-white/50">
                  رابط التذكرة الرسمي لهذه
                  الفعالية لم يُضف بعد.
                </p>
              )}
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}