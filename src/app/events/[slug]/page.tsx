import type { Metadata } from "next";
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

export async function generateMetadata({
  params,
}: EventPageProps): Promise<Metadata> {
  const { slug } = await params;

  const event =
    await eventService.getEventBySlug(slug);

  if (!event) {
    return {
      title: "الفعالية غير موجودة",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const description =
    event.descriptionAr ??
    `اكتشف تفاصيل ${event.titleAr} في جدة واحجز عبر المنصة الرسمية.`;

  const image =
    event.coverImageUrl ?? event.imageUrl;

  return {
    title: event.titleAr,
    description,

    openGraph: {
      type: "article",
      locale: "ar_SA",
      siteName: "NAGA HOUSE",
      title: event.titleAr,
      description,
      images: [
        {
          url: image,
          alt: event.titleAr,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title: event.titleAr,
      description,
      images: [image],
    },
  };
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

  const eventDate = event.startAt
    ? formatEventDate(event.startAt)
    : null;

  const eventTime = event.startAt
    ? formatEventTime(event.startAt)
    : null;

  const primarySchedule =
    eventDate ?? event.scheduleLabel ?? "متاح للحجز";

  return (
    <main className="min-h-screen bg-brand-cream text-brand-ink">
      <section className="relative isolate overflow-hidden bg-brand-green pb-10 pt-7 text-brand-cream sm:pb-14 lg:pb-16">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_85%,rgba(237,139,82,0.20),transparent_38%),radial-gradient(circle_at_90%_10%,rgba(34,93,126,0.30),transparent_32%)]"
        />

        <div className="relative mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-8">
          <Link
            href="/events"
            className="inline-flex items-center gap-2 rounded-full border border-brand-cream/25 bg-brand-cream/10 px-5 py-2.5 text-sm font-bold text-brand-cream transition hover:bg-brand-cream/20 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-orange"
          >
            <span aria-hidden="true">→</span>
            جميع الفعاليات
          </Link>

          <div className="relative mt-7 min-h-[470px] overflow-hidden rounded-[30px] border border-brand-cream/20 bg-brand-ink shadow-[0_22px_65px_rgba(0,0,0,0.22)] sm:min-h-[570px] lg:min-h-[650px] lg:rounded-[38px]">
            <Image
              src={event.coverImageUrl ?? event.imageUrl}
              alt={event.titleAr}
              fill
              priority
              sizes="(max-width: 1600px) 100vw, 1600px"
              className="object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-[#17261b]/95 via-[#17261b]/50 to-[#17261b]/15" />

            <div className="absolute inset-x-0 top-0 flex flex-wrap items-center gap-3 p-5 sm:p-8">
              <span className="rounded-full border border-brand-cream/30 bg-brand-green/90 px-5 py-2.5 text-sm font-bold text-brand-cream backdrop-blur-md">
                {getEventCategoryLabel(event.category)}
              </span>

              {event.featured && (
                <span className="rounded-full bg-brand-orange px-5 py-2.5 text-sm font-extrabold text-brand-ink">
                  فعالية مميزة
                </span>
              )}
            </div>

            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10 lg:p-14">
              <p className="naga-latin mb-4 text-xs font-bold tracking-[0.3em] text-brand-orange sm:text-sm">
                NAGA HOUSE · JEDDAH
              </p>

              <h1 className="max-w-5xl text-4xl font-extrabold leading-tight text-brand-cream sm:text-6xl lg:text-7xl">
                {event.titleAr}
              </h1>

              <p className="mt-5 text-base font-bold text-brand-cream/90 sm:text-lg">
                {event.location.city} · {event.location.venue}
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-x-7 gap-y-3 text-base font-semibold text-brand-cream sm:text-lg">
                <span>{primarySchedule}</span>
                {eventTime && <span>{eventTime}</span>}
                <span className="rounded-full border border-brand-orange/50 bg-brand-orange/20 px-4 py-1.5 font-bold text-brand-cream">
                  {hasPrice ? `يبدأ من ${price}` : price}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-[1600px] gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:px-8 lg:py-16">
        <div className="space-y-6">
          <section className="rounded-[30px] border border-brand-green/15 bg-[#fffaf0] p-6 shadow-[0_12px_34px_rgba(34,34,34,0.06)] sm:p-9">
            <p className="naga-latin text-sm font-bold tracking-[0.3em] text-brand-copper">
              ABOUT EVENT
            </p>
            <h2 className="mt-4 text-3xl font-extrabold text-brand-green sm:text-4xl">
              عن الفعالية
            </h2>
            <p className="mt-5 whitespace-pre-line text-lg leading-9 text-brand-ink/80 sm:text-xl sm:leading-10">
              {event.descriptionAr ?? "تفاصيل الفعالية ستتوفر قريبًا."}
            </p>
          </section>

          <div className="grid gap-5 sm:grid-cols-2">
            <section className="rounded-[28px] border border-brand-green/15 bg-[#fffaf0] p-6 shadow-[0_10px_25px_rgba(34,34,34,0.05)] sm:p-7">
              <span className="mb-5 block h-1.5 w-14 rounded-full bg-brand-orange" aria-hidden="true" />
              <h2 className="text-base font-bold text-brand-copper">الموعد</h2>
              <p className="mt-3 text-xl font-extrabold text-brand-green">
                {primarySchedule}
              </p>
              {eventTime && (
                <p className="mt-2 text-base font-semibold text-brand-ink/75">
                  {eventTime}
                </p>
              )}
            </section>

            <section className="rounded-[28px] border border-brand-green/15 bg-[#fffaf0] p-6 shadow-[0_10px_25px_rgba(34,34,34,0.05)] sm:p-7">
              <span className="mb-5 block h-1.5 w-14 rounded-full bg-brand-blue" aria-hidden="true" />
              <h2 className="text-base font-bold text-brand-copper">الموقع</h2>
              <p className="mt-3 text-xl font-extrabold text-brand-green">
                {event.location.venue}
              </p>
              <p className="mt-2 text-base font-semibold text-brand-ink/75">
                {event.location.city}
              </p>
            </section>
          </div>
        </div>

        <aside>
          <div className="sticky top-32 overflow-hidden rounded-[30px] border border-brand-green/15 bg-[#fffaf0] shadow-[0_18px_45px_rgba(34,34,34,0.10)]">
            <div className="border-b border-brand-cream/15 bg-brand-green px-7 py-7 text-brand-cream">
              <p className="text-sm font-bold text-brand-cream/80">
                أسعار التذاكر
              </p>
              <p className="mt-2 text-4xl font-extrabold text-brand-cream">
                {price}
              </p>
              {hasPrice && (
                <p className="mt-2 text-sm font-semibold text-brand-cream/80">
                  السعر يبدأ من
                </p>
              )}
            </div>

            <div className="space-y-5 px-7 py-7">
              <div>
                <p className="font-bold text-brand-copper">الموعد</p>
                <p className="mt-2 font-bold text-brand-ink">
                  {primarySchedule}
                </p>
                {eventTime && (
                  <p className="mt-1 font-medium text-brand-ink/70">
                    {eventTime}
                  </p>
                )}
              </div>

              <div className="border-t border-brand-green/15 pt-5">
                <p className="font-bold text-brand-copper">المكان</p>
                <p className="mt-2 font-bold text-brand-ink">
                  {event.location.venue}
                </p>
              </div>

              {canBook ? (
                <>
                  <a
                    href={event.ticketUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 flex h-16 w-full items-center justify-center gap-3 rounded-full bg-brand-orange px-6 text-lg font-extrabold text-brand-ink transition hover:scale-[1.01] hover:bg-brand-copper hover:text-brand-cream focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-copper active:scale-[0.99]"
                  >
                    احجز الآن
                    <span aria-hidden="true">↗</span>
                  </a>
                  <p className="text-center text-xs leading-6 text-brand-ink/70">
                    يتم إكمال الحجز عبر منصة التذاكر الرسمية خارج NAGA HOUSE.
                  </p>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    disabled
                    className="mt-2 flex h-16 w-full cursor-not-allowed items-center justify-center gap-3 rounded-full bg-brand-green/15 px-6 text-lg font-bold text-brand-green/60"
                  >
                    احجز الآن
                    <span aria-hidden="true">↗</span>
                  </button>
                  <p className="text-center text-sm leading-6 text-brand-copper">
                    رابط التذكرة الرسمي لهذه الفعالية لم يُضف بعد.
                  </p>
                </>
              )}
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
