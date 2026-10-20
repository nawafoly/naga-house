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
  return new Intl.DateTimeFormat("ar-SA-u-ca-gregory", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Riyadh",
  }).format(new Date(value));
}

export function EventCard({ event, eager = false }: EventCardProps) {
  const price =
    event.price.amountFrom !== undefined
      ? `يبدأ من ${event.price.amountFrom} ر.س`
      : "السعر يحدد لاحقًا";

  const schedule =
    event.startAt !== undefined
      ? formatEventDate(event.startAt)
      : event.scheduleLabel ?? "متاح للحجز";

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[30px] border border-brand-green/15 bg-[#fffaf0] text-brand-ink shadow-[0_18px_38px_rgba(34,34,34,0.10)] transition duration-300 hover:-translate-y-1 hover:border-brand-orange/70 hover:shadow-[0_24px_52px_rgba(34,34,34,0.16)]">
      <div className="relative aspect-[4/5] overflow-hidden bg-brand-green/10">
        <Image
          src={event.imageUrl}
          alt={event.titleAr}
          fill
          loading={eager ? "eager" : "lazy"}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition duration-500 group-hover:scale-[1.035]"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-[#18261b]/95 via-[#18261b]/20 to-[#18261b]/10" />

        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-5">
          <span className="rounded-full border border-brand-cream/30 bg-brand-green/90 px-4 py-2 text-sm font-bold text-brand-cream backdrop-blur-md">
            {getEventCategoryLabel(event.category)}
          </span>
          {event.featured && (
            <span className="rounded-full bg-brand-orange px-4 py-2 text-sm font-extrabold text-brand-ink">
              مميز
            </span>
          )}
        </div>

        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
          <p className="mb-2 text-sm font-bold text-brand-orange">
            {schedule}
          </p>
          <h2 className="text-2xl font-extrabold leading-tight text-brand-cream sm:text-3xl">
            {event.titleAr}
          </h2>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-brand-green/75">
              المكان
            </p>
            <p className="mt-1 truncate text-base font-bold text-brand-ink">
              {event.location.venue}
            </p>
          </div>
          <div className="shrink-0 text-left">
            <p className="text-sm font-semibold text-brand-green/75">
              التذاكر
            </p>
            <p className="mt-1 text-base font-extrabold text-brand-copper">
              {price}
            </p>
          </div>
        </div>

        {event.descriptionAr && (
          <p className="mt-5 line-clamp-2 text-sm leading-7 text-brand-ink/75">
            {event.descriptionAr}
          </p>
        )}

        <div className="mt-auto border-t border-brand-green/15 pt-5 [margin-top:1.5rem]">
          <Link
            href={`/events/${event.slug}`}
            className="flex h-12 w-full items-center justify-between rounded-full bg-brand-green px-5 font-bold text-brand-cream transition hover:bg-brand-copper focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-copper"
          >
            <span>عرض التفاصيل</span>
            <span className="text-xl" aria-hidden="true">←</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
