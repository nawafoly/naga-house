import Image from "next/image";
import Link from "next/link";

import {
  getEventCategoryLabel,
  type Event,
} from "../domain";

interface EventCardProps {
  event: Event;
  eager?: boolean;
}

function formatEventDate(value: string) {
  return new Intl.DateTimeFormat(
    "ar-SA-u-ca-gregory",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "Asia/Riyadh",
    }
  ).format(new Date(value));
}

export function EventCard({
  event,
  eager = false,
}: EventCardProps) {
  const price =
    event.price.amountFrom !== undefined
      ? `يبدأ من ${event.price.amountFrom} ر.س`
      : "السعر يحدد لاحقًا";

  const schedule =
    event.startAt !== undefined
      ? formatEventDate(event.startAt)
      : event.scheduleLabel ?? "متاح للحجز";

  return (
    <article className="group overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.035] transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.055]">
      <div className="relative aspect-[4/5] overflow-hidden">
        <Image
          src={event.imageUrl}
          alt={event.titleAr}
          fill
          loading={eager ? "eager" : "lazy"}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition duration-500 group-hover:scale-[1.035]"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-black/10" />

        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-5">
          <span className="rounded-full border border-white/20 bg-black/55 px-4 py-2 text-sm font-medium text-white backdrop-blur-md">
            {getEventCategoryLabel(event.category)}
          </span>

          {event.featured && (
            <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-black">
              مميز
            </span>
          )}
        </div>

        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
          <p className="mb-2 text-sm font-medium text-white/75">
            {schedule}
          </p>

          <h2 className="text-2xl font-bold leading-tight text-white sm:text-3xl">
            {event.titleAr}
          </h2>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-5">
          <div className="min-w-0">
            <p className="text-sm font-medium text-white/55">
              المكان
            </p>

            <p className="mt-1 truncate text-base font-medium text-white">
              {event.location.venue}
            </p>
          </div>

          <div className="shrink-0 text-left">
            <p className="text-sm font-medium text-white/55">
              التذاكر
            </p>

            <p className="mt-1 text-base font-semibold text-white">
              {price}
            </p>
          </div>
        </div>

        {event.descriptionAr && (
          <p className="mt-5 line-clamp-2 text-sm leading-7 text-white/65">
            {event.descriptionAr}
          </p>
        )}

        <div className="mt-6 border-t border-white/10 pt-5">
          <Link
            href={`/events/${event.slug}`}
            className="flex h-12 w-full items-center justify-between rounded-full bg-white px-5 font-semibold text-black transition hover:bg-white/90"
          >
            <span>عرض التفاصيل</span>

            <span className="text-xl">←</span>
          </Link>
        </div>
      </div>
    </article>
  );
}