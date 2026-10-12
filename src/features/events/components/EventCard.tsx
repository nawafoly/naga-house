import Image from "next/image";
import type { Event } from "../domain";

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  return (
    <article className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
      <div className="relative aspect-[4/5] w-full">
        <Image
          src={event.imageUrl}
          alt={event.titleAr}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
        />
      </div>

      <div className="p-5">
        <div className="mb-3 flex items-center justify-between gap-4">
          <span className="text-sm text-white/50">
            {event.location.city}
          </span>

          {event.price.amountFrom !== undefined && (
            <span className="text-sm font-medium">
              يبدأ من {event.price.amountFrom} ر.س
            </span>
          )}
        </div>

        <h2 className="text-2xl font-semibold">
          {event.titleAr}
        </h2>

        {event.descriptionAr && (
          <p className="mt-3 line-clamp-3 text-sm leading-7 text-white/60">
            {event.descriptionAr}
          </p>
        )}

        <a
          href={`/events/${event.slug}`}
          className="mt-6 inline-flex rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-white/80"
        >
          عرض التفاصيل
        </a>
      </div>
    </article>
  );
}
