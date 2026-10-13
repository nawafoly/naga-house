import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { MockEventRepository } from "@/features/events/data";
import { getEventCategoryLabel } from "@/features/events/domain";
import { EventService } from "@/features/events/services";

const eventService = new EventService(new MockEventRepository());

interface EventPageProps {
  params: Promise<{
    slug: string;
  }>;
}

function formatEventDate(value: string) {
  return new Intl.DateTimeFormat("ar-SA-u-ca-gregory", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function formatEventTime(value: string) {
  return new Intl.DateTimeFormat("ar-SA", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export default async function EventPage({ params }: EventPageProps) {
  const { slug } = await params;

  const event = await eventService.getEventBySlug(slug);

  if (!event) {
    notFound();
  }

  const price =
    event.price.amountFrom !== undefined
      ? `${event.price.amountFrom} ر.س`
      : "يحدد لاحقًا";

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="mx-auto w-full max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="mb-6">
          <Link
            href="/events"
            className="inline-flex items-center gap-2 text-sm font-medium text-white/45 transition hover:text-white"
          >
            <span>→</span>
            جميع الفعاليات
          </Link>
        </div>

        <div className="relative overflow-hidden rounded-[36px] border border-white/10 bg-white/[0.03]">
          <div className="relative min-h-[500px] w-full sm:min-h-[580px] lg:min-h-[680px]">
            <Image
              src={event.coverImageUrl ?? event.imageUrl}
              alt={event.titleAr}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-black/10" />
            <div className="absolute inset-0 bg-gradient-to-l from-black/35 via-transparent to-transparent" />

            <div className="absolute inset-x-0 top-0 flex flex-wrap items-center gap-3 p-5 sm:p-8">
              <span className="rounded-full border border-white/15 bg-black/40 px-5 py-2.5 text-sm font-medium backdrop-blur-md">
                {getEventCategoryLabel(event.category)}
              </span>

              {event.featured && (
                <span className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black">
                  فعالية مميزة
                </span>
              )}
            </div>

            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10 lg:p-14">
              <p className="mb-4 text-base font-medium text-white/65 sm:text-lg">
                {event.location.city} · {event.location.venue}
              </p>

              <h1 className="max-w-5xl text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-8xl">
                {event.titleAr}
              </h1>

              <div className="mt-7 flex flex-wrap gap-x-8 gap-y-3 text-base text-white/65 sm:text-lg">
                <span>{formatEventDate(event.startAt)}</span>
                <span>{formatEventTime(event.startAt)}</span>
                <span>يبدأ من {price}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-8 py-10 lg:grid-cols-[minmax(0,1fr)_380px] lg:py-14">
          <div className="space-y-8">
            <section className="rounded-[32px] border border-white/10 bg-white/[0.03] p-6 sm:p-8 lg:p-10">
              <p className="mb-4 text-sm font-medium uppercase tracking-[0.4em] text-white/30">
                ABOUT EVENT
              </p>

              <h2 className="text-3xl font-bold sm:text-4xl">
                عن الفعالية
              </h2>

              {event.descriptionAr ? (
                <p className="mt-6 max-w-4xl text-lg leading-9 text-white/60 sm:text-xl sm:leading-10">
                  {event.descriptionAr}
                </p>
              ) : (
                <p className="mt-6 text-lg text-white/45">
                  تفاصيل الفعالية ستتوفر قريبًا.
                </p>
              )}
            </section>

            <section className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6">
                <p className="text-sm text-white/35">
                  التاريخ
                </p>

                <p className="mt-3 text-xl font-semibold leading-8">
                  {formatEventDate(event.startAt)}
                </p>

                <p className="mt-2 text-white/45">
                  {formatEventTime(event.startAt)}
                </p>
              </div>

              <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6">
                <p className="text-sm text-white/35">
                  الموقع
                </p>

                <p className="mt-3 text-xl font-semibold">
                  {event.location.venue}
                </p>

                <p className="mt-2 text-white/45">
                  {event.location.city}
                </p>
              </div>
            </section>
          </div>

          <aside>
            <div className="sticky top-32 rounded-[32px] border border-white/10 bg-white/[0.045] p-6 sm:p-8">
              <p className="text-sm text-white/35">
                أسعار التذاكر
              </p>

              <div className="mt-3 flex items-end gap-2">
                <span className="text-4xl font-bold">
                  {price}
                </span>

                {event.price.amountFrom !== undefined && (
                  <span className="pb-1 text-sm text-white/40">
                    تبدأ من
                  </span>
                )}
              </div>

              <div className="my-7 h-px bg-white/10" />

              <div className="space-y-5">
                <div>
                  <p className="text-sm text-white/35">
                    الموعد
                  </p>

                  <p className="mt-2 font-medium">
                    {formatEventDate(event.startAt)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-white/35">
                    المكان
                  </p>

                  <p className="mt-2 font-medium">
                    {event.location.venue}
                  </p>
                </div>
              </div>

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

              <p className="mt-4 text-center text-xs leading-6 text-white/30">
                سيتم تحويلك إلى منصة التذاكر الرسمية لإكمال عملية الحجز.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}